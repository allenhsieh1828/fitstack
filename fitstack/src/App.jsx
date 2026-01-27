import React, { useState, useEffect } from 'react';
import './App.css';
import GymCalendar from './components/GymCalendar.jsx';
import CheckInModal from './components/CheckInModal.jsx';
import ProgressBar from './components/ProgressBar.jsx';
import Login from './pages/Login.jsx'; 
import AdminDashboard from './components/AdminDashboard.jsx'; 
import { MOCK_USER, MOCK_USERS } from './data/mockData.js';
import { ChevronLeft } from 'lucide-react';

// --- 新增：Firebase 相關引用 ---
import { db } from './firebase';
import { doc, setDoc, updateDoc, onSnapshot, collection } from "firebase/firestore";

function App() {
  const [userRole, setUserRole] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const TARGET_POINTS = 10;

  // --- 1. 初始化資料：從 Firebase 監聽所有會員資料 ---
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = [];
      snapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      
      if (usersData.length === 0) {
        initDatabase();
      } else {
        setAllUsers(usersData);
        // 如果正在查看特定成員，同步更新該成員的即時狀態
        if (selectedMember) {
          const updated = usersData.find(u => u.id === selectedMember.id);
          if (updated) setSelectedMember(updated);
        }
        // 設定一般使用者的歷史紀錄
        const currentUser = usersData.find(u => u.id === 'user_01');
        if (currentUser) setHistory(currentUser.checkInHistory);
      }
    });
    return () => unsub();
  }, [selectedMember?.id]); // 監聽選中對象的變化

  const initDatabase = async () => {
    for (const user of MOCK_USERS) {
      await setDoc(doc(db, "users", user.id), user);
    }
  };

  if (!userRole) return <Login onLogin={(role) => setUserRole(role)} />;

  // --- 2. 簽到與兌換邏輯 ---
  const handleDateClick = async (date) => {
    const dateStr = date.toISOString().split('T')[0];

    if (userRole === 'admin' && selectedMember) {
      if (selectedMember.checkInHistory.includes(dateStr)) return;
      
      const newHistory = [...selectedMember.checkInHistory, dateStr];
      const userRef = doc(db, "users", selectedMember.id);
      await updateDoc(userRef, {
        checkInHistory: newHistory,
        totalPoints: newHistory.length,
        lastCheckIn: dateStr
      });
      alert(`已幫 ${selectedMember.name} 補簽！`);
    } else {
      if (history.includes(dateStr)) return;
      setSelectedDate(date);
      setIsModalOpen(true);
    }
  };

  const handleConfirm = async (code) => {
    if (code === '1234') {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const newHistory = [...history, dateStr];
      const userRef = doc(db, "users", "user_01");
      await updateDoc(userRef, {
        checkInHistory: newHistory,
        totalPoints: newHistory.length,
        lastCheckIn: dateStr
      });
      setIsModalOpen(false);
      alert("簽到成功並同步至雲端！");
    } else {
      alert("驗證碼錯誤");
    }
  };

  // 新增：兌換獎勵邏輯
  const handleRedeem = async (user) => {
    if (user.totalPoints < TARGET_POINTS) {
      alert(`點數不足！還差 ${TARGET_POINTS - user.totalPoints} 點`);
      return;
    }

    if (window.confirm(`確定要幫 ${user.name} 兌換獎勵並重置點數嗎？`)) {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        checkInHistory: [],
        totalPoints: 0,
        lastCheckIn: "獎勵已兌換"
      });
      alert("兌換成功！");
    }
  };

  return (
    <div className="app-wrapper">
      <header className="header-area" style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
        {userRole === 'admin' && selectedMember ? (
          <button onClick={() => setSelectedMember(null)} className="nav-btn" style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}>
            <ChevronLeft size={20} />
          </button>
        ) : (
          <button onClick={() => {setUserRole(null); setSelectedMember(null);}} className="nav-btn" style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 12px' }}>
            登出
          </button>
        )}
        <h1 className="main-title">FIT<span className="text-neon">STACK</span></h1>
      </header>

      {userRole === 'user' ? (
        <>
          <ProgressBar current={history.length} total={TARGET_POINTS} />
          <GymCalendar history={history} onCheckIn={handleDateClick} />
          <CheckInModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirm} date={selectedDate} />
        </>
      ) : (
        selectedMember ? (
          <div className="admin-detail-view" style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2 className="text-neon">{selectedMember.name}</h2>
              <p style={{ fontSize: '1.2rem', color: '#fbbf24', margin: '5px 0' }}>
                目前點數：{selectedMember.totalPoints} / {TARGET_POINTS}
              </p>
              
              {/* 兌換按鈕 */}
              <button 
                onClick={() => handleRedeem(selectedMember)}
                className={`confirm-btn ${selectedMember.totalPoints >= TARGET_POINTS ? 'pulse-animation' : 'disabled-btn'}`}
                style={{ width: '100%', marginTop: '10px', height: '45px' }}
              >
                {selectedMember.totalPoints >= TARGET_POINTS ? '🎁 立即兌換獎勵' : '點數尚未達標'}
              </button>
            </div>
            <GymCalendar history={selectedMember.checkInHistory} onCheckIn={handleDateClick} />
          </div>
        ) : (
          <AdminDashboard users={allUsers} onSelectUser={(user) => setSelectedMember(user)} />
        )
      )}
    </div>
  );
}

export default App;
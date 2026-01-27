import React, { useState, useEffect } from 'react';
import './App.css';
import GymCalendar from './components/GymCalendar.jsx';
import CheckInModal from './components/CheckInModal.jsx';
import ProgressBar from './components/ProgressBar.jsx';
import Login from './pages/Login.jsx'; 
import AdminDashboard from './components/AdminDashboard.jsx'; 
import { MOCK_USERS } from './data/mockData.js';
import { ChevronLeft } from 'lucide-react';

// --- Firebase 相關引用 ---
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
        // 即時更新當前選中的成員資訊
        if (selectedMember) {
          const updated = usersData.find(u => u.id === selectedMember.id);
          if (updated) setSelectedMember(updated);
        }
        // 設定一般使用者 (Allen) 的歷史紀錄
        const currentUser = usersData.find(u => u.id === 'user_01');
        if (currentUser) setHistory(currentUser.checkInHistory);
      }
    });
    return () => unsub();
  }, [selectedMember?.id]);

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
      {/* 優化排版：確保標題始終居中，按鈕絕對定位於兩側 */}
      <header className="header-area">
        {userRole === 'admin' && selectedMember ? (
          <button 
            onClick={() => setSelectedMember(null)} 
            className="nav-btn" 
            style={{ position: 'absolute', left: 0 }}
          >
            <ChevronLeft size={20} />
          </button>
        ) : (
          <button 
            onClick={() => {setUserRole(null); setSelectedMember(null);}} 
            className="nav-btn" 
            style={{ position: 'absolute', left: 0, fontSize: '0.7rem' }}
          >
            登出
          </button>
        )}
        <h1 className="main-title">FIT<span className="text-neon">STACK</span></h1>
      </header>

      {/* 主內容區：確保內部組件不會因寬度縮放而跑版 */}
      <main style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {userRole === 'user' ? (
          <>
            <ProgressBar current={history.length} total={TARGET_POINTS} />
            <GymCalendar history={history} onCheckIn={handleDateClick} />
            <CheckInModal 
              isOpen={isModalOpen} 
              onClose={() => setIsModalOpen(false)} 
              onConfirm={handleConfirm} 
              date={selectedDate} 
            />
          </>
        ) : (
          selectedMember ? (
            <div className="admin-detail-view">
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h2 className="text-neon" style={{ margin: 0 }}>{selectedMember.name}</h2>
                <p style={{ fontSize: '1.2rem', color: '#fbbf24', margin: '8px 0', fontWeight: 'bold' }}>
                  {selectedMember.totalPoints} / {TARGET_POINTS} P
                </p>
                
                <button 
                  onClick={() => handleRedeem(selectedMember)}
                  className={`confirm-btn ${selectedMember.totalPoints >= TARGET_POINTS ? 'pulse-animation' : 'disabled-btn'}`}
                  style={{ width: '100%', marginTop: '10px' }}
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
      </main>
    </div>
  );
}

export default App;
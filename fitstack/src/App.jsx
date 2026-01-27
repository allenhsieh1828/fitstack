import React, { useState } from 'react';
import './App.css';
import GymCalendar from './components/GymCalendar.jsx';
import CheckInModal from './components/CheckInModal.jsx';
import ProgressBar from './components/ProgressBar.jsx';
import Login from './pages/Login.jsx'; 
import AdminDashboard from './components/AdminDashboard.jsx'; 
import { MOCK_USER, MOCK_USERS } from './data/mockData.js';
import { ChevronLeft } from 'lucide-react'; // 用於返回清單

function App() {
  const [userRole, setUserRole] = useState(null); // null, 'user', 'admin'
  const [history, setHistory] = useState(MOCK_USER.checkInHistory);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // --- 新增管理者專用狀態 ---
  const [selectedMember, setSelectedMember] = useState(null); // 目前選中的成員
  const [allUsers, setAllUsers] = useState(MOCK_USERS); // 會員總表 state

  const TARGET_POINTS = 10;

  // --- 登入處理 ---
  if (!userRole) {
    return <Login onLogin={(role) => setUserRole(role)} />;
  }

  // --- 核心邏輯：處理日期點擊 ---
  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split('T')[0];

    // 情境 A：管理者正在幫成員「手動加點」
    if (userRole === 'admin' && selectedMember) {
      if (selectedMember.checkInHistory.includes(dateStr)) {
        alert("該成員此日已簽到過囉！");
        return;
      }
      
      // 更新全域會員資料
      const updatedUsers = allUsers.map(u => {
        if (u.id === selectedMember.id) {
          const newHistory = [...u.checkInHistory, dateStr];
          const updatedUser = { ...u, checkInHistory: newHistory, totalPoints: newHistory.length };
          setSelectedMember(updatedUser); // 同步更新目前的詳情視窗
          return updatedUser;
        }
        return u;
      });
      setAllUsers(updatedUsers);
      alert(`已幫 ${selectedMember.name} 補簽成功！💪`);
    } 
    
    // 情境 B：一般使用者自行簽到
    else {
      if (history.includes(dateStr)) {
          alert("這天已經簽過到囉！🔥");
          return;
      }
      setSelectedDate(date);
      setIsModalOpen(true);
    }
  };

  const handleConfirm = (code) => {
    if (code === '1234') {
      const dateStr = selectedDate.toISOString().split('T')[0];
      setHistory([...history, dateStr]);
      setIsModalOpen(false);
      alert("簽到成功！💪");
    } else {
      alert("驗證碼錯誤");
    }
  };

  return (
    <div className="app-wrapper">
      <header className="header-area" style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
        {/* 如果在管理者詳情頁，顯示返回鍵；否則顯示登出鍵 */}
        {userRole === 'admin' && selectedMember ? (
          <button 
            onClick={() => setSelectedMember(null)} 
            className="nav-btn" 
            style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}
          >
            <ChevronLeft size={20} />
          </button>
        ) : (
          <button 
            onClick={() => {setUserRole(null); setSelectedMember(null);}} 
            className="nav-btn" 
            style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 12px' }}
          >
            登出
          </button>
        )}
        <h1 className="main-title">FIT<span className="text-neon">STACK</span></h1>
      </header>

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
        /* 管理者模式：判斷要顯示「清單」還是「個人詳情」 */
        selectedMember ? (
          <div className="admin-detail-view" style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2 className="text-neon" style={{ margin: 0 }}>{selectedMember.name}</h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>管理者模式：點擊日期直接補簽</p>
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
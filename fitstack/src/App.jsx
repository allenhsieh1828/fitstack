import React, { useState } from 'react';
import './App.css';
import GymCalendar from './components/GymCalendar.jsx';
import CheckInModal from './components/CheckInModal.jsx';
import ProgressBar from './components/ProgressBar.jsx';
import Login from './pages/Login.jsx'; 
import AdminDashboard from './components/AdminDashboard.jsx'; // 引入管理者組件
import { MOCK_USER, MOCK_USERS } from './data/mockData.js'; // 引入單一與多位會員數據

function App() {
  const [userRole, setUserRole] = useState(null); // null, 'user', 'admin'
  const [history, setHistory] = useState(MOCK_USER.checkInHistory);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const TARGET_POINTS = 10;

  // --- 登入處理 ---
  if (!userRole) {
    return <Login onLogin={(role) => setUserRole(role)} />;
  }

  // --- 使用者介面處理 ---
  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    if (history.includes(dateStr)) {
        alert("這天已經簽過到囉！🔥");
        return;
    }
    setSelectedDate(date);
    setIsModalOpen(true);
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
        <button 
          onClick={() => setUserRole(null)} 
          className="nav-btn" 
          style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 12px' }}
        >
          登出
        </button>
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
        /* 使用真正的管理者儀表板並傳入會員清單 */
        <AdminDashboard users={MOCK_USERS} />
      )}
    </div>
  );
}

export default App;
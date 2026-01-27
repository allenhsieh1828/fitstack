import React, { useState } from 'react';
import './App.css';
import GymCalendar from './components/GymCalendar.jsx';
import CheckInModal from './components/CheckInModal.jsx';
import ProgressBar from './components/ProgressBar.jsx'; // 引入進度條
import { MOCK_USER } from './data/mockData.js';

function App() {
  const [history, setHistory] = useState(MOCK_USER.checkInHistory);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // 設定目標集點數（例如 10 點可以換獎勵）
  const TARGET_POINTS = 10;

  // 當日曆被點擊
  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    if (history.includes(dateStr)) {
      alert("這天已經簽過到囉！🔥");
      return;
    }
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  // 當彈窗輸入確認
  const handleConfirm = (code) => {
    if (code === '1234') { // 模擬驗證碼
      const dateStr = selectedDate.toISOString().split('T')[0];
      setHistory([...history, dateStr]);
      setIsModalOpen(false);
      
      // 檢查是否剛好達到目標點數，給予特別鼓勵
      if (history.length + 1 === TARGET_POINTS) {
        alert("太棒了！你已達成目標，快去兌換獎勵吧！🎁");
      } else {
        alert("簽到成功！又是充滿力量的一天！💪");
      }
    } else {
      alert("驗證碼錯誤，請詢問健身房櫃檯。");
    }
  };

  return (
    <div className="app-wrapper">
      <header className="header-area">
        <h1 className="main-title">FIT<span className="text-neon">STACK</span></h1>
      </header>

      {/* 放置進度條組件 */}
      <ProgressBar current={history.length} total={TARGET_POINTS} />

      <GymCalendar history={history} onCheckIn={handleDateClick} />

      <CheckInModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleConfirm}
        date={selectedDate}
      />
      
      <footer style={{ marginTop: '2rem', color: '#475569', fontSize: '0.75rem' }}>
        健身房簽到系統 v1.0
      </footer>
    </div>
  );
}

export default App;
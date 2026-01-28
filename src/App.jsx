import React, { useState } from 'react';
import { X, LockKeyhole, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// 修正點：改為相對路徑 ./firebase
import { db } from './firebase'; 

// 這裡是您的簽到彈窗組件
function CheckInModal({ isOpen, onClose, onConfirm, date }) {
  const [code, setCode] = useState('');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay">
        <motion.div 
          className="modal-card"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
        >
          <div className="modal-inner">
            <button className="modal-close-icon" onClick={onClose}>
              <X size={24} />
            </button>
            
            <div className="modal-header-visual">
              <div className="icon-circle">
                <Dumbbell className="text-neon" size={32} />
              </div>
              <h3>健身簽到驗證</h3>
              <p className="date-tag">{date?.toLocaleDateString()}</p>
            </div>

            <div className="modal-body-content">
              <div className="input-group">
                <label>請輸入今日櫃檯提供的 4 位驗證碼</label>
                <div className="input-wrapper">
                  <LockKeyhole size={20} className="input-icon" />
                  <input
                    type="tel" 
                    maxLength="4"
                    placeholder="0 0 0 0"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="smart-input"
                  />
                </div>
              </div>

              <button 
                className="confirm-action-btn"
                onClick={() => { onConfirm(code); setCode(''); }}
                disabled={code.length < 4}
              >
                確認簽到
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// 這是 App 的主要內容，確保畫面不會全黑
function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConfirm = (code) => {
    console.log("驗證碼為:", code, "正在連線資料庫:", db);
    setIsModalOpen(false);
  };

  return (
    <div className="app-container" style={{ color: 'white', padding: '20px', textAlign: 'center' }}>
      <Dumbbell size={48} className="text-neon" style={{ marginBottom: '20px' }} />
      <h1>FITSTACK 健身系統</h1>
      <p>歡迎回來，準備好今天的訓練了嗎？</p>
      
      <button 
        className="confirm-action-btn" 
        onClick={() => setIsModalOpen(true)}
        style={{ marginTop: '20px' }}
      >
        立即簽到
      </button>

      <CheckInModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleConfirm}
        date={new Date()}
      />
    </div>
  );
}

export default App;
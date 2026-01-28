import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Dumbbell } from 'lucide-react';

const CheckInModal = ({ isOpen, onClose, onConfirm, date }) => {
  const [code, setCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(code);
    setCode(''); // 清空輸入框
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div 
          className="modal-content"
          /* 關鍵優化：防止 y: 100% 在手機鍵盤彈出時計算錯誤，改用受控高度 */
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()} // 防止點擊彈窗內部關閉
        >
          <div className="modal-header">
            <div className="flex-items">
              <Dumbbell className="text-neon" size={24} />
              <h3 className="modal-title">健身簽到驗證</h3>
            </div>
            <button onClick={onClose} className="close-btn"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="modal-body">
            <p className="modal-desc">
              正在為 <span className="text-neon">{date?.toLocaleDateString()}</span> 簽到
            </p>
            <input 
              /* 優化：type="tel" 喚起純數字鍵盤，防止網頁因自動放大而跑版 */
              type="tel" 
              pattern="[0-9]*"
              maxLength="4"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="0 0 0 0"
              className="gym-input smart-input" // 結合你剛才的樣式
              autoFocus
            />
            <button 
              type="submit" 
              className={`confirm-btn ${code.length === 4 ? 'pulse-animation' : ''}`}
              disabled={code.length < 1}
            >
              確認簽到
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CheckInModal;
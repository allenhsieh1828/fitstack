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
      <div className="modal-overlay">
        <motion.div 
          className="modal-content"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
          <div className="modal-header">
            <div className="flex-items">
              <Dumbbell className="text-neon" size={24} />
              <h3 className="modal-title">健身簽到驗證</h3>
            </div>
            <button onClick={onClose} className="close-btn"><X /></button>
          </div>

          <form onSubmit={handleSubmit} className="modal-body">
            <p className="modal-desc">請輸入今日櫃檯提供的驗證碼：</p>
            <input 
              type="text" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex: 8888"
              className="gym-input"
              autoFocus
            />
            <button type="submit" className="confirm-btn">
              確認簽到
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CheckInModal;
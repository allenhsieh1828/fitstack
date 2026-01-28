import React, { useState } from 'react';
import { X, LockKeyhole, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
                    type="tel" // 使用 tel 模式在手機上會喚起純數字鍵盤，體驗更好
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

export default CheckInModal;
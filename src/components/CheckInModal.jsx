import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Dumbbell, ShieldCheck } from 'lucide-react';

const CheckInModal = ({ isOpen, onClose, onConfirm, date, userRole }) => {
  const [code, setCode] = useState('');
  const isAdmin = userRole === 'admin';

  // 當視窗關閉時重置輸入
  useEffect(() => {
    if (!isOpen) setCode('');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // 管理者模式不強制要求 code，會員則傳回 code 進行校對
    onConfirm(isAdmin ? "ADMIN" : code);
  };

  return (
    <AnimatePresence mode="wait">
      <div className="modal-overlay" onClick={onClose}>
        <motion.div 
          className="modal-content"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          onClick={(e) => e.stopPropagation()} 
        >
          <div className="modal-header">
            <div className="flex-items">
              {isAdmin ? (
                <ShieldCheck className="text-neon" size={24} />
              ) : (
                <Dumbbell className="text-neon" size={24} />
              )}
              <h3 className="modal-title">
                {isAdmin ? "管理員手動簽到" : "健身簽到驗證"}
              </h3>
            </div>
            <button onClick={onClose} className="close-btn"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="modal-body" style={{ textAlign: 'center' }}>
            <p className="modal-desc" style={{ marginBottom: '1.5rem' }}>
              簽到日期：<span className="text-neon" style={{ fontWeight: '800' }}>
                {date ? date.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' }) : ''}
              </span>
            </p>

            {!isAdmin ? (
              <>
                <input 
                  type="tel" 
                  pattern="[0-9]*"
                  maxLength="4"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="0 0 0 0"
                  className="smart-input"
                  autoFocus
                />
                <p className="text-dim" style={{ fontSize: '0.75rem', marginTop: '10px' }}>
                  請輸入 4 位驗證密碼
                </p>
              </>
            ) : (
              <div style={{ padding: '20px 0', border: '1px dashed rgba(173, 255, 47, 0.2)', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <p className="text-neon" style={{ fontSize: '0.9rem' }}>管理員權限：免驗證</p>
              </div>
            )}

            <button 
              type="submit" 
              className={`confirm-btn ${(!isAdmin && code.length === 4) || isAdmin ? 'pulse-animation' : ''}`}
              disabled={!isAdmin && code.length < 4}
              style={{ marginTop: '1rem' }}
            >
              {isAdmin ? "確認補簽" : "確認簽到"}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CheckInModal;
import React, { useState, useEffect } from 'react';
import { X, LockKeyhole, Dumbbell, Calendar, List, Trophy, UserCog } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// 修正點 1：使用正確的相對路徑
import { db } from './firebase'; 
import { collection, addDoc, query, onSnapshot, serverTimestamp } from 'firebase/firestore';

// --- 你的原本程式碼：彈窗組件 ---
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
            <button className="modal-close-icon" onClick={onClose}><X size={24} /></button>
            <div className="modal-header-visual">
              <div className="icon-circle"><Dumbbell className="text-neon" size={32} /></div>
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
              >確認簽到</button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// --- 修正點 2：加入主程式 App 區塊，恢復消失的功能 ---
export default function App() {
  const [isAdmin, setIsAdmin] = useState(false); // 管理者模式切換
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [records, setRecords] = useState([]);

  // 從 Firebase 實時讀取紀錄
  useEffect(() => {
    const q = query(collection(db, "checkins"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleConfirm = async (code) => {
    if (code === "1234") { // 假設櫃檯驗證碼為 1234
      await addDoc(collection(db, "checkins"), {
        timestamp: serverTimestamp(),
        code: code
      });
      setIsModalOpen(false);
    } else {
      alert("驗證碼錯誤！");
    }
  };

  return (
    <div className="app-container">
      {/* 頂部導覽列 */}
      <header className="header">
        <div className="logo"><Dumbbell className="text-neon" /> FITSTACK</div>
        <button className="mode-toggle" onClick={() => setIsAdmin(!isAdmin)}>
          {isAdmin ? <List /> : <UserCog />}
        </button>
      </header>

      {isAdmin ? (
        /* 管理者模式內容 */
        <div className="admin-view">
          <h2>管理者中心</h2>
          <div className="stats-grid">
            <div className="stat-card">今日簽到：{records.length} 人</div>
          </div>
        </div>
      ) : (
        /* 會員模式內容 */
        <main className="member-view">
          <section className="rewards-card">
            <Trophy className="text-neon" />
            <div className="points">集點進度：{records.length} / 10</div>
          </section>

          <div className="calendar-placeholder">
            <Calendar /> <span>訓練月曆紀錄</span>
          </div>

          <button className="main-checkin-btn" onClick={() => setIsModalOpen(true)}>
            立即簽到
          </button>

          <div className="history-list">
            <h3>近期簽到紀錄</h3>
            {records.map(r => (
              <div key={r.id} className="history-item">
                ✅ {r.timestamp?.toDate().toLocaleString()}
              </div>
            ))}
          </div>
        </main>
      )}

      <CheckInModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleConfirm}
        date={new Date()}
      />
    </div>
  );
}
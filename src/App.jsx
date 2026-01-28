import React, { useState, useEffect } from 'react';
import { X, LockKeyhole, Dumbbell, Trophy, Calendar as CalendarIcon, UserCog, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// 核心：使用正確的相對路徑與資料庫引用
import { db } from './firebase'; 
import { collection, addDoc, query, onSnapshot, serverTimestamp, orderBy } from 'firebase/firestore';

// --- 子組件：簽到彈窗 (對應您的 CSS .modal-content) ---
function CheckInModal({ isOpen, onClose, onConfirm }) {
  const [code, setCode] = useState('');
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="modal-header">
          <div className="flex-items">
            <Dumbbell className="text-neon" />
            <h3 className="modal-title">健身簽到驗證</h3>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          <p className="modal-desc">請輸入今日櫃檯提供的 4 位驗證碼</p>
          <input
            type="tel"
            maxLength="4"
            placeholder="0 0 0 0"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="smart-input"
            autoFocus
          />
          <button 
            className="confirm-action-btn"
            onClick={() => { onConfirm(code); setCode(''); }}
            disabled={code.length < 4}
          >確認簽到</button>
        </div>
      </motion.div>
    </div>
  );
}

// --- 主程式 ---
export default function App() {
  const [view, setView] = useState('member'); // member 或 admin
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [records, setRecords] = useState([]);
  const targetPoints = 10;

  // 1. 實時從 Firebase 讀取簽到紀錄
  useEffect(() => {
    const q = query(collection(db, "checkins"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        date: doc.data().timestamp?.toDate() || new Date(),
        ...doc.data()
      }));
      setRecords(data);
    });
    return () => unsubscribe();
  }, []);

  // 2. 簽到寫入功能
  const handleCheckIn = async (code) => {
    if (code === "1234") { // 這裡是您設定的驗證碼
      try {
        await addDoc(collection(db, "checkins"), {
          timestamp: serverTimestamp(),
          user: "Allen" // 對應照片中的用戶名
        });
        setIsModalOpen(false);
      } catch (e) {
        alert("簽到失敗，請檢查網路");
      }
    } else {
      alert("驗證碼錯誤");
    }
  };

  // 月曆渲染邏輯 (簡化版)
  const renderCalendar = () => {
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const checkedDays = records.map(r => r.date.getDate());
    
    return (
      <div className="calendar-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span className="text-neon" style={{ fontWeight: 'bold' }}>JAN 2026</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center' }}>
          {days.map(day => (
            <div key={day} style={{
              padding: '8px',
              borderRadius: '50%',
              fontSize: '0.8rem',
              backgroundColor: checkedDays.includes(day) ? 'var(--gym-neon)' : 'transparent',
              color: checkedDays.includes(day) ? 'var(--gym-black)' : 'var(--text-dim)',
              fontWeight: checkedDays.includes(day) ? 'bold' : 'normal'
            }}>
              {day}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="app-wrapper">
      <header className="header-area">
        <h1 className="main-title">FIT<span className="text-neon">STACK</span></h1>
        <button 
          onClick={() => setView(view === 'member' ? 'admin' : 'member')}
          style={{ position: 'absolute', right: 0, top: 0, background: 'none', border: 'none', color: 'white' }}
        >
          {view === 'member' ? <UserCog /> : <List />}
        </button>
      </header>

      {view === 'member' ? (
        <>
          <h2 className="text-neon" style={{ margin: '0.5rem 0' }}>Allen</h2>
          <p style={{ color: 'var(--text-dim)' }}>目前點數：{records.length} / {targetPoints}</p>

          <div className="progress-container">
            <div className="progress-track">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min((records.length / targetPoints) * 100, 100)}%` }} 
              />
            </div>
          </div>

          {/* 如果集滿點數，按鈕會脈衝 */}
          <button 
            className={`confirm-action-btn ${records.length >= targetPoints ? 'pulse-animation' : ''}`}
            onClick={() => records.length >= targetPoints ? alert("兌換成功！") : setIsModalOpen(true)}
          >
            {records.length >= targetPoints ? "🎁 立即兌換獎勵" : "🏋️ 立即簽到"}
          </button>

          <div style={{ marginTop: '2rem', width: '100%' }}>
            {renderCalendar()}
          </div>
        </>
      ) : (
        <div className="admin-panel" style={{ width: '100%' }}>
          <h2 className="text-neon">管理者模式</h2>
          {records.map(r => (
            <div key={r.id} className="member-card">
              <span>{r.user} - 簽到成功</span>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                {r.date.toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}

      <CheckInModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleCheckIn} 
      />
    </div>
  );
}
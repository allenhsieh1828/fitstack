import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Dumbbell, Users, Search, ChevronRight, Award, 
  UserCog, List, Trophy, ChevronLeft, Calendar as CalendarIcon, Gift 
} from 'lucide-react';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, 
  endOfWeek, eachDayOfInterval, isSameMonth, 
  isSameDay, addMonths, subMonths 
} from 'date-fns';

// 核心設定：確保路徑與 Firebase 連線正確
import { db } from './firebase'; 
import { collection, addDoc, query, onSnapshot, serverTimestamp, orderBy } from 'firebase/firestore';

// --- [子組件 1] 進度條 (ProgressBar) ---
const ProgressBar = ({ current, total = 10 }) => {
  const percentage = Math.min((current / total) * 100, 100);
  return (
    <div className="progress-container">
      <div className="progress-info" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span className="progress-label">獎勵進度</span>
        <span className="progress-count">{current} / {total} 點</span>
      </div>
      <div className="progress-track" style={{ position: 'relative' }}>
        <motion.div 
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <div className="reward-icon-wrapper" style={{ position: 'absolute', right: '-5px', top: '-25px' }}>
          <Gift size={18} className={current >= total ? "text-neon icon-glow" : "text-dim"} />
        </div>
      </div>
      {current >= total ? (
        <p className="success-msg text-neon" style={{ marginTop: '10px', fontSize: '0.9rem' }}>恭喜！已達成兌換門檻 🎁</p>
      ) : (
        <p className="remain-msg" style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--text-dim)' }}>再集 {total - current} 點即可兌換獎勵</p>
      )}
    </div>
  );
};

// --- [子組件 2] 健身月曆 (GymCalendar) ---
const GymCalendar = ({ history = [], onCheckIn }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div className="calendar-card" style={{ marginTop: '20px' }}>
      <div className="calendar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 className="month-label text-neon">{format(currentMonth, 'MMM yyyy').toUpperCase()}</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="nav-btn"><ChevronLeft size={20}/></button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="nav-btn"><ChevronRight size={20}/></button>
        </div>
      </div>
      <div className="weekday-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '10px', color: 'var(--text-dim)' }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (<div key={d} className="weekday-label">{d}</div>))}
      </div>
      <div className="days-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
        {days.map((day) => {
          const isCheckIn = history.some(h => isSameDay(new Date(h), day));
          const isCurrentMonth = isSameMonth(day, monthStart);
          return (
            <motion.div
              key={day.toString()}
              onClick={() => isCurrentMonth && onCheckIn(day)}
              className={`day-cell ${isCheckIn ? 'day-checked' : ''} ${!isCurrentMonth ? 'day-outside' : ''}`}
              style={{ 
                aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', cursor: isCurrentMonth ? 'pointer' : 'default',
                backgroundColor: isCheckIn ? 'var(--gym-neon)' : 'transparent', color: isCheckIn ? 'black' : (isCurrentMonth ? 'white' : '#334155')
              }}
              whileTap={isCurrentMonth ? { scale: 0.9 } : {}}
            >
              {format(day, 'd')}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// --- [子組件 3] 簽到彈窗 (CheckInModal) ---
const CheckInModal = ({ isOpen, onClose, onConfirm, date }) => {
  const [code, setCode] = useState('');
  if (!isOpen) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(code);
    setCode('');
  };
  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="flex-items"><Dumbbell className="text-neon" size={24} /> <h3 className="modal-title">健身簽到驗證</h3></div>
            <button onClick={onClose} className="close-btn"><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} className="modal-body">
            <p className="modal-desc">正在為 <span className="text-neon">{date ? format(date, 'yyyy/MM/dd') : ''}</span> 簽到</p>
            <input type="tel" pattern="[0-9]*" maxLength="4" value={code} onChange={(e) => setCode(e.target.value)} placeholder="0 0 0 0" className="gym-input smart-input" autoFocus />
            <button type="submit" className={`confirm-btn ${code.length === 4 ? 'pulse-animation' : ''}`} disabled={code.length < 1}>確認簽到</button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// --- [子組件 4] 成員管理 ---
const AdminDashboard = ({ users, onSelectUser }) => (
  <div className="admin-container">
    <div className="admin-header"><div className="flex-items"><Users className="text-neon" size={24} /><h2 className="month-label">成員管理系統</h2></div></div>
    <div className="member-list" style={{ marginTop: '20px' }}>
      {users.map((user, index) => (
        <motion.div key={user.id} className="member-card" onClick={() => onSelectUser(user)} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
          <div className="member-info"><div className="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--gym-neon)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginRight: '12px' }}>{user.name?.[0]}</div>
          <div><h4 className="member-name">{user.name}</h4><p className="member-status" style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>上次：{user.lastCheckIn || '無'}</p></div></div>
          <div className="member-stats" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div className="point-tag" style={{ backgroundColor: 'rgba(173,255,47,0.1)', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem' }}><Award size={14} className="text-neon" /> <span>{user.totalPoints || 0} 點</span></div><ChevronRight size={18} /></div>
        </motion.div>
      ))}
    </div>
  </div>
);

// --- [主組件] App ---
export default function App() {
  const [view, setView] = useState('member');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsubRecords = onSnapshot(query(collection(db, "checkins"), orderBy("timestamp", "desc")), (snap) => {
      setRecords(snap.docs.map(doc => doc.data().timestamp?.toDate()).filter(Boolean));
    });
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubRecords(); unsubUsers(); };
  }, []);

  const handleConfirm = async (code) => {
    if (code === "1234") {
      await addDoc(collection(db, "checkins"), { name: "Allen", timestamp: selectedDate });
      setIsModalOpen(false);
    } else { alert("驗證碼錯誤"); }
  };

  return (
    <div className="app-wrapper">
      <header className="header-area">
        <div className="flex-items" style={{ justifyContent: 'center' }}>
          <Dumbbell className="text-neon" size={32} /><h1 className="main-title">FIT<span className="text-neon">STACK</span></h1>
        </div>
        <button className="mode-toggle" onClick={() => setView(view === 'member' ? 'admin' : 'member')} style={{ position: 'absolute', right: '1rem', top: '1.2rem', background: 'none', border: 'none', color: 'white' }}>
          {view === 'member' ? <UserCog size={24} /> : <List size={24} />}
        </button>
      </header>

      {view === 'member' ? (
        <main style={{ width: '100%' }}>
          <h2 className="text-neon" style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>Allen</h2>
          
          {/* 整合後的進度條組件 */}
          <ProgressBar current={records.length} total={10} />

          <button 
            className={`confirm-action-btn ${records.length >= 10 ? 'pulse-animation' : ''}`} 
            onClick={() => { setSelectedDate(new Date()); setIsModalOpen(true); }}
            style={{ margin: '20px 0', width: '100%' }}
          >
            {records.length >= 10 ? "🎁 立即兌換獎勵" : "🏋️ 立即簽到"}
          </button>

          <GymCalendar history={records} onCheckIn={(day) => { setSelectedDate(day); setIsModalOpen(true); }} />
        </main>
      ) : (
        <AdminDashboard users={users} onSelectUser={(u) => alert(`成員詳情：${u.name}`)} />
      )}

      <CheckInModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirm} date={selectedDate} />
    </div>
  );
}
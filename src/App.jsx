import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  collection, onSnapshot, query, where, orderBy, 
  addDoc, deleteDoc, doc, limit 
} from 'firebase/firestore';

import { db } from './firebase'; 
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Trash2, Activity, History, Users, ChevronLeft, Gift, PlusCircle } from 'lucide-react';

import ProgressBar from './components/ProgressBar';
import GymCalendar from './components/GymCalendar';
import CheckInModal from './components/CheckInModal';
import Login from './pages/Login'; 
import './App.css';

export default function App() {
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); 
  const [records, setRecords] = useState([]);       
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetDate, setTargetDate] = useState(new Date());

  // --- [管理者專用狀態] ---
  const [allMembers, setAllMembers] = useState([]); // 會員清單
  const [viewingMember, setViewingMember] = useState(null); // 目前正在查看誰

  const handleLoginSuccess = (role, userData) => {
    setUserRole(role);
    setCurrentUser(userData);
    if (role === 'user') {
      setViewingMember(userData); // 一般會員只能看自己
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentUser(null);
    setViewingMember(null);
    setRecords([]);
  };

  // --- [1. 管理者：監聽所有會員列表] ---
  useEffect(() => {
    if (userRole !== 'admin') return;
    const q = query(collection(db, "users"), orderBy("name", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setAllMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [userRole]);

  // --- [2. 監聽目前「目標會員」的簽到紀錄] ---
  useEffect(() => {
    if (!viewingMember?.id) return;
    const q = query(
      collection(db, "checkins"), 
      where("userId", "==", viewingMember.id), 
      orderBy("timestamp", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setRecords(snap.docs.map(d => ({ 
        id: d.id, 
        date: d.data().timestamp?.toDate() || new Date(),
        type: d.data().type || 'add'
      })));
    });
    return () => unsub();
  }, [viewingMember]);

  // --- [3. 簽到/點數處理] ---
  const handleCheckIn = async (date, type = 'add') => {
    const targetId = viewingMember?.id;
    if (!targetId) return;

    try {
      await addDoc(collection(db, "checkins"), { 
        userId: targetId, 
        timestamp: date, 
        type: type, // 'add' 或 'redeem'
        userName: viewingMember.name,
        adminId: userRole === 'admin' ? currentUser.id : null
      });
      setIsModalOpen(false);
    } catch (e) { alert("操作失敗"); }
  };

  // 兌換獎勵 (扣除 10 點)
  const handleRedeemReward = () => {
    if (window.confirm(`確定為 ${viewingMember.name} 兌換獎勵並扣除 10 點？`)) {
      // 這裡採用簡單邏輯：連續新增 10 筆負向紀錄或標記一次兌換
      // 為了保持系統簡單，我們直接新增一筆類型為 'redeem' 的紀錄，
      // 並在計算點數時將其排除或扣除。
      handleCheckIn(new Date(), 'redeem_complete');
    }
  };

  if (!userRole) return <Login onLogin={handleLoginSuccess} />;

  // 計算邏輯：總簽到次數 (排除已兌換的標記)
  const validRecords = records.filter(r => r.type !== 'redeem_complete');
  const currentPoints = validRecords.length > 0 && validRecords.length % 10 === 0 ? 10 : validRecords.length % 10;

  return (
    <div className="app-wrapper">
      <header className="header-area">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex-items" style={{ justifyContent: 'space-between', width: '100%', padding: '0 10px' }}>
          <div onClick={() => userRole === 'admin' && setViewingMember(null)} style={{ cursor: userRole === 'admin' ? 'pointer' : 'default' }}>
            <h1 className="main-title" style={{ fontSize: '1.5rem' }}>FIT<span className="text-neon">STACK</span></h1>
            <p className="text-dim" style={{ fontSize: '0.6rem', letterSpacing: '2px' }}>{userRole.toUpperCase()} MODE</p>
          </div>
          
          <div className="flex-items" style={{ background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '20px', border: '1px solid rgba(173,255,47,0.2)' }}>
            <span className="text-neon" style={{ fontWeight: '800', fontSize: '0.8rem', marginRight: '10px' }}>{currentUser?.name}</span>
            <button className="close-btn" onClick={handleLogout}><LogOut size={14} /></button>
          </div>
        </motion.div>
      </header>

      <main style={{ width: '100%' }}>
        {/* --- 管理者：會員列表視圖 --- */}
        {userRole === 'admin' && !viewingMember ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex-items" style={{ marginBottom: '1.5rem', gap: '8px' }}>
              <Users size={18} className="text-neon" />
              <p style={{ fontWeight: '800', fontSize: '0.9rem' }}>MEMBERS LIST</p>
            </div>
            {allMembers.map(member => (
              <div key={member.id} className="member-card" onClick={() => setViewingMember(member)}>
                <div className="flex-items" style={{ gap: '12px' }}>
                  <div style={{ width: '35px', height: '35px', background: 'var(--gym-dark)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--gym-neon)' }}>
                    {member.name.charAt(0)}
                  </div>
                  <span style={{ fontWeight: '700' }}>{member.name}</span>
                </div>
                <span className="text-neon" style={{ fontSize: '0.8rem' }}>MANAGE →</span>
              </div>
            ))}
          </motion.div>
        ) : (
          /* --- 個人/選中會員 詳細視圖 --- */
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {userRole === 'admin' && (
              <button onClick={() => setViewingMember(null)} className="flex-items" style={{ background: 'none', border: 'none', color: 'var(--text-dim)', marginBottom: '1rem', cursor: 'pointer', gap: '4px' }}>
                <ChevronLeft size={16} /> 返回會員列表
              </button>
            )}

            <ProgressBar current={currentPoints} total={10} />

            <div className="calendar-card">
              <GymCalendar records={validRecords} onDateClick={(date) => { setTargetDate(date); setIsModalOpen(true); }} />
            </div>

            {/* 管理者操作面板 */}
            {userRole === 'admin' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '1.5rem' }}>
                <button onClick={() => handleCheckIn(new Date())} className="confirm-btn" style={{ height: '45px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <PlusCircle size={16} /> 手動補點
                </button>
                <button onClick={handleRedeemReward} className="confirm-btn" style={{ height: '45px', fontSize: '0.8rem', background: 'var(--gym-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Gift size={16} /> 兌換獎勵
                </button>
              </div>
            )}

            {/* 最近紀錄 */}
            <div style={{ marginTop: '2.5rem' }}>
              <div className="flex-items" style={{ justifyContent: 'space-between', marginBottom: '1rem' }}>
                <p className="text-dim" style={{ fontSize: '0.8rem', fontWeight: '800' }}>RECENT ACTIVITY / {viewingMember?.name}</p>
              </div>
              <AnimatePresence mode="popLayout">
                {records.slice(0, 5).map((r, index) => (
                  <motion.div key={r.id} className="member-card" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                    <span style={{ fontSize: '0.85rem', color: r.type.includes('redeem') ? 'var(--gym-gold)' : 'var(--gym-white)' }}>
                      {r.type.includes('redeem') ? '🎁' : '✅'} {format(r.date, 'yyyy/MM/dd HH:mm')}
                    </span>
                    {userRole === 'admin' && (
                      <Trash2 size={16} className="text-dim" style={{ cursor: 'pointer' }} onClick={() => window.confirm("確定刪除此紀錄？") && deleteDoc(doc(db, "checkins", r.id))} />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </main>

      <CheckInModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleCheckIn} 
        date={targetDate}
        userRole={userRole} 
      />
    </div>
  );
}
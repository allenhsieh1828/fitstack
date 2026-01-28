import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Dumbbell, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// 引入 Firebase 相關功能
import { db } from '../firebase'; 
import { collection, onSnapshot } from 'firebase/firestore';

const Login = ({ onLogin }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]); // 存放所有會員
  const [selectedUser, setSelectedUser] = useState(null); // 當前選中的會員
  const [password, setPassword] = useState('');

  // 1. 從 Firebase 抓取會員名單
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isAdmin) {
      // 管理者登入邏輯
      if (password === 'admin123') {
        onLogin('admin', { name: '管理者', id: 'admin_root' });
      } else {
        alert('管理者密碼錯誤');
      }
    } else {
      // 使用者登入邏輯
      if (!selectedUser) return alert('請先選擇會員名稱');
      
      // 比對資料庫中該會員的密碼 (假設欄位名為 password)
      if (password === selectedUser.password) {
        onLogin('user', selectedUser);
      } else {
        alert('會員密碼錯誤');
      }
    }
  };

  return (
    <div className="app-wrapper" style={{ justifyContent: 'center' }}>
      <motion.div 
        className="login-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="login-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Dumbbell className="text-neon" size={48} style={{ marginBottom: '1rem' }} />
          <h2 className="main-title" style={{ fontSize: '2rem' }}>FIT<span className="text-neon">STACK</span></h2>
          <p className="text-dim">身分驗證系統</p>
        </div>

        {/* 身分切換器 */}
        <div className="role-selector" style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
          <button 
            type="button"
            className={`confirm-btn ${!isAdmin ? '' : 'btn-outline'}`} 
            style={{ flex: 1, background: !isAdmin ? 'var(--gym-neon)' : '#1e293b', color: !isAdmin ? '#000' : '#fff' }}
            onClick={() => { setIsAdmin(false); setPassword(''); }}
          >
            <User size={18} /> 會員
          </button>
          <button 
            type="button"
            className={`confirm-btn ${isAdmin ? '' : 'btn-outline'}`}
            style={{ flex: 1, background: isAdmin ? 'var(--gym-neon)' : '#1e293b', color: isAdmin ? '#000' : '#fff' }}
            onClick={() => { setIsAdmin(true); setPassword(''); }}
          >
            <ShieldCheck size={18} /> 管理者
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <AnimatePresence mode="wait">
            {!isAdmin ? (
              <motion.div 
                key="user-fields"
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 10 }}
              >
                {/* 會員下拉選單 */}
                <select 
                  className="gym-input" 
                  style={{ marginBottom: '1rem', letterSpacing: 'normal', fontSize: '1rem' }}
                  onChange={(e) => setSelectedUser(users.find(u => u.id === e.target.value))}
                  required
                >
                  <option value="">選擇您的名字</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* 密碼輸入框 (不論身分都需要輸入) */}
          <input 
            type="password"
            placeholder={isAdmin ? "管理者密碼" : "會員密碼"}
            className="smart-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="confirm-btn" style={{ marginTop: '1.5rem' }}>
            確認登入
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
import React, { useState } from 'react';
import { User, ShieldCheck, Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = ({ onLogin }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isAdmin) {
      if (password === 'admin123') {
        onLogin('admin');
      } else {
        alert('管理者密碼錯誤');
      }
    } else {
      onLogin('user');
    }
  };

  return (
    <div className="login-container">
      <motion.div 
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="login-header">
          <Dumbbell className="text-neon" size={40} />
          <h2 className="login-title">FIT<span className="text-neon">STACK</span></h2>
          <p className="login-subtitle">請選擇登入身分</p>
        </div>

        <div className="role-selector">
          <button 
            className={`role-btn ${!isAdmin ? 'active' : ''}`}
            onClick={() => setIsAdmin(false)}
          >
            <User size={20} /> 使用者
          </button>
          <button 
            className={`role-btn ${isAdmin ? 'active' : ''}`}
            onClick={() => setIsAdmin(true)}
          >
            <ShieldCheck size={20} /> 管理者
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {isAdmin && (
            <motion.input 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              type="password"
              placeholder="請輸入管理者密碼"
              className="gym-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}
          <button type="submit" className="confirm-btn" style={{ marginTop: '1rem' }}>
            {isAdmin ? '管理者登入' : '進入系統'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
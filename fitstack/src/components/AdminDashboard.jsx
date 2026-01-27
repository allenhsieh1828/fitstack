import React from 'react';
import { Users, Search, ChevronRight, Award } from 'lucide-react';
import { motion } from 'framer-motion';

// 新增接收 onSelectUser 屬性
const AdminDashboard = ({ users, onSelectUser }) => {
  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="flex-items">
          <Users className="text-neon" size={24} />
          <h2 className="month-label">成員管理系統</h2>
        </div>
        <div className="search-bar">
          <Search size={16} className="text-dim" />
          <input type="text" placeholder="搜尋成員姓名..." />
        </div>
      </div>

      <div className="member-list">
        {users.map((user, index) => (
          <motion.div 
            key={user.id}
            className="member-card"
            // 新增：點擊卡片時將選中的 user 傳回 App.jsx
            onClick={() => onSelectUser(user)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="member-info">
              <div className="avatar">{user.name[0]}</div>
              <div>
                <h4 className="member-name">{user.name}</h4>
                <p className="member-status">上次簽到：{user.lastCheckIn}</p>
              </div>
            </div>
            
            <div className="member-stats">
              <div className="point-tag">
                <Award size={14} />
                <span>{user.totalPoints} 點</span>
              </div>
              <ChevronRight className="text-dim" size={20} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
import React from 'react';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';

const ProgressBar = ({ current, total = 10 }) => {
  const percentage = Math.min((current / total) * 100, 100);

  return (
    <div className="progress-container">
      <div className="progress-info">
        <span className="progress-label">獎勵進度</span>
        <span className="progress-count">{current} / {total} 點</span>
      </div>
      
      <div className="progress-track">
        <motion.div 
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        
        {/* 獎勵圖示標記 */}
        <div className="reward-icon-wrapper" style={{ left: '100%' }}>
          <Gift 
            size={18} 
            className={current >= total ? "text-neon icon-glow" : "text-dim"} 
          />
        </div>
      </div>
      
      {current >= total ? (
        <p className="success-msg text-neon">恭喜！已達成兌換門檻 🎁</p>
      ) : (
        <p className="remain-msg">再集 {total - current} 點即可兌換獎勵</p>
      )}
    </div>
  );
};

export default ProgressBar;
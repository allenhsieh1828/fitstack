import React from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // <--- 補上這個
import { Gift, Sparkles, Zap } from 'lucide-react';

const ProgressBar = ({ current, total = 10 }) => {
  const percentage = Math.min((current / total) * 100, 100);

  return (
    <div className="progress-container">
      <div className="flex-items" style={{ justifyContent: 'space-between', marginBottom: '12px' }}>
        <div className="flex-items" style={{ gap: '6px' }}>
          <Zap size={14} className={current > 0 ? "text-neon" : "text-dim"} />
          <span style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1.5px', color: 'var(--text-dim)' }}>
            SYSTEM ENERGY
          </span>
        </div>
        <div className="flex-items" style={{ gap: '8px' }}>
          {current >= total && <Sparkles size={14} className="text-neon" />}
          <span className="text-neon" style={{ fontSize: '1.1rem', fontWeight: '900', fontFamily: 'monospace' }}>
            {percentage}%
          </span>
        </div>
      </div>
      
      <div className="progress-track" style={{ height: '16px', background: 'rgba(0,0,0,0.3)', position: 'relative', overflow: 'visible', border: '1px solid rgba(255,255,255,0.05)' }}>
        <motion.div 
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.2, ease: "circOut" }}
          style={{ position: 'relative' }}
        >
          {current > 0 && <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '8px', background: '#fff', filter: 'blur(4px)', opacity: 0.7, boxShadow: '0 0 15px #fff' }} />}
        </motion.div>
        
        <div style={{ position: 'absolute', right: '-8px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
          <Gift size={22} className={current >= total ? "text-neon pulse-animation" : "text-dim"} />
        </div>
      </div>
      
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <AnimatePresence mode="wait">
          {current >= total ? (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <p className="text-neon" style={{ fontSize: '0.9rem', fontWeight: '900', margin: 0 }}>LIMIT BROKEN</p>
            </motion.div>
          ) : (
            <p key="pending" className="text-dim" style={{ fontSize: '0.75rem', margin: 0 }}>
              REMAINING: <span style={{ color: 'var(--gym-neon)' }}>{total - current} POINTS</span>
            </p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProgressBar;
import React, { useState } from 'react';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, 
  endOfWeek, eachDayOfInterval, isSameMonth, 
  isSameDay, addMonths, subMonths 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const GymCalendar = ({ history = [], onCheckIn }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div className="calendar-card">
      <div className="calendar-header">
        <h2 className="month-label text-neon">
          {format(currentMonth, 'MMM yyyy').toUpperCase()}
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="nav-btn"><ChevronLeft size={20}/></button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="nav-btn"><ChevronRight size={20}/></button>
        </div>
      </div>

      <div className="weekday-row">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <div key={d} className="weekday-label">{d}</div>
        ))}
      </div>

      <div className="days-grid">
        {days.map((day) => {
          const isCheckIn = history.some(h => isSameDay(new Date(h), day));
          const isCurrentMonth = isSameMonth(day, monthStart);
          
          return (
            <motion.div
              key={day.toString()}
              onClick={() => isCurrentMonth && onCheckIn(day)}
              className={`day-cell 
                ${isCheckIn ? 'day-checked' : ''} 
                ${!isCurrentMonth ? 'day-outside' : ''}
              `}
              whileTap={isCurrentMonth ? { scale: 0.95 } : {}}
            >
              {format(day, 'd')}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default GymCalendar;
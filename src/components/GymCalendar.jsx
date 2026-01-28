import React, { useState } from 'react';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths 
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GymCalendar({ records, onDateClick }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  return (
    <div className="calendar-container">
      <div className="calendar-nav">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="nav-btn">
          <ChevronLeft size={24} />
        </button>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="nav-btn">
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="calendar-title-wrap">
        <AnimatePresence mode="wait">
          <motion.h3 
            key={currentMonth.toString()}
            className="calendar-month-year"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
          >
            {format(currentMonth, 'MMMM yyyy')}
          </motion.h3>
        </AnimatePresence>
      </div>

      <div className="calendar-grid">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="weekday-label">{d}</div>
        ))}
        {days.map((day, idx) => {
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, monthStart);
          const hasRecord = records.some((rec) => isSameDay(rec.date, day));

          return (
            <div
              key={idx}
              className={`calendar-day ${!isCurrentMonth ? 'day-outside' : ''} ${isToday ? 'day-today' : ''} ${hasRecord ? 'has-record' : ''}`}
              onClick={() => onDateClick(day)}
            >
              <span className="day-number">{format(day, 'd')}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
import { useState, useMemo } from 'react';
import ReminderCard from './ReminderCard';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ReminderCalendar({
  reminders = [],
  onComplete,
  onSnooze,
  onEdit,
  onDelete,
  onViewHistory,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(
    new Date().toISOString().split('T')[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Group reminders by date (YYYY-MM-DD)
  const remindersByDate = useMemo(() => {
    const map = {};
    reminders.forEach((r) => {
      const d = r.status === 'SNOOZED' && r.snoozeUntil ? r.snoozeUntil : r.dueDate;
      if (!map[d]) {
        map[d] = [];
      }
      map[d].push(r);
    });
    return map;
  }, [reminders]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const dateStr = prevDate.toISOString().split('T')[0];
      days.push({
        dayNum,
        dateStr,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const currentD = new Date(year, month, i);
      // Ensure local date string matches YYYY-MM-DD
      const y = currentD.getFullYear();
      const m = String(currentD.getMonth() + 1).padStart(2, '0');
      const d = String(currentD.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;

      days.push({
        dayNum: i,
        dateStr,
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill complete grid of 35 or 42 cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const dateStr = nextDate.toISOString().split('T')[0];
      days.push({
        dayNum: i,
        dateStr,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  const monthLabel = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const selectedReminders = remindersByDate[selectedDateStr] || [];
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left 7/8 columns: Calendar Grid */}
      <div className="lg:col-span-7 xl:col-span-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Calendar Nav Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {monthLabel}
            </h2>
            <button
              onClick={handleToday}
              className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevMonth}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              title="Previous Month"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNextMonth}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              title="Next Month"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Days of Week */}
        <div className="mt-4 grid grid-cols-7 gap-1 text-center">
          {DAYS_OF_WEEK.map((d) => (
            <div
              key={d}
              className="py-1 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid Cells */}
        <div className="mt-2 grid grid-cols-7 gap-1.5">
          {calendarDays.map((day, idx) => {
            const dayReminders = remindersByDate[day.dateStr] || [];
            const isToday = day.dateStr === todayStr;
            const isSelected = day.dateStr === selectedDateStr;
            const hasOverdue = dayReminders.some((r) => r.isOverdue && r.status !== 'COMPLETED');
            const hasPending = dayReminders.some((r) => r.status === 'PENDING' || r.status === 'SNOOZED');

            return (
              <button
                key={idx}
                onClick={() => setSelectedDateStr(day.dateStr)}
                className={`relative flex min-h-[72px] flex-col justify-between rounded-xl border p-2 text-left transition-all ${
                  !day.isCurrentMonth
                    ? 'opacity-40 border-transparent bg-slate-50/50 dark:bg-slate-900/30'
                    : isSelected
                    ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/20'
                    : isToday
                    ? 'border-indigo-200 bg-indigo-50/20 dark:border-indigo-900 dark:bg-indigo-950/10'
                    : 'border-slate-100 bg-slate-50/40 hover:bg-slate-100/70 dark:border-slate-800/80 dark:bg-slate-800/20 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isToday
                        ? 'bg-indigo-600 font-bold text-white'
                        : isSelected
                        ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {day.dayNum}
                  </span>

                  {dayReminders.length > 0 && (
                    <span
                      className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                        hasOverdue
                          ? 'bg-rose-500 text-white animate-pulse'
                          : hasPending
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {dayReminders.length}
                    </span>
                  )}
                </div>

                {/* Dots indicator */}
                <div className="flex items-center gap-1 overflow-hidden pt-1">
                  {dayReminders.slice(0, 3).map((r, i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${
                        r.status === 'COMPLETED'
                          ? 'bg-emerald-500'
                          : r.isOverdue
                          ? 'bg-rose-500'
                          : r.type === 'BILL'
                          ? 'bg-amber-500'
                          : r.type === 'SUBSCRIPTION'
                          ? 'bg-purple-500'
                          : r.type === 'EMI'
                          ? 'bg-blue-500'
                          : 'bg-indigo-500'
                      }`}
                    />
                  ))}
                  {dayReminders.length > 3 && (
                    <span className="text-[9px] font-bold text-slate-400">+{dayReminders.length - 3}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right 5/4 columns: Selected Day Inspector */}
      <div className="lg:col-span-5 xl:col-span-4 flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Reminders on {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selectedReminders.length} reminder{selectedReminders.length === 1 ? '' : 's'} scheduled
            </p>
          </div>
        </div>

        <div className="mt-4 flex-1 space-y-3 overflow-y-auto max-h-[540px] pr-1">
          {selectedReminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <span className="text-3xl mb-2">🗓️</span>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                No reminders on this day
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Select another date or add a new reminder.
              </p>
            </div>
          ) : (
            selectedReminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onComplete={onComplete}
                onSnooze={onSnooze}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewHistory={onViewHistory}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

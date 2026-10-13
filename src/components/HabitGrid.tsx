import React from 'react';
import confetti from 'canvas-confetti';
import { Check, Trash2, Flame, Sparkles, CheckCircle2 } from 'lucide-react';
import { Habit } from '../types/habit';
import { CalendarDay, calculateHabitStreak } from '../utils/dateUtils';

interface HabitGridProps {
  habits: Habit[];
  days: CalendarDay[];
  onToggleHabit: (habitId: string, dateStr: string) => void;
  onDeleteHabit: (habitId: string) => void;
}

export const HabitGrid: React.FC<HabitGridProps> = ({
  habits,
  days,
  onToggleHabit,
  onDeleteHabit,
}) => {
  // Trigger delightful confetti burst when habit checked
  const handleCellClick = (habitId: string, dateStr: string, isCurrentlyChecked: boolean) => {
    onToggleHabit(habitId, dateStr);

    if (!isCurrentlyChecked) {
      // Trigger subtle celebratory confetti
      confetti({
        particleCount: 28,
        spread: 45,
        origin: { y: 0.7 },
        colors: ['#10b981', '#6366f1', '#f59e0b', '#06b6d4'],
        disableForReducedMotion: true,
      });
    }
  };

  // Calculate daily totals for formula summary row
  const dailyTotals = days.map((day) => {
    const completedCount = habits.filter((h) => h.completions[day.dateStr]).length;
    const percentage = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;
    return {
      dateStr: day.dateStr,
      count: completedCount,
      percentage,
      isPerfect: completedCount === habits.length && habits.length > 0,
    };
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden transition-colors duration-200">
      {/* Sleek helper & status bar */}
      <div className="bg-slate-50/80 dark:bg-slate-800/60 px-4 py-2.5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Monthly Grid
          </span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Click any cell to record your daily habit
          </span>
        </div>
        <div className="hidden sm:flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm shadow-2xs shadow-emerald-500/50"></span>
            <span className="text-slate-700 dark:text-slate-300">Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-sm"></span>
            <span className="text-slate-700 dark:text-slate-300">Pending</span>
          </div>
        </div>
      </div>

      {/* Spreadsheet Container with Horizontal Scroll */}
      <div className="overflow-x-auto relative scrollbar-thin">
        <table className="w-full border-collapse text-left text-xs">
          {/* Table Header: Column headers & Dates */}
          <thead>
            <tr className="bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-b border-slate-200/90 dark:border-slate-700/80 divide-x divide-slate-200/80 dark:divide-slate-700/80 select-none">
              
              {/* Sticky Column: Habit Name & Category */}
              <th className="sticky left-0 z-20 bg-slate-100 dark:bg-slate-800 px-4 py-3 min-w-[260px] sm:min-w-[300px] font-semibold text-slate-700 dark:text-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between">
                  <span className="uppercase tracking-wider text-[11px] text-slate-700 dark:text-slate-200 font-extrabold">
                    Habit Name ({habits.length})
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Category / Target</span>
                </div>
              </th>

              {/* Day Columns (1 to 28/30/31) */}
              {days.map((day) => (
                <th
                  key={day.dateStr}
                  className={`px-1 py-2 text-center min-w-[38px] max-w-[42px] transition-colors ${
                    day.isToday
                      ? 'bg-emerald-100/90 dark:bg-emerald-950/70 font-bold text-emerald-900 dark:text-emerald-300 border-b-2 border-b-emerald-500'
                      : day.isWeekend
                      ? 'bg-slate-100/60 dark:bg-slate-900/60'
                      : 'hover:bg-slate-200/50 dark:hover:bg-slate-700/60'
                  }`}
                  title={`${day.fullDayName}, ${day.dateStr}`}
                >
                  <div className="flex flex-col items-center">
                    <span
                      className={`text-[10px] uppercase tracking-tight ${
                        day.isToday
                          ? 'text-emerald-800 dark:text-emerald-400 font-bold'
                          : day.isWeekend
                          ? 'text-slate-600 dark:text-slate-300 font-bold'
                          : 'text-slate-500 dark:text-slate-400 font-semibold'
                      }`}
                    >
                      {day.dayOfWeek}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold mt-0.5 ${
                        day.isToday
                          ? 'bg-emerald-600 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-xs shadow-emerald-600/40'
                          : day.isWeekend
                          ? 'text-slate-700 dark:text-slate-200'
                          : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                  </div>
                </th>
              ))}

              {/* Monthly Stats Columns (Pinned / Sticky Right) */}
              <th className="sticky right-[112px] z-20 px-3 py-3 text-center w-[92px] min-w-[92px] max-w-[92px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border-l border-slate-200/80 dark:border-slate-700/80 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.06)] dark:shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                Progress
              </th>
              <th className="sticky right-[46px] z-20 px-3 py-3 text-center w-[66px] min-w-[66px] max-w-[66px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border-l border-slate-200/80 dark:border-slate-700/80">
                Streak
              </th>
              <th className="sticky right-0 z-20 px-2 py-3 text-center w-[46px] min-w-[46px] max-w-[46px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border-l border-slate-200/80 dark:border-slate-700/80">
                Action
              </th>
            </tr>
          </thead>

          {/* Table Body: Habits Rows */}
          <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
            {habits.length === 0 ? (
              <tr>
                <td
                  colSpan={days.length + 4}
                  className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-sm font-medium"
                >
                  No habits found. Click <strong className="text-emerald-600 dark:text-emerald-400">"New Habit"</strong> to start tracking!
                </td>
              </tr>
            ) : (
              habits.map((habit, rowIndex) => {
                // Calculate monthly completions for this habit
                const completedDaysInMonth = days.filter((d) => habit.completions[d.dateStr]).length;
                const target = habit.targetPerMonth || days.length;
                const completionPercentage = Math.min(Math.round((completedDaysInMonth / target) * 100), 100);
                const streak = calculateHabitStreak(habit.completions);

                return (
                  <tr
                    key={habit.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors duration-150 ease-in-out divide-x divide-slate-200/70 dark:divide-slate-800/80 group"
                  >
                    {/* Sticky Habit Label Cell */}
                    <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 px-4 py-2.5 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] transition-colors duration-150 ease-in-out">
                      <div className="flex items-center space-x-3">
                        <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px] w-4 text-right font-medium">
                          {rowIndex + 1}
                        </span>
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 shadow-2xs transition-transform duration-200 ease-in-out group-hover:scale-105"
                          style={{ backgroundColor: `${habit.color}15`, border: `1px solid ${habit.color}40` }}
                        >
                          {habit.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900 dark:text-white truncate text-xs leading-snug">
                            {habit.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors duration-200"
                              style={{
                                color: habit.color,
                                backgroundColor: `${habit.color}18`,
                              }}
                            >
                              {habit.category}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-400 font-mono">
                              Goal: {target}d
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Interactive Checkbox Day Cells */}
                    {days.map((day) => {
                      const isChecked = Boolean(habit.completions[day.dateStr]);
                      return (
                        <td
                          key={day.dateStr}
                          onClick={() => handleCellClick(habit.id, day.dateStr, isChecked)}
                          className={`p-0 text-center cursor-pointer select-none transition-colors duration-150 ease-in-out ${
                            day.isToday
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40'
                              : day.isWeekend
                              ? 'bg-slate-100/30 dark:bg-slate-950/30 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                              : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                          }`}
                          title={`${habit.name} on ${day.dayOfWeek}, ${day.dateStr}: ${
                            isChecked ? 'Completed (Click to uncheck)' : 'Incomplete (Click to complete)'
                          }`}
                        >
                          <div className="w-full h-11 flex items-center justify-center">
                            {isChecked ? (
                              <div
                                className="w-6 h-6 rounded-lg flex items-center justify-center text-white transition-all duration-150 ease-in-out transform hover:scale-110 active:scale-90"
                                style={{
                                  backgroundColor: habit.color,
                                  boxShadow: `0 3px 8px ${habit.color}45`,
                                }}
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded border border-slate-300 dark:border-slate-700 group-hover:border-slate-400 dark:group-hover:border-slate-600 flex items-center justify-center hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:scale-105 transition-all duration-150 ease-in-out">
                                <span className="opacity-0 hover:opacity-40 text-[10px] font-bold text-slate-500 dark:text-slate-300 transition-opacity duration-150 ease-in-out">
                                  ✓
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Monthly Progress Cell (Sticky Right) */}
                    <td className="sticky right-[112px] z-10 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 px-3 py-2 text-center w-[92px] min-w-[92px] max-w-[92px] border-l border-slate-200/80 dark:border-slate-800/80 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.06)] dark:shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.5)] transition-colors duration-150 ease-in-out">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center justify-between w-full text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200">
                          <span>{completedDaysInMonth}/{target}</span>
                          <span className="text-slate-500 dark:text-slate-400">{completionPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700/80 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 ease-in-out"
                            style={{
                              width: `${completionPercentage}%`,
                              backgroundColor: habit.color,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Streak Count Cell (Sticky Right) */}
                    <td className="sticky right-[46px] z-10 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 px-2 py-2 text-center font-mono w-[66px] min-w-[66px] max-w-[66px] border-l border-slate-200/80 dark:border-slate-800/80 transition-colors duration-150 ease-in-out">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-700/60 transition-transform duration-200 ease-in-out hover:scale-105 shadow-2xs">
                        <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>{streak.current}</span>
                      </div>
                    </td>

                    {/* Action Cell (Sticky Right) */}
                    <td className="sticky right-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 px-2 py-2 text-center w-[46px] min-w-[46px] max-w-[46px] border-l border-slate-200/80 dark:border-slate-800/80 transition-colors duration-150 ease-in-out">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete habit "${habit.name}"?`)) {
                            onDeleteHabit(habit.id);
                          }
                        }}
                        className="p-1 text-slate-400 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all duration-150 ease-in-out hover:scale-110 active:scale-90"
                        title="Delete habit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}

            {/* Bottom Summary Row 1: Daily Completed Count */}
            {habits.length > 0 && (
              <>
                <tr className="bg-slate-100/90 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-200 divide-x divide-slate-200/80 dark:divide-slate-700/80 border-t-2 border-slate-300/80 dark:border-slate-700">
                  <td className="sticky left-0 z-10 bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-xs shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                    <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Daily Completed
                    </span>
                  </td>
                  {dailyTotals.map((dt) => (
                    <td
                      key={`total-${dt.dateStr}`}
                      className={`text-center py-2 font-mono text-[11px] font-bold ${
                        dt.isPerfect
                          ? 'bg-emerald-100/90 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300'
                          : dt.count > 0
                          ? 'text-slate-800 dark:text-white'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {dt.count}
                    </td>
                  ))}
                  <td className="sticky right-[112px] z-10 bg-slate-100 dark:bg-slate-800 px-3 py-2 text-center text-[11px] text-slate-700 dark:text-slate-200 font-bold w-[92px] min-w-[92px] max-w-[92px] border-l border-slate-200/80 dark:border-slate-700/80 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.06)] dark:shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                    Total
                  </td>
                  <td className="sticky right-[46px] z-10 bg-slate-100 dark:bg-slate-800 px-2 py-2 text-center text-[11px] text-slate-400 dark:text-slate-500 font-mono w-[66px] min-w-[66px] max-w-[66px] border-l border-slate-200/80 dark:border-slate-700/80">
                    —
                  </td>
                  <td className="sticky right-0 z-10 bg-slate-100 dark:bg-slate-800 px-2 py-2 text-center text-[11px] text-slate-400 dark:text-slate-500 w-[46px] min-w-[46px] max-w-[46px] border-l border-slate-200/80 dark:border-slate-700/80">
                  </td>
                </tr>

                {/* Bottom Summary Row 2: Daily Success Rate % */}
                <tr className="bg-slate-50 dark:bg-slate-800/80 font-medium text-slate-700 dark:text-slate-200 divide-x divide-slate-200/80 dark:divide-slate-700/80 border-t border-slate-200/80 dark:border-slate-700">
                  <td className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 text-xs shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                    <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      Daily Success Rate
                    </span>
                  </td>
                  {dailyTotals.map((dt) => (
                    <td
                      key={`pct-${dt.dateStr}`}
                      className={`text-center py-2 font-mono text-[10px] font-bold ${
                        dt.isPerfect
                          ? 'bg-emerald-100/90 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300'
                          : dt.percentage >= 70
                          ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/40'
                          : dt.percentage > 0
                          ? 'text-slate-700 dark:text-slate-200'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {dt.percentage}%
                    </td>
                  ))}
                  <td className="sticky right-[112px] z-10 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-center text-[11px] text-slate-700 dark:text-slate-200 font-bold w-[92px] min-w-[92px] max-w-[92px] border-l border-slate-200/80 dark:border-slate-700/80 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.06)] dark:shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                    Average
                  </td>
                  <td className="sticky right-[46px] z-10 bg-slate-50 dark:bg-slate-800/80 px-2 py-2 text-center text-[11px] text-slate-400 dark:text-slate-500 font-mono w-[66px] min-w-[66px] max-w-[66px] border-l border-slate-200/80 dark:border-slate-700/80">
                    —
                  </td>
                  <td className="sticky right-0 z-10 bg-slate-50 dark:bg-slate-800/80 px-2 py-2 text-center text-[11px] text-slate-400 dark:text-slate-500 w-[46px] min-w-[46px] max-w-[46px] border-l border-slate-200/80 dark:border-slate-700/80">
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

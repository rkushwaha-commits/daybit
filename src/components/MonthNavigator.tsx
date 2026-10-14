import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, ArrowRightCircle } from 'lucide-react';
import { getMonthName } from '../utils/dateUtils';

interface MonthNavigatorProps {
  currentDate: Date;
  todayDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onJumpToCurrentMonth: () => void;
  daysCount: number;
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({
  currentDate,
  todayDate,
  onPrevMonth,
  onNextMonth,
  onJumpToCurrentMonth,
  daysCount,
}) => {
  const isCurrentMonth =
    currentDate.getFullYear() === todayDate.getFullYear() &&
    currentDate.getMonth() === todayDate.getMonth();

  const monthName = getMonthName(currentDate.getMonth());
  const year = currentDate.getFullYear();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 p-3 sm:px-4 sm:py-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors duration-200">
      <div className="flex items-center justify-between sm:justify-start space-x-2.5 sm:space-x-3.5">
        {/* Previous / Next Month Arrows */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs shrink-0">
          <button
            onClick={onPrevMonth}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-150 active:scale-90"
            title="Previous Month"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNextMonth}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-150 active:scale-90"
            title="Next Month"
            aria-label="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Month & Year Title */}
        <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0">
          <div className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
            {monthName} <span className="text-slate-400 dark:text-slate-500 font-semibold text-sm sm:text-base">{year}</span>
          </h2>
          <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs shrink-0">
            {daysCount}d
          </span>
        </div>
      </div>

      {/* Return to Current Month Button */}
      <div className="flex items-center justify-end space-x-2.5">
        {!isCurrentMonth && (
          <button
            onClick={onJumpToCurrentMonth}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300/60 dark:border-emerald-800 rounded-xl transition-all duration-150 active:scale-95 shadow-xs shadow-emerald-500/10 cursor-pointer"
          >
            <ArrowRightCircle className="w-3.5 h-3.5" />
            <span>Return to Current Month</span>
          </button>
        )}
        <div className="text-xs text-slate-400 dark:text-slate-500 font-medium hidden md:block">
          Grid auto-syncs with selected month
        </div>
      </div>
    </div>
  );
};

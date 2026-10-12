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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm transition-all duration-200">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={onPrevMonth}
            className="p-1.5 rounded-md hover:bg-white text-slate-600 hover:text-slate-900 transition-all duration-200 active:scale-90 shadow-none hover:shadow-xs"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNextMonth}
            className="p-1.5 rounded-md hover:bg-white text-slate-600 hover:text-slate-900 transition-all duration-200 active:scale-90 shadow-none hover:shadow-xs"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-emerald-600 transition-transform duration-200 hover:scale-110" />
          <h2 className="text-lg font-bold text-slate-900 tracking-tight transition-all duration-200">
            {monthName} <span className="text-slate-500 font-medium">{year}</span>
          </h2>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {daysCount} Days
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {!isCurrentMonth && (
          <button
            onClick={onJumpToCurrentMonth}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all duration-200 ease-in-out active:scale-95 hover:shadow-xs"
          >
            <ArrowRightCircle className="w-3.5 h-3.5" />
            <span>Return to Current Month</span>
          </button>
        )}
        <div className="text-xs text-slate-400 hidden md:block">
          Grid auto-syncs with selected month
        </div>
      </div>
    </div>
  );
};

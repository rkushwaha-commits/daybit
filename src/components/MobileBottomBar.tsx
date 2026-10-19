import React from 'react';
import { ListChecks, Calendar, Plus, BarChart2 } from 'lucide-react';

interface MobileBottomBarProps {
  activeTab: 'today' | 'grid' | 'stats';
  onTabChange: (tab: 'today' | 'grid' | 'stats') => void;
  onOpenAddModal: () => void;
  todayCompletedCount: number;
  totalHabitsCount: number;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
  todayCompletedCount,
  totalHabitsCount,
}) => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800/90 pb-safe sm:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] select-none"
    >
      <div className="flex items-center justify-around px-3 py-1.5 max-w-md mx-auto relative">
        {/* 1. Today Checklist Tab */}
        <button
          type="button"
          onClick={() => onTabChange('today')}
          className={`flex flex-col items-center justify-center py-1 px-3.5 rounded-xl transition-all cursor-pointer active:scale-95 focus:outline-none focus:ring-0 outline-none select-none ${
            activeTab === 'today'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/80 dark:bg-emerald-950/50'
              : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium'
          }`}
        >
          <div className="relative">
            <ListChecks className="w-5 h-5" strokeWidth={activeTab === 'today' ? 2.5 : 2} />
            {totalHabitsCount > 0 && (
              <span className="absolute -top-1 -right-3.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/50 dark:border-emerald-800/60 leading-none shadow-2xs">
                {todayCompletedCount}/{totalHabitsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 whitespace-nowrap">Today</span>
        </button>

        {/* 2. Full Month Spreadsheet Grid Tab */}
        <button
          type="button"
          onClick={() => onTabChange('grid')}
          className={`flex flex-col items-center justify-center py-1 px-3.5 rounded-xl transition-all cursor-pointer active:scale-95 focus:outline-none focus:ring-0 outline-none select-none ${
            activeTab === 'grid'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/80 dark:bg-emerald-950/50'
              : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium'
          }`}
        >
          <Calendar className="w-5 h-5" strokeWidth={activeTab === 'grid' ? 2.5 : 2} />
          <span className="text-[10px] mt-1 whitespace-nowrap">Month</span>
        </button>

        {/* 3. New Habit Tab (Uniform with other tabs) */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex flex-col items-center justify-center py-1 px-3.5 rounded-xl transition-all cursor-pointer active:scale-95 focus:outline-none focus:ring-0 outline-none select-none text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium"
          title="Add New Habit"
          aria-label="Add New Habit"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          <span className="text-[10px] mt-1 whitespace-nowrap">New</span>
        </button>

        {/* 4. Stats & Analytics Tab */}
        <button
          type="button"
          onClick={() => onTabChange('stats')}
          className={`flex flex-col items-center justify-center py-1 px-3.5 rounded-xl transition-all cursor-pointer active:scale-95 focus:outline-none focus:ring-0 outline-none select-none ${
            activeTab === 'stats'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/80 dark:bg-emerald-950/50'
              : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium'
          }`}
        >
          <BarChart2 className="w-5 h-5" strokeWidth={activeTab === 'stats' ? 2.5 : 2} />
          <span className="text-[10px] mt-1 whitespace-nowrap">Stats</span>
        </button>
      </div>
    </nav>
  );
};


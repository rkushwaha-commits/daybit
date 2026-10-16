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
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800/90 pb-safe sm:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]"
    >
      <div className="flex items-center justify-around px-2 py-1.5 max-w-md mx-auto relative">
        {/* 1. Today Checklist Tab */}
        <button
          type="button"
          onClick={() => onTabChange('today')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'today'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
          }`}
        >
          <div className="relative">
            <ListChecks className="w-5 h-5" strokeWidth={activeTab === 'today' ? 2.5 : 2} />
            {totalHabitsCount > 0 && (
              <span className="absolute -top-1 -right-3 px-1 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/50 dark:border-emerald-800/60 leading-none">
                {todayCompletedCount}/{totalHabitsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1">Today</span>
        </button>

        {/* 2. Full Month Spreadsheet Grid Tab */}
        <button
          type="button"
          onClick={() => onTabChange('grid')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'grid'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
          }`}
        >
          <Calendar className="w-5 h-5" strokeWidth={activeTab === 'grid' ? 2.5 : 2} />
          <span className="text-[10px] mt-1">Grid</span>
        </button>

        {/* 3. Center Elevated Quick Add Habit Floating Action Button */}
        <div className="flex flex-col items-center -mt-5">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/35 active:scale-90 transition-transform cursor-pointer ring-4 ring-white dark:ring-[#0b0f19]"
            title="Add New Habit"
            aria-label="Add New Habit"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
            New
          </span>
        </div>

        {/* 4. Stats & Analytics Tab */}
        <button
          type="button"
          onClick={() => onTabChange('stats')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'stats'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
          }`}
        >
          <BarChart2 className="w-5 h-5" strokeWidth={activeTab === 'stats' ? 2.5 : 2} />
          <span className="text-[10px] mt-1">Stats</span>
        </button>
      </div>
    </nav>
  );
};

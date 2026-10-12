import React from 'react';
import { Plus, Search, RotateCcw, Table2, Flame, Cloud, CheckCircle2, LogOut, Loader2 } from 'lucide-react';
import { HabitCategory } from '../types/habit';
import { User } from '@supabase/supabase-js';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories: HabitCategory[];
  onOpenAddModal: () => void;
  onResetData: () => void;
  bestStreak: number;
  user: User | null;
  isSyncing: boolean;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  categories,
  onOpenAddModal,
  onResetData,
  bestStreak,
  user,
  isSyncing,
  onOpenAuthModal,
  onSignOut,
}) => {
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          {/* Logo & App Tagline */}
          <div className="flex items-center space-x-3.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Table2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  Habit<span className="text-emerald-600">Flow</span>
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Build consistency. Become your best self.
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Streak Counter Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              <Flame className="w-4 h-4 text-amber-500 animate-pulse fill-amber-500" />
              <span>Best Streak: <strong className="text-amber-900 font-bold">{bestStreak} Days</strong></span>
            </div>

            {/* Cloud Sync Status / User Profile */}
            {user ? (
              <div className="flex items-center gap-2">
                {/* User Card */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 shadow-sm">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="w-6 h-6 rounded-full ring-2 ring-emerald-400 ring-offset-1 object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-emerald-400 ring-offset-1">
                        {avatarLetter}
                      </div>
                    )}
                    {/* Online dot */}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
                  </div>

                  {/* Name & sync status */}
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold text-slate-800 leading-tight truncate max-w-[140px]">
                      {displayName}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-700 leading-tight">
                      {isSyncing ? (
                        <>
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Cloud Synced
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Sign out button */}
                <button
                  onClick={onSignOut}
                  title="Sign out of HabitFlow"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-90 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-95 shadow-xs transition-all duration-200 cursor-pointer"
              >
                <Cloud className="w-3.5 h-3.5 text-indigo-500" />
                <span>Sign In / Sync</span>
              </button>
            )}

            {/* Search Input */}
            <div className="relative min-w-[180px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors duration-200" />
              <input
                type="text"
                placeholder="Search habits..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all duration-200 ease-in-out"
              />
            </div>

            {/* Reset Sample Data Button */}
            <button
              onClick={onResetData}
              title="Reset sample data"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all duration-200 ease-in-out"
            >
              <RotateCcw className="w-3.5 h-3.5 transition-transform duration-300 ease-in-out group-hover:-rotate-45" />
              <span className="hidden sm:inline">Reset Sample</span>
            </button>

            {/* New Habit Button */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-sm shadow-emerald-600/30 hover:shadow-md hover:shadow-emerald-600/25 transition-all duration-200 ease-in-out cursor-pointer"
            >
              <Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
              <span>New Habit</span>
            </button>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="mt-3 flex items-center space-x-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100 text-xs scrollbar-none">
          <span className="text-slate-400 font-medium mr-1 text-[11px] uppercase tracking-wider">
            Category:
          </span>
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ease-in-out active:scale-95 ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/90 hover:text-slate-900'
            }`}
          >
            All Habits
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-200 ease-in-out active:scale-95 ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/90 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

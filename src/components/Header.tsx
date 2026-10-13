import React from 'react';
import { Plus, Search, RotateCcw, Table2, Flame, Cloud, CheckCircle2, LogOut, Loader2, Sun, Moon } from 'lucide-react';
import { HabitCategory } from '../types/habit';
import { User } from '@supabase/supabase-js';
import { Theme } from '../hooks/useTheme';
import { getAvatarById } from '../data/avatars';

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
  theme: Theme;
  onToggleTheme: (e?: React.MouseEvent) => void;
  selectedAvatarId: string;
  onOpenAvatarPicker: () => void;
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
  theme,
  onToggleTheme,
  selectedAvatarId,
  onOpenAvatarPicker,
}) => {
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const persona = getAvatarById(selectedAvatarId);

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 dark:bg-[#0b0f19]/80 border-b border-slate-200/70 dark:border-slate-800/80 shadow-xs transition-colors duration-200">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

          {/* Logo & App Tagline */}
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 ring-1 ring-white/20">
              <Table2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                  Habit<span className="text-emerald-600 dark:text-emerald-400">Flow</span>
                </h1>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Consistency is your superpower
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Streak Counter Pill */}
            <div className="hidden sm:inline-flex h-8 items-center gap-1.5 px-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs font-semibold shadow-2xs">
              <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse fill-amber-500" />
              <span>Best Streak: <strong className="font-extrabold text-amber-950 dark:text-amber-100">{bestStreak}d</strong></span>
            </div>

            {/* Cloud Sync Status / User Profile */}
            {user ? (
              <div className="h-8 inline-flex items-center gap-2 pl-1.5 pr-1.5 rounded-lg bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                {/* Clickable Avatar with Curated Persona */}
                <button
                  type="button"
                  onClick={onOpenAvatarPicker}
                  title={`Persona: ${selectedAvatarId === 'google' ? 'Google Account Photo' : persona.name} — Click to customize`}
                  className="relative w-6 h-6 shrink-0 group/avatar cursor-pointer"
                >
                  {selectedAvatarId === 'google' && avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-emerald-500/40 transition-transform duration-150 group-hover/avatar:scale-110"
                    />
                  ) : (
                    <div
                      className={`w-6 h-6 rounded-full bg-gradient-to-tr ${persona.bgGradient} flex items-center justify-center text-[12px] select-none shadow-xs ring-1 ${persona.ringColor} transition-transform duration-150 group-hover/avatar:scale-110`}
                    >
                      {persona.emoji}
                    </div>
                  )}
                  {/* Online status indicator */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white dark:border-slate-900 pointer-events-none" />
                </button>

                {/* Name & sync status */}
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 leading-none truncate max-w-[160px]">
                    {displayName}
                  </span>
                  <span className="flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold leading-none mt-0.5">
                    {isSyncing ? (
                      <>
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        Syncing
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Synced
                      </>
                    )}
                  </span>
                </div>

                {/* Integrated Sign out button */}
                <button
                  onClick={onSignOut}
                  title="Sign out of HabitFlow"
                  className="ml-1 p-1 rounded-md text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 active:scale-90 transition-all duration-150 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="h-8 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 shadow-2xs transition-all duration-150 cursor-pointer"
              >
                <Cloud className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>Sign In / Sync</span>
              </button>
            )}

            {/* Search Input */}
            <div className="relative min-w-[160px] sm:min-w-[175px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none transition-colors duration-200" />
              <input
                type="text"
                placeholder="Search habits..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs bg-slate-100/70 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white dark:focus:bg-slate-800 transition-all duration-150"
              />
            </div>

            {/* Premium Theme Switcher Button */}
            <button
              onClick={(e) => onToggleTheme(e)}
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              className="h-8 inline-flex items-center gap-1.5 px-2.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 active:scale-95 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all duration-150 cursor-pointer"
              aria-label="Toggle theme"
            >
              <div className="relative w-3.5 h-3.5 flex items-center justify-center overflow-hidden">
                <Sun
                  className={`w-3.5 h-3.5 text-amber-500 absolute transition-all duration-300 transform ${
                    theme === 'dark' ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0'
                  }`}
                />
                <Moon
                  className={`w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 absolute transition-all duration-300 transform ${
                    theme === 'dark' ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
                  }`}
                />
              </div>
              <span className="select-none min-w-[28px] text-left">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>

            {/* Reset Sample Data Button */}
            <button
              onClick={onResetData}
              title="Reset sample data"
              className="h-8 inline-flex items-center gap-1.5 px-2.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100/70 dark:bg-slate-800/70 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 active:scale-95 border border-slate-200/60 dark:border-slate-700/60 transition-all duration-150 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 transition-transform duration-300 hover:-rotate-45" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* New Habit Button */}
            <button
              onClick={onOpenAddModal}
              className="h-8 inline-flex items-center gap-1.5 px-3.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 shadow-md shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all duration-150 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Habit</span>
            </button>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="mt-2.5 flex items-center space-x-1.5 overflow-x-auto pb-0.5 pt-1 border-t border-slate-200/60 dark:border-slate-800/60 text-xs scrollbar-none">
          <span className="text-slate-400 dark:text-slate-500 font-semibold mr-1 text-[10px] uppercase tracking-wider">
            Filter:
          </span>
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-all duration-150 active:scale-95 ${
              selectedCategory === 'all'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs font-semibold'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Habits
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-2.5 py-0.5 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-150 active:scale-95 ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/30 font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
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

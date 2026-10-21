import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  RotateCcw,
  Table2,
  Flame,
  Cloud,
  CheckCircle2,
  LogOut,
  Loader2,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Download,
} from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { Theme } from '../hooks/useTheme';
import { getMonthName } from '../utils/dateUtils';

interface HeaderProps {
  currentDate: Date;
  todayDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onJumpToCurrentMonth: () => void;
  daysCount: number;
  onOpenAddModal: () => void;
  bestStreak: number;
  user: User | null;
  isSyncing: boolean;
  onOpenAuthModal: () => void;
  onSignOut: () => void;
  theme: Theme;
  onToggleTheme: (e?: React.MouseEvent) => void;
  activeMobileTab?: 'today' | 'grid' | 'stats';
  onPromptInstall?: () => void;
  isStandalone?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  todayDate,
  onPrevMonth,
  onNextMonth,
  onJumpToCurrentMonth,
  daysCount,
  onOpenAddModal,
  bestStreak,
  user,
  isSyncing,
  onOpenAuthModal,
  onSignOut,
  theme,
  onToggleTheme,
  activeMobileTab = 'today',
  onPromptInstall,
  isStandalone = false,
}) => {
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';

  const isCurrentMonth =
    currentDate.getFullYear() === todayDate.getFullYear() &&
    currentDate.getMonth() === todayDate.getMonth();

  const monthName = getMonthName(currentDate.getMonth());
  const year = currentDate.getFullYear();

  // More options menu state
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (desktopMenuRef.current && !desktopMenuRef.current.contains(e.target as Node)) {
        setIsDesktopMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDesktopMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    if (isDesktopMenuOpen || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDesktopMenuOpen, isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/95 dark:bg-[#0b0f19]/95 border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors duration-200">
      <div className="max-w-[1700px] mx-auto px-3 sm:px-6 py-2 sm:py-2.5">
        
        {/* ─────────────────────────────────────────────────────────────
            MOBILE-SPECIFIC STREAMLINED HEADER (< md)
        ───────────────────────────────────────────────────────────── */}
        <div className="flex md:hidden flex-col gap-2">
          {/* Top Row: Logo + Streak + Three Dots Menu */}
          <div className="flex items-center justify-between gap-2">
            {/* Logo */}
            <div className="flex items-center space-x-2 shrink-0">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Table2 className="h-3.5 w-3.5" />
              </div>
              <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-0.5">
                Day<span className="text-emerald-500">bit</span>
              </h1>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Streak Pill */}
              <div className="inline-flex h-7 items-center gap-1 px-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs font-bold">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{bestStreak}d</span>
              </div>

              {/* Mobile Three Dots Menu with Compact Dropdown (Identical to Desktop) */}
              <div className="relative" ref={mobileMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                  title="More Options"
                  aria-label="More Options"
                  className={`h-7 w-7 inline-flex items-center justify-center rounded-lg border transition-all cursor-pointer active:scale-95 ${
                    isMobileMenuOpen
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80'
                  }`}
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {/* Mobile Dropdown Menu (Exact point size & styling matching desktop mode) */}
                {isMobileMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-1.5 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 animate-fade-in divide-y divide-slate-100 dark:divide-slate-800"
                  >
                    <div className="p-1">
                      {/* Theme Toggle */}
                      <button
                        onClick={(e) => { onToggleTheme(e); setIsMobileMenuOpen(false); }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 rounded-xl cursor-pointer"
                        role="menuitem"
                      >
                        <div className="flex items-center gap-2">
                          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                          <span>Theme</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 capitalize">
                          {theme}
                        </span>
                      </button>

                      {/* Install App (PWA) */}
                      {!isStandalone && onPromptInstall && (
                        <button
                          onClick={() => { setIsMobileMenuOpen(false); onPromptInstall(); }}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl cursor-pointer"
                          role="menuitem"
                        >
                          <div className="flex items-center gap-2">
                            <Download className="w-4 h-4 text-emerald-500" />
                            <span>Install App</span>
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">Free</span>
                        </button>
                      )}
                    </div>

                    <div className="p-1">
                      {user ? (
                        <>
                          <div className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 truncate border-b border-slate-100 dark:border-slate-800/60 mb-1">
                            {displayName}
                          </div>
                          <button
                            onClick={() => { setIsMobileMenuOpen(false); onSignOut(); }}
                            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl cursor-pointer"
                            role="menuitem"
                          >
                            <div className="flex items-center gap-2">
                              <LogOut className="w-4 h-4" />
                              <span>Sign Out</span>
                            </div>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => { setIsMobileMenuOpen(false); onOpenAuthModal(); }}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl cursor-pointer"
                          role="menuitem"
                        >
                          <div className="flex items-center gap-2">
                            <Cloud className="w-4 h-4" />
                            <span>Cloud Sync</span>
                          </div>
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Sign In</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Subheader Row: Month Navigator on Grid/Stats tabs only (Clean, no date duplicate on Today view) */}
          {activeMobileTab !== 'today' && (
            <div className="flex items-center justify-between gap-1.5 bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
              <button
                onClick={onPrevMonth}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all active:scale-90 cursor-pointer"
                title="Previous Month"
                aria-label="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {monthName} <span className="text-slate-400 dark:text-slate-500 font-medium">{year}</span>
                </span>
                <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded-md">
                  {daysCount}d
                </span>
              </div>

              <div className="flex items-center gap-1">
                {!isCurrentMonth && (
                  <button
                    onClick={onJumpToCurrentMonth}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300/80 dark:border-emerald-800 transition-all active:scale-95 cursor-pointer"
                    title="Return to Current Month"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Today</span>
                  </button>
                )}
                <button
                  onClick={onNextMonth}
                  className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all active:scale-90 cursor-pointer"
                  title="Next Month"
                  aria-label="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            DESKTOP HEADER (>= md)
        ───────────────────────────────────────────────────────────── */}
        <div className="hidden md:flex md:items-center md:justify-between gap-3">
          {/* Left: Brand Logo + Month Navigation */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 ring-1 ring-white/20 shrink-0">
                <Table2 className="h-4 w-4" />
              </div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1 select-none">
                Day<span className="text-emerald-500">bit</span>
              </h1>
            </div>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700/80" />

            {/* Streamlined Month Navigator */}
            <div className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
              <div className="flex items-center">
                <button
                  onClick={onPrevMonth}
                  className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all active:scale-90 cursor-pointer"
                  title="Previous Month"
                  aria-label="Previous Month"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onNextMonth}
                  className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all active:scale-90 cursor-pointer"
                  title="Next Month"
                  aria-label="Next Month"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

              <div className="px-1 flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
                  {monthName} <span className="text-slate-400 dark:text-slate-500 font-medium text-xs">{year}</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 px-1.5 py-0.2 rounded-md border border-slate-200/60 dark:border-slate-600/60">
                  {daysCount}d
                </span>
              </div>

              {!isCurrentMonth && (
                <button
                  onClick={onJumpToCurrentMonth}
                  className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300/70 dark:border-emerald-800/80 transition-all active:scale-95 cursor-pointer shadow-2xs animate-fade-in"
                  title="Return to Current Month"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Back to Today</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Streak, User/Sync, New Habit, More Menu */}
          <div className="flex items-center gap-2">
            {/* Streak Counter Pill */}
            <div className="inline-flex h-8 items-center gap-1.5 px-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs font-semibold shadow-2xs">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              <span className="font-extrabold text-amber-950 dark:text-amber-100">{bestStreak}d</span>
            </div>

            {/* Signed-in User Profile Badge (Desktop: Name + Sync Status Only) */}
            {user && (
              <div className="inline-flex h-8 items-center gap-2 px-2.5 rounded-lg bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-none truncate max-w-[130px]">
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

                <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-700" />

                <button
                  onClick={onSignOut}
                  title="Sign out"
                  aria-label="Sign out"
                  className="p-1 rounded text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 active:scale-90 transition-all cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Quick Add Habit Button (Desktop CTA) */}
            <button
              onClick={onOpenAddModal}
              className="h-8 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Habit</span>
            </button>

            {/* Desktop Three Dots More Menu */}
            <div className="relative" ref={desktopMenuRef}>
              <button
                onClick={() => setIsDesktopMenuOpen((prev) => !prev)}
                title="More Options"
                aria-label="More Options"
                className={`h-8 w-8 inline-flex items-center justify-center rounded-lg border transition-all cursor-pointer active:scale-95 ${
                  isDesktopMenuOpen
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600'
                    : 'bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80'
                }`}
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Desktop Dropdown Menu */}
              {isDesktopMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 animate-fade-in divide-y divide-slate-100 dark:divide-slate-800"
                >
                  <div className="p-1">
                    {/* Theme Toggle */}
                    <button
                      onClick={(e) => { onToggleTheme(e); setIsDesktopMenuOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 rounded-xl cursor-pointer"
                      role="menuitem"
                    >
                      <div className="flex items-center gap-2">
                        {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                        <span>Theme</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 capitalize">
                        {theme}
                      </span>
                    </button>

                    {/* Install App (PWA) */}
                    {!isStandalone && onPromptInstall && (
                      <button
                        onClick={() => { setIsDesktopMenuOpen(false); onPromptInstall(); }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl cursor-pointer"
                        role="menuitem"
                      >
                        <div className="flex items-center gap-2">
                          <Download className="w-4 h-4 text-emerald-500" />
                          <span>Install App</span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">Free</span>
                      </button>
                    )}
                  </div>

                  <div className="p-1">
                    {user ? (
                      <>
                        <div className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 truncate border-b border-slate-100 dark:border-slate-800/60 mb-1">
                          {displayName}
                        </div>
                        <button
                          onClick={() => { setIsDesktopMenuOpen(false); onSignOut(); }}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl cursor-pointer"
                          role="menuitem"
                        >
                          <div className="flex items-center gap-2">
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </div>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => { setIsDesktopMenuOpen(false); onOpenAuthModal(); }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl cursor-pointer"
                        role="menuitem"
                      >
                        <div className="flex items-center gap-2">
                          <Cloud className="w-4 h-4" />
                          <span>Cloud Sync</span>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Sign In</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};

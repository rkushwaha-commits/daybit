import React, { useRef, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Check,
  Trash2,
  Flame,
  ListChecks,
  Lock,
  Unlock,
  Plus,
  LayoutGrid,
  Table2,
  Target,
} from 'lucide-react';
import { Habit, HabitCategory } from '../types/habit';
import { CalendarDay, calculateHabitStreak } from '../utils/dateUtils';

interface HabitGridProps {
  habits: Habit[];
  days: CalendarDay[];
  onToggleHabit: (habitId: string, dateStr: string) => void;
  onDeleteHabit: (habitId: string) => void;
  categories: HabitCategory[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenAddModal: () => void;
  activeView?: 'today' | 'cards' | 'table' | 'grid';
  onViewChange?: (view: 'today' | 'cards' | 'table' | 'grid') => void;
}

export type HabitViewMode = 'today' | 'cards' | 'table';

const ACCOUNTABILITY_LOCK_KEY = 'daybit_accountability_lock_v1';

export const HabitGrid: React.FC<HabitGridProps> = ({
  habits,
  days,
  onToggleHabit,
  onDeleteHabit,
  categories,
  selectedCategory,
  onSelectCategory,
  onOpenAddModal,
  activeView: controlledActiveView,
  onViewChange,
}) => {
  // Saved format preference for monthly tracking: 'cards' or 'table'
  const [gridFormat, setGridFormat] = useState<'cards' | 'table'>(() => {
    try {
      const saved = localStorage.getItem('daybit_grid_format_preference');
      if (saved === 'cards' || saved === 'table') return saved;
    } catch {
      // ignore
    }
    return 'cards';
  });

  // Internal active view: defaults to 'today' on phones (<640px) or saved preference on desktop
  const [internalView, setInternalView] = useState<HabitViewMode>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return 'today';
    }
    try {
      const saved = localStorage.getItem('daybit_active_view');
      if (saved === 'today' || saved === 'cards' || saved === 'table') return saved;
    } catch {
      // ignore
    }
    return 'cards';
  });

  // Resolve current effective view
  const effectiveView: HabitViewMode = (() => {
    if (controlledActiveView) {
      if (controlledActiveView === 'grid') return gridFormat;
      return controlledActiveView;
    }
    return internalView;
  })();

  const handleSelectView = (view: HabitViewMode) => {
    setInternalView(view);
    if (view === 'cards' || view === 'table') {
      setGridFormat(view);
      try {
        localStorage.setItem('daybit_grid_format_preference', view);
      } catch {
        // ignore
      }
    }
    try {
      localStorage.setItem('daybit_active_view', view);
    } catch {
      // ignore
    }
    if (onViewChange) {
      onViewChange(view);
    }
  };

  // Accountability Lock state: when true, only today's habits can be edited
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(ACCOUNTABILITY_LOCK_KEY);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleLock = () => {
    setIsLocked((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(ACCOUNTABILITY_LOCK_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const todayThRef = useRef<HTMLTableCellElement>(null);

  // Today day object if current month contains today
  const todayDay = days.find((d) => d.isToday);

  // Scroll centering state: true when Today is within viewport center, false when user scrolled away
  const [isTodayCentered, setIsTodayCentered] = useState<boolean>(true);

  // Check whether Today column is currently centered in the table container
  const checkIsTodayCentered = () => {
    if (todayThRef.current && tableContainerRef.current) {
      const container = tableContainerRef.current;
      const todayEl = todayThRef.current;
      const stickyColWidth = window.innerWidth < 640 ? 210 : 280;
      const targetScroll = Math.max(
        0,
        todayEl.offsetLeft - stickyColWidth - (container.clientWidth - stickyColWidth) / 2 + todayEl.clientWidth / 2
      );
      const isClose = Math.abs(container.scrollLeft - targetScroll) < 45;
      setIsTodayCentered(isClose);
    }
  };

  // Function to smoothly scroll table to the 'Today' column
  const scrollToToday = (behavior: ScrollBehavior = 'smooth') => {
    if (todayThRef.current && tableContainerRef.current) {
      const container = tableContainerRef.current;
      const todayEl = todayThRef.current;
      const stickyColWidth = window.innerWidth < 640 ? 210 : 280;
      const targetScroll = Math.max(
        0,
        todayEl.offsetLeft - stickyColWidth - (container.clientWidth - stickyColWidth) / 2 + todayEl.clientWidth / 2
      );
      container.scrollTo({ left: targetScroll, behavior });
      setIsTodayCentered(true);
    }
  };

  // Auto-scroll to today column when mounted or month changes
  useEffect(() => {
    if (todayDay && effectiveView === 'table') {
      const timer = setTimeout(() => {
        scrollToToday('smooth');
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [days, todayDay, effectiveView]);

  // Handle checking a cell with strict accountability checks
  const handleCellClick = (habitId: string, day: CalendarDay, isCurrentlyChecked: boolean) => {
    // 1. Future dates cannot be checked
    if (day.isFuture) return;

    // 2. Today is always editable
    if (day.isToday) {
      onToggleHabit(habitId, day.dateStr);
      if (!isCurrentlyChecked) {
        confetti({
          particleCount: 28,
          spread: 45,
          origin: { y: 0.7 },
          colors: ['#10b981', '#6366f1', '#f59e0b', '#06b6d4'],
          disableForReducedMotion: true,
        });
      }
      return;
    }

    // 3. Past dates when locked — cannot edit
    if (isLocked) return;

    // 4. Past dates when unlocked
    onToggleHabit(habitId, day.dateStr);
    if (!isCurrentlyChecked) {
      confetti({
        particleCount: 20,
        spread: 35,
        origin: { y: 0.7 },
        colors: ['#10b981', '#6366f1', '#f59e0b'],
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

  // Calculate today completed count for the Today tab badge
  const todayCompletedCount = todayDay
    ? habits.filter((h) => h.completions[todayDay.dateStr]).length
    : 0;

  return (
    <div className="bg-white dark:bg-[#0f1422] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden transition-colors duration-200">
      
      {/* ─────────────────────────────────────────────────────────────
      {/* ─────────────────────────────────────────────────────────────
          STREAMLINED GRID TOOLBAR (VIEW SWITCHER + CATEGORIES + LOCK)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800/80 text-xs">
        {/* Desktop Toolbar (>= sm) */}
        <div className="hidden sm:flex items-center justify-between gap-3 px-4 py-2">
          {/* Left: 1-Click View Switcher (Today, Cards, Table) + Inline Category Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Unified 3-Way Segmented Control */}
            <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-950/80 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
              {/* 1. Today Checklist Button */}
              <button
                type="button"
                onClick={() => handleSelectView('today')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-all duration-150 cursor-pointer ${
                  effectiveView === 'today'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Today's Daily Ritual Checklist"
              >
                <ListChecks className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Today</span>
                {todayDay && (
                  <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                    {todayCompletedCount}/{habits.length}
                  </span>
                )}
              </button>

              {/* 2. Cards View Button */}
              <button
                type="button"
                onClick={() => handleSelectView('cards')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-all duration-150 cursor-pointer ${
                  effectiveView === 'cards'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Card View (Monthly Heatmap Streaks)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>

              {/* 3. Table View Button */}
              <button
                type="button"
                onClick={() => handleSelectView('table')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-all duration-150 cursor-pointer ${
                  effectiveView === 'table'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Spreadsheet Table View"
              >
                <Table2 className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

            {/* Inline Category Filter Chips */}
            <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none no-scrollbar touch-pan-x">
              <button
                type="button"
                onClick={() => onSelectCategory('all')}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-150 active:scale-95 shrink-0 cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-95 shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Accountability Lock Button & Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLock}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer border shadow-2xs ${
                isLocked
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-800/70 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/40'
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300/80 dark:border-amber-800/70 hover:bg-amber-100/80 dark:hover:bg-amber-900/40'
              }`}
              title={
                isLocked
                  ? 'Currently Locked: Only today is editable. Click to unlock past days.'
                  : 'Currently Unlocked: Past days can be edited. Click to lock.'
              }
            >
              {isLocked ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-bold">Locked</span>
                  <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">
                    (Today Only)
                  </span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="font-bold">Unlocked</span>
                  <span className="text-[10px] text-amber-700/80 dark:text-amber-300/80 font-medium">
                    (Edit Past)
                  </span>
                </>
              )}
            </button>

            {todayDay && effectiveView === 'table' && (
              <button
                type="button"
                onClick={() => scrollToToday('smooth')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer ${
                  !isTodayCentered
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80'
                }`}
                title={
                  !isTodayCentered
                    ? `Click to center Today (${todayDay.dayOfWeek}, ${todayDay.dateStr})`
                    : `Today (${todayDay.dayOfWeek}, ${todayDay.dateStr}) is centered`
                }
              >
                <Target
                  className={`w-3.5 h-3.5 ${
                    !isTodayCentered ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                  }`}
                />
                <span>Today</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Toolbar (< sm) */}
        <div className="flex sm:hidden flex-col gap-2 p-2.5">
          {/* Scrollable Category Chips Ribbon (Never wraps, no scrollbar!) */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none no-scrollbar touch-pan-x py-1 px-0.5 select-none scroll-smooth">
            <button
              type="button"
              onClick={() => onSelectCategory('all')}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all duration-150 active:scale-95 shrink-0 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/25'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700/80'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-95 shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/25 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sub-row for Month view on mobile: Format Switcher + Lock + Today */}
          {effectiveView !== 'today' && (
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
              {/* Cards vs Table format switch */}
              <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => handleSelectView('cards')}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    effectiveView === 'cards'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                  title="Card View"
                >
                  <LayoutGrid className="w-3 h-3" />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectView('table')}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    effectiveView === 'table'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                  title="Spreadsheet Table View"
                >
                  <Table2 className="w-3 h-3" />
                  <span>Table</span>
                </button>
              </div>

              {/* Right: Today Centering + Lock Toggle */}
              <div className="flex items-center gap-1.5">
                {todayDay && effectiveView === 'table' && !isTodayCentered && (
                  <button
                    type="button"
                    onClick={() => scrollToToday('smooth')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all active:scale-95 cursor-pointer animate-fade-in"
                    title="Click to center Today"
                  >
                    <Target className="w-3 h-3 text-white" />
                    <span>Today</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={toggleLock}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all active:scale-95 cursor-pointer ${
                    isLocked
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300/80 dark:border-amber-800'
                  }`}
                  title={isLocked ? 'Only today editable' : 'Past days editable'}
                >
                  {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  <span>{isLocked ? 'Locked' : 'Unlocked'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODE A: TODAY'S DAILY CHECKLIST VIEW (MOBILE-FIRST)
      ───────────────────────────────────────────────────────────── */}
      {effectiveView === 'today' ? (
        <div className="p-3.5 sm:p-6 space-y-3">
          {todayDay ? (
            <>
              {/* Daily Hero Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-transparent border border-emerald-500/20 dark:border-emerald-800/40 p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                      {todayDay.fullDayName} · {todayDay.dateStr}
                    </p>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">
                      {todayCompletedCount === habits.length && habits.length > 0
                        ? '🎉 All Done Today!'
                        : `${habits.length - todayCompletedCount} habits remaining`}
                    </h3>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {habits.length > 0 ? Math.round((todayCompletedCount / habits.length) * 100) : 0}%
                    </span>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      {todayCompletedCount} of {habits.length} done
                    </p>
                  </div>
                </div>

                {/* Smooth Progress Bar */}
                <div className="w-full bg-slate-200/80 dark:bg-slate-800/80 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 ease-out shadow-xs shadow-emerald-500/50"
                    style={{
                      width: `${habits.length > 0 ? Math.round((todayCompletedCount / habits.length) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Habit Cards */}
              {habits.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">No habits yet</p>
                  <p className="text-xs mb-3">Tap "+ Add Habit" to start building your routine!</p>
                  <button
                    onClick={onOpenAddModal}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer shadow-sm shadow-emerald-600/30"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Your First Habit</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {habits.map((habit) => {
                    const isChecked = Boolean(habit.completions[todayDay.dateStr]);
                    const streak = calculateHabitStreak(habit.completions);
                    const completedDaysInMonth = days.filter((d) => habit.completions[d.dateStr]).length;
                    const target = habit.targetPerMonth || days.length;

                    return (
                      <div
                        key={`today-card-${habit.id}`}
                        onClick={() => handleCellClick(habit.id, todayDay, isChecked)}
                        className={`group relative flex items-center justify-between gap-3 px-3.5 py-3 sm:px-4 sm:py-3.5 rounded-2xl border transition-all duration-300 ease-out cursor-pointer select-none active:scale-[0.99] ${
                          isChecked
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/35 border-emerald-300/70 dark:border-emerald-800/60 shadow-xs shadow-emerald-500/5 hover:bg-emerald-50 dark:hover:bg-emerald-950/45 hover:border-emerald-400'
                            : 'bg-white dark:bg-[#121829] border-slate-200 dark:border-slate-800/90 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 shadow-xs hover:shadow-md'
                        }`}
                      >
                        {/* Left: Checkbox + Emoji + Name & Category */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Circle Checkbox */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCellClick(habit.id, todayDay, isChecked);
                            }}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 cursor-pointer ${
                              isChecked
                                ? 'scale-105'
                                : 'border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 dark:hover:border-emerald-400'
                            }`}
                            style={
                              isChecked
                                ? {
                                    backgroundColor: habit.color,
                                    boxShadow: `0 0 0 3px ${habit.color}25, 0 2px 10px ${habit.color}40`,
                                  }
                                : undefined
                            }
                            title={isChecked ? 'Mark pending' : 'Mark completed'}
                            aria-label={`Toggle habit ${habit.name}`}
                          >
                            {isChecked && (
                              <Check className="w-4 h-4 text-white stroke-[3.5] animate-check-pop" />
                            )}
                          </button>

                          {/* Emoji in squircle */}
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 transition-transform group-hover:scale-105 shadow-2xs"
                            style={{
                              backgroundColor: `${habit.color}15`,
                              border: `1px solid ${habit.color}35`,
                            }}
                          >
                            {habit.emoji}
                          </div>

                          {/* Title & Metadata */}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm sm:text-base font-bold transition-colors duration-200 leading-snug break-words text-slate-900 dark:text-white">
                              {habit.name}
                            </p>

                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {/* Category tag */}
                              <span
                                className="inline-block text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap"
                                style={{
                                  color: habit.color,
                                  backgroundColor: `${habit.color}18`,
                                }}
                              >
                                {habit.category}
                              </span>

                              {/* Monthly progress */}
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold whitespace-nowrap">
                                {completedDaysInMonth}/{target}d
                              </span>

                              {isChecked && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/70 px-2 py-0.5 rounded-md transition-all animate-fade-in">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>Done</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Streak & Delete Action */}
                        <div className="flex items-center gap-2 shrink-0">
                          {streak.current > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60 shadow-2xs">
                              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              <span>{streak.current}d</span>
                            </span>
                          )}

                          {/* Delete habit action */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete "${habit.name}"?`)) {
                                onDeleteHabit(habit.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 active:scale-90 transition-all cursor-pointer"
                            title="Delete habit"
                            aria-label="Delete habit"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm">
              The currently selected month does not contain today's date.
            </div>
          )}
        </div>
      ) : effectiveView === 'cards' ? (
        /* ─────────────────────────────────────────────────────────────
            MODE B: MONTHLY TRACKER (STREAK MATRIX CARDS)
        ───────────────────────────────────────────────────────────── */
        <div className="p-3.5 sm:p-5">
              {habits.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">No habits found</p>
                  <p className="text-xs mb-3">Add habits to track your monthly progress!</p>
                  <button
                    onClick={onOpenAddModal}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer shadow-sm shadow-emerald-600/30"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Habit</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
                  {habits.map((habit) => {
                  const completedDaysInMonth = days.filter((d) => habit.completions[d.dateStr]).length;
                  const target = habit.targetPerMonth || days.length;
                  const streak = calculateHabitStreak(habit.completions);
                  const completionPercentage = Math.min(Math.round((completedDaysInMonth / target) * 100), 100);

                  return (
                    <div
                      key={`matrix-card-${habit.id}`}
                      className="bg-white dark:bg-[#121829] rounded-2xl border border-slate-200 dark:border-slate-800/90 p-3.5 shadow-xs space-y-3"
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-2xs"
                            style={{
                              backgroundColor: `${habit.color}15`,
                              border: `1px solid ${habit.color}35`,
                            }}
                          >
                            {habit.emoji}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white break-words leading-snug">
                              {habit.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span
                                className="text-[9px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap"
                                style={{
                                  color: habit.color,
                                  backgroundColor: `${habit.color}18`,
                                }}
                              >
                                {habit.category}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold whitespace-nowrap">
                                {completedDaysInMonth}/{target}d ({completionPercentage}%)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Streak & Delete */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {streak.current > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60 shadow-2xs">
                              <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                              <span>{streak.current}d</span>
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete "${habit.name}"?`)) {
                                onDeleteHabit(habit.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 active:scale-90 transition-all cursor-pointer"
                            title="Delete habit"
                            aria-label="Delete habit"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Visual Month Heatmap Grid: 7 days per row */}
                      <div className="grid grid-cols-7 gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        {days.map((day) => {
                          const isChecked = Boolean(habit.completions[day.dateStr]);
                          const isCellDisabled = day.isFuture || (isLocked && !day.isToday);

                          return (
                            <button
                              type="button"
                              key={`grid-cell-${habit.id}-${day.dateStr}`}
                              onClick={() => handleCellClick(habit.id, day, isChecked)}
                              disabled={isCellDisabled}
                              className={`h-9 rounded-xl flex flex-col items-center justify-center transition-all duration-150 cursor-pointer relative select-none ${
                                isChecked
                                  ? 'text-white shadow-xs font-black'
                                  : isCellDisabled
                                  ? 'bg-slate-50/60 dark:bg-slate-900/30 text-slate-300 dark:text-slate-600 border border-slate-100/60 dark:border-slate-800/40 cursor-not-allowed'
                                  : day.isToday
                                  ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200/70 dark:hover:bg-emerald-900/50 font-extrabold'
                                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold'
                              }`}
                              style={
                                isChecked
                                  ? {
                                      backgroundColor: habit.color,
                                      boxShadow: `0 2px 6px ${habit.color}40`,
                                    }
                                  : undefined
                              }
                              title={`${habit.name} on ${day.dayOfWeek}, ${day.dateStr}: ${isChecked ? 'Completed' : 'Pending'}`}
                            >
                              <span className="text-[8px] uppercase tracking-tighter opacity-70 leading-none">
                                {day.dayOfWeek[0]}
                              </span>
                              <span className="text-[11px] font-bold leading-tight mt-0.5">
                                {day.dayNumber}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
        /* ─────────────────────────────────────────────────────────────
            MODE C: FULL SPREADSHEET TABLE VIEW
        ───────────────────────────────────────────────────────────── */
        <div
          ref={tableContainerRef}
          onScroll={checkIsTodayCentered}
          className="overflow-x-auto relative scrollbar-thin touch-pan-x block"
        >
            <table className="w-full border-collapse text-left text-xs">
              {/* Table Header: Column headers & Dates */}
              <thead>
                <tr className="bg-slate-100/90 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 border-b border-slate-200/90 dark:border-slate-800 divide-x divide-slate-200/80 dark:divide-slate-800 select-none">
                  
                  {/* Sticky Column: Contains "+ Add Habit" button */}
                  <th className="sticky left-0 z-20 bg-slate-100 dark:bg-slate-900 px-2 sm:px-3 py-2 w-[210px] min-w-[210px] max-w-[210px] sm:w-auto sm:min-w-[270px] sm:max-w-none font-semibold text-slate-700 dark:text-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={onOpenAddModal}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 shadow-xs transition-all cursor-pointer"
                        title="Create a new habit"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">Add Habit</span>
                        <span className="xs:hidden">Add</span>
                      </button>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-semibold hidden sm:inline">
                        {habits.length} habits
                      </span>
                    </div>
                  </th>

                {/* Day Columns (High-Density 2-Tier Header, with solid pill on Today) */}
                {days.map((day) => (
                  <th
                    key={day.dateStr}
                    ref={day.isToday ? todayThRef : undefined}
                    className={`px-1 pt-1.5 pb-1 text-center min-w-[36px] sm:min-w-[38px] max-w-[42px] transition-colors ${
                      day.isToday
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40'
                        : day.isWeekend
                        ? 'bg-slate-100/60 dark:bg-slate-950/40'
                        : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/60'
                    }`}
                    title={`${day.fullDayName}, ${day.dateStr}`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      {day.isToday ? (
                        <div className="w-full py-1 px-0.5 rounded-lg bg-emerald-600 text-white shadow-xs flex flex-col items-center">
                          <span className="text-[9px] uppercase font-bold tracking-tight leading-normal text-emerald-100">
                            {day.dayOfWeek}
                          </span>
                          <span className="text-xs font-black leading-tight mt-0.5">
                            {day.dayNumber}
                          </span>
                        </div>
                      ) : (
                        <>
                          <span
                            className={`text-[9px] uppercase tracking-tight leading-normal ${
                              day.isWeekend
                                ? 'text-slate-500 dark:text-slate-400 font-bold'
                                : 'text-slate-400 dark:text-slate-500 font-medium'
                            }`}
                          >
                            {day.dayOfWeek}
                          </span>
                          <span
                            className={`text-xs font-extrabold leading-tight mt-0.5 ${
                              day.isWeekend
                                ? 'text-slate-700 dark:text-slate-300'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {day.dayNumber}
                          </span>
                        </>
                      )}
                    </div>
                  </th>
                ))}

                {/* Monthly Stats Columns (Pinned Right on sm+ screens) */}
                <th className="sm:sticky sm:right-[112px] sm:z-20 px-3 py-2 text-center w-[92px] min-w-[92px] max-w-[92px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800 sm:shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.06)] dark:sm:shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                  Progress
                </th>
                <th className="sm:sticky sm:right-[46px] sm:z-20 px-2 py-2 text-center w-[66px] min-w-[66px] max-w-[66px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800">
                  Streak
                </th>
                <th className="sm:sticky sm:right-0 sm:z-20 px-2 py-2 text-center w-[46px] min-w-[46px] max-w-[46px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800">
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
                    No habits found. Click <strong className="text-emerald-600 dark:text-emerald-400">"Add Habit"</strong> above to start tracking!
                  </td>
                </tr>
              ) : (
                habits.map((habit, rowIndex) => {
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
                      <td className="sticky left-0 z-10 bg-white dark:bg-[#0f1422] group-hover:bg-slate-50 dark:group-hover:bg-[#182032] px-2 sm:px-3 py-2 w-[210px] min-w-[210px] max-w-[210px] sm:w-auto sm:min-w-[270px] sm:max-w-none shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] transition-colors duration-150 ease-in-out">
                        <div className="flex items-center space-x-2 sm:space-x-2.5">
                          <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px] w-3.5 text-right font-medium hidden sm:inline-block">
                            {rowIndex + 1}
                          </span>
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 shadow-2xs"
                            style={{ backgroundColor: `${habit.color}15`, border: `1px solid ${habit.color}40` }}
                          >
                            {habit.emoji}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900 dark:text-white text-xs leading-snug break-words">
                              {habit.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-md"
                                style={{
                                  color: habit.color,
                                  backgroundColor: `${habit.color}18`,
                                }}
                              >
                                {habit.category}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono hidden sm:inline">
                                {target}d
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Interactive Checkbox Day Cells (Clean block cells) */}
                      {days.map((day) => {
                        const isChecked = Boolean(habit.completions[day.dateStr]);
                        const isCellDisabled = day.isFuture || (isLocked && !day.isToday);

                        return (
                          <td
                            key={day.dateStr}
                            onClick={() => handleCellClick(habit.id, day, isChecked)}
                            className={`p-0 text-center select-none transition-colors ${
                              isCellDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
                            } ${
                              day.isToday
                                ? 'bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 ring-1 ring-inset ring-emerald-500/30'
                                : day.isFuture
                                ? 'bg-slate-50/20 dark:bg-slate-950/20 opacity-35'
                                : day.isWeekend
                                ? 'bg-slate-100/30 dark:bg-slate-950/30 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                                : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                            }`}
                            title={`${habit.name} on ${day.dayOfWeek}, ${day.dateStr}: ${
                              isChecked ? 'Completed' : 'Pending'
                            }${
                              day.isToday
                                ? ' • Today'
                                : day.isFuture
                                ? ' • Future (Locked)'
                                : isLocked
                                ? ' • Past (Locked)'
                                : ' • Past (Editable)'
                            }`}
                          >
                            <div className="w-full h-10 flex items-center justify-center">
                              {isChecked ? (
                                <div
                                  className={`w-6 h-6 rounded-md flex items-center justify-center text-white transition-all duration-150 ease-in-out ${
                                    isCellDisabled ? 'opacity-85' : 'transform hover:scale-105 active:scale-95'
                                  }`}
                                  style={{
                                    backgroundColor: habit.color,
                                    boxShadow: `0 2px 6px ${habit.color}40`,
                                  }}
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              ) : (
                                <div
                                  className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all duration-150 ease-in-out ${
                                    isCellDisabled
                                      ? 'border-slate-200 dark:border-slate-800/80 opacity-40'
                                      : 'border-slate-300 dark:border-slate-700 group-hover:border-slate-400 dark:group-hover:border-slate-600 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40'
                                  }`}
                                >
                                  {day.isToday ? (
                                    <span className="opacity-0 hover:opacity-40 text-[10px] font-bold text-emerald-500 dark:text-emerald-400">
                                      ✓
                                    </span>
                                  ) : isCellDisabled ? (
                                    <span className="text-[7px] text-slate-300 dark:text-slate-600 select-none">
                                      •
                                    </span>
                                  ) : (
                                    <span className="opacity-0 hover:opacity-40 text-[10px] font-bold text-slate-400">
                                      ✓
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* Monthly Progress Cell */}
                      <td className="sm:sticky sm:right-[112px] sm:z-10 bg-white dark:bg-[#0f1422] group-hover:bg-slate-50 dark:group-hover:bg-[#182032] px-2.5 py-2 text-center w-[92px] min-w-[92px] max-w-[92px] border-l border-slate-200/80 dark:border-slate-800 sm:shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.06)] dark:sm:shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.5)] transition-colors duration-150 ease-in-out">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center justify-between w-full text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200">
                            <span>{completedDaysInMonth}/{target}</span>
                            <span className="text-slate-500 dark:text-slate-400">{completionPercentage}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
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

                      {/* Streak Count Cell */}
                      <td className="sm:sticky sm:right-[46px] sm:z-10 bg-white dark:bg-[#0f1422] group-hover:bg-slate-50 dark:group-hover:bg-[#182032] px-2 py-2 text-center font-mono w-[66px] min-w-[66px] max-w-[66px] border-l border-slate-200/80 dark:border-slate-800 transition-colors duration-150 ease-in-out">
                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-700/60 shadow-2xs">
                          <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>{streak.current}</span>
                        </div>
                      </td>

                      {/* Action Cell */}
                      <td className="sm:sticky sm:right-0 sm:z-10 bg-white dark:bg-[#0f1422] group-hover:bg-slate-50 dark:group-hover:bg-[#182032] px-2 py-2 text-center w-[46px] min-w-[46px] max-w-[46px] border-l border-slate-200/80 dark:border-slate-800 transition-colors duration-150 ease-in-out">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete habit "${habit.name}"?`)) {
                              onDeleteHabit(habit.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all duration-150 cursor-pointer"
                          title="Delete habit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}

              {/* Bottom Summary Rows */}
              {habits.length > 0 && (
                <>
                  {/* Daily Completed Count Row */}
                  <tr className="bg-slate-100/90 dark:bg-slate-900/95 font-bold border-t-2 border-slate-300 dark:border-slate-700 divide-x divide-slate-200/80 dark:divide-slate-800 select-none">
                    <td className="sticky left-0 z-10 bg-slate-100 dark:bg-slate-900 px-3 py-2 text-slate-800 dark:text-slate-200 text-xs shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Completed</span>
                      </div>
                    </td>

                    {dailyTotals.map((stat, i) => (
                      <td
                        key={`total-${days[i].dateStr}`}
                        className={`p-0 text-center text-xs font-mono font-extrabold ${
                          stat.isPerfect
                            ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                            : days[i].isToday
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                            : stat.count > 0
                            ? 'text-slate-800 dark:text-slate-200'
                            : 'text-slate-400 dark:text-slate-600'
                        }`}
                      >
                        <div className="w-full h-8 flex items-center justify-center">
                          {stat.count}
                        </div>
                      </td>
                    ))}

                    <td className="sm:sticky sm:right-[112px] sm:z-10 bg-slate-100 dark:bg-slate-900 px-2 py-2 text-center text-slate-700 dark:text-slate-300 font-mono text-xs border-l border-slate-200/80 dark:border-slate-800">
                      Total
                    </td>
                    <td className="sm:sticky sm:right-[46px] sm:z-10 bg-slate-100 dark:bg-slate-900 px-2 py-2 text-center text-slate-500 dark:text-slate-400 text-xs border-l border-slate-200/80 dark:border-slate-800">
                      —
                    </td>
                    <td className="sm:sticky sm:right-0 sm:z-10 bg-slate-100 dark:bg-slate-900 px-2 py-2 border-l border-slate-200/80 dark:border-slate-800" />
                  </tr>

                  {/* Daily Success % Row */}
                  <tr className="bg-slate-50/90 dark:bg-slate-950/80 text-[11px] font-semibold divide-x divide-slate-200/70 dark:divide-slate-800/80 select-none">
                    <td className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-slate-600 dark:text-slate-400 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        <span>Success %</span>
                      </div>
                    </td>

                    {dailyTotals.map((stat, i) => (
                      <td
                        key={`pct-${days[i].dateStr}`}
                        className={`p-0 text-center font-mono ${
                          stat.isPerfect
                            ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                            : days[i].isToday
                            ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                            : stat.percentage > 0
                            ? 'text-slate-600 dark:text-slate-300'
                            : 'text-slate-400 dark:text-slate-600'
                        }`}
                      >
                        <div className="w-full h-7 flex items-center justify-center">
                          {stat.percentage}%
                        </div>
                      </td>
                    ))}

                    <td className="sm:sticky sm:right-[112px] sm:z-10 bg-slate-50 dark:bg-slate-950 px-2 py-1.5 text-center text-slate-600 dark:text-slate-400 font-mono border-l border-slate-200/80 dark:border-slate-800">
                      Avg
                    </td>
                    <td className="sm:sticky sm:right-[46px] sm:z-10 bg-slate-50 dark:bg-slate-950 px-2 py-1.5 text-center text-slate-400 border-l border-slate-200/80 dark:border-slate-800">
                      —
                    </td>
                    <td className="sm:sticky sm:right-0 sm:z-10 bg-slate-50 dark:bg-slate-950 px-2 py-1.5 border-l border-slate-200/80 dark:border-slate-800" />
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

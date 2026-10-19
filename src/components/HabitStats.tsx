import React from 'react';
import { CheckCircle2, TrendingUp, Trophy, Target, Award } from 'lucide-react';
import { MonthSummary } from '../types/habit';

interface HabitStatsProps {
  summary: MonthSummary;
  monthName: string;
}

export const HabitStats: React.FC<HabitStatsProps> = ({ summary, monthName }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Completion Rate */}
      <div className="bg-white dark:bg-[#0f1422] p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs hover:border-emerald-500/40 dark:hover:border-emerald-500/40 hover:shadow-md transition-all duration-200 ease-in-out flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Monthly Rate
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center ring-1 ring-emerald-500/20 shrink-0">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {summary.completionRate}%
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-semibold whitespace-nowrap">
              {monthName}
            </span>
          </div>
        </div>
        <div className="mt-3.5 sm:mt-4 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full shadow-xs shadow-emerald-500/50 transition-all duration-500 ease-in-out"
            style={{ width: `${Math.min(100, Math.max(0, summary.completionRate))}%` }}
          />
        </div>
      </div>

      {/* 2. Total Checked Days */}
      <div className="bg-white dark:bg-[#0f1422] p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs hover:border-indigo-500/40 dark:hover:border-indigo-500/40 hover:shadow-md transition-all duration-200 ease-in-out flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Check-ins
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center ring-1 ring-indigo-500/20 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {summary.totalLogged}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-semibold whitespace-nowrap">
              / {summary.totalPossible}
            </span>
          </div>
        </div>
        <div className="mt-3.5 sm:mt-4 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium whitespace-nowrap overflow-hidden">
          <CheckCircle2 className="w-3 h-3 text-indigo-500 dark:text-indigo-400 shrink-0" />
          <span className="truncate">Total completed</span>
        </div>
      </div>

      {/* 3. Perfect Days & Peak Day */}
      <div className="bg-white dark:bg-[#0f1422] p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs hover:border-amber-500/40 dark:hover:border-amber-500/40 hover:shadow-md transition-all duration-200 ease-in-out flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Perfect Days
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center ring-1 ring-amber-500/20 shrink-0">
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {summary.perfectDaysCount}
            </span>
            <span className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 font-bold whitespace-nowrap">
              100% days
            </span>
          </div>
        </div>
        <div className="mt-3.5 sm:mt-4 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium whitespace-nowrap overflow-hidden">
          <Award className="w-3 h-3 text-amber-500 dark:text-amber-400 shrink-0" />
          <span className="truncate">{summary.bestDay ? `Peak: ${summary.bestDay}` : 'All complete'}</span>
        </div>
      </div>

      {/* 4. Active Habits */}
      <div className="bg-white dark:bg-[#0f1422] p-3.5 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xs hover:border-sky-500/40 dark:hover:border-sky-500/40 hover:shadow-md transition-all duration-200 ease-in-out flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Habits
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center ring-1 ring-sky-500/20 shrink-0">
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {summary.currentActiveHabits}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-semibold whitespace-nowrap">
              tracked
            </span>
          </div>
        </div>
        <div className="mt-3.5 sm:mt-4 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium whitespace-nowrap overflow-hidden">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
          <span className="truncate">Active routines</span>
        </div>
      </div>
    </div>
  );
};

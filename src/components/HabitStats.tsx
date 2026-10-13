import React from 'react';
import { CheckCircle2, TrendingUp, Trophy, Target, Award } from 'lucide-react';
import { MonthSummary } from '../types/habit';

interface HabitStatsProps {
  summary: MonthSummary;
  monthName: string;
}

export const HabitStats: React.FC<HabitStatsProps> = ({ summary, monthName }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {/* 1. Completion Rate */}
      <div className="backdrop-blur-sm bg-white dark:bg-[#111726] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-emerald-500/40 dark:hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-200 ease-in-out flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Monthly Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center ring-1 ring-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {summary.completionRate}%
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">in {monthName}</span>
          </div>
        </div>
        <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full shadow-xs shadow-emerald-500/50 transition-all duration-500 ease-in-out"
            style={{ width: `${summary.completionRate}%` }}
          />
        </div>
      </div>

      {/* 2. Total Checked Days */}
      <div className="backdrop-blur-sm bg-white dark:bg-[#111726] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-indigo-500/40 dark:hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 ease-in-out flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Check-ins
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center ring-1 ring-indigo-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {summary.totalLogged}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">/ {summary.totalPossible} possible</span>
          </div>
        </div>
        <div className="mt-4 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
          <span>Completed repetitions</span>
        </div>
      </div>

      {/* 3. Perfect Days */}
      <div className="backdrop-blur-sm bg-white dark:bg-[#111726] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-amber-500/40 dark:hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-200 ease-in-out flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Perfect Days
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center ring-1 ring-amber-500/20">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {summary.perfectDaysCount}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">100% finished</span>
          </div>
        </div>
        <div className="mt-4 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
          <Award className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
          <span>Every habit completed</span>
        </div>
      </div>

      {/* 4. Active Habits */}
      <div className="backdrop-blur-sm bg-white dark:bg-[#111726] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-sky-500/40 dark:hover:border-sky-500/40 hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-200 ease-in-out flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Habits
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center ring-1 ring-sky-500/20">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {summary.currentActiveHabits}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">in current grid</span>
          </div>
        </div>
        <div className="mt-4 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
          <span>Daily tracked rows</span>
        </div>
      </div>
    </div>
  );
};

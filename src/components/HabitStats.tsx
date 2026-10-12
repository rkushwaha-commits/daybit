import React from 'react';
import { CheckCircle2, TrendingUp, Trophy, Target, Award } from 'lucide-react';
import { MonthSummary } from '../types/habit';

interface HabitStatsProps {
  summary: MonthSummary;
  monthName: string;
}

export const HabitStats: React.FC<HabitStatsProps> = ({ summary, monthName }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Completion Rate */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-in-out">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Monthly Rate
          </span>
          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center transition-transform duration-200 ease-in-out group-hover:scale-110">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.completionRate}%
          </span>
          <span className="text-xs text-slate-400">in {monthName}</span>
        </div>
        <div className="mt-2.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${summary.completionRate}%` }}
          />
        </div>
      </div>

      {/* 2. Total Checked Days */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-in-out">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Completions
          </span>
          <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center transition-transform duration-200 ease-in-out group-hover:scale-110">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.totalLogged}
          </span>
          <span className="text-xs text-slate-400">/ {summary.totalPossible} possible</span>
        </div>
        <div className="mt-2.5 text-[11px] text-slate-500 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
          <span>Total completed check-ins</span>
        </div>
      </div>

      {/* 3. Perfect Days */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-in-out">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Perfect Days
          </span>
          <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center transition-transform duration-200 ease-in-out group-hover:scale-110">
            <Trophy className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.perfectDaysCount}
          </span>
          <span className="text-xs text-amber-600 font-medium">100% finished</span>
        </div>
        <div className="mt-2.5 text-[11px] text-slate-500 flex items-center gap-1">
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>Every habit completed</span>
        </div>
      </div>

      {/* 4. Active Habits */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-sky-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-in-out">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Active Habits
          </span>
          <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center transition-transform duration-200 ease-in-out group-hover:scale-110">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.currentActiveHabits}
          </span>
          <span className="text-xs text-slate-400">habits in grid</span>
        </div>
        <div className="mt-2.5 text-[11px] text-slate-500 flex items-center gap-1">
          <span>Tracked daily rows</span>
        </div>
      </div>
    </div>
  );
};

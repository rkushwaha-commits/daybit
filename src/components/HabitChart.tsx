import React, { useMemo, useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Habit } from '../types/habit';
import { TrendingUp, BarChart2 } from 'lucide-react';

interface DayEntry {
  dateStr: string;
  dayNumber: number;
  dayOfWeek: string;
  isToday: boolean;
  isWeekend: boolean;
}

interface HabitChartProps {
  days: DayEntry[];
  habits: Habit[];
}

// ── Custom Tooltip ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string | number }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-lg text-xs">
        <p className="font-semibold text-slate-700 dark:text-slate-200 mb-0.5">Day {label}</p>
        <p className="text-emerald-600 dark:text-emerald-400 font-bold">{payload[0].value}% completed</p>
      </div>
    );
  }
  return null;
};

// ── Category colours ────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  Health: '#10b981',
  Fitness: '#f59e0b',
  Productivity: '#6366f1',
  Learning: '#3b82f6',
  Mindfulness: '#a855f7',
  Lifestyle: '#ec4899',
};

const HabitChart: React.FC<HabitChartProps> = ({ days, habits }) => {
  // Track screen width for responsive recharts dimensions
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ── 1. Daily completion % (line chart) ────────────────────────────────────
  const dailyData = useMemo(() =>
    days.map((day) => {
      const completed = habits.filter((h) => h.completions[day.dateStr]).length;
      const total = habits.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { day: day.dayNumber, percentage, dateStr: day.dateStr };
    }),
    [days, habits]
  );

  // ── 2. Per-habit total completions (bar chart) ────────────────────
  const habitBarData = useMemo(() =>
    habits.map((h) => ({
      name: h.name,
      emoji: h.emoji,
      completions: Object.values(h.completions).filter(Boolean).length,
      target: h.targetPerMonth ?? days.length,
      category: h.category,
    })).sort((a, b) => b.completions - a.completions),
    [habits, days.length]
  );

  if (!habits.length) return null;

  return (
    <div className="space-y-4">
      {/* ── Daily Completion Line Chart ───────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3.5 sm:p-5 shadow-xs transition-colors duration-200 ease-in-out">
        <div className="flex items-center justify-between gap-2 mb-3.5 sm:mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate">Daily Completion Rate</h2>
          </div>
          <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full shrink-0">
            % each day
          </span>
        </div>
        <div style={{ height: isMobile ? 180 : 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dailyData}
              margin={{ top: 5, right: 10, left: isMobile ? -25 : -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis
                dataKey="day"
                interval={isMobile ? 3 : 1}
                tick={{ fontSize: isMobile ? 9 : 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: isMobile ? 9 : 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: isMobile ? 2 : 3, fill: '#10b981', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Per-Habit Completions Bar Chart ───────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3.5 sm:p-5 shadow-xs transition-colors duration-200 ease-in-out">
        <div className="flex items-center justify-between gap-2 mb-3.5 sm:mb-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate">Habit Completions</h2>
          </div>
          <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full shrink-0">
            by habit
          </span>
        </div>
        <div style={{ height: Math.max(160, habitBarData.length * 36) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={habitBarData}
              layout="vertical"
              margin={{ top: 0, right: 15, left: isMobile ? -10 : 5, bottom: 0 }}
              barSize={14}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis
                type="number"
                tick={{ fontSize: isMobile ? 9 : 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={isMobile ? 100 : 175}
                tick={{ fontSize: isMobile ? 10 : 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value: number) => [value, 'Days completed']}
                cursor={{ fill: 'rgba(99,102,241,0.06)' }}
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, #ffffff)',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="completions" radius={[0, 6, 6, 0]}>
                {habitBarData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[entry.category] ?? '#10b981'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-2.5 sm:gap-3 mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
            <span key={cat} className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: color }} />
              {cat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HabitChart;

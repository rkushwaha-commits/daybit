import React, { useMemo } from 'react';
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
import { TrendingUp, BarChart2, Flame } from 'lucide-react';

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
      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg text-xs">
        <p className="font-semibold text-slate-700 mb-0.5">Day {label}</p>
        <p className="text-emerald-600 font-bold">{payload[0].value}% completed</p>
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

  // ── 2. Per-habit total completions (bar chart) ────────────────────────────
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

  // ── 3. Summary stats ──────────────────────────────────────────────────────
  const totalCompleted = useMemo(() =>
    habits.reduce((sum, h) => sum + Object.values(h.completions).filter(Boolean).length, 0),
    [habits]
  );
  const overallRate = habits.length > 0 && days.length > 0
    ? Math.round((totalCompleted / (habits.length * days.length)) * 100)
    : 0;

  const bestHabit = habitBarData[0];

  return (
    <div className="space-y-5">
      {/* ── Summary pills ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 group hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-300 transition-all duration-200 ease-in-out shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 transition-transform duration-200 ease-in-out group-hover:scale-110">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Overall Rate</p>
            <p className="text-xl font-bold text-slate-800">{overallRate}%</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 group hover:shadow-md hover:-translate-y-0.5 hover:border-amber-300 transition-all duration-200 ease-in-out shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 transition-transform duration-200 ease-in-out group-hover:scale-110">
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500">Best Habit</p>
            <p className="text-sm font-bold text-slate-800 leading-tight truncate" title={bestHabit ? `${bestHabit.emoji} ${bestHabit.name}` : ''}>
              {bestHabit ? `${bestHabit.emoji} ${bestHabit.name}` : '—'}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 group hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-300 transition-all duration-200 ease-in-out shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 transition-transform duration-200 ease-in-out group-hover:scale-110">
            <BarChart2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Check-ins</p>
            <p className="text-xl font-bold text-slate-800">{totalCompleted}</p>
          </div>
        </div>
      </div>

      {/* ── Daily Completion Line Chart ───────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-all duration-200 ease-in-out">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-semibold text-slate-700">Daily Completion Rate</h2>
          <span className="ml-auto text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
            % of habits done each day
          </span>
        </div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Per-Habit Completions Bar Chart ───────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-all duration-200 ease-in-out">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-slate-700">Habit Completions This Month</h2>
          <span className="ml-auto text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
            by habit
          </span>
        </div>
        <div style={{ height: Math.max(180, habitBarData.length * 38) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={habitBarData}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
              barSize={16}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={175}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value: number) => [value, 'Days completed']}
                cursor={{ fill: 'rgba(99,102,241,0.04)' }}
                contentStyle={{
                  border: '1px solid #e2e8f0',
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
        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-slate-100">
          {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
            <span key={cat} className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
              {cat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HabitChart;

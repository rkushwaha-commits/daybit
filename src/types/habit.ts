export type HabitCategory =
  | 'Health'
  | 'Fitness'
  | 'Productivity'
  | 'Learning'
  | 'Mindfulness'
  | 'Lifestyle';

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  color: string; // Tailwind color token or hex
  emoji: string;
  targetPerMonth?: number; // target completed days in month
  createdAt: string; // ISO date string
  completions: Record<string, boolean>; // key: "YYYY-MM-DD", val: true
  description?: string;
}

export interface DayStat {
  dateStr: string;
  dayNumber: number;
  dayOfWeek: string;
  isToday: boolean;
  isWeekend: boolean;
  completedCount: number;
  totalHabits: number;
  percentage: number;
}

export interface MonthSummary {
  totalLogged: number;
  totalPossible: number;
  completionRate: number;
  bestDay: string | null;
  perfectDaysCount: number;
  currentActiveHabits: number;
}

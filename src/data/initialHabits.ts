import { Habit, HabitCategory } from '../types/habit';

export interface StarterHabitOption {
  id: string;
  name: string;
  category: HabitCategory;
  emoji: string;
  color: string;
  targetPerMonth: number;
  description: string;
}

export const STARTER_HABIT_OPTIONS: StarterHabitOption[] = [
  {
    id: 'h1',
    name: 'Drink 2.5L Water',
    category: 'Health',
    emoji: '💧',
    color: '#0ea5e9', // Sky blue
    targetPerMonth: 28,
    description: 'Stay hydrated — keep a 1L bottle on desk and refill throughout the day',
  },
  {
    id: 'h2',
    name: 'Morning Workout / Walk',
    category: 'Fitness',
    emoji: '🏃',
    color: '#10b981', // Emerald
    targetPerMonth: 22,
    description: '30 mins of exercise, jogging, gym or a brisk morning walk',
  },
  {
    id: 'h3',
    name: 'Read 20 Mins',
    category: 'Learning',
    emoji: '📚',
    color: '#6366f1', // Indigo
    targetPerMonth: 25,
    description: 'Read non-fiction, career growth books, or articles without distractions',
  },
  {
    id: 'h4',
    name: 'Deep Work (2hr Focus)',
    category: 'Productivity',
    emoji: '⚡',
    color: '#f59e0b', // Amber
    targetPerMonth: 20,
    description: 'Dedicated focus block on high-value tasks with notifications silenced',
  },
  {
    id: 'h5',
    name: 'Healthy Clean Meals',
    category: 'Health',
    emoji: '🥗',
    color: '#ec4899', // Pink
    targetPerMonth: 26,
    description: 'Eat whole foods, vegetables, fruits and avoid junk/sugary snacks',
  },
  {
    id: 'h6',
    name: '10 Mins Meditation',
    category: 'Mindfulness',
    emoji: '🧘',
    color: '#8b5cf6', // Violet
    targetPerMonth: 20,
    description: 'Mindful breathing, reflection or gentle stretch before bedtime',
  },
  {
    id: 'h7',
    name: 'Sleep by 11 PM (7-8 hrs)',
    category: 'Lifestyle',
    emoji: '😴',
    color: '#14b8a6', // Teal
    targetPerMonth: 28,
    description: 'Consistent sleep schedule for optimal energy and recovery',
  },
];

export function buildHabitsFromStarterIds(selectedIds: string[]): Habit[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const createdIso = new Date(year, month, 1).toISOString();

  return STARTER_HABIT_OPTIONS
    .filter((opt) => selectedIds.includes(opt.id))
    .map((opt) => ({
      id: opt.id,
      name: opt.name,
      category: opt.category,
      color: opt.color,
      emoji: opt.emoji,
      targetPerMonth: opt.targetPerMonth,
      createdAt: createdIso,
      description: opt.description,
      completions: {},
    }));
}

export function getDefaultHabits(): Habit[] {
  const allIds = STARTER_HABIT_OPTIONS.map((opt) => opt.id);
  return buildHabitsFromStarterIds(allIds);
}

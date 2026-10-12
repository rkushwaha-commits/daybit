import { Habit } from '../types/habit';
import { formatDateStr } from '../utils/dateUtils';

// Helper to seed completions for days in current month up to day 11 or today
function generateSampleCompletions(activeDays: number[], year: number, month: number): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  for (const day of activeDays) {
    const key = formatDateStr(year, month, day);
    result[key] = true;
  }
  return result;
}

export function getDefaultHabits(): Habit[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  return [
    {
      id: 'h1',
      name: 'Morning Workout & Stretch',
      category: 'Fitness',
      emoji: '🏋️‍♂️',
      color: '#10b981', // Emerald
      targetPerMonth: 22,
      createdAt: new Date(year, month, 1).toISOString(),
      description: '30 mins HIIT or gym workout followed by 10 mins mobility stretch',
      completions: generateSampleCompletions([1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12], year, month),
    },
    {
      id: 'h2',
      name: 'Read 20 Pages of a Book',
      category: 'Learning',
      emoji: '📚',
      color: '#6366f1', // Indigo
      targetPerMonth: 25,
      createdAt: new Date(year, month, 1).toISOString(),
      description: 'Deep reading non-fiction or career growth books without phone distractions',
      completions: generateSampleCompletions([1, 2, 4, 5, 6, 7, 9, 10, 11, 12], year, month),
    },
    {
      id: 'h3',
      name: 'Drink 3L Water',
      category: 'Health',
      emoji: '💧',
      color: '#0ea5e9', // Sky blue
      targetPerMonth: 28,
      createdAt: new Date(year, month, 1).toISOString(),
      description: 'Keep a 1L bottle on desk and refill 3 times throughout the day',
      completions: generateSampleCompletions([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], year, month),
    },
    {
      id: 'h4',
      name: '10 Mins Meditation',
      category: 'Mindfulness',
      emoji: '🧘',
      color: '#8b5cf6', // Violet
      targetPerMonth: 20,
      createdAt: new Date(year, month, 1).toISOString(),
      description: 'Guided breathing session using headspace or calm before work',
      completions: generateSampleCompletions([1, 3, 4, 5, 7, 8, 10, 11], year, month),
    },
    {
      id: 'h5',
      name: 'Deep Work (2hr Focus)',
      category: 'Productivity',
      emoji: '⚡',
      color: '#f59e0b', // Amber
      targetPerMonth: 20,
      createdAt: new Date(year, month, 1).toISOString(),
      description: 'Zero Slack/emails focus block on core programming & problem solving',
      completions: generateSampleCompletions([2, 3, 4, 5, 6, 8, 9, 10, 11, 12], year, month),
    },
    {
      id: 'h6',
      name: 'No Sugar / Junk Food',
      category: 'Health',
      emoji: '🥗',
      color: '#ec4899', // Pink
      targetPerMonth: 24,
      createdAt: new Date(year, month, 1).toISOString(),
      description: 'Clean eating with whole foods, fruits and home-cooked meals',
      completions: generateSampleCompletions([1, 2, 4, 5, 6, 8, 11, 12], year, month),
    },
    {
      id: 'h7',
      name: 'Evening Journaling',
      category: 'Mindfulness',
      emoji: '✍️',
      color: '#14b8a6', // Teal
      targetPerMonth: 26,
      createdAt: new Date(year, month, 1).toISOString(),
      description: '3 things I am grateful for, what went well, and what to improve tomorrow',
      completions: generateSampleCompletions([1, 2, 3, 4, 6, 7, 8, 9, 10, 11], year, month),
    }
  ];
}

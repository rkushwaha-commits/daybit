import { Habit } from '../types/habit';

export function getDefaultHabits(): Habit[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const createdIso = new Date(year, month, 1).toISOString();

  return [
    {
      id: 'h1',
      name: 'Drink 2.5L Water',
      category: 'Health',
      emoji: '💧',
      color: '#0ea5e9', // Sky blue
      targetPerMonth: 28,
      createdAt: createdIso,
      description: 'Stay hydrated — keep a 1L bottle on desk and refill throughout the day',
      completions: {}, // Starts unticked for fresh user tracking
    },
    {
      id: 'h2',
      name: 'Morning Workout / Walk',
      category: 'Fitness',
      emoji: '🏃',
      color: '#10b981', // Emerald
      targetPerMonth: 22,
      createdAt: createdIso,
      description: '30 mins of exercise, jogging, gym or a brisk morning walk',
      completions: {}, // Starts unticked
    },
    {
      id: 'h3',
      name: 'Read 20 Mins',
      category: 'Learning',
      emoji: '📚',
      color: '#6366f1', // Indigo
      targetPerMonth: 25,
      createdAt: createdIso,
      description: 'Read non-fiction, career growth books, or articles without distractions',
      completions: {}, // Starts unticked
    },
    {
      id: 'h4',
      name: 'Deep Work (2hr Focus)',
      category: 'Productivity',
      emoji: '⚡',
      color: '#f59e0b', // Amber
      targetPerMonth: 20,
      createdAt: createdIso,
      description: 'Dedicated focus block on high-value tasks with notifications silenced',
      completions: {}, // Starts unticked
    },
    {
      id: 'h5',
      name: 'Healthy Clean Meals',
      category: 'Health',
      emoji: '🥗',
      color: '#ec4899', // Pink
      targetPerMonth: 26,
      createdAt: createdIso,
      description: 'Eat whole foods, vegetables, fruits and avoid junk/sugary snacks',
      completions: {}, // Starts unticked
    },
    {
      id: 'h6',
      name: '10 Mins Meditation & Calm',
      category: 'Mindfulness',
      emoji: '🧘',
      color: '#8b5cf6', // Violet
      targetPerMonth: 20,
      createdAt: createdIso,
      description: 'Mindful breathing, reflection or gentle stretch before bedtime',
      completions: {}, // Starts unticked
    },
    {
      id: 'h7',
      name: 'Sleep by 11 PM (7-8 hrs)',
      category: 'Lifestyle',
      emoji: '😴',
      color: '#14b8a6', // Teal
      targetPerMonth: 28,
      createdAt: createdIso,
      description: 'Consistent sleep schedule for optimal energy and recovery',
      completions: {}, // Starts unticked
    },
  ];
}

export interface AvatarPersona {
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  bgGradient: string;
  ringColor: string;
  shadowColor: string;
}

export const AVATAR_PERSONAS: AvatarPersona[] = [
  {
    id: 'volt',
    name: 'Volt',
    tagline: 'High Energy & Momentum',
    emoji: '⚡',
    bgGradient: 'from-amber-400 via-amber-500 to-orange-500',
    ringColor: 'ring-amber-400 dark:ring-amber-500',
    shadowColor: 'rgba(245, 158, 11, 0.35)',
  },
  {
    id: 'zen',
    name: 'Zen',
    tagline: 'Mindful, Calm & Balanced',
    emoji: '🧘',
    bgGradient: 'from-emerald-400 via-teal-500 to-emerald-600',
    ringColor: 'ring-emerald-400 dark:ring-emerald-500',
    shadowColor: 'rgba(16, 185, 129, 0.35)',
  },
  {
    id: 'astra',
    name: 'Astra',
    tagline: 'Ambition & High Growth',
    emoji: '🚀',
    bgGradient: 'from-indigo-500 via-purple-500 to-pink-500',
    ringColor: 'ring-indigo-400 dark:ring-indigo-500',
    shadowColor: 'rgba(99, 102, 241, 0.35)',
  },
  {
    id: 'titan',
    name: 'Titan',
    tagline: 'Strength & Courage',
    emoji: '🦁',
    bgGradient: 'from-orange-500 via-amber-600 to-yellow-600',
    ringColor: 'ring-orange-400 dark:ring-orange-500',
    shadowColor: 'rgba(234, 88, 12, 0.35)',
  },
  {
    id: 'sage',
    name: 'Sage',
    tagline: 'Wisdom & Deep Focus',
    emoji: '🦉',
    bgGradient: 'from-sky-400 via-blue-500 to-indigo-600',
    ringColor: 'ring-sky-400 dark:ring-sky-500',
    shadowColor: 'rgba(14, 165, 233, 0.35)',
  },
  {
    id: 'ninja',
    name: 'Ninja',
    tagline: 'Quiet, Ruthless Discipline',
    emoji: '🥷',
    bgGradient: 'from-slate-700 via-slate-800 to-slate-900',
    ringColor: 'ring-slate-400 dark:ring-slate-500',
    shadowColor: 'rgba(71, 85, 105, 0.35)',
  },
  {
    id: 'spark',
    name: 'Spark',
    tagline: 'Quick, Agile & Smart',
    emoji: '🦊',
    bgGradient: 'from-rose-400 via-orange-500 to-amber-500',
    ringColor: 'ring-rose-400 dark:ring-rose-500',
    shadowColor: 'rgba(244, 63, 94, 0.35)',
  },
  {
    id: 'apex',
    name: 'Apex',
    tagline: 'Unbreakable Resilience',
    emoji: '💎',
    bgGradient: 'from-cyan-400 via-teal-500 to-blue-600',
    ringColor: 'ring-cyan-400 dark:ring-cyan-500',
    shadowColor: 'rgba(6, 182, 212, 0.35)',
  },
  {
    id: 'bonsai',
    name: 'Bonsai',
    tagline: 'Organic Daily Habits',
    emoji: '🌲',
    bgGradient: 'from-emerald-600 via-green-600 to-teal-700',
    ringColor: 'ring-emerald-400 dark:ring-emerald-500',
    shadowColor: 'rgba(5, 150, 105, 0.35)',
  },
  {
    id: 'victor',
    name: 'Victor',
    tagline: '100% Habit Mastery',
    emoji: '🏆',
    bgGradient: 'from-yellow-400 via-amber-500 to-yellow-600',
    ringColor: 'ring-yellow-400 dark:ring-yellow-500',
    shadowColor: 'rgba(234, 179, 8, 0.35)',
  },
];

export const DEFAULT_AVATAR_ID = 'volt';

export function getAvatarById(id: string | null | undefined): AvatarPersona {
  const found = AVATAR_PERSONAS.find((a) => a.id === id);
  return found || AVATAR_PERSONAS[0];
}

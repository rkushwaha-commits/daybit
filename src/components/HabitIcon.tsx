import React from 'react';
import {
  Zap,
  Dumbbell,
  Activity,
  Droplets,
  BookOpen,
  Utensils,
  Moon,
  Target,
  PenTool,
  Laptop,
  Brain,
  Sprout,
  Bike,
  Palette,
  Heart,
  Flame,
  Smile,
  Sun,
  LucideIcon,
} from 'lucide-react';

export interface HabitIconOption {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const AVAILABLE_HABIT_ICONS: HabitIconOption[] = [
  { id: 'zap', label: 'Energy / Focus', icon: Zap },
  { id: 'dumbbell', label: 'Workout', icon: Dumbbell },
  { id: 'activity', label: 'Cardio / Steps', icon: Activity },
  { id: 'droplets', label: 'Water', icon: Droplets },
  { id: 'book-open', label: 'Reading', icon: BookOpen },
  { id: 'utensils', label: 'Nutrition', icon: Utensils },
  { id: 'moon', label: 'Sleep', icon: Moon },
  { id: 'target', label: 'Goals', icon: Target },
  { id: 'pen-tool', label: 'Writing', icon: PenTool },
  { id: 'laptop', label: 'Deep Work', icon: Laptop },
  { id: 'brain', label: 'Mindset', icon: Brain },
  { id: 'sprout', label: 'Growth', icon: Sprout },
  { id: 'bike', label: 'Cycling', icon: Bike },
  { id: 'palette', label: 'Creative', icon: Palette },
  { id: 'heart', label: 'Health', icon: Heart },
  { id: 'flame', label: 'Intensity', icon: Flame },
  { id: 'smile', label: 'Mindfulness', icon: Smile },
  { id: 'sun', label: 'Morning', icon: Sun },
];

export const HABIT_ICON_MAP: Record<string, LucideIcon> = {
  // Key names
  zap: Zap,
  dumbbell: Dumbbell,
  activity: Activity,
  droplets: Droplets,
  'book-open': BookOpen,
  bookopen: BookOpen,
  utensils: Utensils,
  moon: Moon,
  target: Target,
  'pen-tool': PenTool,
  pentool: PenTool,
  laptop: Laptop,
  brain: Brain,
  sprout: Sprout,
  bike: Bike,
  palette: Palette,
  heart: Heart,
  flame: Flame,
  smile: Smile,
  sun: Sun,

  // Seamless fallback for existing/legacy emoji habits
  '⚡': Zap,
  '🏋️‍♂️': Dumbbell,
  '🏋️': Dumbbell,
  '🏃': Activity,
  '🏃‍♂️': Activity,
  '💧': Droplets,
  '📚': BookOpen,
  '📖': BookOpen,
  '🥗': Utensils,
  '🍽️': Utensils,
  '🧘': Smile,
  '🧘‍♂️': Smile,
  '😴': Moon,
  '💤': Moon,
  '🎯': Target,
  '✍️': PenTool,
  '📝': PenTool,
  '💻': Laptop,
  '🖥️': Laptop,
  '🧠': Brain,
  '🌱': Sprout,
  '🚴': Bike,
  '🚴‍♂️': Bike,
  '🎨': Palette,
  '❤️': Heart,
  '🔥': Flame,
  '☀️': Sun,
};

interface HabitIconProps {
  name: string;
  color?: string;
  className?: string;
  strokeWidth?: number;
}

export const HabitIcon: React.FC<HabitIconProps> = ({
  name,
  color,
  className = 'w-4 h-4',
  strokeWidth = 2.2,
}) => {
  const normalizedKey = name ? name.toLowerCase().trim() : 'zap';
  const IconComponent = HABIT_ICON_MAP[normalizedKey] || HABIT_ICON_MAP[name];

  if (IconComponent) {
    return (
      <IconComponent
        className={className}
        style={color ? { color } : undefined}
        strokeWidth={strokeWidth}
      />
    );
  }

  // Fallback for any unknown character
  return <span className="leading-none text-sm">{name || '⚡'}</span>;
};

import React, { useState, useEffect } from 'react';
import { X, Pencil, ChevronDown } from 'lucide-react';
import { Habit, HabitCategory } from '../types/habit';
import { AVAILABLE_HABIT_ICONS } from './HabitIcon';

interface EditHabitModalProps {
  isOpen: boolean;
  habit: Habit | null;
  onClose: () => void;
  onSaveHabit: (habit: Habit) => void;
  daysInMonth: number;
}

const COLOR_OPTIONS = [
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Sky', hex: '#0ea5e9' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Teal', hex: '#14b8a6' },
  { name: 'Pink', hex: '#ec4899' },
];

const CATEGORIES: HabitCategory[] = [
  'Health',
  'Fitness',
  'Productivity',
  'Learning',
  'Mindfulness',
  'Lifestyle',
];

export const EditHabitModal: React.FC<EditHabitModalProps> = ({
  isOpen,
  habit,
  onClose,
  onSaveHabit,
  daysInMonth,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<HabitCategory>('Productivity');
  const [emoji, setEmoji] = useState('zap');
  const [color, setColor] = useState('#10b981');
  const [targetPerMonth, setTargetPerMonth] = useState(20);
  const [description, setDescription] = useState('');

  // Sync state when habit to edit changes
  useEffect(() => {
    if (habit) {
      setName(habit.name || '');
      setCategory(habit.category || 'Productivity');
      setEmoji(habit.emoji || 'zap');
      setColor(habit.color || '#10b981');
      setTargetPerMonth(habit.targetPerMonth ?? Math.min(20, daysInMonth));
      setDescription(habit.description || '');
    }
  }, [habit, daysInMonth]);

  if (!isOpen || !habit) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveHabit({
      ...habit, // Preserves id, createdAt, and historical completions!
      name: name.trim(),
      category,
      emoji,
      color,
      targetPerMonth: Number(targetPerMonth),
      description: description.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-200 ease-in-out animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden animate-modal-in transition-all duration-200">
        
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-tr from-amber-500/15 via-orange-500/10 to-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center ring-1 ring-amber-500/25 dark:ring-amber-400/30 shadow-2xs">
              <Pencil className="w-4 h-4" strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                Edit Habit
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Update details • Streaks & history preserved
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all duration-150 cursor-pointer"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form - Scrollable */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Habit Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Habit Name
              </label>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                Required
              </span>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Drink 3L Water daily"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-2xs"
            />
          </div>

          {/* Category & Target Days Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as HabitCategory)}
                  className="w-full px-3 py-2 text-xs bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium appearance-none cursor-pointer pr-8"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Target Days Per Month */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Target <span className="text-[10px] font-normal text-slate-400">(Days / Mo)</span>
              </label>
              <input
                type="number"
                min="1"
                max={daysInMonth}
                value={targetPerMonth}
                onChange={(e) => setTargetPerMonth(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-mono font-bold"
              />
            </div>
          </div>

          {/* Premium Vector Icon Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Icon
              </label>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                18 Curated Icons
              </span>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5 p-2 bg-slate-50/70 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800">
              {AVAILABLE_HABIT_ICONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = emoji === item.id || emoji === item.id.toLowerCase();
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setEmoji(item.id)}
                    title={item.label}
                    className={`h-9 rounded-lg flex items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'shadow-xs scale-105'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
                    }`}
                    style={
                      isSelected
                        ? {
                            backgroundColor: `${color}18`,
                            color: color,
                            border: `2px solid ${color}`,
                            boxShadow: `0 0 10px ${color}35`,
                          }
                        : undefined
                    }
                  >
                    <IconComponent className="w-4 h-4" strokeWidth={isSelected ? 2.5 : 2} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accent Color Palette */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => {
                const isSelected = color === c.hex;
                return (
                  <button
                    type="button"
                    key={c.hex}
                    onClick={() => setColor(c.hex)}
                    title={c.name}
                    className={`w-6 h-6 rounded-full transition-all duration-150 active:scale-90 flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-offset-2 ring-slate-800 dark:ring-white dark:ring-offset-slate-900 scale-110 shadow-sm'
                        : 'hover:scale-110 opacity-85 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                );
              })}
            </div>
          </div>

          {/* Why It Matters (Motivation Notes) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Why It Matters
              </label>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                Optional
              </span>
            </div>
            <input
              type="text"
              placeholder="e.g. Boost hydration, focus & clarity"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-150"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 pb-safe sm:pb-0 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 active:scale-95 rounded-xl shadow-md shadow-orange-500/25 transition-all cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Table2,
  ArrowRight,
  ArrowLeft,
  Sun,
  Moon,
  Check,
  Sparkles,
  Loader2,
  User,
  X,
} from 'lucide-react';
import { signInWithGoogle } from '../lib/supabase';
import { Theme } from '../hooks/useTheme';
import { Habit } from '../types/habit';
import { STARTER_HABIT_OPTIONS, buildHabitsFromStarterIds } from '../data/initialHabits';
import { AVATAR_PERSONAS } from '../data/avatars';

interface SetupScreenProps {
  theme: Theme;
  onToggleTheme: (e?: React.MouseEvent) => void;
  selectedAvatarId: string;
  onSelectAvatar: (avatarId: string) => void;
  currentHabits: Habit[];
  onSaveHabits: (habits: Habit[]) => void;
  onComplete: () => void;
  onClose?: () => void;
}

// Crisp standard Google "G" SVG icon
const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const SetupScreen: React.FC<SetupScreenProps> = ({
  theme,
  onToggleTheme,
  selectedAvatarId,
  onSelectAvatar,
  currentHabits,
  onSaveHabits,
  onComplete,
  onClose,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fadeClass, setFadeClass] = useState('animate-fade-in');

  // Pre-populate selected habit IDs (defaults to top 3)
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>(() => {
    if (currentHabits && currentHabits.length > 0) {
      const existingStarterIds = currentHabits
        .map((h) => h.id)
        .filter((id) => STARTER_HABIT_OPTIONS.some((opt) => opt.id === id));
      if (existingStarterIds.length > 0) return existingStarterIds;
    }
    return ['h1', 'h2', 'h3']; // Water, Workout, Reading
  });

  const changeStep = (nextStep: 1 | 2 | 3) => {
    setFadeClass('opacity-0 translate-y-1 transition-all duration-150');
    setTimeout(() => {
      setStep(nextStep);
      setFadeClass('animate-fade-in');
    }, 160);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorMessage(null);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect with Google';
      setErrorMessage(msg);
      setGoogleLoading(false);
    }
  };

  const toggleHabitSelection = (habitId: string) => {
    setSelectedHabitIds((prev) =>
      prev.includes(habitId) ? prev.filter((id) => id !== habitId) : [...prev, habitId]
    );
  };

  const handleSelectAllHabits = () => {
    if (selectedHabitIds.length === STARTER_HABIT_OPTIONS.length) {
      setSelectedHabitIds([]);
    } else {
      setSelectedHabitIds(STARTER_HABIT_OPTIONS.map((h) => h.id));
    }
  };

  const handleSelectTheme = (selected: Theme, e: React.MouseEvent) => {
    if (theme !== selected) {
      onToggleTheme(e);
    }
  };

  const applyHabitsAndFinish = () => {
    const customHabits = (currentHabits || []).filter(
      (h) => !STARTER_HABIT_OPTIONS.some((opt) => opt.id === h.id)
    );
    const newStarterHabits = buildHabitsFromStarterIds(selectedHabitIds);
    onSaveHabits([...newStarterHabits, ...customHabits]);
    onComplete();
  };

  const featuredPersonas = AVATAR_PERSONAS.slice(0, 6);
  const activePersona =
    AVATAR_PERSONAS.find((p) => p.id === selectedAvatarId) || AVATAR_PERSONAS[0];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs transition-colors duration-300">
      {/* Subtle ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div
        className={`relative w-full max-w-md rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 ${fadeClass}`}
      >
        {/* Close Button (if opened from dashboard) */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close setup"
            aria-label="Close setup"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Back Button for Steps 2 & 3 */}
        {step > 1 && (
          <button
            onClick={() => changeStep((step - 1) as 1 | 2)}
            className="absolute top-4 left-4 inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        )}

        {/* Minimal Progress Dots */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          <div
            className={`h-1 rounded-full transition-all duration-300 ${
              step === 1 ? 'w-6 bg-emerald-500' : 'w-2 bg-slate-200 dark:bg-slate-700'
            }`}
          />
          <div
            className={`h-1 rounded-full transition-all duration-300 ${
              step === 2 ? 'w-6 bg-emerald-500' : 'w-2 bg-slate-200 dark:bg-slate-700'
            }`}
          />
          <div
            className={`h-1 rounded-full transition-all duration-300 ${
              step === 3 ? 'w-6 bg-emerald-500' : 'w-2 bg-slate-200 dark:bg-slate-700'
            }`}
          />
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            STEP 1: Minimalist Welcome & Auth
        ═════════════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Clean Hero */}
            <div className="text-center pt-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 mb-3.5">
                <Table2 className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Habit<span className="text-emerald-500">Flow</span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Simple, spreadsheet-style habit tracking
              </p>
            </div>

            {/* Clean Action Buttons */}
            <div className="space-y-3 pt-2">
              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-xs active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                ) : (
                  <GoogleIcon className="w-4 h-4 shrink-0" />
                )}
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <span className="relative px-3 bg-white dark:bg-[#0f172a] text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  or
                </span>
              </div>

              {/* Continue as Guest Button */}
              <button
                type="button"
                onClick={() => changeStep(2)}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-sm transition-all active:scale-[0.99] cursor-pointer"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>Continue as Guest</span>
              </button>
            </div>

            {/* Error Message if OAuth fails */}
            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs text-center">
                {errorMessage}
              </div>
            )}

            {/* Minimal Subtext */}
            <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 pt-1">
              Data is saved locally in your browser • Free & private
            </p>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            STEP 2: Starter Habits (Clean & Minimal)
        ═════════════════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center pt-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Choose your habits
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pick what to track, or customize anytime later
              </p>
            </div>

            {/* Quick Toggle Row */}
            <div className="flex items-center justify-between text-xs px-1 text-slate-500 dark:text-slate-400">
              <span>{selectedHabitIds.length} selected</span>
              <button
                type="button"
                onClick={handleSelectAllHabits}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline cursor-pointer"
              >
                {selectedHabitIds.length === STARTER_HABIT_OPTIONS.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>

            {/* Clean Habit List */}
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-0.5">
              {STARTER_HABIT_OPTIONS.map((habit) => {
                const isSelected = selectedHabitIds.includes(habit.id);
                return (
                  <button
                    key={habit.id}
                    type="button"
                    onClick={() => toggleHabitSelection(habit.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500/80 bg-emerald-50/40 dark:bg-emerald-950/30 text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">{habit.emoji}</span>
                      <span className="text-xs font-semibold truncate">{habit.name}</span>
                    </div>

                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ml-2 transition-colors ${
                        isSelected
                          ? 'bg-emerald-500 text-white'
                          : 'border border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => changeStep(3)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedHabitIds([]);
                  changeStep(3);
                }}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 py-1 transition-colors cursor-pointer"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            STEP 3: Appearance & Persona (Clean & Minimal)
        ═════════════════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="text-center pt-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Personalize
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Choose your theme and avatar
              </p>
            </div>

            {/* Theme Selector */}
            <div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={(e) => handleSelectTheme('light', e)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-1 ring-emerald-500/30'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSelectTheme('dark', e)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'border-emerald-500 bg-slate-800 text-white ring-1 ring-emerald-500/30'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Dark</span>
                </button>
              </div>
            </div>

            {/* Avatar Selector */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                <span>Avatar</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {activePersona.name}
                </span>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {featuredPersonas.map((persona) => {
                  const isSelected = selectedAvatarId === persona.id;
                  return (
                    <button
                      key={persona.id}
                      type="button"
                      onClick={() => onSelectAvatar(persona.id)}
                      className={`relative flex items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40 ring-1 ring-emerald-500/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <span className="text-lg">{persona.emoji}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={applyHabitsAndFinish}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Tracking</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

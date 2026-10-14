import React, { useState } from 'react';
import { Table2, Cloud, ArrowRight, Sun, Moon, Check, Sparkles, ShieldCheck, Smartphone, Loader2, UserCircle2 } from 'lucide-react';
import { signInWithGoogle } from '../lib/supabase';
import { Theme } from '../hooks/useTheme';

interface SetupScreenProps {
  theme: Theme;
  onToggleTheme: (e?: React.MouseEvent) => void;
  onComplete: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  theme,
  onToggleTheme,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fadeClass, setFadeClass] = useState('animate-fade-in');

  const transitionToStep2 = () => {
    setFadeClass('opacity-0 translate-y-2 transition-all duration-200');
    setTimeout(() => {
      setStep(2);
      setFadeClass('animate-fade-in');
    }, 220);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorMessage(null);
    try {
      await signInWithGoogle();
      // Browser redirects to Google OAuth — on return, App.tsx auth listener fires
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect with Google';
      setErrorMessage(msg);
      setGoogleLoading(false);
    }
  };

  const handleSkipLogin = () => {
    transitionToStep2();
  };

  const handleSelectTheme = (selected: Theme, e: React.MouseEvent) => {
    if (theme !== selected) {
      onToggleTheme(e);
    }
  };

  const handleFinish = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-[#0b0f19] transition-colors duration-300">
      {/* Subtle background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/5 dark:bg-teal-500/3 rounded-full blur-3xl" />
      </div>

      <div className={`relative w-full max-w-lg ${fadeClass}`}>
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 text-white shadow-lg shadow-emerald-500/25 mb-4">
            <Table2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome to Habit<span className="text-emerald-600 dark:text-emerald-400">Flow</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
            Build better habits, transform yourself
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`h-1.5 rounded-full transition-all duration-300 ${
            step === 1 ? 'w-8 bg-emerald-500' : 'w-4 bg-slate-300 dark:bg-slate-600'
          }`} />
          <div className={`h-1.5 rounded-full transition-all duration-300 ${
            step === 2 ? 'w-8 bg-emerald-500' : 'w-4 bg-slate-300 dark:bg-slate-600'
          }`} />
        </div>

        {/* ─── STEP 1: Auth Choice ─── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                How would you like to start?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Sign in to sync across devices, or jump right in
              </p>
            </div>

            {/* Google Sign In Card */}
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full group relative overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 p-5 text-left hover:border-emerald-400 dark:hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-60"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/30 flex items-center justify-center shrink-0 ring-1 ring-emerald-200/60 dark:ring-emerald-700/40">
                  {googleLoading ? (
                    <Loader2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-spin" />
                  ) : (
                    <Cloud className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Sign in with Google
                    <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-700/60">
                      Recommended
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Sync your habits across all your devices with free cloud backup
                  </p>
                  {/* Mini feature list */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2.5">
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                      <Smartphone className="w-3 h-3 text-indigo-500" /> Cross-device sync
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                      <ShieldCheck className="w-3 h-3 text-teal-500" /> Secure & private
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                      <Sparkles className="w-3 h-3 text-amber-500" /> Zero passwords
                    </span>
                  </div>
                </div>
              </div>
            </button>

            {/* Continue Without Login Card */}
            <button
              onClick={handleSkipLogin}
              disabled={googleLoading}
              className="w-full group relative overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 p-5 text-left hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-lg hover:shadow-slate-500/10 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-40"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center shrink-0 ring-1 ring-slate-200/80 dark:ring-slate-600/60">
                  <UserCircle2 className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Continue without login
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Start tracking habits locally — you can always sign in later
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>

            {/* Error */}
            {errorMessage && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                <span>⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* ─── STEP 2: Theme Selection ─── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Choose your vibe
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Pick a theme — you can change it anytime from the header
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Light Theme Card */}
              <button
                onClick={(e) => handleSelectTheme('light', e)}
                className={`group relative rounded-2xl border-2 p-4 sm:p-5 text-center transition-all duration-200 cursor-pointer active:scale-[0.97] ${
                  theme === 'light'
                    ? 'border-emerald-500 bg-white dark:bg-slate-800 shadow-lg shadow-emerald-500/15 ring-1 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md'
                }`}
              >
                {/* Selected checkmark */}
                {theme === 'light' && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                )}
                <div className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl flex items-center justify-center mb-3 transition-all duration-200 ${
                  theme === 'light'
                    ? 'bg-amber-50 ring-2 ring-amber-200/60'
                    : 'bg-slate-100 dark:bg-slate-700 ring-1 ring-slate-200/60 dark:ring-slate-600/60'
                }`}>
                  <Sun className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors duration-200 ${
                    theme === 'light' ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'
                  }`} />
                </div>
                <h3 className={`text-sm font-bold transition-colors duration-200 ${
                  theme === 'light' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                }`}>
                  Light
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Clean & bright
                </p>
              </button>

              {/* Dark Theme Card */}
              <button
                onClick={(e) => handleSelectTheme('dark', e)}
                className={`group relative rounded-2xl border-2 p-4 sm:p-5 text-center transition-all duration-200 cursor-pointer active:scale-[0.97] ${
                  theme === 'dark'
                    ? 'border-emerald-500 bg-white dark:bg-slate-800 shadow-lg shadow-emerald-500/15 ring-1 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md'
                }`}
              >
                {/* Selected checkmark */}
                {theme === 'dark' && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                )}
                <div className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl flex items-center justify-center mb-3 transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-indigo-950/60 ring-2 ring-indigo-400/30'
                    : 'bg-slate-100 dark:bg-slate-700 ring-1 ring-slate-200/60 dark:ring-slate-600/60'
                }`}>
                  <Moon className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors duration-200 ${
                    theme === 'dark' ? 'text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                  }`} />
                </div>
                <h3 className={`text-sm font-bold transition-colors duration-200 ${
                  theme === 'dark' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                }`}>
                  Dark
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Easy on the eyes
                </p>
              </button>
            </div>

            {/* Get Started Button */}
            <button
              onClick={handleFinish}
              className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-[length:200%_auto] hover:bg-right shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 active:scale-[0.98] transition-all duration-300 cursor-pointer"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-8">
          HabitFlow • Your data stays on your device {theme === 'light' ? '☀️' : '🌙'}
        </p>
      </div>
    </div>
  );
};

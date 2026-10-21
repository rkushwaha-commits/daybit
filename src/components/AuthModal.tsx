import React, { useState } from 'react';
import { X, AlertCircle, Cloud, ShieldCheck, Smartphone, Loader2 } from 'lucide-react';
import { signInWithGoogle } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await signInWithGoogle();
      // Browser redirects to Google OAuth
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect with Google';
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-200 ease-in-out animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-sm w-full max-h-[90vh] flex flex-col overflow-hidden animate-modal-in transition-all duration-200">
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center space-x-2.5">
            <img src="/icons/daybit-emblem.png" alt="Daybit" className="h-9 w-9 object-contain shrink-0 drop-shadow-xs block dark:hidden" />
            <img src="/icons/daybit-emblem-dark.png" alt="Daybit" className="h-9 w-9 object-contain shrink-0 drop-shadow-[0_0_12px_rgba(245,158,11,0.3)] hidden dark:block" />
            <div>
              <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-0.5">
                Sign In to Day<span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">bit</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sync your habits everywhere</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 active:scale-90 transition-all duration-200 ease-in-out"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Feature Highlights */}
          <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-xl p-3.5">
            <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
              <Cloud className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Automatic cloud backup for your streaks</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
              <Smartphone className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Real-time sync across phone & laptop</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-teal-500 shrink-0" />
              <span>1-click secure login — zero passwords to remember</span>
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Google 1-Click Login Button */}
          <div>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 active:scale-[0.98] shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Connecting with Google...</span>
                </>
              ) : (
                <>
                  {/* Google official SVG logo */}
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>

          {/* Privacy & Guest note */}
          <div className="text-center space-y-1.5 pt-1">
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Free cloud sync. No passwords or credit cards required.
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Prefer to stay offline? You can keep using Daybit locally without an account.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

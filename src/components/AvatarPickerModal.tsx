import React, { useEffect } from 'react';
import { X, Check, Sparkles, User as UserIcon } from 'lucide-react';
import { AVATAR_PERSONAS, AvatarPersona } from '../data/avatars';
import { User } from '@supabase/supabase-js';

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAvatarId: string;
  onSelectAvatar: (avatarId: string) => void;
  user: User | null;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  isOpen,
  onClose,
  selectedAvatarId,
  onSelectAvatar,
  user,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const avatarUrl = user?.user_metadata?.avatar_url;
  const isGoogleSelected = selectedAvatarId === 'google';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#111726] rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-6 z-10 animate-modal-in overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-gradient-to-b from-emerald-500/10 to-transparent blur-xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between relative mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                Habit Persona
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Choose an avatar that reflects your daily drive and mindset
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 10 Curated Personas Grid */}
        <div className="grid grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
          {AVATAR_PERSONAS.map((persona: AvatarPersona) => {
            const isSelected = selectedAvatarId === persona.id;
            return (
              <button
                key={persona.id}
                onClick={() => {
                  onSelectAvatar(persona.id);
                  onClose();
                }}
                className={`relative flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer group active:scale-98 ${
                  isSelected
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-500 shadow-xs ring-1 ring-emerald-500/30'
                    : 'bg-slate-50/80 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100/90 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                {/* Persona Avatar */}
                <div
                  className={`w-9 h-9 rounded-full bg-gradient-to-tr ${persona.bgGradient} flex items-center justify-center text-base shrink-0 shadow-xs ring-2 ${persona.ringColor} ring-offset-1 dark:ring-offset-slate-900 transition-transform duration-200 group-hover:scale-105`}
                >
                  <span className="select-none">{persona.emoji}</span>
                </div>

                {/* Persona Meta */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {persona.name}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate block mt-0.5">
                    {persona.tagline}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Optional Google Account Photo Option (if user has signed in) */}
        {user && (
          <div className="mt-4 pt-3.5 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Google DP" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Google Account Photo
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  Use your original profile picture
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onSelectAvatar('google');
                onClose();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isGoogleSelected
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {isGoogleSelected ? 'Active' : 'Use Photo'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { X, Share, PlusSquare, Smartphone, CheckCircle2 } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS: boolean;
  onInstall?: () => void;
  canDirectInstall?: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  isIOS,
  onInstall,
  canDirectInstall = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 shadow-2xl p-5 text-slate-800 dark:text-slate-100 animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with App Icon */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src="/icons/icon-192.png"
            alt="Daybit Icon"
            className="w-12 h-12 rounded-2xl shadow-sm border border-emerald-500/20 shrink-0"
          />
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
              Install Daybit App
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Free • Standalone Home Screen App
            </p>
          </div>
        </div>

        {/* Benefit bullet points */}
        <div className="space-y-1.5 mb-4 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Opens full-screen with no browser address bar</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Fast one-tap launch directly from your home screen</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Works offline with cached habit checklists</span>
          </div>
        </div>

        {/* Step-by-step instructions */}
        {isIOS ? (
          <div className="space-y-2.5 mb-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              How to install on iPhone &amp; iPad:
            </p>

            <div className="flex items-start gap-2.5 text-xs">
              <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                1
              </div>
              <div className="pt-0.5">
                <span>Tap the </span>
                <span className="inline-flex items-center gap-1 font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                  <Share className="w-3 h-3 text-sky-500" /> Share
                </span>
                <span> button in Safari's bottom toolbar.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs">
              <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                2
              </div>
              <div className="pt-0.5">
                <span>Scroll down and select </span>
                <span className="inline-flex items-center gap-1 font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                  <PlusSquare className="w-3 h-3 text-emerald-500" /> Add to Home Screen
                </span>
                <span>.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs">
              <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                3
              </div>
              <div className="pt-0.5">
                <span>Tap </span>
                <span className="font-bold text-slate-900 dark:text-white">Add</span>
                <span> in the top-right corner. You're all set!</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 mb-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              How to install on Android &amp; Chrome:
            </p>

            <div className="flex items-start gap-2.5 text-xs">
              <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                1
              </div>
              <div className="pt-0.5">
                <span>Tap the browser menu (three dots </span>
                <span className="font-bold text-slate-900 dark:text-white">⋮</span>
                <span>) in the top right.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs">
              <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                2
              </div>
              <div className="pt-0.5">
                <span>Select </span>
                <span className="inline-flex items-center gap-1 font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                  <Smartphone className="w-3 h-3 text-emerald-500" /> Install App
                </span>
                <span> or </span>
                <span className="font-bold text-slate-900 dark:text-white">"Add to Home screen"</span>
                <span>.</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {canDirectInstall && onInstall && (
            <button
              type="button"
              onClick={() => {
                onInstall();
                onClose();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all cursor-pointer shadow-xs shadow-emerald-600/30 text-center"
            >
              Install App
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              canDirectInstall
                ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                : 'w-full text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 shadow-xs shadow-emerald-600/30'
            }`}
          >
            {canDirectInstall ? 'Dismiss' : 'Got It'}
          </button>
        </div>
      </div>
    </div>
  );
};

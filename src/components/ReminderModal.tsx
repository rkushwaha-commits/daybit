import React, { useState } from 'react';
import {
  X,
  Bell,
  Sunrise,
  Flame,
  Check,
  Send,
  AlertCircle,
} from 'lucide-react';
import { ReminderSettings } from '../hooks/useHabitReminders';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReminderSettings;
  permission: NotificationPermission | 'unsupported';
  isSupported: boolean;
  onEnable: () => Promise<boolean>;
  onDisable: () => void;
  onUpdate: (updates: Partial<ReminderSettings>) => void;
  onSendTest: () => Promise<boolean>;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  settings,
  permission,
  isSupported,
  onEnable,
  onDisable,
  onUpdate,
  onSendTest,
}) => {
  const [testSent, setTestSent] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);

  if (!isOpen) return null;

  const handleToggle = async () => {
    if (settings.enabled) {
      onDisable();
    } else {
      setIsEnabling(true);
      await onEnable();
      setIsEnabling(false);
    }
  };

  const handleTest = async () => {
    setTestSent(true);
    await onSendTest();
    setTimeout(() => setTestSent(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-200 ease-in-out animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden animate-modal-in transition-all duration-200">
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center ring-1 ring-emerald-500/25 dark:ring-emerald-400/30 shadow-2xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                Daily Reminders
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Gentle motivation to protect your streak
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all duration-150 cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Main Toggle Card */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Push Notifications
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {settings.enabled
                  ? 'Reminders are active on this device'
                  : 'Get 2 daily touchpoints for morning focus & evening streak'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggle}
              disabled={isEnabling || !isSupported}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.enabled ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
              role="switch"
              aria-checked={settings.enabled}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  settings.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Browser Permission Notice if blocked */}
          {permission === 'denied' && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
              <span>
                Notifications are blocked in your browser settings. Please allow notifications for Daybit to enable reminders.
              </span>
            </div>
          )}

          {/* The 2 Daily Touchpoints */}
          <div className="space-y-3">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Curated Daily Touchpoints
            </h5>

            {/* 1. Morning Kickoff */}
            <div className="p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                    <Sunrise className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      Morning Kickoff
                    </span>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500">
                      Intention & focus for the day ahead
                    </span>
                  </div>
                </div>
                <input
                  type="time"
                  value={settings.morningTime}
                  onChange={(e) => onUpdate({ morningTime: e.target.value })}
                  disabled={!settings.enabled}
                  className="px-2 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pl-8">
                &ldquo;Win the morning, own the day. Time to check off your first habit!&rdquo;
              </p>
            </div>

            {/* 2. Evening Streak Protection */}
            <div className="p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      Streak Protection
                    </span>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500">
                      Evening check-in before midnight
                    </span>
                  </div>
                </div>
                <input
                  type="time"
                  value={settings.eveningTime}
                  onChange={(e) => onUpdate({ eveningTime: e.target.value })}
                  disabled={!settings.enabled}
                  className="px-2 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pl-8">
                &ldquo;Finish what you started! Lock in today&apos;s daily habits before midnight.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <button
            type="button"
            onClick={handleTest}
            disabled={testSent || !isSupported}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 rounded-xl transition-all cursor-pointer"
          >
            {testSent ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Test Sent!</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send Test</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-95 rounded-xl shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

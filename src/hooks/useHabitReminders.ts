import { useState, useEffect, useCallback, useRef } from 'react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendNotification,
} from '../services/notificationService';

export interface ReminderSettings {
  enabled: boolean;
  morningEnabled: boolean;
  eveningEnabled: boolean;
  morningTime: string; // e.g. "08:00"
  eveningTime: string; // e.g. "20:00"
  lastMorningTrigger?: string; // YYYY-MM-DD
  lastEveningTrigger?: string; // YYYY-MM-DD
}

const STORAGE_KEY = 'daybit_reminders_config_v1';

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: false,
  morningEnabled: true,
  eveningEnabled: true,
  morningTime: '08:00',
  eveningTime: '20:00',
};

export function useHabitReminders() {
  const [settings, setSettings] = useState<ReminderSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback to default
    }
    return DEFAULT_SETTINGS;
  });

  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    getNotificationPermission()
  );

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // Persist settings changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage errors
    }
  }, [settings]);

  // Request & enable reminders
  const enableReminders = useCallback(async (): Promise<boolean> => {
    if (!isNotificationSupported()) {
      return false;
    }

    const perm = await requestNotificationPermission();
    setPermission(perm);

    if (perm === 'granted') {
      setSettings((prev) => ({
        ...prev,
        enabled: true,
      }));
      return true;
    }
    return false;
  }, []);

  // Disable reminders
  const disableReminders = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      enabled: false,
    }));
  }, []);

  // Update specific settings
  const updateSettings = useCallback((updates: Partial<ReminderSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Send interactive test notification
  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    const success = await sendNotification({
      title: 'Daybit • Daily Ritual ☀️',
      body: 'Win the morning, own the day. Your daily habits are waiting!',
      tag: 'daybit-test',
    });
    return success;
  }, []);

  // Background check interval for scheduled times
  useEffect(() => {
    if (!settings.enabled || permission !== 'granted') {
      return;
    }

    const checkSchedule = () => {
      const current = settingsRef.current;
      if (!current.enabled) return;

      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${hours}:${mins}`;

      // 1. Morning Kickoff Reminder (e.g. 08:00 - 12:59)
      if (
        current.morningEnabled &&
        timeStr >= current.morningTime &&
        timeStr < '13:00' &&
        current.lastMorningTrigger !== todayStr
      ) {
        sendNotification({
          title: 'Daybit • Morning Ritual ☀️',
          body: 'Win the morning, own the day. Time to check off your first habit!',
          tag: 'daybit-morning',
        });
        setSettings((prev) => ({
          ...prev,
          lastMorningTrigger: todayStr,
        }));
      }

      // 2. Evening Streak Protection Reminder (e.g. 20:00 - 23:59)
      if (
        current.eveningEnabled &&
        timeStr >= current.eveningTime &&
        current.lastEveningTrigger !== todayStr
      ) {
        sendNotification({
          title: 'Daybit • Protect Your Streak 🔥',
          body: "Finish what you started! Check in today's habits before midnight.",
          tag: 'daybit-evening',
        });
        setSettings((prev) => ({
          ...prev,
          lastEveningTrigger: todayStr,
        }));
      }
    };

    // Run check immediately, then every 30 seconds
    checkSchedule();
    const timer = setInterval(checkSchedule, 30000);
    return () => clearInterval(timer);
  }, [settings.enabled, permission]);

  return {
    settings,
    permission,
    isSupported: isNotificationSupported(),
    enableReminders,
    disableReminders,
    updateSettings,
    sendTestNotification,
  };
}

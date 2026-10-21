// Daybit Notification Service
// Handles browser Web Notification API and Service Worker notifications

export interface NotificationPayload {
  title: string;
  body: string;
  tag?: string;
  icon?: string;
  badge?: string;
  url?: string;
}

export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('[Daybit] Error requesting notification permission:', err);
    return Notification.permission;
  }
};

export const sendNotification = async (payload: NotificationPayload): Promise<boolean> => {
  if (!isNotificationSupported()) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      return false;
    }
  }

  const iconUrl = payload.icon || '/icons/icon-192.png';
  const badgeUrl = payload.badge || '/favicon.png';

  // 1. Try sending via active Service Worker (preferred for PWA & mobile background)
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(payload.title, {
          body: payload.body,
          icon: iconUrl,
          badge: badgeUrl,
          tag: payload.tag || 'daybit-reminder',
          data: { url: payload.url || '/' },
        });
        return true;
      }
    } catch (swErr) {
      console.warn('[Daybit] Service Worker notification failed, falling back to desktop:', swErr);
    }
  }

  // 2. Standard Web Notification fallback
  try {
    const notif = new Notification(payload.title, {
      body: payload.body,
      icon: iconUrl,
      tag: payload.tag || 'daybit-reminder',
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
    };
    return true;
  } catch (desktopErr) {
    console.warn('[Daybit] Standard notification failed:', desktopErr);
    return false;
  }
};

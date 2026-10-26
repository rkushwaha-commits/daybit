import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (
      typeof window !== 'undefined' &&
      (window as unknown as { __daybit_deferredPrompt?: BeforeInstallPromptEvent }).__daybit_deferredPrompt
    ) {
      return (window as unknown as { __daybit_deferredPrompt: BeforeInstallPromptEvent }).__daybit_deferredPrompt;
    }
    return null;
  });
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isIOSModalOpen, setIsIOSModalOpen] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (installed app)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(Boolean(isStandaloneMode));
    };

    checkStandalone();

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    // Capture standard Chromium/Android beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      (window as unknown as { __daybit_deferredPrompt?: BeforeInstallPromptEvent }).__daybit_deferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handleGlobalPWAReady = () => {
      const promptEvent = (window as unknown as { __daybit_deferredPrompt?: BeforeInstallPromptEvent }).__daybit_deferredPrompt;
      if (promptEvent) {
        setDeferredPrompt(promptEvent);
      }
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      setIsIOSModalOpen(false);
      (window as unknown as { __daybit_deferredPrompt?: BeforeInstallPromptEvent | null }).__daybit_deferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('daybit-pwa-ready', handleGlobalPWAReady);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('daybit-pwa-installed', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('daybit-pwa-ready', handleGlobalPWAReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('daybit-pwa-installed', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    // Check state or global window cache
    const activePrompt =
      deferredPrompt ||
      (typeof window !== 'undefined'
        ? (window as unknown as { __daybit_deferredPrompt?: BeforeInstallPromptEvent }).__daybit_deferredPrompt
        : null);

    // If Android / Desktop Chromium with deferred prompt
    if (activePrompt) {
      try {
        await activePrompt.prompt();
        const choiceResult = await activePrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
          setIsStandalone(true);
          (window as unknown as { __daybit_deferredPrompt?: null }).__daybit_deferredPrompt = null;
          return;
        }
      } catch (err) {
        console.warn('[Daybit PWA] Prompt install error:', err);
      }
    }

    // Fallback: show instructions modal (iOS Safari or Chromium menu instruction)
    setIsIOSModalOpen(true);
  };

  return {
    isInstallable: !isStandalone && (Boolean(deferredPrompt) || isIOS),
    isStandalone,
    isIOS,
    canDirectInstall: Boolean(deferredPrompt),
    promptInstall,
    isIOSModalOpen,
    setIsIOSModalOpen,
  };
}

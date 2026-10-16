import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('daybit_theme_v1') as Theme | null;
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // fallback
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('daybit_theme_v1', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = (e?: React.MouseEvent) => {
    const nextTheme: Theme = theme === 'light' ? 'dark' : 'light';
    const root = document.documentElement;

    // Check for native View Transition API support (modern Chrome, Edge, Safari 18+)
    const doc = document as unknown as {
      startViewTransition?: (callback: () => Promise<void> | void) => {
        ready: Promise<void>;
      };
    };

    const startViewTransition =
      typeof doc.startViewTransition === 'function' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? doc.startViewTransition.bind(doc)
        : null;

    if (!startViewTransition) {
      root.classList.add('theme-transitioning');
      setTheme(nextTheme);
      setTimeout(() => {
        root.classList.remove('theme-transitioning');
      }, 400);
      return;
    }

    // Get accurate click coordinates for circular ripple reveal
    let x = e?.clientX;
    let y = e?.clientY;
    if (typeof x !== 'number' || typeof y !== 'number' || (x === 0 && y === 0)) {
      if (e?.currentTarget instanceof HTMLElement) {
        const rect = e.currentTarget.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      } else {
        x = window.innerWidth - 80;
        y = 35;
      }
    }

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = startViewTransition(() => {
      if (nextTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      setTheme(nextTheme);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      root.animate(
        {
          clipPath,
        },
        {
          duration: 460,
          easing: 'cubic-bezier(0.2, 0, 0, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  };

  return { theme, toggleTheme };
}

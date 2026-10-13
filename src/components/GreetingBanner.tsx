import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';

interface GreetingBannerProps {
  user: User;
}

interface Greeting {
  text: string;
  emoji: string;
  sub: string;
}

function getGreeting(name: string): Greeting {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return {
      emoji: '🌤️',
      text: `Good morning, ${name}!`,
      sub: 'A fresh start — what habits will you conquer today?',
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      emoji: '☀️',
      text: `Good afternoon, ${name}!`,
      sub: "You're halfway through the day — maintain your momentum.",
    };
  } else if (hour >= 17 && hour < 21) {
    return {
      emoji: '🌆',
      text: `Good evening, ${name}!`,
      sub: "Wind down peacefully — don't forget to log today's wins.",
    };
  } else {
    return {
      emoji: '🌙',
      text: `Hey, ${name}!`,
      sub: 'Burning the midnight oil? Log your habits before you rest.',
    };
  }
}

const GreetingBanner: React.FC<GreetingBannerProps> = ({ user }) => {
  const displayName =
    user.user_metadata?.full_name?.split(' ')[0] ||
    user.email?.split('@')[0] ||
    'there';

  const [greeting, setGreeting] = useState<Greeting>(() => getGreeting(displayName));

  // Recalculate at the top of every hour
  useEffect(() => {
    const scheduleUpdate = () => {
      const now = new Date();
      const msUntilNextHour =
        (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();

      const timeout = setTimeout(() => {
        setGreeting(getGreeting(displayName));
        const interval = setInterval(() => {
          setGreeting(getGreeting(displayName));
        }, 3_600_000);
        return () => clearInterval(interval);
      }, msUntilNextHour + 500);

      return timeout;
    };

    const t = scheduleUpdate();
    return () => clearTimeout(t);
  }, [displayName]);

  return (
    <div className="relative overflow-hidden flex items-center gap-4 px-5 py-3.5 rounded-2xl backdrop-blur-md bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-indigo-500/10 dark:from-emerald-500/10 dark:via-slate-900/60 dark:to-teal-500/10 border border-emerald-500/20 dark:border-emerald-500/20 shadow-xs animate-fade-in transition-colors duration-200">
      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-xs ring-1 ring-black/5 dark:ring-white/10 flex items-center justify-center text-2xl select-none shrink-0">
        {greeting.emoji}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
          {greeting.text}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug font-medium">
          {greeting.sub}
        </span>
      </div>
    </div>
  );
};

export default GreetingBanner;

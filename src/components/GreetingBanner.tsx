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
      sub: 'A fresh start — what habits will you crush today?',
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      emoji: '☀️',
      text: `Good afternoon, ${name}!`,
      sub: "You're halfway through the day — keep the momentum going.",
    };
  } else if (hour >= 17 && hour < 21) {
    return {
      emoji: '🌆',
      text: `Good evening, ${name}!`,
      sub: "Wind down well — don't forget to log today's habits.",
    };
  } else {
    return {
      emoji: '🌙',
      text: `Hey, ${name}!`,
      sub: 'Burning the midnight oil? Log your habits before you sleep.',
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
    <div className="flex items-center gap-4 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-100/80 shadow-sm animate-fade-in">
      <span className="text-3xl select-none flex-shrink-0" role="img" aria-label="greeting">
        {greeting.emoji}
      </span>
      <div className="flex flex-col min-w-0">
        <span className="text-base font-bold text-slate-800 leading-tight">
          {greeting.text}
        </span>
        <span className="text-xs text-slate-500 mt-0.5 leading-snug">
          {greeting.sub}
        </span>
      </div>
    </div>
  );
};

export default GreetingBanner;

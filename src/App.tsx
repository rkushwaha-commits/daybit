import { useState, useEffect, useMemo, useCallback } from 'react';
import { Habit, HabitCategory, MonthSummary } from './types/habit';
import { getDefaultHabits } from './data/initialHabits';
import { getDaysForMonth, getMonthName, calculateHabitStreak } from './utils/dateUtils';
import { Header } from './components/Header';
import { MonthNavigator } from './components/MonthNavigator';
import { HabitStats } from './components/HabitStats';
import { HabitGrid } from './components/HabitGrid';
import { AddHabitModal } from './components/AddHabitModal';
import { AuthModal } from './components/AuthModal';
import GreetingBanner from './components/GreetingBanner';
import { Sparkles, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import HabitChart from './components/HabitChart';
import { User } from '@supabase/supabase-js';
import {
  supabase,
  signOut,
  fetchCloudHabits,
  upsertCloudHabit,
  upsertAllCloudHabits,
  deleteCloudHabit,
} from './lib/supabase';

const LOCAL_STORAGE_KEY = 'habitflow_habits_v1';

export default function App() {
  // ── Authentication & Cloud Sync States ──
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // ── Current real date — synced to today and auto-refreshed at midnight ──
  const [todayDate, setTodayDate] = useState<Date>(() => {
    const now = new Date();
    // Normalise to midnight local time so comparisons are day-accurate
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });

  // Navigation month state — starts at the real current month
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  // Auto-refresh todayDate and currentDate at local midnight
  useEffect(() => {
    const scheduleRefresh = () => {
      const now = new Date();
      const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0, 0, 0, 0
      );
      const msUntilMidnight = midnight.getTime() - now.getTime();

      const timer = setTimeout(() => {
        const newToday = new Date();
        setTodayDate(new Date(newToday.getFullYear(), newToday.getMonth(), newToday.getDate()));
        // If the user hasn't manually navigated away from the current month,
        // slide currentDate forward with the real date so the grid stays on today's month.
        setCurrentDate((prev) => {
          const prevKey = `${prev.getFullYear()}-${prev.getMonth()}`;
          const nowKey  = `${now.getFullYear()}-${now.getMonth()}`;
          // Only auto-advance if still on the same month as before midnight
          return prevKey === nowKey ? newToday : prev;
        });
        scheduleRefresh(); // reschedule for next midnight
      }, msUntilMidnight + 100); // +100ms safety buffer

      return timer;
    };

    const timer = scheduleRefresh();
    return () => clearTimeout(timer);
  }, []);

  // Calendar days for the currently selected month.
  // We pass todayDate (state) so getDaysForMonth uses the authoritative today
  // and re-runs whenever todayDate changes (e.g. at midnight).
  const days = useMemo(() => {
    return getDaysForMonth(currentDate.getFullYear(), currentDate.getMonth(), todayDate);
  }, [currentDate, todayDate]);
  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse habits from localStorage:', e);
    }
    return getDefaultHabits();
  });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(habits));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }, [habits]);

  // Cloud sync handler when user is authenticated
  const loadAndSyncUserHabits = useCallback(async (userId: string) => {
    setIsSyncing(true);
    try {
      const cloudHabits = await fetchCloudHabits(userId);
      if (cloudHabits && cloudHabits.length > 0) {
        setHabits(cloudHabits);
      } else {
        // If user has no habits in the cloud yet, migrate their existing local habits!
        setHabits((current) => {
          if (current.length > 0) {
            upsertAllCloudHabits(userId, current).catch(console.error);
          }
          return current;
        });
      }
    } catch (err) {
      console.warn('Could not sync with Supabase cloud (table might not exist yet):', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Subscribe to Supabase auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        loadAndSyncUserHabits(currentUser.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        loadAndSyncUserHabits(currentUser.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadAndSyncUserHabits]);



  // Categories list derived from habits
  const categories = useMemo(() => {
    const defaultCats: HabitCategory[] = ['Health', 'Fitness', 'Productivity', 'Learning', 'Mindfulness', 'Lifestyle'];
    const usedCats = Array.from(new Set(habits.map((h) => h.category)));
    return Array.from(new Set([...defaultCats, ...usedCats])) as HabitCategory[];
  }, [habits]);

  // Filtered habits
  const filteredHabits = useMemo(() => {
    return habits.filter((habit) => {
      const matchesSearch = habit.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || habit.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [habits, searchQuery, selectedCategory]);

  // Compute month summary statistics
  const summary: MonthSummary = useMemo(() => {
    const totalPossible = habits.length * days.length;
    let totalLogged = 0;
    let perfectDaysCount = 0;

    days.forEach((day) => {
      const dayCompleted = habits.filter((h) => h.completions[day.dateStr]).length;
      totalLogged += dayCompleted;
      if (habits.length > 0 && dayCompleted === habits.length) {
        perfectDaysCount++;
      }
    });

    const completionRate = totalPossible > 0 ? Math.round((totalLogged / totalPossible) * 100) : 0;

    return {
      totalLogged,
      totalPossible,
      completionRate,
      bestDay: null,
      perfectDaysCount,
      currentActiveHabits: habits.length,
    };
  }, [habits, days]);

  // Best streak across all habits
  const bestStreak = useMemo(() => {
    let max = 0;
    habits.forEach((h) => {
      const s = calculateHabitStreak(h.completions);
      if (s.longest > max) max = s.longest;
    });
    return max;
  }, [habits]);

  // Handlers
  const handleToggleHabit = (habitId: string, dateStr: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const currentVal = Boolean(h.completions[dateStr]);
        const updatedCompletions = { ...h.completions };
        if (currentVal) {
          delete updatedCompletions[dateStr];
        } else {
          updatedCompletions[dateStr] = true;
        }
        const updatedHabit = {
          ...h,
          completions: updatedCompletions,
        };
        // Asynchronously sync to Supabase cloud if logged in
        if (user) {
          upsertCloudHabit(user.id, updatedHabit).catch(console.error);
        }
        return updatedHabit;
      })
    );
  };

  const handleAddHabit = (newHabitData: Omit<Habit, 'id' | 'createdAt' | 'completions'>) => {
    const newHabit: Habit = {
      ...newHabitData,
      id: `habit_${Date.now()}`,
      createdAt: new Date().toISOString(),
      completions: {},
    };
    setHabits((prev) => [newHabit, ...prev]);
    if (user) {
      upsertCloudHabit(user.id, newHabit).catch(console.error);
    }
  };

  const handleDeleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    if (user) {
      deleteCloudHabit(user.id, habitId).catch(console.error);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all habits back to default sample data?')) {
      const sample = getDefaultHabits();
      setHabits(sample);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sample));
      if (user) {
        upsertAllCloudHabits(user.id, sample).catch(console.error);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleJumpToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  const monthName = getMonthName(currentDate.getMonth());

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Application Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categories={categories}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onResetData={handleResetData}
        bestStreak={bestStreak}
        user={user}
        isSyncing={isSyncing}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">

        {/* Navigation & Month Title */}
        <MonthNavigator
          currentDate={currentDate}
          todayDate={todayDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onJumpToCurrentMonth={handleJumpToCurrentMonth}
          daysCount={days.length}
        />

        {/* Personalized Greeting Banner — only shown when logged in */}
        {user && <GreetingBanner user={user} />}

        {/* 4 Excel Key Performance Cards */}
        <HabitStats summary={summary} monthName={monthName} />

        {/* Interactive Spreadsheet Habit Grid */}
        <HabitGrid
          habits={filteredHabits}
          days={days}
          onToggleHabit={handleToggleHabit}
          onDeleteHabit={handleDeleteHabit}
        />

        {/* Analytics Charts */}
        <HabitChart days={days} habits={filteredHabits} />

        {/* Pro-Tips & Footer Notes */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>{user ? 'Cloud & Local Auto-Save:' : 'Local Auto-Save:'}</strong>{' '}
              {user
                ? 'Your habits and check-ins are synced to your cloud account and stored locally.'
                : 'Your habits and check-ins are saved in your browser. Sign in to sync across devices!'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
              Monthly Tracker
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Live Streak Tracking
            </span>
          </div>
        </div>
      </main>

      {/* Modal for Creating New Habit */}
      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddHabit={handleAddHabit}
        daysInMonth={days.length}
      />

      {/* Modal for User Sign In / Sign Up */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

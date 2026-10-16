import { useState, useEffect, useMemo, useCallback } from 'react';
import { Habit, HabitCategory, MonthSummary } from './types/habit';
import { getDefaultHabits } from './data/initialHabits';
import { getDaysForMonth, getMonthName, calculateHabitStreak } from './utils/dateUtils';
import { Header } from './components/Header';
import { HabitStats } from './components/HabitStats';
import { HabitGrid } from './components/HabitGrid';
import { AddHabitModal } from './components/AddHabitModal';
import { AuthModal } from './components/AuthModal';
import { AvatarPickerModal } from './components/AvatarPickerModal';
import { DEFAULT_AVATAR_ID } from './data/avatars';
import GreetingBanner from './components/GreetingBanner';
import { Sparkles, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import HabitChart from './components/HabitChart';
import { SetupScreen } from './components/SetupScreen';
import { MobileBottomBar } from './components/MobileBottomBar';
import { User } from '@supabase/supabase-js';
import { useTheme } from './hooks/useTheme';
import {
  supabase,
  signOut,
  fetchCloudHabits,
  upsertCloudHabit,
  upsertAllCloudHabits,
  deleteCloudHabit,
} from './lib/supabase';

const LOCAL_STORAGE_KEY = 'daybit_habits_v2';
const OLD_LOCAL_STORAGE_KEY = 'daybit_habits_v1';
const AVATAR_STORAGE_KEY = 'daybit_avatar_id_v1';
const SETUP_STORAGE_KEY = 'daybit_setup_complete_v1';

export default function App() {
  // ── Theme State ──
  const { theme, toggleTheme } = useTheme();

  // ── Authentication & Cloud Sync States ──
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'today' | 'grid' | 'stats'>('today');
  const [isSetupComplete, setIsSetupComplete] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SETUP_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [avatarId, setAvatarId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(AVATAR_STORAGE_KEY);
      if (saved) return saved;
    } catch {
      // fallback
    }
    return DEFAULT_AVATAR_ID;
  });

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
      const savedV2 = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedV2) {
        const parsed = JSON.parse(savedV2);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }

      // Check legacy v1 — if user created any custom habits, preserve them
      const savedV1 = localStorage.getItem(OLD_LOCAL_STORAGE_KEY);
      if (savedV1) {
        const parsedV1 = JSON.parse(savedV1);
        if (Array.isArray(parsedV1) && parsedV1.length > 0) {
          const customHabits = parsedV1.filter((h: Habit) => !h.id.startsWith('h'));
          if (customHabits.length > 0) {
            return [...customHabits, ...getDefaultHabits()];
          }
        }
      }
    } catch (e) {
      console.warn('Failed to parse habits from localStorage:', e);
    }
    return getDefaultHabits();
  });

  const todayDay = useMemo(() => days.find((d) => d.isToday), [days]);
  const todayCompletedCount = useMemo(() => {
    if (!todayDay) return 0;
    return habits.filter((h) => h.completions[todayDay.dateStr]).length;
  }, [todayDay, habits]);

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

  const handleSetupComplete = useCallback(() => {
    setIsSetupComplete(true);
    try {
      localStorage.setItem(SETUP_STORAGE_KEY, 'true');
    } catch (e) {
      console.warn('Failed to save setup completion:', e);
    }
  }, []);

  // Subscribe to Supabase auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        setIsSetupComplete(true);
        try {
          localStorage.setItem(SETUP_STORAGE_KEY, 'true');
        } catch {
          // ignore
        }
        loadAndSyncUserHabits(currentUser.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        setIsSetupComplete(true);
        try {
          localStorage.setItem(SETUP_STORAGE_KEY, 'true');
        } catch {
          // ignore
        }
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
    let maxCompleted = 0;
    let bestDayNum: number | null = null;

    days.forEach((day) => {
      const dayCompleted = habits.filter((h) => h.completions[day.dateStr]).length;
      totalLogged += dayCompleted;
      if (habits.length > 0 && dayCompleted === habits.length) {
        perfectDaysCount++;
      }
      if (dayCompleted > maxCompleted) {
        maxCompleted = dayCompleted;
        bestDayNum = day.dayNumber;
      }
    });

    const completionRate = totalPossible > 0 ? Math.round((totalLogged / totalPossible) * 100) : 0;

    return {
      totalLogged,
      totalPossible,
      completionRate,
      bestDay: bestDayNum ? `Day ${bestDayNum}` : null,
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
    if (window.confirm('Reset all habits back to default clean habits?')) {
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

  const handleSelectAvatar = (newAvatarId: string) => {
    setAvatarId(newAvatarId);
    try {
      localStorage.setItem(AVATAR_STORAGE_KEY, newAvatarId);
    } catch (e) {
      console.warn('Failed to save avatar ID to localStorage:', e);
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

  const handleSaveSetupHabits = (newHabits: Habit[]) => {
    setHabits(newHabits);
    if (user) {
      upsertAllCloudHabits(user.id, newHabits).catch(console.error);
    }
  };

  // Show Setup / Onboarding screen for first-time users or when opened manually
  if ((!isSetupComplete && !user) || isSetupOpen) {
    return (
      <SetupScreen
        theme={theme}
        onToggleTheme={toggleTheme}
        selectedAvatarId={avatarId}
        onSelectAvatar={handleSelectAvatar}
        currentHabits={habits}
        onSaveHabits={handleSaveSetupHabits}
        onComplete={() => {
          handleSetupComplete();
          setIsSetupOpen(false);
        }}
        onClose={isSetupComplete || user ? () => setIsSetupOpen(false) : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col text-slate-800 dark:text-slate-100">
      {/* Top Application Header with Integrated Month Navigation */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentDate={currentDate}
        todayDate={todayDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onJumpToCurrentMonth={handleJumpToCurrentMonth}
        daysCount={days.length}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onResetData={handleResetData}
        onOpenSetup={() => setIsSetupOpen(true)}
        bestStreak={bestStreak}
        user={user}
        isSyncing={isSyncing}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        theme={theme}
        onToggleTheme={toggleTheme}
        selectedAvatarId={avatarId}
        onOpenAvatarPicker={() => setIsAvatarPickerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-3 sm:px-6 py-3 sm:py-5 pb-24 sm:pb-6 space-y-4 sm:space-y-5 animate-fade-in">

        {/* Personalized Greeting Banner — only shown when logged in */}
        {user && <GreetingBanner user={user} />}

        {/* Interactive Spreadsheet Habit Grid (Centerpiece / Main action) */}
        <HabitGrid
          habits={filteredHabits}
          days={days}
          onToggleHabit={handleToggleHabit}
          onDeleteHabit={handleDeleteHabit}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          activeView={mobileTab === 'grid' ? 'grid' : 'today'}
          onViewChange={(view) => setMobileTab(view)}
        />

        {/* Unified Monthly Analysis & Performance Section */}
        <div id="analytics-section" className="space-y-4 pt-2">
          <div className="flex items-center gap-2 px-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50"></span>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              Monthly Analytics & Performance
            </h3>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700/60">
              {monthName}
            </span>
          </div>

          {/* 4 Unified KPI Performance Cards */}
          <HabitStats summary={summary} monthName={monthName} />

          {/* Analytics Line & Bar Charts */}
          <HabitChart days={days} habits={filteredHabits} />
        </div>

        {/* Pro-Tips & Footer Notes */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs transition-colors duration-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong className="text-slate-700 dark:text-slate-200">{user ? 'Cloud & Local Auto-Save:' : 'Local Auto-Save:'}</strong>{' '}
              {user
                ? 'Your habits and check-ins are synced to your cloud account and stored locally.'
                : 'Your habits and check-ins are saved in your browser. Sign in to sync across devices!'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
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

      {/* Native Mobile Bottom Navigation Bar (Thumb-friendly on phone) */}
      <MobileBottomBar
        activeTab={mobileTab}
        onTabChange={(tab) => {
          setMobileTab(tab);
          if (tab === 'stats') {
            const statsEl = document.getElementById('analytics-section');
            statsEl?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        todayCompletedCount={todayCompletedCount}
        totalHabitsCount={habits.length}
      />

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

      {/* Modal for Customizing Habit Persona Avatar */}
      <AvatarPickerModal
        isOpen={isAvatarPickerOpen}
        onClose={() => setIsAvatarPickerOpen(false)}
        selectedAvatarId={avatarId}
        onSelectAvatar={handleSelectAvatar}
        user={user}
      />
    </div>
  );
}

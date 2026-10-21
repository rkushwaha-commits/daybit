import { useState, useEffect, useMemo, useCallback } from 'react';
import { Habit, HabitCategory, MonthSummary } from './types/habit';
import { getDefaultHabits } from './data/initialHabits';
import { getDaysForMonth, getMonthName, calculateHabitStreak } from './utils/dateUtils';
import { Header } from './components/Header';
import { HabitStats } from './components/HabitStats';
import { HabitGrid } from './components/HabitGrid';
import { AddHabitModal } from './components/AddHabitModal';
import { AuthModal } from './components/AuthModal';
import GreetingBanner from './components/GreetingBanner';
import { Sparkles, FileSpreadsheet, ShieldCheck, Loader2, Table2, AlertCircle, X } from 'lucide-react';
import HabitChart from './components/HabitChart';
import { SetupScreen } from './components/SetupScreen';
import { MobileBottomBar } from './components/MobileBottomBar';
import { PWAInstallModal } from './components/PWAInstallModal';
import { usePWAInstall } from './hooks/usePWAInstall';
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
const SETUP_STORAGE_KEY = 'daybit_setup_complete_v1';

export default function App() {
  // ── Theme State ──
  const { theme, toggleTheme } = useTheme();

  // ── Authentication & Cloud Sync States ──
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'today' | 'grid' | 'stats'>('today');

  // ── PWA Installation Hook ──
  const {
    isStandalone,
    isIOS,
    promptInstall,
    isIOSModalOpen,
    setIsIOSModalOpen,
  } = usePWAInstall();
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const hasHash = window.location.hash.includes('access_token') || window.location.hash.includes('refresh_token');
      const hasCode = window.location.search.includes('code=');
      return hasHash || hasCode;
    }
    return false;
  });
  const [authBannerError, setAuthBannerError] = useState<string | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState<boolean>(() => {
    try {
      // Allow testing onboarding by appending ?setup=true, ?fresh=true, or ?onboarding=true to URL
      if (typeof window !== 'undefined') {
        const search = window.location.search;
        if (search.includes('setup=true') || search.includes('fresh=true') || search.includes('onboarding=true')) {
          localStorage.removeItem(SETUP_STORAGE_KEY);
          return false;
        }
      }

      if (localStorage.getItem(SETUP_STORAGE_KEY) === 'true') {
        return true;
      }
      // If user already has stored habits from a prior visit, they are not a first-time user
      if (localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem(OLD_LOCAL_STORAGE_KEY)) {
        localStorage.setItem(SETUP_STORAGE_KEY, 'true');
        return true;
      }
      return false;
    } catch {
      return false;
    }
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

  // Category filter state
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
    // Clean ?setup=true from URL if present
    if (typeof window !== 'undefined' && window.location.search.includes('setup=')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Subscribe to Supabase auth changes and handle OAuth return
  useEffect(() => {
    // Check for error parameters in URL (from OAuth cancellation or misconfiguration)
    if (typeof window !== 'undefined') {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const queryParams = new URLSearchParams(window.location.search);
      const errorDesc =
        hashParams.get('error_description') ||
        queryParams.get('error_description') ||
        hashParams.get('error') ||
        queryParams.get('error');

      if (errorDesc) {
        console.error('OAuth return error:', errorDesc);
        setAuthBannerError(decodeURIComponent(errorDesc.replace(/\+/g, ' ')));
        // Clean URL so the error param is not stuck on subsequent reloads
        window.history.replaceState({}, document.title, window.location.pathname);
        setIsAuthChecking(false);
      }
    }

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      setIsAuthChecking(false);
      if (error) {
        console.warn('Error fetching Supabase session:', error.message);
      }
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthChecking(false);
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

      // Clean up hash/code from address bar once signed in
      if (event === 'SIGNED_IN' && typeof window !== 'undefined') {
        if (window.location.hash || window.location.search.includes('code=')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
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

  // Filtered habits by selected category
  const filteredHabits = useMemo(() => {
    if (selectedCategory === 'all') return habits;
    return habits.filter((habit) => habit.category === selectedCategory);
  }, [habits, selectedCategory]);

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

  const handleSaveSetupHabits = (newHabits: Habit[]) => {
    setHabits(newHabits);
    if (user) {
      upsertAllCloudHabits(user.id, newHabits).catch(console.error);
    }
  };

  // Show smooth loading state while completing OAuth token exchange
  if (isAuthChecking) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 p-4">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/25 mb-4 animate-pulse">
          <Table2 className="h-6 w-6" />
        </div>
        <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
          <span>Signing in & syncing your habits...</span>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Connecting to Daybit Cloud</p>
      </div>
    );
  }

  // Show Setup / Onboarding screen strictly for first-time users
  if (!isSetupComplete && !user) {
    return (
      <SetupScreen
        theme={theme}
        onToggleTheme={toggleTheme}
        currentHabits={habits}
        onSaveHabits={handleSaveSetupHabits}
        onComplete={handleSetupComplete}
        initialError={authBannerError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col text-slate-800 dark:text-slate-100">
      {/* OAuth Error Toast if triggered after setup complete */}
      {authBannerError && (
        <div className="sticky top-0 z-50 bg-rose-600 text-white px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-medium shadow-md animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Google Sign-In note: {authBannerError}</span>
          </div>
          <button
            onClick={() => setAuthBannerError(null)}
            className="p-1 rounded-md hover:bg-rose-700 active:scale-95 transition-all cursor-pointer"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Application Header with Integrated Month Navigation */}
      <Header
        currentDate={currentDate}
        todayDate={todayDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onJumpToCurrentMonth={handleJumpToCurrentMonth}
        daysCount={days.length}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        bestStreak={bestStreak}
        user={user}
        isSyncing={isSyncing}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        theme={theme}
        onToggleTheme={toggleTheme}
        activeMobileTab={mobileTab}
        onPromptInstall={promptInstall}
        isStandalone={isStandalone}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-3 sm:px-6 py-3 sm:py-5 pb-24 sm:pb-6 space-y-4 sm:space-y-5 animate-fade-in">

        {/* ─────────────────────────────────────────────────────────────
            MOBILE-ONLY DEDICATED VIEW (Uncluttered, fast, tab-specific)
        ───────────────────────────────────────────────────────────── */}
        <div className="sm:hidden space-y-3.5">
          {/* Today Tab: The focused daily ritual */}
          {mobileTab === 'today' && (
            <div className="space-y-3 animate-fade-in">
              {user && <GreetingBanner user={user} />}
              <HabitGrid
                habits={filteredHabits}
                days={days}
                onToggleHabit={handleToggleHabit}
                onDeleteHabit={handleDeleteHabit}
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                activeView="today"
                onViewChange={(view) => setMobileTab(view === 'today' ? 'today' : 'grid')}
              />
            </div>
          )}

          {/* Grid / Month Tab: The monthly streak matrix & spreadsheet */}
          {mobileTab === 'grid' && (
            <div className="space-y-3 animate-fade-in">
              <HabitGrid
                habits={filteredHabits}
                days={days}
                onToggleHabit={handleToggleHabit}
                onDeleteHabit={handleDeleteHabit}
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                activeView="grid"
                onViewChange={(view) => setMobileTab(view === 'today' ? 'today' : 'grid')}
              />
            </div>
          )}

          {/* Stats Tab: High-impact monthly analytics & charts */}
          {mobileTab === 'stats' && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                    Monthly Performance
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700/60">
                  {monthName} {currentDate.getFullYear()}
                </span>
              </div>

              {/* 4 KPI Cards */}
              <HabitStats summary={summary} monthName={monthName} />

              {/* Analytics Line & Bar Charts */}
              <HabitChart days={days} habits={filteredHabits} />

              {/* Sync Status Badge */}
              <div className="bg-white dark:bg-[#0f1422] rounded-xl p-3 border border-slate-200/90 dark:border-slate-800/90 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="leading-tight">
                    {user ? 'Cloud & Local sync active' : 'Local storage auto-saved'}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                  Secured
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            DESKTOP FULL DASHBOARD (>= sm: rich spreadsheet + stats)
        ───────────────────────────────────────────────────────────── */}
        <div className="hidden sm:block space-y-5">
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
          />

          {/* Unified Monthly Analysis & Performance Section */}
          <div id="analytics-section" className="space-y-4 pt-2">
            <div className="flex items-center gap-2 px-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
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
        </div>
      </main>

      {/* Native Mobile Bottom Navigation Bar (Thumb-friendly on phone) */}
      <MobileBottomBar
        activeTab={mobileTab}
        onTabChange={(tab) => {
          setMobileTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
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

      {/* Modal for Installing App / Home Screen Guidance (PWA) */}
      <PWAInstallModal
        isOpen={isIOSModalOpen}
        onClose={() => setIsIOSModalOpen(false)}
        isIOS={isIOS}
      />
    </div>
  );
}

import { createClient, User } from '@supabase/supabase-js';
import { Habit } from '../types/habit';

const DEFAULT_SUPABASE_URL = 'https://sfmpfkzswawjodzilpes.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmbXBma3pzd2F3am9kemlscGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MjAzMjcsImV4cCI6MjEwNzM5NjMyN30.dNfvdZCSt9RaHw6JdjUH_hQsT8OR9LubOiZlCiKwSTw';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ── Authentication Helpers ──────────────────────────────────────────────────

export const signInWithGoogle = async () => {
  // Compute redirect URL based on current origin and path
  const redirectUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`.replace(/\/$/, '')
    : undefined;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl || window.location.origin,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });
  if (error) throw error;
  return data;
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// ── Cloud Database Sync Helpers ─────────────────────────────────────────────

interface DbHabitRow {
  id: string;
  user_id: string;
  name: string;
  category: string;
  emoji: string;
  color: string;
  target_per_month: number | null;
  description: string | null;
  created_at: string;
  completions: Record<string, boolean>;
}

export const habitToDbRow = (habit: Habit, userId: string): DbHabitRow => ({
  id: habit.id,
  user_id: userId,
  name: habit.name,
  category: habit.category,
  emoji: habit.emoji,
  color: habit.color,
  target_per_month: habit.targetPerMonth ?? null,
  description: habit.description ?? null,
  created_at: habit.createdAt,
  completions: habit.completions,
});

export const dbRowToHabit = (row: DbHabitRow): Habit => ({
  id: row.id,
  name: row.name,
  category: row.category as Habit['category'],
  emoji: row.emoji,
  color: row.color,
  targetPerMonth: row.target_per_month ?? undefined,
  description: row.description ?? undefined,
  createdAt: row.created_at,
  completions: row.completions || {},
});

export const fetchCloudHabits = async (userId: string): Promise<Habit[]> => {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching habits from cloud:', error);
    throw error;
  }

  return (data || []).map((row) => dbRowToHabit(row as DbHabitRow));
};

export const upsertCloudHabit = async (userId: string, habit: Habit): Promise<void> => {
  const row = habitToDbRow(habit, userId);
  const { error } = await supabase
    .from('habits')
    .upsert(row, { onConflict: 'id' });

  if (error) {
    console.error('Error saving habit to cloud:', error);
    throw error;
  }
};

export const upsertAllCloudHabits = async (userId: string, habits: Habit[]): Promise<void> => {
  if (habits.length === 0) return;
  const rows = habits.map((h) => habitToDbRow(h, userId));
  const { error } = await supabase
    .from('habits')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    console.error('Error bulk uploading habits to cloud:', error);
    throw error;
  }
};

export const deleteCloudHabit = async (userId: string, habitId: string): Promise<void> => {
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', habitId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting habit from cloud:', error);
    throw error;
  }
};

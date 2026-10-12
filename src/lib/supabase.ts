import { createClient, User } from '@supabase/supabase-js';
import { Habit } from '../types/habit';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Cloud sync will operate in offline/local mode.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

// ── Authentication Helpers ──────────────────────────────────────────────────

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
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

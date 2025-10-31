import { supabase } from './supabaseClient';
import type {
  User,
  Cleaner,
  Apartment,
  CleaningTask,
  ApartmentWithCleaner,
  CleaningTaskWithDetails,
} from '../types/db';

/* ========== USER ========== */

export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // In deinem Schema existieren sowohl auth_id als auch auth_user_id.
  // Wir filtern hier über auth_id (wie bisher bei dir genutzt).
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/* ========== CLEANERS ========== */

export async function getCleaners(hostId: string): Promise<Cleaner[]> {
  const { data, error } = await supabase
    .from('cleaners')
    .select('*')
    .eq('host_id', hostId)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function createCleaner(
  cleaner: Omit<Cleaner, 'id' | 'created_at'>
): Promise<Cleaner> {
  const { data, error } = await supabase
    .from('cleaners')
    .insert([cleaner])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCleaner(
  id: string,
  updates: Partial<Cleaner>
): Promise<Cleaner> {
  const { data, error } = await supabase
    .from('cleaners')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ruft deine Edge Function auf (Service-Role läuft serverseitig dort)
export async function deleteCleanerCascade(cleanerId: string) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-cleaner-cascade`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cleaner_id: cleanerId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || 'Failed to delete cleaner');
  return json;
}

/* ========== APARTMENTS ========== */

export async function getApartments(
  ownerId: string
): Promise<ApartmentWithCleaner[]> {
  const { data, error } = await supabase
    .from('apartments')
    .select(
      `
      *,
      default_cleaner:cleaners(*)
    `
    )
    .eq('owner_id', ownerId)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getApartmentsForCleaner(
  cleanerId: string
): Promise<Apartment[]> {
  const { data, error } = await supabase
    .from('apartments')
    .select('*')
    .eq('default_cleaner_id', cleanerId)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function createApartment(
  apartment: Omit<Apartment, 'id' | 'created_at'>
): Promise<Apartment> {
  const { data, error } = await supabase
    .from('apartments')
    .insert([apartment])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateApartment(
  id: string,
  updates: Partial<Apartment>
): Promise<Apartment> {
  const { data, error } = await supabase
    .from('apartments')
    .update(updates)
    .eq('listing_id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteApartment(id: string): Promise<void> {
  const { error } = await supabase
    .from('apartments')
    .delete()
    .eq('listing_id', id);

  if (error) throw error;
}

/* ========== TASKS ========== */

export async function getTasks(
  ownerId: string,
  filters?: { dateFrom?: string; dateTo?: string; cleanerId?: string }
): Promise<CleaningTaskWithDetails[]> {
  // Alias "apartment" für den Join, damit Filter stabil sind
  let query = supabase
    .from('cleaning_tasks')
    .select(
      `
      *,
      apartment:apartments!inner(*),
      cleaner:cleaners(*)
    `
    )
    .eq('apartment.owner_id', ownerId); // Filter auf die gejointe Tabelle via Alias

  if (filters?.dateFrom) query = query.gte('date', filters.dateFrom);
  if (filters?.dateTo) query = query.lte('date', filters.dateTo);
  if (filters?.cleanerId) query = query.eq('cleaner_id', filters.cleanerId);

  const { data, error } = await query.order('date');
  if (error) throw error;
  return data ?? [];
}

export async function getTasksForCleaner(
  cleanerId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<CleaningTaskWithDetails[]> {
  let query = supabase
    .from('cleaning_tasks')
    .select(
      `
      *,
      apartment:apartments!cleaning_tasks_listing_id_fkey(*)
    `
    )
    .eq('cleaner_id', cleanerId);

  if (dateFrom) query = query.gte('date', dateFrom);
  if (dateTo) query = query.lte('date', dateTo);

  const { data, error } = await query.order('date');
  if (error) throw error;
  return data || [];
}

export async function createTask(
  task: Omit<CleaningTask, 'id' | 'created_at'>
): Promise<CleaningTask> {
  const taskData: CleaningTask = { ...(task as any) };

  // Falls kein cleaner_id übergeben wurde, default_cleaner des Apartments verwenden
  if (!taskData.cleaner_id && taskData.listing_id) {
    const { data: apartment, error: aErr } = await supabase
      .from('apartments')
      .select('default_cleaner_id')
      .eq('listing_id', taskData.listing_id) // ✅ richtiger Key (vorher fälschlich 'name')
      .maybeSingle();

    if (aErr) throw aErr;
    if (apartment?.default_cleaner_id) {
      taskData.cleaner_id = apartment.default_cleaner_id;
    }
  }

  const { data, error } = await supabase
    .from('cleaning_tasks')
    .insert([taskData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTask(
  id: string,
  updates: Partial<CleaningTask>
): Promise<CleaningTask> {
  const { data, error } = await supabase
    .from('cleaning_tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('cleaning_tasks').delete().eq('id', id);
  if (error) throw error;
}

/* ========== LOOKUPS ========== */

export async function getCleanerById(
  cleanerId: string
): Promise<Cleaner | null> {
  const { data, error } = await supabase
    .from('cleaners')
    .select('*')
    .eq('id', cleanerId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getCleanerByUserId(
  userId: string
): Promise<Cleaner | null> {
  const { data, error } = await supabase
    .from('cleaners')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

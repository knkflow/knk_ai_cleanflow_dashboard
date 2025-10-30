import { supabase } from './supabase';
import type { User, Cleaner, Apartment, CleaningTask, ApartmentWithCleaner, CleaningTaskWithDetails } from '../types/db';

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getCleaners(hostId: string): Promise<Cleaner[]> {
  const { data, error } = await supabase
    .from('cleaners')
    .select('*')
    .eq('host_id', hostId)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function createCleaner(cleaner: Omit<Cleaner, 'id' | 'created_at'>): Promise<Cleaner> {
  const { data, error } = await supabase
    .from('cleaners')
    .insert([cleaner])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCleaner(id: string, updates: Partial<Cleaner>): Promise<Cleaner> {
  const { data, error } = await supabase
    .from('cleaners')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCleaner(id: string): Promise<void> {
  const { error } = await supabase
    .from('cleaners')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getApartments(ownerId: string): Promise<ApartmentWithCleaner[]> {
  const { data, error } = await supabase
    .from('apartments')
    .select(`
      *,
      default_cleaner:cleaners(*)
    `)
    .eq('owner_id', ownerId)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getApartmentsForCleaner(cleanerId: string): Promise<Apartment[]> {
  const { data, error } = await supabase
    .from('apartments')
    .select('*')
    .eq('default_cleaner_id', cleanerId)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function createApartment(apartment: Omit<Apartment, 'id' | 'created_at'>): Promise<Apartment> {
  const { data, error } = await supabase
    .from('apartments')
    .insert([apartment])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateApartment(id: string, updates: Partial<Apartment>): Promise<Apartment> {
  const { data, error } = await supabase
    .from('apartments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteApartment(id: string): Promise<void> {
  const { error } = await supabase
    .from('apartments')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getTasks(
  ownerId: string,
  filters?: { dateFrom?: string; dateTo?: string; cleanerId?: string }
): Promise<CleaningTaskWithDetails[]> {
  let query = supabase
    .from('cleaning_tasks')
    .select(`
      *,
      apartment:apartments!inner(*),
      cleaner:cleaners(*)
    `)
    // filtere auf die verbundene Tabelle
    .eq('apartments.owner_id', ownerId); // wichtig: Pfad ist der Tabellenname im Select

  if (filters?.dateFrom) query = query.gte('date', filters.dateFrom);
  if (filters?.dateTo)   query = query.lte('date', filters.dateTo);
  if (filters?.cleanerId) query = query.eq('cleaner_id', filters.cleanerId);

  const { data, error } = await query.order('date');
  if (error) throw error;
  return data ?? [];
}

export async function getTasksForCleaner(cleanerId: string, dateFrom?: string, dateTo?: string): Promise<CleaningTaskWithDetails[]> {
  let query = supabase
    .from('cleaning_tasks')
    .select(`
      *,
      apartment:apartments!cleaning_tasks_listing_id_fkey(*)
    `)
    .eq('cleaner_id', cleanerId);

  if (dateFrom) {
    query = query.gte('date', dateFrom);
  }
  if (dateTo) {
    query = query.lte('date', dateTo);
  }

  const { data, error } = await query.order('date');

  if (error) throw error;
  return data || [];
}

export async function createTask(task: Omit<CleaningTask, 'id' | 'created_at'>): Promise<CleaningTask> {
  let taskData = { ...task };

  console.log(taskData);

  if (!taskData.cleaner_id && taskData.listing_id) {
    const { data: apartment } = await supabase
      .from('apartments')
      .select('default_cleaner_id')
      .eq('name', taskData.listing_id)
      .maybeSingle();

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

export async function updateTask(id: string, updates: Partial<CleaningTask>): Promise<CleaningTask> {
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
  const { error } = await supabase
    .from('cleaning_tasks')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getCleanerById(cleanerId: string): Promise<Cleaner | null> {
  const { data, error } = await supabase
    .from('cleaners')
    .select('*')
    .eq('id', cleanerId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getCleanerByUserId(userId: string): Promise<Cleaner | null> {
  const { data, error } = await supabase
    .from('cleaners')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

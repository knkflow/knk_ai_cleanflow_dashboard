// src/lib/api.ts
import { supabase } from './supabase'
import type {
  User,
  Cleaner,
  Apartment,
  CleaningTask,
  ApartmentWithCleaner,
  CleaningTaskWithDetails,
} from '../types/db'

/* ========== USER ========== */

export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .maybeSingle()

  if (error) throw error
  return data
}

/* ========== CLEANERS ========== */

/** Holt alle Cleaner eines Hosts */
export async function getCleaners(hostId: string): Promise<Cleaner[]> {
  const { data, error } = await supabase
    .from('cleaners')
    .select('*')
    .eq('host_id', hostId)
    .order('name')

  if (error) throw error
  return data || []
}
export async function getApartmentsForCleaner(
  cleanerId: string
): Promise<Apartment[]> {
  const { data, error } = await supabase
    .from('apartments')
    .select('*')
    .eq('default_cleaner_id', cleanerId)
    .order('name')

  if (error) throw error
  return data || []
}

/**
 * Cleaner erstellen + Einladung senden (Edge Function)
 * Aufruf-Slug lt. deiner Angabe: "smart-function"
 * Rückgabe: wir geben *data* direkt zurück (dein UI prüft später result?.ok)
 */
export async function createCleanerAndInvite(payload: {
  host_id: string
  name: string
  email?: string | null
  phone?: string | null
  hourly_rate?: number | null
  send_magic_link?: boolean
}): Promise<any> {
  const { data, error } = await supabase.functions.invoke('smart-function', {
    body: payload,
  })

  if (error) throw new Error(error.message || 'Edge Function call failed')

  // Optional defensiv: Edge-Error in data abfangen, ohne die Form zu ändern
  if (data?.error) throw new Error(data.error)

  return data
}

/**
 * Cleaner + zugehörige Daten löschen (Edge Function)
 * ⛳️ Prüfe den Slug in Supabase; du nanntest zuletzt "quick-task".
 * Falls dein tatsächlicher Slug anders ist (z. B. "delete.cleaner-oncascade"),
 * einfach unten austauschen.
 */
export async function deleteCleanerCascade(cleanerId: string) {
  const { data, error } = await supabase.functions.invoke('quick-task', {
    body: { cleaner_id: cleanerId },
  })

  if (error) {
    console.error('❌ Supabase invoke error:', error)
    throw new Error(error.message || 'Failed to invoke delete-cleaner-cascade')
  }

  if (data?.error) {
    console.error('❌ Function returned error:', data.error)
    throw new Error(data.error)
  }

  return data
}

/** Lokales Update in der Tabelle cleaners (kein Edge Function Call) */
export async function updateCleaner(id: string, updates: Partial<Cleaner>): Promise<Cleaner> {
  const { data, error } = await supabase
    .from('cleaners')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/* ========== APARTMENTS ========== */

export async function getApartments(ownerId: string): Promise<ApartmentWithCleaner[]> {
  const { data, error } = await supabase
    .from('apartments')
    .select(`
      *,
      default_cleaner:cleaners(*)
    `)
  .eq('owner_id', ownerId)
  .order('name')

  if (error) throw error
  return data || []
}

export async function createApartment(
  apartment: Omit<Apartment, 'id' | 'created_at'>
): Promise<Apartment> {
  const { data, error } = await supabase
    .from('apartments')
    .insert([apartment])
    .select()
    .single()

  if (error) throw error
  return data
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
    .single()

  if (error) throw error
  return data
}

export async function deleteApartment(id: string): Promise<void> {
  const { error } = await supabase
    .from('apartments')
    .delete()
    .eq('listing_id', id)

  if (error) throw error
}

/* ========== TASKS ========== */

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
    .eq('apartment.owner_id', ownerId)

  if (filters?.dateFrom) query = query.gte('date', filters.dateFrom)
  if (filters?.dateTo)   query = query.lte('date', filters.dateTo)
  if (filters?.cleanerId) query = query.eq('cleaner_id', filters.cleanerId)

  const { data, error } = await query.order('date')
  if (error) throw error
  return data ?? []
}

export async function createTask(
  task: Omit<CleaningTask, 'id' | 'created_at'>
): Promise<CleaningTask> {
  const taskData: any = { ...task }

  // Falls kein cleaner_id gesetzt: Default aus Apartment ziehen
  if (!taskData.cleaner_id && taskData.listing_id) {
    const { data: apartment, error: aErr } = await supabase
      .from('apartments')
      .select('default_cleaner_id')
      .eq('listing_id', taskData.listing_id)
      .maybeSingle()

    if (aErr) throw aErr
    if (apartment?.default_cleaner_id) {
      taskData.cleaner_id = apartment.default_cleaner_id
    }
  }

  const { data, error } = await supabase
    .from('cleaning_tasks')
    .insert([taskData])
    .select()
    .single()

  if (error) throw error
  return data
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
    .single()

  if (error) throw error
  return data
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('cleaning_tasks')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/* ========== LOOKUPS ========== */

export async function getCleanerById(cleanerId: string): Promise<Cleaner | null> {
  const { data, error } = await supabase
    .from('cleaners')
    .select('*')
    .eq('id', cleanerId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getCleanerByUserId(userId: string): Promise<Cleaner | null> {
  const { data, error } = await supabase
    .from('cleaners')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

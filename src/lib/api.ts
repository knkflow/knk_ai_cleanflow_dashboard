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
export async function getCleaners(hostId: string): Promise<Cleaner[]> {
  const { data, error } = await supabase
    .from('cleaners')
    .select('*')
    .eq('host_id', hostId)
    .order('name')

  if (error) throw error
  return data || []
}

/**
 * Cleaner erstellen + Einladung senden (Edge Function)
 */
export async function createCleanerAndInvite(payload: {
  host_id: string
  name: string
  email?: string | null
  phone?: string | null
  hourly_rate?: number | null
  send_magic_link?: boolean
})const { data, error } = await supabase.functions.invoke('smart-function', {
  body: payload,
})

  // Rückgabe immer konsistent
  return { data, error }
}

/**
 * Cleaner + zugehörige Daten löschen (Edge Function)
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

  console.log('✅ Cleaner deletion success:', data)
  return data
}

/**
 * Cleaner direkt in DB updaten (kein Edge Function Call)
 */
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
  if (filters?.dateTo) query = query.lte('date', filters.dateTo)
  if (filters?.cleanerId) query = query.eq('cleaner_id', filters.cleanerId)

  const { data, error } = await query.order('date')
  if (error) throw error
  return data ?? []
}

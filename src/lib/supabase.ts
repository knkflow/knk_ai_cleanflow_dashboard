// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ✅ Zusatz: praktischer Hook für React-Komponenten
export function useSupabase() {
  return { supabase };
}

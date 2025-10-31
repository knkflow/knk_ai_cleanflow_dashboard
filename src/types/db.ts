// src/types/db.ts
export interface User {
  id: string;
  auth_id: string | null;
  role: 'Host' | 'Cleaner' | string;
  name: string | null;
  email: string;
  phone: string | null;
}

export interface Cleaner {
  id: string;
  host_id: string;       // -> public.users.id
  user_id: string | null; // -> auth.users.id
  name: string;
  email: string | null;
  phone: string | null;
  hourly_rate: number | null;
  availability: string[] | null; // jsonb
}

export interface Apartment {
  listing_id: string;           // PK
  owner_id: string;             // -> public.users.id
  default_cleaner_id: string | null; // -> public.cleaners.id
  name: string;
  address: string | null;
}

export interface CleaningTask {
  id: string;
  listing_id: string;          // -> apartments.listing_id
  cleaner_id: string | null;   // -> cleaners.id
  date: string;                // 'YYYY-MM-DD'
  note: string | null;
  deadline: string | null;
}

export interface ApartmentWithCleaner extends Apartment {
  default_cleaner?: Cleaner | null;
}

export interface CleaningTaskWithDetails extends CleaningTask {
  apartment?: Apartment | null;
  cleaner?: Cleaner | null;
}

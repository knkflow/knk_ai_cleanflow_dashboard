export interface User {
  id: string;
  auth_id: string;
  email: string;
  role: 'Host' | 'Cleaner';
  name: string | null;
  phone: string | null;
  created_at: string; // ISO
}

export interface Cleaner {
  id: string;
  host_id: string;
  user_id: string | null; // auth.users.id
  name: string;
  email: string | null;
  phone: string | null;
  hourly_rate: number | null;
  availability: string[] | null; // <— WICHTIG: nullable!
  created_at: string; // ISO
}

export interface Apartment {
  id: string;
  owner_id: string;
  listing_id: string;
  name: string;
  address: string | null;
  default_cleaner_id: string | null;
  created_at: string; // ISO
}

export interface CleaningTask {
  id: string;
  listing_id: string;
  cleaner_id: string | null;
  date: string; // ISO Date (YYYY-MM-DD?) oder Timestamp (ISO) — vereinheitlichen!
  deadline: string | null; // ISO
  note: string | null;
  created_at: string; // ISO
}

export interface ApartmentWithCleaner extends Apartment {
  default_cleaner?: Cleaner | null;
}

export interface CleaningTaskWithDetails extends CleaningTask {
  apartment?: Apartment;
  cleaner?: Cleaner | null;
}

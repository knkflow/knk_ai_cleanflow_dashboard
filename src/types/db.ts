export interface User {
  id: string;
  auth_id: string;
  email: string;
  role: 'Host' | 'Cleaner';
  name: string | null;
  phone: string | null;
  created_at: string;
}

export interface Cleaner {
  id: string;
  host_id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  hourly_rate: number | null;
  availability: string[];
  created_at: string;
}

export interface Apartment {
  id: string;
  owner_id: string;
  listing_id: string;
  name: string;
  address: string | null;
  default_cleaner_id: string | null;
  created_at: string;
}

export interface CleaningTask {
  id: string;
  listing_id: string;
  cleaner_id: string | null;
  date: string;
  deadline: string | null;
  note: string | null;
  created_at: string;
}

export interface ApartmentWithCleaner extends Apartment {
  default_cleaner?: Cleaner | null;
}

export interface CleaningTaskWithDetails extends CleaningTask {
  apartment?: Apartment;
  cleaner?: Cleaner | null;
}

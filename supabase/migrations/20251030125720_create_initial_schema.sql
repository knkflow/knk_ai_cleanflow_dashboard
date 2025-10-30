/*
  # Initial Schema for Short-Term Rental Cleaning Management

  ## New Tables
  
  ### 1. `users`
  - `id` (uuid, primary key) - Internal user ID
  - `auth_id` (uuid, unique, references auth.users) - Link to Supabase Auth
  - `email` (text, not null) - User email
  - `role` (text, not null) - Either 'Host' or 'Cleaner'
  - `name` (text) - User full name
  - `phone` (text) - Contact phone number
  - `created_at` (timestamptz) - Account creation timestamp

  ### 2. `cleaners`
  - `id` (uuid, primary key) - Cleaner ID
  - `host_id` (uuid, references users.id) - Host who manages this cleaner
  - `user_id` (uuid, references users.id, nullable) - Linked user account (null until signup)
  - `name` (text, not null) - Cleaner name
  - `email` (text) - Cleaner email for invitation
  - `phone` (text) - Contact phone
  - `hourly_rate` (numeric) - Pay rate
  - `availability` (jsonb, default '[]') - Array of unavailable dates in 'dd-MM-yyyy' format
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. `apartments`
  - `id` (uuid, primary key) - Apartment ID
  - `owner_id` (uuid, references users.id) - Host who owns this apartment
  - `listing_id` (text, not null, unique) - Immutable external listing identifier
  - `name` (text, not null) - Apartment name
  - `address` (text) - Full address
  - `default_cleaner_id` (uuid, references cleaners.id, nullable) - Default assigned cleaner
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. `cleaning_tasks`
  - `id` (uuid, primary key) - Task ID
  - `listing_id` (uuid, references apartments.id) - Apartment to clean
  - `cleaner_id` (uuid, references cleaners.id, nullable) - Assigned cleaner
  - `date` (text, not null) - Cleaning date in 'dd-MM-yyyy' format
  - `deadline` (text) - Deadline in 'dd-MM-yyyy' format
  - `note` (text) - Additional notes
  - `created_at` (timestamptz) - Task creation timestamp

  ## Security
  - Enable RLS on all tables
  - Add policies for Host and Cleaner role-based access

  ## Important Notes
  1. All date fields use 'dd-MM-yyyy' string format for consistency
  2. The `listing_id` in apartments is immutable (should be disabled in edit UI)
  3. Cleaners can be created without user_id (pending signup)
  4. Auto-linking via DB trigger when cleaner signs up (see separate trigger file)
*/

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('Host', 'Cleaner')),
  name text,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Create cleaners table
CREATE TABLE IF NOT EXISTS public.cleaners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text,
  phone text,
  hourly_rate numeric(10,2),
  availability jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create apartments table
CREATE TABLE IF NOT EXISTS public.apartments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  listing_id text NOT NULL UNIQUE,
  name text NOT NULL,
  address text,
  default_cleaner_id uuid REFERENCES public.cleaners(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create cleaning_tasks table
CREATE TABLE IF NOT EXISTS public.cleaning_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
  cleaner_id uuid REFERENCES public.cleaners(id) ON DELETE SET NULL,
  date text NOT NULL,
  deadline text,
  note text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_id);
CREATE INDEX IF NOT EXISTS idx_cleaners_host_id ON public.cleaners(host_id);
CREATE INDEX IF NOT EXISTS idx_cleaners_user_id ON public.cleaners(user_id);
CREATE INDEX IF NOT EXISTS idx_cleaners_email ON public.cleaners(email);
CREATE INDEX IF NOT EXISTS idx_apartments_owner_id ON public.apartments(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_listing_id ON public.cleaning_tasks(listing_id);
CREATE INDEX IF NOT EXISTS idx_tasks_cleaner_id ON public.cleaning_tasks(cleaner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_date ON public.cleaning_tasks(date);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaning_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- RLS Policies for cleaners table
CREATE POLICY "Hosts can view own cleaners"
  ON public.cleaners FOR SELECT
  TO authenticated
  USING (
    host_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid() AND role = 'Host')
    OR user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid() AND role = 'Cleaner')
  );

CREATE POLICY "Hosts can insert own cleaners"
  ON public.cleaners FOR INSERT
  TO authenticated
  WITH CHECK (
    host_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid() AND role = 'Host')
  );

CREATE POLICY "Hosts can update own cleaners"
  ON public.cleaners FOR UPDATE
  TO authenticated
  USING (
    host_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid() AND role = 'Host')
    OR user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid() AND role = 'Cleaner')
  )
  WITH CHECK (
    host_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid() AND role = 'Host')
    OR user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid() AND role = 'Cleaner')
  );

CREATE POLICY "Hosts can delete own cleaners"
  ON public.cleaners FOR DELETE
  TO authenticated
  USING (
    host_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid() AND role = 'Host')
  );

-- RLS Policies for apartments table
CREATE POLICY "Hosts can view own apartments"
  ON public.apartments FOR SELECT
  TO authenticated
  USING (
    owner_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid() AND role = 'Host')
    OR default_cleaner_id IN (
      SELECT id FROM public.cleaners WHERE user_id IN (
        SELECT id FROM public.users WHERE auth_id = auth.uid() AND role = 'Cleaner'
      )
    )
  );

CREATE POLICY "Hosts can insert own apartments"
  ON public.apartments FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid() AND role = 'Host')
  );

CREATE POLICY "Hosts can update own apartments"
  ON public.apartments FOR UPDATE
  TO authenticated
  USING (
    owner_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid() AND role = 'Host')
  )
  WITH CHECK (
    owner_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid() AND role = 'Host')
  );

CREATE POLICY "Hosts can delete own apartments"
  ON public.apartments FOR DELETE
  TO authenticated
  USING (
    owner_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid() AND role = 'Host')
  );

-- RLS Policies for cleaning_tasks table
CREATE POLICY "View tasks for host apartments or assigned cleaner"
  ON public.cleaning_tasks FOR SELECT
  TO authenticated
  USING (
    listing_id IN (
      SELECT id FROM public.apartments WHERE owner_id IN (
        SELECT id FROM public.users WHERE auth_id = auth.uid() AND role = 'Host'
      )
    )
    OR cleaner_id IN (
      SELECT id FROM public.cleaners WHERE user_id IN (
        SELECT id FROM public.users WHERE auth_id = auth.uid() AND role = 'Cleaner'
      )
    )
  );

CREATE POLICY "Hosts can insert tasks for own apartments"
  ON public.cleaning_tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    listing_id IN (
      SELECT id FROM public.apartments WHERE owner_id IN (
        SELECT id FROM public.users WHERE auth_id = auth.uid() AND role = 'Host'
      )
    )
  );

CREATE POLICY "Hosts can update tasks for own apartments"
  ON public.cleaning_tasks FOR UPDATE
  TO authenticated
  USING (
    listing_id IN (
      SELECT id FROM public.apartments WHERE owner_id IN (
        SELECT id FROM public.users WHERE auth_id = auth.uid() AND role = 'Host'
      )
    )
  )
  WITH CHECK (
    listing_id IN (
      SELECT id FROM public.apartments WHERE owner_id IN (
        SELECT id FROM public.users WHERE auth_id = auth.uid() AND role = 'Host'
      )
    )
  );

CREATE POLICY "Hosts can delete tasks for own apartments"
  ON public.cleaning_tasks FOR DELETE
  TO authenticated
  USING (
    listing_id IN (
      SELECT id FROM public.apartments WHERE owner_id IN (
        SELECT id FROM public.users WHERE auth_id = auth.uid() AND role = 'Host'
      )
    )
  );
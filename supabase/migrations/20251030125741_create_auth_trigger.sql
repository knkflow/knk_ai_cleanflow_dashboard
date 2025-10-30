/*
  # Auto-linking Auth Users to Profiles and Cleaners

  ## Purpose
  This trigger automatically:
  1. Creates or updates a user profile in public.users when a new auth.users record is created
  2. Links pending cleaners to their user account based on email match

  ## How it Works
  When a cleaner signs up:
  - The trigger creates a public.users profile with role 'Cleaner'
  - It finds any cleaners records with matching email (case-insensitive)
  - Updates those cleaner records to link them via user_id

  ## Important Notes
  - This eliminates the need for Edge Functions or admin API calls
  - Hosts can create "pending" cleaners with just an email
  - When the cleaner signs up, the link happens automatically
  - Multiple cleaners with same email (different hosts) will all be linked
*/

-- Function to handle new auth user creation
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- 1. Insert or update the user profile
  INSERT INTO public.users (auth_id, email, role, name, phone)
  VALUES (NEW.id, NEW.email, 'Cleaner', NULL, NULL)
  ON CONFLICT (auth_id) 
  DO UPDATE SET email = EXCLUDED.email;

  -- Get the user_id
  SELECT id INTO v_user_id 
  FROM public.users 
  WHERE auth_id = NEW.id;

  -- 2. Link any pending cleaners with matching email
  UPDATE public.cleaners
  SET user_id = v_user_id
  WHERE email IS NOT NULL
    AND LOWER(email) = LOWER(NEW.email)
    AND user_id IS NULL;

  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();
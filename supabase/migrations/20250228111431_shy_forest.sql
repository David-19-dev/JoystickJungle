/*
  # Fix profiles RLS policies

  1. Security
    - Add policy for inserting profiles during signup
    - Fix existing RLS policies for profiles table
    - Ensure service role can access all profiles
*/

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow service role to bypass RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create a policy for the service role to access all profiles
CREATE POLICY "Service role can do anything"
  ON profiles
  USING (true)
  WITH CHECK (true);

-- Ensure the auth.users trigger function exists to create profiles automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, created_at)
  VALUES (new.id, new.email, 'user', now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if the trigger exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
  END IF;
END
$$;
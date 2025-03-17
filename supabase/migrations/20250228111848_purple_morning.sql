/*
  # Fix profile duplication issues

  1. Security
    - Ensure the trigger function for creating profiles exists
    - Add ON CONFLICT DO NOTHING to prevent duplicate key errors
*/

-- Ensure the auth.users trigger function exists to create profiles automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, created_at)
  VALUES (new.id, new.email, 'user', now())
  ON CONFLICT (id) DO NOTHING; -- Add this to prevent duplicate key errors
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
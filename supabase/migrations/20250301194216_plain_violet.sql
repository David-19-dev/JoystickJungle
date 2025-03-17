/*
  # Add birth_date to profiles table

  1. Changes
    - Add birth_date column to profiles table
*/

-- Add birth_date column to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'birth_date'
  ) THEN
    ALTER TABLE profiles ADD COLUMN birth_date date;
  END IF;
END $$;
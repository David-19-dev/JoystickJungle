/*
  # Initial Schema Setup for Joystick Jungle

  1. New Tables
    - `profiles`
      - User profiles with role-based access control
    - `gaming_sessions`
      - Gaming session bookings with platform, time, and status
    - `subscriptions`
      - User subscription plans with remaining time
    - `payments`
      - Payment records for sessions and subscriptions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for admins to access all data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  first_name text,
  last_name text,
  phone text,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

-- Create gaming_sessions table
CREATE TABLE IF NOT EXISTS gaming_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  duration_minutes integer NOT NULL,
  status text NOT NULL DEFAULT 'booked',
  players_count integer NOT NULL DEFAULT 1,
  extras text[],
  total_price numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  remaining_minutes integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency text NOT NULL,
  payment_method text NOT NULL,
  status text NOT NULL,
  reference text NOT NULL UNIQUE,
  session_id uuid REFERENCES gaming_sessions(id) ON DELETE SET NULL,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gaming_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Profiles policies - check if they exist first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile"
      ON profiles
      FOR SELECT
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile"
      ON profiles
      FOR UPDATE
      USING (auth.uid() = id);
  END IF;
END
$$;

-- Gaming sessions policies - check if they exist first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'gaming_sessions' AND policyname = 'Users can view their own gaming sessions'
  ) THEN
    CREATE POLICY "Users can view their own gaming sessions"
      ON gaming_sessions
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'gaming_sessions' AND policyname = 'Users can insert their own gaming sessions'
  ) THEN
    CREATE POLICY "Users can insert their own gaming sessions"
      ON gaming_sessions
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'gaming_sessions' AND policyname = 'Users can update their own gaming sessions'
  ) THEN
    CREATE POLICY "Users can update their own gaming sessions"
      ON gaming_sessions
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Subscriptions policies - check if they exist first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can view their own subscriptions'
  ) THEN
    CREATE POLICY "Users can view their own subscriptions"
      ON subscriptions
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can insert their own subscriptions'
  ) THEN
    CREATE POLICY "Users can insert their own subscriptions"
      ON subscriptions
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- Payments policies - check if they exist first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Users can view their own payments'
  ) THEN
    CREATE POLICY "Users can view their own payments"
      ON payments
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Admin policies (using a function to check admin role)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies - check if they exist first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can view all profiles'
  ) THEN
    CREATE POLICY "Admins can view all profiles"
      ON profiles
      FOR SELECT
      USING (is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'gaming_sessions' AND policyname = 'Admins can view all gaming sessions'
  ) THEN
    CREATE POLICY "Admins can view all gaming sessions"
      ON gaming_sessions
      FOR SELECT
      USING (is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'gaming_sessions' AND policyname = 'Admins can update all gaming sessions'
  ) THEN
    CREATE POLICY "Admins can update all gaming sessions"
      ON gaming_sessions
      FOR UPDATE
      USING (is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Admins can view all subscriptions'
  ) THEN
    CREATE POLICY "Admins can view all subscriptions"
      ON subscriptions
      FOR SELECT
      USING (is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Admins can update all subscriptions'
  ) THEN
    CREATE POLICY "Admins can update all subscriptions"
      ON subscriptions
      FOR UPDATE
      USING (is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Admins can view all payments'
  ) THEN
    CREATE POLICY "Admins can view all payments"
      ON payments
      FOR SELECT
      USING (is_admin());
  END IF;
END
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS gaming_sessions_user_id_idx ON gaming_sessions(user_id);
CREATE INDEX IF NOT EXISTS gaming_sessions_start_time_idx ON gaming_sessions(start_time);
CREATE INDEX IF NOT EXISTS gaming_sessions_platform_idx ON gaming_sessions(platform);
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON payments(user_id);
CREATE INDEX IF NOT EXISTS payments_reference_idx ON payments(reference);
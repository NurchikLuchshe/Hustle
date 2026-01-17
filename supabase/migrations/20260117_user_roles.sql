-- Create user_roles enum if not exists
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('vendor', 'client');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add role column to vendors table (for users who are vendors)
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'vendor';

-- Create clients_profile table for client users
CREATE TABLE IF NOT EXISTS client_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for client_profiles
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own client profile"
ON client_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own client profile"
ON client_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own client profile"
ON client_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

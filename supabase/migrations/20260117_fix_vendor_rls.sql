-- Fix RLS: Allow users to create their own vendor record
CREATE POLICY "Users can create own vendor"
ON vendors FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own vendor
CREATE POLICY "Users can update own vendor"
ON vendors FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to select their own vendor
CREATE POLICY "Users can view own vendor"
ON vendors FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

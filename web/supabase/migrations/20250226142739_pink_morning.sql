/*
  # Update profile access policy

  1. Changes
    - Allow all authenticated users to view any profile
    - Remove the restriction that users can only view their own profile

  2. Security
    - Maintains existing RLS
    - Only modifies SELECT policy
    - Other policies (INSERT, UPDATE, DELETE) remain unchanged
*/

-- Drop existing select policy if it exists
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;

-- Create new select policy for public access
CREATE POLICY "Anyone can view profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);
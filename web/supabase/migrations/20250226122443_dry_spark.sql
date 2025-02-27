/*
  # Update profile policies for public access

  1. Changes
    - Drop and recreate select policy to allow public access
    - Keep existing update policy

  2. Security
    - Public read access to profiles
    - Write access remains restricted to profile owners
*/

-- Drop existing select policy
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

-- Create new select policy for public access
CREATE POLICY "Anyone can view profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);
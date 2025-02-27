/*
  # Fix group member policies

  1. Changes
    - Simplify group member policies to fix infinite recursion
    - Update groups policies for better member access

  2. Security
    - Maintain RLS security while fixing recursion issues
    - Ensure proper access control for group members
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Members can view their groups" ON groups;
DROP POLICY IF EXISTS "Members can view their own memberships" ON group_members;
DROP POLICY IF EXISTS "Members can view group member list" ON group_members;
DROP POLICY IF EXISTS "Owners can manage members" ON group_members;

-- Simplified group access policy
CREATE POLICY "Members can view their groups"
  ON groups
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT group_id
      FROM group_members
      WHERE user_id = auth.uid()
    )
  );

-- Simplified member policies
CREATE POLICY "View own memberships and group members"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    group_id IN (
      SELECT group_id
      FROM group_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage members"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id
      FROM group_members
      WHERE user_id = auth.uid()
      AND role = 'owner'
    )
  );
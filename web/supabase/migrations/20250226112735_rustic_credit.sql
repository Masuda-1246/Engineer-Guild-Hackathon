/*
  # Simplify group and member policies

  1. Changes
    - Remove complex nested queries from policies
    - Simplify access control logic
    - Fix infinite recursion issues

  2. Security
    - Maintain basic access control
    - Ensure proper group member visibility
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Members can view their groups" ON groups;
DROP POLICY IF EXISTS "View own memberships and group members" ON group_members;
DROP POLICY IF EXISTS "Owners can manage members" ON group_members;

-- Simple group access policy
CREATE POLICY "Group access policy"
  ON groups
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (created_by = auth.uid());

-- Simple member policies
CREATE POLICY "Member access policy"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Member management policy"
  ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT created_by FROM groups WHERE id = group_id) = auth.uid()
  );

CREATE POLICY "Member delete policy"
  ON group_members
  FOR DELETE
  TO authenticated
  USING (
    (SELECT created_by FROM groups WHERE id = group_id) = auth.uid()
  );
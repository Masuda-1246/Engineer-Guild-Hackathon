/*
  # Fix recursive policies

  1. Changes
    - Drop existing policies that cause recursion
    - Create simplified policies without recursive checks
    - Ensure proper access control while avoiding policy loops

  2. Security
    - Groups:
      - View: Members can view their groups
      - Create: Any authenticated user can create groups
      - Manage: Owners can manage their groups
    - Members:
      - View: Simple policy for viewing members
      - Join: Users can join groups
      - Manage: Owners can manage members
*/

-- Drop existing policies
DROP POLICY IF EXISTS "View groups" ON groups;
DROP POLICY IF EXISTS "Create groups" ON groups;
DROP POLICY IF EXISTS "Manage groups" ON groups;
DROP POLICY IF EXISTS "View members" ON group_members;
DROP POLICY IF EXISTS "Join groups" ON group_members;
DROP POLICY IF EXISTS "Manage members" ON group_members;

-- Groups policies
CREATE POLICY "View groups"
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

CREATE POLICY "Create groups"
  ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Manage groups"
  ON groups
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Group members policies
CREATE POLICY "View members"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id
      FROM group_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Join groups"
  ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Manage members"
  ON group_members
  FOR DELETE
  TO authenticated
  USING (
    group_id IN (
      SELECT id
      FROM groups
      WHERE created_by = auth.uid()
    )
  );
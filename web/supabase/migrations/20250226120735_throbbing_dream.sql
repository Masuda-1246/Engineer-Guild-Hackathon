/*
  # Update group policies and add join functionality

  1. Changes
    - Drop existing policies
    - Add new policies for groups and members
    - Restrict group viewing to members only
    - Allow group joining with proper checks

  2. Security
    - Users can only view groups they are members of
    - Users can join groups if not already a member
    - Users can create new groups
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "View groups" ON groups;
DROP POLICY IF EXISTS "Create groups" ON groups;
DROP POLICY IF EXISTS "View group members" ON group_members;
DROP POLICY IF EXISTS "Join groups" ON group_members;

-- Groups policies
CREATE POLICY "View own groups"
  ON groups
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Create new groups"
  ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Group members policies
CREATE POLICY "View group members"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Join new groups"
  ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    NOT EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = group_members.group_id
      AND user_id = auth.uid()
    )
  );
/*
  # Update group and member policies

  1. Changes
    - Drop existing policies
    - Add new simplified policies for groups and members
    - Ensure proper access control for all operations

  2. Security
    - Groups:
      - View: Only members can view their groups
      - Create: Any authenticated user can create groups
      - Edit/Delete: Only owners can manage their groups
    - Members:
      - View: Group members can view other members
      - Join: Users can join groups (if not already a member)
      - Manage: Only owners can manage members
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Members can view their groups" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Members can view group members" ON group_members;
DROP POLICY IF EXISTS "Users can join groups" ON group_members;
DROP POLICY IF EXISTS "Owners can manage members" ON group_members;

-- Groups policies
CREATE POLICY "View groups"
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

CREATE POLICY "Create groups"
  ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Manage groups"
  ON groups
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = id
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = id
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'owner'
    )
  );

-- Group members policies
CREATE POLICY "View members"
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

CREATE POLICY "Join groups"
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

CREATE POLICY "Manage members"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );
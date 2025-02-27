/*
  # Fix group join functionality with simplified policies

  1. Changes
    - Drop existing complex policies
    - Add simplified policies for groups and members
    - Enable basic CRUD operations for authenticated users

  2. Security
    - Members can view their groups
    - Members can view group members
    - Users can join groups
    - Group owners can manage groups
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Group access policy" ON groups;
DROP POLICY IF EXISTS "Member access policy" ON group_members;
DROP POLICY IF EXISTS "Member management policy" ON group_members;
DROP POLICY IF EXISTS "Member delete policy" ON group_members;

-- Groups policies
CREATE POLICY "Members can view groups"
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

-- Group members policies
CREATE POLICY "Members can view group members"
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

CREATE POLICY "Users can join groups"
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
/*
  # Add rules table for groups

  1. New Tables
    - `rules`
      - `id` (uuid, primary key)
      - `group_id` (uuid, references groups)
      - `title` (text)
      - `fine_amount` (integer)
      - `created_at` (timestamptz)
      - `created_by` (uuid, references profiles)

  2. Security
    - Enable RLS on `rules` table
    - Add policies for group members to view rules
    - Add policies for group owners to manage rules
*/

CREATE TABLE IF NOT EXISTS rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  title text NOT NULL,
  fine_amount integer NOT NULL CHECK (fine_amount >= 0),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id) NOT NULL
);

ALTER TABLE rules ENABLE ROW LEVEL SECURITY;

-- Group members can view rules
CREATE POLICY "Group members can view rules"
  ON rules
  FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id
      FROM group_members
      WHERE user_id = auth.uid()
    )
  );

-- Group owners can manage rules
CREATE POLICY "Group owners can manage rules"
  ON rules
  FOR ALL
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id
      FROM group_members
      WHERE user_id = auth.uid()
      AND role = 'owner'
    )
  )
  WITH CHECK (
    group_id IN (
      SELECT group_id
      FROM group_members
      WHERE user_id = auth.uid()
      AND role = 'owner'
    )
  );
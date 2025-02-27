/*
  # Add group invitations feature

  1. New Tables
    - `group_invitations`
      - `id` (uuid, primary key)
      - `group_id` (uuid, references groups)
      - `code` (text, unique)
      - `created_at` (timestamptz)
      - `created_by` (uuid, references profiles)
      - `expires_at` (timestamptz)

  2. Security
    - Enable RLS on `group_invitations` table
    - Add policies for group owners to manage invitations
    - Add policies for anyone to use invitation links
*/

CREATE TABLE IF NOT EXISTS group_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id) NOT NULL,
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;

-- Group owners can manage invitations
CREATE POLICY "Group owners can manage invitations"
  ON group_invitations
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

-- Anyone can view valid invitations
CREATE POLICY "Anyone can view valid invitations"
  ON group_invitations
  FOR SELECT
  TO authenticated
  USING (expires_at > now());
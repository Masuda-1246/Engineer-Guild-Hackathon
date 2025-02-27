/*
  # Add comments feature

  1. New Tables
    - `comments`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references posts)
      - `user_id` (uuid, references profiles)
      - `content` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `comments` table
    - Add policies for:
      - Group members can view comments
      - Users can create comments
      - Users can update own comments
      - Users can delete own comments
*/

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Group members can view comments"
  ON comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM posts
      JOIN group_members ON posts.group_id = group_members.group_id
      WHERE posts.id = comments.post_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1
      FROM posts
      JOIN group_members ON posts.group_id = group_members.group_id
      WHERE posts.id = comments.post_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
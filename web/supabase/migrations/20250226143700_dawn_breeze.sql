/*
  # 自白機能の実装

  1. 新しいテーブル
    - `confessions`
      - `id` (uuid, primary key)
      - `post_id` (uuid, references posts)
      - `user_id` (uuid, references profiles)
      - `rule_id` (uuid, references rules)
      - `created_at` (timestamptz)

  2. セキュリティ
    - RLSを有効化
    - グループメンバーが自白を閲覧可能
    - ユーザーが自白を作成可能
*/

-- Create confessions table
CREATE TABLE IF NOT EXISTS confessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rule_id uuid REFERENCES rules(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE confessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Group members can view confessions"
  ON confessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM posts
      JOIN group_members ON posts.group_id = group_members.group_id
      WHERE posts.id = confessions.post_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create confessions"
  ON confessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1
      FROM posts
      JOIN group_members ON posts.group_id = group_members.group_id
      WHERE posts.id = confessions.post_id
      AND group_members.user_id = auth.uid()
    )
  );

-- Function to automatically create a confession comment
CREATE OR REPLACE FUNCTION handle_new_confession()
RETURNS trigger AS $$
BEGIN
  INSERT INTO comments (post_id, user_id, content, is_confession)
  VALUES (NEW.post_id, NEW.user_id, '私がやりました', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create comment on confession
CREATE TRIGGER on_confession_created
  AFTER INSERT ON confessions
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_confession();

-- Add is_confession column to comments
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_confession boolean DEFAULT false;
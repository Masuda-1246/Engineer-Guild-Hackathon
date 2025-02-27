/*
  # グループ機能のテーブル作成

  1. 新規テーブル
    - `groups`
      - `id` (uuid): グループのID
      - `name` (text): グループ名
      - `description` (text): グループの説明
      - `created_at` (timestamptz): 作成日時
      - `created_by` (uuid): 作成者のID
    
    - `group_members`
      - `group_id` (uuid): グループのID
      - `user_id` (uuid): メンバーのID
      - `role` (text): メンバーの役割
      - `joined_at` (timestamptz): 参加日時

  2. セキュリティ
    - グループテーブルのRLS有効化
    - グループメンバーテーブルのRLS有効化
    - 適切なポリシーの設定
*/

-- グループテーブルの作成
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id) NOT NULL
);

-- グループメンバーテーブルの作成
CREATE TABLE IF NOT EXISTS group_members (
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'member')),
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

-- RLSの有効化
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- グループのポリシー
CREATE POLICY "Users can create groups"
  ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Members can view their groups"
  ON groups
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update their groups"
  ON groups
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'owner'
    )
  );

-- グループメンバーのポリシー
CREATE POLICY "Group members can view member list"
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

CREATE POLICY "Owners can manage group members"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'owner'
    )
  );

-- トリガー関数: グループ作成時にオーナーを自動的に追加
CREATE OR REPLACE FUNCTION add_group_owner()
RETURNS trigger AS $$
BEGIN
  INSERT INTO group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーの作成
CREATE TRIGGER on_group_created
  AFTER INSERT ON groups
  FOR EACH ROW
  EXECUTE FUNCTION add_group_owner();
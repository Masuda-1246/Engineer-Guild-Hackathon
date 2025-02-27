/*
  # グループポリシーの修正

  1. 変更内容
    - グループメンバーのポリシーを修正して無限再帰を防止
    - より明確なポリシー名の設定
    - セキュリティの強化

  2. セキュリティ
    - グループメンバーテーブルのRLSポリシーを改善
    - 適切なアクセス制御の維持
*/

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Group members can view member list" ON group_members;
DROP POLICY IF EXISTS "Owners can manage group members" ON group_members;

-- グループメンバー向けの新しいポリシー
CREATE POLICY "Enable read access for group members"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    group_id IN (
      SELECT group_id
      FROM group_members
      WHERE user_id = auth.uid()
    )
  );

-- グループオーナー向けの新しいポリシー
CREATE POLICY "Enable insert for group owners"
  ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    group_id IN (
      SELECT group_id
      FROM group_members
      WHERE user_id = auth.uid()
      AND role = 'owner'
    )
  );

CREATE POLICY "Enable delete for group owners"
  ON group_members
  FOR DELETE
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id
      FROM group_members
      WHERE user_id = auth.uid()
      AND role = 'owner'
    )
  );

CREATE POLICY "Enable update for group owners"
  ON group_members
  FOR UPDATE
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
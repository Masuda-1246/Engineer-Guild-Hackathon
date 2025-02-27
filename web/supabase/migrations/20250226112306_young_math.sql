/*
  # グループポリシーの最終修正

  1. 変更内容
    - グループメンバーのポリシーを完全に再設計
    - より単純で効率的なアクセス制御の実装
    - パフォーマンスの最適化

  2. セキュリティ
    - 明確な権限分離
    - 効率的なクエリ構造
*/

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Enable read access for group members" ON group_members;
DROP POLICY IF EXISTS "Enable insert for group owners" ON group_members;
DROP POLICY IF EXISTS "Enable delete for group owners" ON group_members;
DROP POLICY IF EXISTS "Enable update for group owners" ON group_members;

-- 基本的な読み取りポリシー
CREATE POLICY "Members can view their own memberships"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- グループメンバー一覧の表示ポリシー
CREATE POLICY "Members can view group member list"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM group_members my_membership
      WHERE my_membership.group_id = group_members.group_id
      AND my_membership.user_id = auth.uid()
    )
  );

-- オーナー権限のポリシー
CREATE POLICY "Owners can manage members"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM group_members owner_check
      WHERE owner_check.group_id = group_members.group_id
      AND owner_check.user_id = auth.uid()
      AND owner_check.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM group_members owner_check
      WHERE owner_check.group_id = group_members.group_id
      AND owner_check.user_id = auth.uid()
      AND owner_check.role = 'owner'
    )
  );
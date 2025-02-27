/*
  # 招待機能の最適化

  1. 変更内容
    - accept_invitation 関数の最適化
    - スタック深度エラーの修正
    - トランザクション処理の簡素化

  2. セキュリティ
    - RLS ポリシーの維持
    - セキュリティチェックの効率化
*/

-- Drop existing function
DROP FUNCTION IF EXISTS accept_invitation(text);

-- Create optimized function
CREATE OR REPLACE FUNCTION accept_invitation(invitation_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _group_id uuid;
  _status text;
  _expires_at timestamptz;
BEGIN
  -- Get invitation details with minimal data
  SELECT 
    group_id,
    status,
    expires_at
  INTO 
    _group_id,
    _status,
    _expires_at
  FROM group_invitations
  WHERE code = invitation_code
  LIMIT 1;

  -- Check invitation validity
  IF _group_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', '招待が見つかりません'
    );
  END IF;

  IF _status != 'pending' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'この招待は既に使用されているか無効です'
    );
  END IF;

  IF _expires_at <= now() THEN
    RETURN json_build_object(
      'success', false,
      'error', '招待の有効期限が切れています'
    );
  END IF;

  -- Check if already a member
  IF EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = _group_id
    AND user_id = auth.uid()
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'すでにグループのメンバーです'
    );
  END IF;

  -- Add member and update invitation status
  BEGIN
    INSERT INTO group_members (
      group_id,
      user_id,
      role
    ) VALUES (
      _group_id,
      auth.uid(),
      'member'
    );

    UPDATE group_invitations
    SET status = 'accepted'
    WHERE code = invitation_code;

    RETURN json_build_object(
      'success', true,
      'group_id', _group_id
    );
  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'グループへの参加に失敗しました'
    );
  END;
END;
$$;
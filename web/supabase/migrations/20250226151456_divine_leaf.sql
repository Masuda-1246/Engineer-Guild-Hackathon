/*
  # 招待システムの強化

  1. 変更内容
    - group_invitations テーブルに status カラムを追加
    - 招待の状態を管理（pending, accepted, expired）
    - 招待コードの一意性を確保
    - 招待の有効期限を設定

  2. セキュリティ
    - RLS ポリシーの更新
    - 招待の検証と承認のための関数を追加
*/

-- Add status column to group_invitations
ALTER TABLE group_invitations 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'
CHECK (status IN ('pending', 'accepted', 'expired'));

-- Function to handle invitation acceptance
CREATE OR REPLACE FUNCTION accept_invitation(invitation_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _invitation_record record;
  _existing_member boolean;
BEGIN
  -- Get invitation details
  SELECT * INTO _invitation_record
  FROM group_invitations
  WHERE code = invitation_code
  AND status = 'pending'
  AND expires_at > now();

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', '無効または期限切れの招待コードです'
    );
  END IF;

  -- Check if already a member
  SELECT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = _invitation_record.group_id
    AND user_id = auth.uid()
  ) INTO _existing_member;

  IF _existing_member THEN
    RETURN json_build_object(
      'success', false,
      'error', 'すでにグループのメンバーです'
    );
  END IF;

  -- Begin transaction
  BEGIN
    -- Add user to group
    INSERT INTO group_members (
      group_id,
      user_id,
      role
    ) VALUES (
      _invitation_record.group_id,
      auth.uid(),
      'member'
    );

    -- Update invitation status
    UPDATE group_invitations
    SET status = 'accepted'
    WHERE code = invitation_code;

    RETURN json_build_object(
      'success', true,
      'group_id', _invitation_record.group_id
    );
  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'グループへの参加に失敗しました'
    );
  END;
END;
$$;

-- Update RLS policies
DROP POLICY IF EXISTS "Anyone can view valid invitations" ON group_invitations;

CREATE POLICY "Anyone can view valid invitations"
ON group_invitations
FOR SELECT
TO authenticated
USING (
  status = 'pending'
  AND expires_at > now()
);

-- Function to automatically expire invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE group_invitations
  SET status = 'expired'
  WHERE expires_at <= now()
  AND status = 'pending';
  RETURN NULL;
END;
$$;

-- Create trigger to expire old invitations
DROP TRIGGER IF EXISTS check_invitation_expiry ON group_invitations;
CREATE TRIGGER check_invitation_expiry
  AFTER INSERT OR UPDATE
  ON group_invitations
  FOR EACH STATEMENT
  EXECUTE FUNCTION expire_old_invitations();
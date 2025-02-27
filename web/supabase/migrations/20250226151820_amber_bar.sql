-- Drop existing function
DROP FUNCTION IF EXISTS accept_invitation(text);

-- Create optimized function with reduced stack depth
CREATE OR REPLACE FUNCTION accept_invitation(invitation_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invitation record;
BEGIN
  -- Simple select with minimal joins
  SELECT 
    i.group_id,
    i.status,
    i.expires_at,
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = i.group_id
      AND user_id = auth.uid()
    ) as is_member
  INTO _invitation
  FROM group_invitations i
  WHERE i.code = invitation_code;

  -- Early validation
  IF _invitation IS NULL THEN
    RETURN json_build_object('success', false, 'error', '招待が見つかりません');
  END IF;

  IF _invitation.status != 'pending' THEN
    RETURN json_build_object('success', false, 'error', 'この招待は既に使用されているか無効です');
  END IF;

  IF _invitation.expires_at <= now() THEN
    RETURN json_build_object('success', false, 'error', '招待の有効期限が切れています');
  END IF;

  IF _invitation.is_member THEN
    RETURN json_build_object('success', false, 'error', 'すでにグループのメンバーです');
  END IF;

  -- Simple transaction with minimal operations
  BEGIN
    INSERT INTO group_members (group_id, user_id, role)
    VALUES (_invitation.group_id, auth.uid(), 'member');

    UPDATE group_invitations
    SET status = 'accepted'
    WHERE code = invitation_code;

    RETURN json_build_object('success', true, 'group_id', _invitation.group_id);
  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', 'グループへの参加に失敗しました');
  END;
END;
$$;
/*
  # Optimize invitation system

  1. Changes
    - Simplify invitation acceptance process
    - Remove unnecessary JOINs
    - Improve error handling
    - Add index for better performance

  2. Security
    - Maintain RLS policies
    - Keep security checks
*/

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_group_invitations_code ON group_invitations (code);

-- Drop existing function
DROP FUNCTION IF EXISTS accept_invitation(text);

-- Create optimized function with minimal operations
CREATE OR REPLACE FUNCTION accept_invitation(invitation_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _group_id uuid;
  _status text;
BEGIN
  -- Simple select without joins
  SELECT group_id, status
  INTO _group_id, _status
  FROM group_invitations
  WHERE code = invitation_code
  AND expires_at > now();

  -- Early validation
  IF _group_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', '無効または期限切れの招待コードです');
  END IF;

  IF _status != 'pending' THEN
    RETURN json_build_object('success', false, 'error', 'この招待は既に使用されています');
  END IF;

  -- Check membership with direct query
  IF EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = _group_id
    AND user_id = auth.uid()
  ) THEN
    RETURN json_build_object('success', false, 'error', 'すでにグループのメンバーです');
  END IF;

  -- Execute operations in a simple transaction
  BEGIN
    -- Add member
    INSERT INTO group_members (group_id, user_id, role)
    VALUES (_group_id, auth.uid(), 'member');

    -- Update invitation status
    UPDATE group_invitations
    SET status = 'accepted'
    WHERE code = invitation_code;

    RETURN json_build_object('success', true, 'group_id', _group_id);
  EXCEPTION 
    WHEN unique_violation THEN
      RETURN json_build_object('success', false, 'error', 'すでにグループのメンバーです');
    WHEN OTHERS THEN
      RETURN json_build_object('success', false, 'error', 'グループへの参加に失敗しました');
  END;
END;
$$;
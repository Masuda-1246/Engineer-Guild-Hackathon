/*
  # Optimize invitation system

  1. Changes
    - Add index for better performance
    - Simplify invitation acceptance process
    - Remove unnecessary JOINs
    - Improve error handling

  2. Security
    - Maintain RLS policies
    - Keep security checks
*/

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_group_invitations_code_status ON group_invitations (code, status);

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
BEGIN
  -- Simple select with minimal data
  SELECT group_id
  INTO _group_id
  FROM group_invitations
  WHERE code = invitation_code
  AND status = 'pending'
  AND expires_at > now();

  -- Early validation
  IF _group_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', '無効または期限切れの招待コードです');
  END IF;

  -- Execute operations in a simple transaction
  BEGIN
    -- Add member if not exists
    INSERT INTO group_members (group_id, user_id, role)
    VALUES (_group_id, auth.uid(), 'member')
    ON CONFLICT (group_id, user_id) DO NOTHING;

    -- Update invitation status
    UPDATE group_invitations
    SET status = 'accepted'
    WHERE code = invitation_code
    AND status = 'pending';

    RETURN json_build_object('success', true, 'group_id', _group_id);
  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', 'グループへの参加に失敗しました');
  END;
END;
$$;
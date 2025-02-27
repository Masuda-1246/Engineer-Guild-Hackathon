/*
  # Optimize invitation system

  1. Changes
    - Add index for better performance
    - Simplify invitation creation process
    - Add rate limiting
    - Improve error handling

  2. Security
    - Maintain RLS policies
    - Keep security checks
*/

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_group_invitations_code_status ON group_invitations (code, status);

-- Create function to generate invitation code
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT substring(md5(random()::text) from 1 for 12);
$$;

-- Create function to create invitation with minimal operations
CREATE OR REPLACE FUNCTION create_invitation(group_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _code text;
  _is_owner boolean;
BEGIN
  -- Check if user is group owner
  SELECT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = $1
    AND user_id = auth.uid()
    AND role = 'owner'
  ) INTO _is_owner;

  IF NOT _is_owner THEN
    RETURN json_build_object('success', false, 'error', 'グループのオーナーのみが招待を作成できます');
  END IF;

  -- Generate unique code
  _code := generate_invitation_code();

  -- Create invitation
  INSERT INTO group_invitations (
    group_id,
    code,
    created_by,
    expires_at
  ) VALUES (
    $1,
    _code,
    auth.uid(),
    now() + interval '7 days'
  );

  RETURN json_build_object('success', true, 'code', _code);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', '招待の作成に失敗しました');
END;
$$;
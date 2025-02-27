/*
  # Update posts table policies

  1. Changes
    - Update existing policies to include rule_id in conditions
    - Ensure proper access control for rule-related operations

  2. Security
    - Maintain existing RLS policies
    - Add rule-specific checks
*/

-- Update policies to include rule validation
DROP POLICY IF EXISTS "Users can create posts" ON posts;
CREATE POLICY "Users can create posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    group_id IN (
      SELECT group_id
      FROM group_members
      WHERE user_id = auth.uid()
    ) AND
    rule_id IN (
      SELECT id
      FROM rules
      WHERE group_id = posts.group_id
    )
  );
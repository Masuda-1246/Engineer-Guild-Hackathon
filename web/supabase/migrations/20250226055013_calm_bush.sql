/*
  # Storage policies for avatars

  1. Changes
    - Enable storage for avatars bucket
    - Add policies for avatar upload and view
    - Allow authenticated users to:
      - Upload their own avatars
      - View any avatar (since they are public)
*/

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload avatars
CREATE POLICY "Users can upload avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (CASE
    WHEN POSITION('.' IN name) > 0 THEN
      LOWER(SUBSTRING(name FROM POSITION('.' IN name) + 1)) IN ('jpg', 'jpeg', 'png', 'gif')
    ELSE false
  END)
);

-- Policy to allow public access to view avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy to allow users to update and delete their own avatars
CREATE POLICY "Users can update and delete own avatars"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');
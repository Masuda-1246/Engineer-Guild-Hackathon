/*
  # Create posts storage bucket and policies

  1. Changes
    - Create posts storage bucket
    - Add policies for image upload and management
  
  2. Security
    - Allow authenticated users to upload images
    - Allow public access to view images
    - Allow users to manage their own images
*/

-- Create posts storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DO $$ 
BEGIN
  -- Upload policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Upload post images'
  ) THEN
    CREATE POLICY "Upload post images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'posts' AND
      (CASE
        WHEN POSITION('.' IN name) > 0 THEN
          LOWER(SUBSTRING(name FROM POSITION('.' IN name) + 1)) IN ('jpg', 'jpeg', 'png', 'gif')
        ELSE false
      END)
    );
  END IF;

  -- View policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'View post images'
  ) THEN
    CREATE POLICY "View post images"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'posts');
  END IF;

  -- Management policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Manage post images'
  ) THEN
    CREATE POLICY "Manage post images"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING (
      bucket_id = 'posts' AND 
      auth.uid()::text = SPLIT_PART(name, '/', 1)
    )
    WITH CHECK (
      bucket_id = 'posts' AND 
      auth.uid()::text = SPLIT_PART(name, '/', 1)
    );
  END IF;
END $$;
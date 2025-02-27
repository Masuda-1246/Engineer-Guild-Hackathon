-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DO $$ 
BEGIN
  -- Upload policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Upload avatar images'
  ) THEN
    CREATE POLICY "Upload avatar images"
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
  END IF;

  -- View policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'View avatar images'
  ) THEN
    CREATE POLICY "View avatar images"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'avatars');
  END IF;

  -- Management policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Manage avatar images'
  ) THEN
    CREATE POLICY "Manage avatar images"
    ON storage.objects
    FOR ALL
    TO authenticated
    USING (
      bucket_id = 'avatars' AND 
      auth.uid()::text = SPLIT_PART(name, '/', 1)
    )
    WITH CHECK (
      bucket_id = 'avatars' AND 
      auth.uid()::text = SPLIT_PART(name, '/', 1)
    );
  END IF;
END $$;
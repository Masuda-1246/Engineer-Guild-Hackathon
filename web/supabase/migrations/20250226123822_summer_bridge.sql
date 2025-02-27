/*
  # Create posts table and policies

  1. Changes
    - Create posts table with rule_id reference
    - Add RLS policies for posts
    - Create storage bucket and policies for post images
  
  2. Security
    - Enable RLS on posts table
    - Add policies for viewing, creating, updating, and deleting posts
    - Add storage policies for post images
*/

-- Create posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  image_url text,
  rule_id uuid REFERENCES rules(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
  -- View policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'posts' 
    AND policyname = 'Group members can view posts'
  ) THEN
    CREATE POLICY "Group members can view posts"
      ON posts
      FOR SELECT
      TO authenticated
      USING (
        group_id IN (
          SELECT group_id
          FROM group_members
          WHERE user_id = auth.uid()
        )
      );
  END IF;

  -- Create policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'posts' 
    AND policyname = 'Users can create posts'
  ) THEN
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
        )
      );
  END IF;

  -- Update policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'posts' 
    AND policyname = 'Users can update own posts'
  ) THEN
    CREATE POLICY "Users can update own posts"
      ON posts
      FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;

  -- Delete policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'posts' 
    AND policyname = 'Users can delete own posts'
  ) THEN
    CREATE POLICY "Users can delete own posts"
      ON posts
      FOR DELETE
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

-- Create posts storage bucket if it doesn't exist
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
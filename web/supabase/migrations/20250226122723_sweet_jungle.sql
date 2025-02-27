/*
  # Add posts feature with storage

  1. Storage
    - Create posts bucket for storing images
    - Add storage policies for authenticated users

  2. New Tables
    - `posts`
      - `id` (uuid, primary key)
      - `group_id` (uuid, references groups)
      - `user_id` (uuid, references profiles)
      - `content` (text)
      - `image_url` (text)
      - `created_at` (timestamp)

  3. Security
    - Enable RLS on posts table
    - Add policies for group members to view posts
    - Add policies for users to manage their own posts
*/

-- Create posts storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload post images"
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

CREATE POLICY "Anyone can view post images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'posts');

CREATE POLICY "Users can manage their post images"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'posts' AND auth.uid()::text = SPLIT_PART(name, '/', 1))
WITH CHECK (bucket_id = 'posts' AND auth.uid()::text = SPLIT_PART(name, '/', 1));

-- Create posts table
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    image_url text,
    created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ BEGIN
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
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
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
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own posts"
    ON posts
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own posts"
    ON posts
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
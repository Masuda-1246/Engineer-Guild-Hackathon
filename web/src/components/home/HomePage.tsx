import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { PostList } from '../posts/PostList';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  profiles: {
    name: string;
  };
  rules: {
    title: string;
    fine_amount: number;
  };
  groups: {
    name: string;
  };
  comment_count: number;
  confessions: {
    id: string;
    user_id: string;
  }[];
}

const POSTS_PER_PAGE = 10;

export function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const lastPostRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver>();

  const fetchPosts = useCallback(async (startIndex: number = 0) => {
    try {
      const isInitialFetch = startIndex === 0;
      if (isInitialFetch) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ユーザーが見つかりません');

      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          image_url,
          created_at,
          user_id,
          profiles (
            name
          ),
          rules (
            id,
            title,
            fine_amount
          ),
          groups (
            name
          ),
          comment_count:comments(count),
          confessions (
            id,
            user_id
          )
        `)
        .order('created_at', { ascending: false })
        .range(startIndex, startIndex + POSTS_PER_PAGE - 1);

      if (error) throw error;

      const postsWithCommentCount = data?.map(post => ({
        ...post,
        comment_count: post.comment_count[0]?.count || 0
      })) || [];

      if (isInitialFetch) {
        setPosts(postsWithCommentCount);
      } else {
        setPosts(prev => [...prev, ...postsWithCommentCount]);
      }

      setHasMore(postsWithCommentCount.length === POSTS_PER_PAGE);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('投稿の取得に失敗しました');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const currentObserver = observer.current;
    if (currentObserver) {
      currentObserver.disconnect();
    }

    observer.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchPosts(posts.length);
        }
      },
      { threshold: 0.5 }
    );

    if (lastPostRef.current) {
      observer.current.observe(lastPostRef.current);
    }

    return () => {
      if (currentObserver) {
        currentObserver.disconnect();
      }
    };
  }, [posts.length, hasMore, loadingMore, fetchPosts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg mt-4">
        {error}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <p className="text-center">
          まだ投稿がありません。<br />
          グループに参加して最初の投稿を作成してください。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      <h2 className="text-xl font-bold mb-6">最近の投稿</h2>
      <PostList posts={posts} onPostsChange={fetchPosts} />
      
      <div ref={lastPostRef} className="py-4">
        {loadingMore && (
          <div className="flex justify-center">
            <LoadingSpinner size="md" />
          </div>
        )}
      </div>

      {!hasMore && posts.length > 0 && (
        <div className="text-center py-4 text-gray-500">
          すべての投稿を読み込みました
        </div>
      )}
    </div>
  );
}
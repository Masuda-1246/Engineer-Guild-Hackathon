import React, { useState, useEffect } from 'react';
import { formatDistanceToNow, isAfter, addDays, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { MessageSquare, Check, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { CommentModal } from './CommentModal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { supabase } from '../../lib/supabase';

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
    id: string;
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

interface PostListProps {
  posts: Post[];
  onPostsChange?: () => void;
}

export function PostList({ posts, onPostsChange }: PostListProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [loadingPostId, setLoadingPostId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [menuOpenPostId, setMenuOpenPostId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  }

  const handleConfess = async (postId: string, ruleId: string, postUserId: string) => {
    if (!currentUserId) return;
    
    // Prevent post creator from confessing to their own post
    if (currentUserId === postUserId) {
      setError('自分の投稿に対して自白することはできません');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    try {
      setLoadingPostId(postId);
      setError(null);

      const { error: confessionError } = await supabase
        .from('confessions')
        .insert([
          {
            post_id: postId,
            user_id: currentUserId,
            rule_id: ruleId
          }
        ]);

      if (confessionError) throw confessionError;
      if (onPostsChange) onPostsChange();
    } catch (err) {
      console.error('Error confessing:', err);
      setError('自白の処理中にエラーが発生しました');
    } finally {
      setLoadingPostId(null);
    }
  };

  const handleComment = (postId: string) => {
    setSelectedPostId(postId);
  };

  const handleEdit = async (post: Post) => {
    setEditingPost(post);
    setMenuOpenPostId(null);
  };

  const handleDelete = async (postId: string) => {
    try {
      setLoadingPostId(postId);
      setError(null);

      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (deleteError) throw deleteError;
      if (onPostsChange) onPostsChange();
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('投稿の削除に失敗しました');
    } finally {
      setLoadingPostId(null);
      setMenuOpenPostId(null);
    }
  };

  const handleUpdate = async (post: Post, newContent: string) => {
    try {
      setLoadingPostId(post.id);
      setError(null);

      const { error: updateError } = await supabase
        .from('posts')
        .update({ content: newContent })
        .eq('id', post.id);

      if (updateError) throw updateError;
      setEditingPost(null);
      if (onPostsChange) onPostsChange();
    } catch (err) {
      console.error('Error updating post:', err);
      setError('投稿の更新に失敗しました');
    } finally {
      setLoadingPostId(null);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {posts.map((post) => {
          if (!post.profiles || !post.rules || !post.groups) {
            return null;
          }

          const createdAt = parseISO(post.created_at);
          const expiresAt = addDays(createdAt, 3);
          const isExpired = !isAfter(expiresAt, new Date());
          const hasConfessed = post.confessions?.some(c => c.user_id === currentUserId);
          const isOwnPost = post.user_id === currentUserId;

          if (editingPost?.id === post.id) {
            return (
              <div key={post.id} className="bg-white rounded-lg shadow p-4">
                <textarea
                  value={editingPost.content}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary min-h-[100px] mb-4"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingPost(null)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={() => handleUpdate(post, editingPost.content)}
                    disabled={loadingPostId === post.id}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                  >
                    {loadingPostId === post.id ? '更新中...' : '更新'}
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div key={post.id} className="bg-white rounded-lg shadow">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-medium">
                      {post.profiles.name[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="font-semibold">{post.profiles.name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {formatDistanceToNow(new Date(post.created_at), {
                            addSuffix: true,
                            locale: ja
                          })}
                        </span>
                      </div>
                      {isOwnPost && (
                        <div className="relative">
                          <button
                            onClick={() => setMenuOpenPostId(menuOpenPostId === post.id ? null : post.id)}
                            className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          {menuOpenPostId === post.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                              <button
                                onClick={() => handleEdit(post)}
                                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                <span>編集</span>
                              </button>
                              <button
                                onClick={() => handleDelete(post.id)}
                                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>削除</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="mt-1 mb-2 inline-block px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm">
                      {post.rules.title} (罰金: ¥{post.rules.fine_amount.toLocaleString()})
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>
                </div>
              </div>

              {post.image_url && (
                <div className="aspect-video bg-gray-100">
                  <img
                    src={post.image_url}
                    alt="投稿画像"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-4 flex gap-2">
                <button
                  onClick={() => handleConfess(post.id, post.rules.id, post.user_id)}
                  disabled={isExpired || hasConfessed || loadingPostId === post.id || isOwnPost}
                  className={`flex-1 py-2 px-4 rounded-full text-sm font-medium flex items-center justify-center gap-2 ${
                    isExpired || hasConfessed || isOwnPost
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors'
                  }`}
                >
                  {loadingPostId === post.id ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>
                    {hasConfessed ? '自白済み' : isOwnPost ? '自分の投稿です' : loadingPostId === post.id ? '処理中...' : '私がやりました'}
                  </span>
                </button>
                <button
                  onClick={() => handleComment(post.id)}
                  className="flex-1 py-2 px-4 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>
                    コメント
                    {post.comment_count > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-gray-200 rounded-full text-xs">
                        {post.comment_count}
                      </span>
                    )}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedPostId && (
        <CommentModal
          isOpen={true}
          onClose={() => setSelectedPostId(null)}
          postId={selectedPostId}
        />
      )}

      {error && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-50 text-red-600 px-4 py-2 rounded-lg shadow">
          {error}
        </div>
      )}
    </>
  );
}
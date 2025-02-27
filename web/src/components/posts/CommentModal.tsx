import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  is_confession: boolean;
  profiles: {
    name: string;
  };
}

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

export function CommentModal({ isOpen, onClose, postId }: CommentModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, postId]);

  async function fetchComments() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          is_confession,
          profiles (
            name
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('コメントの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ユーザーが見つかりません');

      const { error: commentError } = await supabase
        .from('comments')
        .insert([
          {
            post_id: postId,
            user_id: user.id,
            content: newComment.trim()
          }
        ]);

      if (commentError) throw commentError;

      setNewComment('');
      await fetchComments();
    } catch (err) {
      console.error('Error posting comment:', err);
      setError('コメントの投稿に失敗しました');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 relative flex flex-col max-h-[80vh]">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">コメント</h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              コメントはありません
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className={`flex gap-3 ${comment.is_confession ? 'bg-primary-50 p-3 rounded-lg' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  comment.is_confession ? 'bg-primary text-white' : 'bg-primary-100'
                }`}>
                  <span className={`text-sm font-medium ${
                    comment.is_confession ? 'text-white' : 'text-primary'
                  }`}>
                    {comment.profiles.name[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium">{comment.profiles.name}</span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                        locale: ja
                      })}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${
                    comment.is_confession ? 'text-primary-600 font-medium' : 'text-gray-600'
                  }`}>
                    {comment.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="コメントを入力..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="sr-only">送信</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
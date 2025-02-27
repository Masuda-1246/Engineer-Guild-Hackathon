import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function JoinGroupModal({ isOpen, onClose, onSuccess }: JoinGroupModalProps) {
  const [groupId, setGroupId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ユーザーが見つかりません');

      // グループの存在確認
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('id')
        .eq('id', groupId)
        .single();

      if (groupError || !group) {
        setError('グループが見つかりません');
        return;
      }

      // 既にメンバーかどうかの確認
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        setError('すでにこのグループのメンバーです');
        return;
      }

      // グループに参加
      const { error: joinError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member'
        });

      if (joinError) {
        console.error('Join error:', joinError);
        throw new Error('グループへの参加に失敗しました');
      }

      onSuccess();
      onClose();
      setGroupId('');
    } catch (err) {
      console.error('Error joining group:', err);
      setError(err instanceof Error ? err.message : 'グループへの参加に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">グループに参加</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="groupId" className="block text-sm font-medium text-gray-700 mb-1">
              グループID
            </label>
            <input
              id="groupId"
              type="text"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              placeholder="グループIDを入力"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              {loading ? '参加中...' : '参加する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CreateRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groupId: string;
}

export function CreateRuleModal({ isOpen, onClose, onSuccess, groupId }: CreateRuleModalProps) {
  const [title, setTitle] = useState('');
  const [fineAmount, setFineAmount] = useState('');
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

      const { error: ruleError } = await supabase
        .from('rules')
        .insert([
          {
            group_id: groupId,
            title,
            fine_amount: parseInt(fineAmount, 10),
            created_by: user.id
          }
        ]);

      if (ruleError) throw ruleError;

      onSuccess();
      onClose();
      setTitle('');
      setFineAmount('');
    } catch (err) {
      console.error('Error creating rule:', err);
      setError('ルールの作成に失敗しました');
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

        <h2 className="text-2xl font-bold mb-6">新しいルールを追加</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              ルール内容
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="fineAmount" className="block text-sm font-medium text-gray-700 mb-1">
              罰金額（円）
            </label>
            <input
              id="fineAmount"
              type="number"
              min="0"
              value={fineAmount}
              onChange={(e) => setFineAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
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
              {loading ? '作成中...' : 'ルールを追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
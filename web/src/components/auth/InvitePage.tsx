import React, { useState } from 'react';
import { Users, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface InvitePageProps {
  groupName?: string;
  error?: string;
  onLogin: () => void;
  onSignUp: () => void;
}

export function InvitePage({ groupName, error: initialError, onLogin, onSignUp }: InvitePageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);

  const handleAcceptInvitation = async () => {
    try {
      setLoading(true);
      setError(null);

      const path = window.location.pathname;
      const match = path.match(/^\/invite\/([a-zA-Z0-9-]+)$/);
      if (!match) {
        setError('無効な招待リンクです');
        return;
      }

      const inviteCode = match[1];

      // 招待の承認を実行
      const { data, error: acceptError } = await supabase
        .rpc('accept_invitation', { invitation_code: inviteCode });

      if (acceptError) throw acceptError;

      if (!data.success) {
        setError(data.error);
        return;
      }

      // 成功したらホームページにリダイレクト
      window.location.href = '/';
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError('招待の承認に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            グループへの招待
          </h1>
          {groupName ? (
            <p className="text-gray-600">
              「{groupName}」に招待されています
            </p>
          ) : (
            <p className="text-gray-600">
              グループに招待されています
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleAcceptInvitation}
            disabled={loading}
            className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary-600 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>処理中...</span>
              </>
            ) : (
              <span>参加する</span>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">または</span>
            </div>
          </div>

          <button
            onClick={onLogin}
            className="w-full bg-white text-primary border-2 border-primary py-3 px-4 rounded-lg hover:bg-primary-50 font-medium"
          >
            ログインして参加
          </button>

          <button
            onClick={onSignUp}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 font-medium"
          >
            新規登録して参加
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          ※ グループに参加するにはアカウントが必要です
        </p>
      </div>
    </div>
  );
}
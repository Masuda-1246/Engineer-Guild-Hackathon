import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AuthFormProps {
  onSuccess: (session: any) => void;
  isSignUp?: boolean;
}

export function AuthForm({ onSuccess, isSignUp: defaultIsSignUp = false }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(defaultIsSignUp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        onSuccess(data.session);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onSuccess(data.session);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '認証エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-8">
        {isSignUp ? 'アカウント作成' : 'ログイン'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            パスワード
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-600 disabled:opacity-50"
        >
          {loading ? '処理中...' : isSignUp ? 'アカウントを作成' : 'ログイン'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-primary hover:underline text-sm"
        >
          {isSignUp ? 'ログインする' : 'アカウントを作成する'}
        </button>
      </div>
    </div>
  );
}
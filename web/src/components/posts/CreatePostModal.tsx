import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groupId: string;
}

interface Rule {
  id: string;
  title: string;
  fine_amount: number;
}

export function CreatePostModal({ isOpen, onClose, onSuccess, groupId }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [selectedRule, setSelectedRule] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchRules();
    }
  }, [isOpen, groupId]);

  async function fetchRules() {
    try {
      const { data, error } = await supabase
        .from('rules')
        .select('id, title, fine_amount')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (err) {
      console.error('Error fetching rules:', err);
      setError('ルールの取得に失敗しました');
    }
  }

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // プレビューを作成
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setImage(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRule) {
      setError('違反したルールを選択してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ユーザーが見つかりません');

      let imageUrl = null;

      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // 画像をアップロード
        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        // 公開URLを取得
        const { data: { publicUrl } } = supabase.storage
          .from('posts')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // 投稿を作成
      const { error: postError } = await supabase
        .from('posts')
        .insert([
          {
            group_id: groupId,
            user_id: user.id,
            content,
            image_url: imageUrl,
            rule_id: selectedRule
          }
        ]);

      if (postError) throw postError;

      onSuccess();
      onClose();
      setContent('');
      setImage(null);
      setPreview(null);
      setSelectedRule('');
    } catch (err) {
      console.error('Error creating post:', err);
      setError('投稿の作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">ルール違反を報告</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="rule"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              違反したルール
            </label>
            <select
              id="rule"
              value={selectedRule}
              onChange={(e) => setSelectedRule(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              required
            >
              <option value="">選択してください</option>
              {rules.map((rule) => (
                <option key={rule.id} value={rule.id}>
                  {rule.title} (罰金: ¥{rule.fine_amount.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              詳細
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary min-h-[100px]"
              placeholder="違反の状況を説明してください"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              証拠写真
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                {preview ? (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="mx-auto h-32 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setPreview(null);
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full transform translate-x-1/2 -translate-y-1/2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="image-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-600 focus-within:outline-none"
                      >
                        <span>画像をアップロード</span>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
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
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {loading ? '投稿中...' : '違反を報告'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
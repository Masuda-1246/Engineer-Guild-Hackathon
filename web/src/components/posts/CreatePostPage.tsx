import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Group {
  id: string;
  name: string;
}

interface Rule {
  id: string;
  title: string;
  fine_amount: number;
}

export function CreatePostPage() {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [rules, setRules] = useState<Rule[]>([]);
  const [selectedRule, setSelectedRule] = useState<string>('');

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchRules(selectedGroup);
    } else {
      setRules([]);
      setSelectedRule('');
    }
  }, [selectedGroup]);

  async function fetchGroups() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ユーザーが見つかりません');

      const { data, error } = await supabase
        .from('group_members')
        .select('groups:group_id (id, name)')
        .eq('user_id', user.id);

      if (error) throw error;

      const formattedGroups = data
        .map(item => item.groups)
        .filter((group): group is Group => group !== null);

      setGroups(formattedGroups);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError('グループの取得に失敗しました');
    }
  }

  async function fetchRules(groupId: string) {
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setImage(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedGroup) {
      setError('グループを選択してください');
      return;
    }

    if (!selectedRule) {
      setError('違反したルールを選択してください');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ユーザーが見つかりません');

      let imageUrl = null;

      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('posts')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const { error: postError } = await supabase
        .from('posts')
        .insert([
          {
            group_id: selectedGroup,
            user_id: user.id,
            content,
            image_url: imageUrl,
            rule_id: selectedRule
          }
        ]);

      if (postError) throw postError;

      setSuccess(true);
      setContent('');
      setImage(null);
      setPreview(null);
      setSelectedGroup('');
      setSelectedRule('');
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err instanceof Error ? err.message : '投稿の作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-4">
      <h2 className="text-xl font-bold mb-6">ルール違反を報告</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="group"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            グループ
          </label>
          <select
            id="group"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            required
          >
            <option value="">選択してください</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        {selectedGroup && (
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
        )}

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
                      className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-600 focus-within:outline-none"
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

        {success && (
          <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm">
            投稿が完了しました
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !selectedGroup || !selectedRule}
          className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader className="w-4 h-4 animate-spin" />}
          {loading ? '投稿中...' : '違反を報告'}
        </button>
      </form>
    </div>
  );
}
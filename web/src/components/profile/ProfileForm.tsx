import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
}

export function ProfileForm() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // プロフィールが存在しない場合は作成
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              name: user.email?.split('@')[0] || 'ユーザー',
            }
          ])
          .select()
          .single();

        if (insertError) throw insertError;
        data = newProfile;
      } else if (error) {
        throw error;
      }

      if (data) {
        setProfile(data);
        setName(data.name);
        
        // アバターURLの取得と設定
        if (data.avatar_url) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(data.avatar_url);
          setAvatarUrl(publicUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'プロフィールの取得に失敗しました' });
    }
  }

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setLoading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // ファイル名を生成（ユーザーIDを含める）
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ユーザーが見つかりません');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      // 古いアバターを削除
      if (profile?.avatar_url) {
        await supabase.storage
          .from('avatars')
          .remove([profile.avatar_url]);
      }

      // 新しいアバターをアップロード
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // プロフィールを更新
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: fileName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 新しいアバターのURLを設定
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      setAvatarUrl(publicUrl);
      setMessage({ type: 'success', text: 'アバターを更新しました' });

    } catch (error) {
      console.error('Error uploading avatar:', error);
      setMessage({ type: 'error', text: 'アバターのアップロードに失敗しました' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ユーザーが見つかりません');

      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'プロフィールを更新しました' });
      await fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'プロフィールの更新に失敗しました' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 mb-4">
          <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer shadow-lg"
          >
            <Camera className="w-4 h-4" />
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          名前
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
          required
        />
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-600'
              : 'bg-red-50 text-red-600'
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-600 disabled:opacity-50"
      >
        {loading ? '更新中...' : 'プロフィールを更新'}
      </button>
    </form>
  );
}
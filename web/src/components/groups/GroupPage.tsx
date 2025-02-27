import React, { useState, useEffect } from 'react';
import { Plus, Users, MessageSquarePlus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CreateRuleModal } from './CreateRuleModal';
import { CreatePostModal } from '../posts/CreatePostModal';
import { PostList } from '../posts/PostList';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface Rule {
  id: string;
  title: string;
  fine_amount: number;
  created_by: string;
}

interface Member {
  id: string;
  name: string;
  role: 'owner' | 'member';
}

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

interface GroupPageProps {
  groupId: string;
  groupName: string;
  onBack: () => void;
}

export function GroupPage({ groupId, groupName, onBack }: GroupPageProps) {
  const [rules, setRules] = useState<Rule[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'rules' | 'members' | 'posts'>('posts');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser();
    fetchData();
  }, [groupId]);

  async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  }

  async function fetchRules() {
    try {
      const { data, error } = await supabase
        .from('rules')
        .select('id, title, fine_amount, created_by')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (err) {
      console.error('Error fetching rules:', err);
      setError('ルールの取得に失敗しました');
    }
  }

  async function fetchMembers() {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          user_id,
          role,
          profiles!group_members_user_id_fkey (
            name
          )
        `)
        .eq('group_id', groupId);

      if (error) throw error;

      const formattedMembers = data.map(member => ({
        id: member.user_id,
        name: member.profiles.name,
        role: member.role
      }));

      setMembers(formattedMembers);

      // Check if current user is an owner
      if (currentUserId) {
        const isCurrentUserOwner = data.some(
          member => member.user_id === currentUserId && member.role === 'owner'
        );
        setIsOwner(isCurrentUserOwner);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('メンバーの取得に失敗しました');
    }
  }

  async function fetchPosts() {
    try {
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
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const postsWithCommentCount = data?.map(post => ({
        ...post,
        comment_count: post.comment_count[0]?.count || 0
      })) || [];

      setPosts(postsWithCommentCount);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('投稿の取得に失敗しました');
    }
  }

  async function fetchData() {
    setLoading(true);
    await Promise.all([fetchRules(), fetchMembers(), fetchPosts()]);
    setLoading(false);
  }

  async function handleDeleteMember(memberId: string) {
    if (!isOwner || memberId === currentUserId) return;

    try {
      setDeletingMemberId(memberId);
      setError(null);

      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', memberId);

      if (error) throw error;

      // Update members list
      setMembers(members.filter(member => member.id !== memberId));
    } catch (err) {
      console.error('Error deleting member:', err);
      setError('メンバーの削除に失敗しました');
    } finally {
      setDeletingMemberId(null);
    }
  }

  async function handleDeleteRule(ruleId: string) {
    if (!isOwner) return;

    try {
      setDeletingRuleId(ruleId);
      setError(null);

      const { error } = await supabase
        .from('rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      // Update rules list
      setRules(rules.filter(rule => rule.id !== ruleId));
    } catch (err) {
      console.error('Error deleting rule:', err);
      setError('ルールの削除に失敗しました');
    } finally {
      setDeletingRuleId(null);
    }
  }

  return (
    <div className="py-4">
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800"
        >
          ← 戻る
        </button>
        <h2 className="text-xl font-bold">{groupName}</h2>
      </div>

      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 -mb-px ${
            activeTab === 'posts'
              ? 'border-b-2 border-primary text-primary font-medium'
              : 'text-gray-500'
          }`}
        >
          投稿
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 -mb-px ${
            activeTab === 'rules'
              ? 'border-b-2 border-primary text-primary font-medium'
              : 'text-gray-500'
          }`}
        >
          ルール
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 -mb-px ${
            activeTab === 'members'
              ? 'border-b-2 border-primary text-primary font-medium'
              : 'text-gray-500'
          }`}
        >
          メンバー
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : activeTab === 'posts' ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">投稿一覧</h3>
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
            >
              <MessageSquarePlus className="w-5 h-5" />
              <span>違反を報告</span>
            </button>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              投稿がありません。最初の投稿を作成してください。
            </div>
          ) : (
            <PostList posts={posts} onPostsChange={fetchPosts} />
          )}
        </>
      ) : activeTab === 'rules' ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">ルール一覧</h3>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
            >
              <Plus className="w-5 h-5" />
              <span>ルールを追加</span>
            </button>
          </div>

          {rules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              ルールがありません。新しいルールを追加してください。
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="bg-white p-4 rounded-lg shadow"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{rule.title}</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-primary font-medium">
                        ¥{rule.fine_amount.toLocaleString()}
                      </span>
                      {isOwner && (
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          disabled={deletingRuleId === rule.id}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          title="ルールを削除"
                        >
                          {deletingRuleId === rule.id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">メンバー一覧</h3>
          </div>

          {members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              メンバーがいません。
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary font-medium">
                        {member.name[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">{member.name}</h4>
                      <span className="text-sm text-gray-500">
                        {member.role === 'owner' ? 'オーナー' : 'メンバー'}
                      </span>
                    </div>
                  </div>
                  
                  {isOwner && member.id !== currentUserId && member.role !== 'owner' && (
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      disabled={deletingMemberId === member.id}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="メンバーを削除"
                    >
                      {deletingMemberId === member.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <CreateRuleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchRules();
          setIsCreateModalOpen(false);
        }}
        groupId={groupId}
      />

      <CreatePostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSuccess={() => {
          fetchPosts();
          setIsPostModalOpen(false);
        }}
        groupId={groupId}
      />
    </div>
  );
}
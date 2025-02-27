import React, { useState, useEffect } from 'react';
import { Plus, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CreateGroupModal } from './CreateGroupModal';
import { GroupPage } from './GroupPage';
import { JoinGroupModal } from './JoinGroupModal';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface Group {
  id: string;
  name: string;
}

export function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  async function fetchGroups() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ユーザーが見つかりません');

      // グループの取得方法を修正
      const { data, error } = await supabase
        .from('groups')
        .select('id, name')
        .eq('created_by', user.id);

      if (error) throw error;

      // メンバーとして参加しているグループも取得
      const { data: memberGroups, error: memberError } = await supabase
        .from('group_members')
        .select('groups:group_id (id, name)')
        .eq('user_id', user.id)
        .neq('groups.created_by', user.id);

      if (memberError) throw memberError;

      // 両方のグループをマージ
      const memberGroupsFormatted = memberGroups
        .map(item => item.groups)
        .filter((group): group is Group => group !== null);

      setGroups([...data, ...memberGroupsFormatted]);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError('グループの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGroups();
  }, []);

  if (selectedGroup) {
    return (
      <GroupPage
        groupId={selectedGroup.id}
        groupName={selectedGroup.name}
        onBack={() => setSelectedGroup(null)}
      />
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">グループ一覧</h2>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-primary text-primary rounded-lg hover:bg-primary-50"
          >
            <Users className="w-5 h-5" />
            <span>参加する</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
          >
            <Plus className="w-5 h-5" />
            <span>新規作成</span>
          </button>
        </div>
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
      ) : groups.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          グループがありません。新しいグループを作成するか、既存のグループに参加してください。
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedGroup(group)}
              className="w-full text-left bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-lg">{group.name}</h3>
            </button>
          ))}
        </div>
      )}

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchGroups();
          setIsCreateModalOpen(false);
        }}
      />

      <JoinGroupModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSuccess={() => {
          fetchGroups();
          setIsJoinModalOpen(false);
        }}
      />
    </div>
  );
}
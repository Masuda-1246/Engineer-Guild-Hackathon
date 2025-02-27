import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { HomePage } from './components/home/HomePage';
import { GroupsPage } from './components/groups/GroupsPage';
import { AuthForm } from './components/auth/AuthForm';
import { ProfileForm } from './components/profile/ProfileForm';
import { InvitePage } from './components/auth/InvitePage';
import { CreatePostPage } from './components/posts/CreatePostPage';
import { BillingPage } from './components/billing/BillingPage';
import { supabase } from './lib/supabase';

type Tab = 'home' | 'post' | 'profile' | 'billing' | 'groups';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [session, setSession] = useState<boolean>(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [invitedGroupName, setInvitedGroupName] = useState<string | null>(null);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [processingInvite, setProcessingInvite] = useState(false);

  useEffect(() => {
    // Check for invite code in URL
    const path = window.location.pathname;
    const match = path.match(/^\/invite\/([a-zA-Z0-9-]+)$/);
    if (match) {
      setInviteCode(match[1]);
      fetchInvitationDetails(match[1]);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(!!session);
      if (session && inviteCode) {
        handleInvite();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(!!session);
      if (session && inviteCode) {
        handleInvite();
      }
    });

    return () => subscription.unsubscribe();
  }, [inviteCode]);

  async function fetchInvitationDetails(code: string) {
    try {
      const { data: invitation, error } = await supabase
        .from('group_invitations')
        .select(`
          group_id,
          groups:group_id (
            name
          )
        `)
        .eq('code', code)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) throw error;
      if (invitation?.groups) {
        setInvitedGroupName(invitation.groups.name);
      }
    } catch (err) {
      console.error('Error fetching invitation details:', err);
      setInviteError('無効または期限切れの招待リンクです');
    }
  }

  async function handleInvite() {
    if (!inviteCode || processingInvite) return;

    try {
      setProcessingInvite(true);
      setInviteError(null);

      // Verify invitation
      const { data: invitation, error: inviteError } = await supabase
        .from('group_invitations')
        .select('group_id')
        .eq('code', inviteCode)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (inviteError || !invitation) {
        setInviteError('無効または期限切れの招待リンクです');
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', invitation.group_id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        setInviteError('すでにこのグループのメンバーです');
        return;
      }

      // Add user to group
      const { error: memberError } = await supabase
        .from('group_members')
        .insert([
          {
            group_id: invitation.group_id,
            user_id: user.id,
            role: 'member'
          }
        ]);

      if (memberError) {
        console.error('Error joining group:', memberError);
        setInviteError('グループへの参加に失敗しました');
        return;
      }

      // Redirect to groups page
      window.history.pushState({}, '', '/');
      setActiveTab('groups');
      setInviteCode(null);
      setInvitedGroupName(null);
    } catch (err) {
      console.error('Error processing invitation:', err);
      setInviteError('招待の処理中にエラーが発生しました');
    } finally {
      setProcessingInvite(false);
    }
  }

  if (!session) {
    if (inviteCode && !showAuthForm) {
      return (
        <InvitePage
          groupName={invitedGroupName || undefined}
          error={inviteError || undefined}
          onLogin={() => {
            setIsSignUp(false);
            setShowAuthForm(true);
          }}
          onSignUp={() => {
            setIsSignUp(true);
            setShowAuthForm(true);
          }}
        />
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <AuthForm
          onSuccess={() => setSession(true)}
          isSignUp={isSignUp}
        />
        {inviteError && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-50 text-red-600 px-4 py-2 rounded-lg shadow">
            {inviteError}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-md mx-auto px-4 pt-16 pb-20">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'post' && <CreatePostPage />}
        {activeTab === 'groups' && <GroupsPage />}
        {activeTab === 'billing' && <BillingPage />}
        {activeTab === 'profile' && (
          <div className="py-4">
            <h2 className="text-xl font-bold mb-4">プロフィール設定</h2>
            <ProfileForm />
          </div>
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      {inviteError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-50 text-red-600 px-4 py-2 rounded-lg shadow">
          {inviteError}
        </div>
      )}
    </div>
  );
}

export default App;
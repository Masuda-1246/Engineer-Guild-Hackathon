import React from 'react';
import { Camera, Home, User, DollarSign, Users } from 'lucide-react';

type Tab = 'home' | 'post' | 'profile' | 'billing' | 'groups';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="bg-white fixed bottom-0 w-full border-t">
      <div className="max-w-md mx-auto px-4 pb-6">
        <div className="flex justify-around">
          <NavButton
            icon={<Home className="w-6 h-6" />}
            isActive={activeTab === 'home'}
            onClick={() => onTabChange('home')}
          />
          <NavButton
            icon={<Users className="w-6 h-6" />}
            isActive={activeTab === 'groups'}
            onClick={() => onTabChange('groups')}
          />
          <NavButton
            icon={<Camera className="w-6 h-6" />}
            isActive={activeTab === 'post'}
            onClick={() => onTabChange('post')}
          />
          <NavButton
            icon={<DollarSign className="w-6 h-6" />}
            isActive={activeTab === 'billing'}
            onClick={() => onTabChange('billing')}
          />
          <NavButton
            icon={<User className="w-6 h-6" />}
            isActive={activeTab === 'profile'}
            onClick={() => onTabChange('profile')}
          />
        </div>
      </div>
    </nav>
  );
}

interface NavButtonProps {
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

function NavButton({ icon, isActive, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-4 flex items-center justify-center ${
        isActive ? 'text-primary' : 'text-gray-500'
      }`}
    >
      {icon}
    </button>
  );
}
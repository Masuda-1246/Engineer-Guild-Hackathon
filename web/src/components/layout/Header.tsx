import React from 'react';
import { PlusCircle, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function Header() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-white shadow-sm fixed top-0 w-full z-10">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">私がやりました</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-primary-50"
          >
            <LogOut className="w-6 h-6 text-gray-500" />
          </button>
        </div>
      </div>
    </header>
  );
}
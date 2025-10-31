import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { User } from '../../types/db';

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  return (
<header className="bg-black border-b border-white/10">
  <div className="container mx-auto px-4 py-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <img
        src="/brand/logo.jpg"
        alt="KNK-AI"
        className="h-10 w-auto"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      <div>
        <h1 className="text-xl font-semibold text-white">Cleanflow</h1>

        {/* Role badge */}
        <div className="mt-1 inline-flex items-center rounded-full bg-green-400/15 px-2.5 py-0.5 text-xs font-medium text-green-300 ring-1 ring-inset ring-green-400/20">
          {user.role}
        </div>
      </div>
    </div>

    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="text-sm text-white">{user.name || user.email}</p>
        <p className="text-xs text-white/50">{user.email}</p>
      </div>
      <button
        onClick={handleLogout}
        className="p-2 hover:bg-white/10 transition-colors rounded-md"
        title="Logout"
      >
        <LogOut className="w-5 h-5 text-white" />
      </button>
    </div>
  </div>
</header>

  );
}

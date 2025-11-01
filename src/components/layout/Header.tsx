// src/components/layout/Header.tsx
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
    <header className="bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/brand/logo.jpg"
            alt="KNK-AI"
            className="h-10 w-auto"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Guten Tag, {user.name || user.email}
            </h1>

            <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
              <span className="text-emerald-700/80">Rolle:</span>
              <span className="font-semibold">{user.role}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-900">{user.name || user.email}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

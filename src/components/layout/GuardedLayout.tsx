import { useEffect, useState } from 'react';
import { Navigate, Outlet, NavLink } from 'react-router-dom';
import { Header } from './Header';
import { getCurrentUser } from '../../lib/api';
import type { User } from '../../types/db';

type TabItem = {
  to: string;
  label: string;
  icon?: React.ElementType; // Lucide icon component type
};

interface GuardedLayoutProps {
  requiredRole: 'Host' | 'Cleaner';
  tabs: TabItem[];
}

export function GuardedLayout({ requiredRole, tabs }: GuardedLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== requiredRole) {
    return <Navigate to={user.role === 'Host' ? '/host' : '/cleaner'} replace />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header user={user} />

      {/* Inline tab navigation (replaces TabNav) */}
      <nav className="container mx-auto px-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 py-3">
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white text-black'
                    : 'text-white/80 hover:bg-white/10 hover:text-white',
                ].join(' ')
              }
            >
              {Icon ? <Icon className="w-4 h-4" /> : null}
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}

// src/components/layout/GuardedLayout.tsx
import { useEffect, useState } from 'react';
import { Navigate, Outlet, NavLink } from 'react-router-dom';
import { Header } from './Header';
import { getCurrentUser } from '../../lib/api';
import type { User } from '../../types/db';

type TabItem = { to: string; label: string; icon?: React.ElementType };

interface GuardedLayoutProps {
  requiredRole: 'Host' | 'Cleaner';
  tabs: TabItem[];
}

export function GuardedLayout({ requiredRole, tabs }: GuardedLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser().then(setUser).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-sky-100 flex items-center justify-center">
        <div className="text-emerald-600 text-lg font-medium">Cleanflow lädt...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== requiredRole)
    return <Navigate to={user.role === 'Host' ? '/host' : '/cleaner'} replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-sky-100 to-sky-200 text-gray-800">
      {/* Header mit weichem Schatten und leichtem Farbverlauf */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-sky-100 to-sky-50 border-b border-emerald-100 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <Header user={user} />
      </div>

      {/* Tabs */}
      <nav className="container mx-auto px-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-sky-200/70 py-3">
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 shadow-sm',
                  isActive
                    ? 'bg-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.35)]'
                    : 'text-gray-700 bg-white/60 hover:bg-emerald-50 hover:text-emerald-700 border border-transparent hover:border-emerald-100',
                ].join(' ')
              }
            >
              {Icon ? <Icon className="w-4 h-4" /> : null}
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Seiteninhalt */}
      <main className="container mx-auto px-4 py-8">
        <Outlet context={{ user }} />
      </main>

      {/* Subtle Footer (optional, kann entfernt werden) */}
      <footer className="mt-8 py-6 text-center text-sm text-gray-500">
        <span className="font-medium text-emerald-600">Cleanflow</span> © {new Date().getFullYear()} – Effizienz in jedem Detail.
      </footer>
    </div>
  );
}

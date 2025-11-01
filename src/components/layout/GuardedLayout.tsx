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
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-sky-200 to-sky-300 flex items-center justify-center">
        <div className="text-emerald-700 text-lg font-medium animate-pulse">
          Cleanflow wird geladen...
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== requiredRole)
    return <Navigate to={user.role === 'Host' ? '/host' : '/cleaner'} replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-sky-200 to-sky-300 text-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-sky-200 to-sky-100 border-b border-emerald-100 shadow-[0_4px_12px_rgba(0,0,0,0.05)] backdrop-blur">
        <Header user={user} />
      </div>

      {/* Navigation */}
      <nav className="container mx-auto px-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-emerald-200/40 py-3">
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 shadow-sm',
                  isActive
                    ? 'bg-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.35)]'
                    : 'text-gray-700 bg-sky-50/70 hover:bg-emerald-50 hover:text-emerald-700 border border-transparent hover:border-emerald-100',
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
        <div className="rounded-2xl bg-sky-50/70 backdrop-blur-sm p-6 shadow-[0_0_25px_rgba(0,0,0,0.05)] border border-sky-200/50">
          <Outlet context={{ user }} />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 py-6 text-center text-sm text-gray-600 border-t border-emerald-100/50 bg-gradient-to-r from-sky-100 to-sky-200">
        <span className="font-semibold text-emerald-600">Cleanflow</span> © {new Date().getFullYear()} — Struktur trifft Ruhe.
      </footer>
    </div>
  );
}

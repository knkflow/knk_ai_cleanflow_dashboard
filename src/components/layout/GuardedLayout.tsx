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
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-sky-200 to-emerald-100 flex items-center justify-center">
        <div className="text-emerald-700 text-lg font-medium">Cleanflow lädt...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== requiredRole)
    return <Navigate to={user.role === 'Host' ? '/host' : '/cleaner'} replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-sky-200 to-emerald-100 text-gray-800">
      {/* Header mit Verlauf, Schlagschatten und Emerald-Akzentlinie */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-sky-200 via-sky-100 to-emerald-50 border-b border-emerald-200 shadow-[0_2px_15px_rgba(0,0,0,0.08)]">
        <Header user={user} />
      </header>

      {/* Navigations-Tabs */}
      <nav className="container mx-auto px-4 mt-2">
        <div className="flex flex-wrap items-center gap-2 border-b border-emerald-200/60 py-3 backdrop-blur-sm">
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 shadow-sm',
                  isActive
                    ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.45)]'
                    : 'text-gray-700 bg-white/40 hover:bg-emerald-50 hover:text-emerald-700 border border-transparent hover:border-emerald-200',
                ].join(' ')
              }
            >
              {Icon ? <Icon className="w-4 h-4" /> : null}
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Hauptinhalt */}
      <main className="container mx-auto px-4 py-10">
        <Outlet context={{ user }} />
      </main>

      {/* Dezenter Footer */}
      <footer className="mt-8 py-8 text-center text-sm text-gray-600 bg-transparent">
        <span className="font-medium text-emerald-700">Cleanflow</span> © {new Date().getFullYear()} — Sauberkeit mit System.
      </footer>
    </div>
  );
}

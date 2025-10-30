import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Header } from './Header';
import { TabNav } from './TabNav';
import { getCurrentUser } from '../../lib/api';
import type { User } from '../../types/db';

interface GuardedLayoutProps {
  requiredRole: 'Host' | 'Cleaner';
  tabs: Array<{ to: string; label: string }>;
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
    <div className="min-h-screen bg-black">
      <Header user={user} />
      <TabNav tabs={tabs} />
      <main className="container mx-auto px-4 py-8">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}

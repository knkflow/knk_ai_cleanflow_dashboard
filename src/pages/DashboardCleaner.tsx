import { Navigate } from 'react-router-dom';
import { useSupabase } from '../lib/supabaseClient'; // Beispiel
import { useEffect, useState } from 'react';

export function DashboardCleaner() {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [isCleaner, setIsCleaner] = useState(false);

  useEffect(() => {
    async function checkRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.role === 'Cleaner') {
        setIsCleaner(true);
      }
      setLoading(false);
    }
    checkRole();
  }, []);

  if (loading) return <div className="text-white">Loading...</div>;

  if (!isCleaner) return <Navigate to="/login" replace />;

  return <Navigate to="/cleaner/apartments" replace />;
}

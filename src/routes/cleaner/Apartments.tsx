import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Home } from 'lucide-react';
import { getApartmentsForCleaner, getCleanerByUserId } from '../../lib/api';
import type { User, Apartment } from '../../types/db';

interface ContextType {
  user: User;
}

export function Apartments() {
  const { user } = useOutletContext<ContextType>();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user.id]);

  async function loadData() {
    try {
      const cleaner = await getCleanerByUserId(user.id);
      if (cleaner) {
        const data = await getApartmentsForCleaner(cleaner.id);
        setApartments(data);
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">My Apartments</h2>
        <p className="text-white/70 text-sm">
          Apartments where you are the default cleaner
        </p>
      </div>

      <div className="grid gap-4">
        {apartments.map((apartment) => (
          <div
            key={apartment.id}
            className="bg-white/5 border border-white/10 p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {apartment.name}
                </h3>
                {apartment.address && (
                  <p className="text-white/70 text-sm">{apartment.address}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {apartments.length === 0 && (
          <div className="text-center py-12 text-white/50">
            No apartments assigned yet. Contact your host to be assigned as a default cleaner.
          </div>
        )}
      </div>
    </div>
  );
}

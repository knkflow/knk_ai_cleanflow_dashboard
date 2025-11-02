import { useEffect, useState, FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  Building2,
  KeyRound,
  MapPin,
  User as User_Icon,
} from 'lucide-react';
import {
  getApartments,
  createApartment,
  updateApartment,
  deleteApartment,
  getCleaners,
} from '../../lib/api';
import type { User, ApartmentWithCleaner, Cleaner } from '../../types/db';

interface ContextType {
  user: User;
}

export function Apartments() {
  const { user } = useOutletContext<ContextType>();
  const [apartments, setApartments] = useState<ApartmentWithCleaner[]>([]);
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [loading, setLoading] = useState(true);

  // Create/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete Modal
  const [apartmentToDelete, setApartmentToDelete] =
    useState<ApartmentWithCleaner | null>(null);

  const [formData, setFormData] = useState({
    listing_id: '',
    name: '',
    address: '',
    default_cleaner_id: '',
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  async function loadData() {
    setLoading(true);
    try {
      const [apartmentsData, cleanersData] = await Promise.all([
        getApartments(user.id),
        getCleaners(user.id),
      ]);
      setApartments(apartmentsData);
      setCleaners(cleanersData);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingId(null);
    setFormData({
      listing_id: '',
      name: '',
      address: '',
      default_cleaner_id: '',
    });
    setIsModalOpen(true);
  }

  function openEditModal(apartment: ApartmentWithCleaner) {
    setEditingId(apartment.listing_id);
    setFormData({
      listing_id: apartment.listing_id,
      name: apartment.name,
      address: apartment.address || '',
      default_cleaner_id: apartment.default_cleaner_id || '',
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await updateApartment(editingId, {
          name: formData.name,
          address: formData.address || null,
          default_cleaner_id: formData.default_cleaner_id || null,
        });
      } else {
        await createApartment({
          owner_id: user.id,
          listing_id: formData.listing_id,
          name: formData.name,
          address: formData.address || null,
          default_cleaner_id: formData.default_cleaner_id || null,
        });
      }
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  }

  function openDeleteModal(apartment: ApartmentWithCleaner) {
    setApartmentToDelete(apartment);
  }

  async function confirmDeleteApartment() {
    if (!apartmentToDelete) return;
    try {
      await deleteApartment(apartmentToDelete.listing_id);
      setApartmentToDelete(null);
      loadData();
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return (
      <div className="text-white px-4 sm:px-6 md:px-8">Loading...</div>
    );
  }

  return (
    <div className="px-4 sm:px-6 md:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold text-white">Apartments</h2>
        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto px-4 py-2 bg-white text-black hover:bg-white/90 transition-colors font-medium flex items-center justify-center gap-2 rounded-md"
        >
          <Plus className="w-5 h-5" />
          Apartment hinzufügen
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {apartments.map((apartment) => (
          <div
            key={apartment.listing_id}
            className="bg-white/5 border border-white/10 p-5 rounded-2xl transition-all duration-300 hover:border-white hover:shadow-[0_0_15px_2px_rgba(255,255,255,0.45)]"
          >
            <div className="flex flex-col gap-3">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-white/80" />
                  <span className="truncate">{apartment.name}</span>
                </h3>

                <p className="text-white/70 text-sm mb-2 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-white/60" />
                  Listing ID: {apartment.listing_id}
                </p>

                {apartment.address && (
                  <p className="text-white/60 text-sm mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-white/50" />
                    {apartment.address}
                  </p>
                )}

                {apartment.default_cleaner && (
                  <p className="text-white/50 text-sm flex items-center gap-2">
                    <User_Icon className="w-4 h-4 text-white/40" />
                    Stammreinigungskraft: {apartment.default_cleaner.name}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                <button
                  onClick={() => openEditModal(apartment)}
                  className="w-full sm:w-auto p-2 rounded-md hover:bg-white/10 flex items-center justify-center gap-2"
                >
                  <Edit className="w-5 h-5 text-white" />
                  <span className="sm:hidden text-sm">Bearbeiten</span>
                </button>

                <button
                  onClick={() => openDeleteModal(apartment)}
                  className="w-full sm:w-auto p-2 rounded-md hover:bg-red-500/20 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                  <span className="sm:hidden text-sm text-red-400">Löschen</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {apartments.length === 0 && (
          <div className="col-span-full text-center py-12 text-white/60 text-base">
            Noch keine Apartments. Füge dein erstes Apartment hinzu, um zu starten.
          </div>
        )}
      </div>

      {/* Create/Edit Modal - gleiches Design wie Cleaner */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 text-white border border-white/20 rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">
              {editingId ? 'Apartment bearbeiten' : 'Apartment hinzufügen'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Listing ID */}
              <div>
                <label className="block text-sm text-white mb-1">Listing ID</label>
                <input
                  type="text"
                  value={formData.listing_id}
                  onChange={(e) =>
                    setFormData({ ...formData, listing_id: e.target.value })
                  }
                  required
                  disabled={!!editingId}
                  placeholder="z. B. APT-001"
                  className="w-full rounded-md border border-white/20 bg-white text-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-60"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm text-white mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="z. B. Downtown Studio"
                  className="w-full rounded-md border border-white/20 bg-white text-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>

              {/* Adresse */}
              <div>
                <label className="block text-sm text-white mb-1">Adresse</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Vollständige Adresse"
                  className="w-full rounded-md border border-white/20 bg-white text-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>

              {/* Cleaner Auswahl */}
              <div>
                <label className="block text-sm text-white mb-1">
                  Stammreinigungskraft
                </label>
                <select
                  value={formData.default_cleaner_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      default_cleaner_id: e.target.value,
                    })
                  }
                  className="w-full rounded-md border border-white/20 bg-white text-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <option value="">Keine</option>
                  {cleaners.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-white/30 text-white rounded-md hover:border-white/60 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white text-black font-semibold rounded-md hover:bg-gray-100 transition-colors"
                >
                  {editingId ? 'Aktualisieren' : 'Erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {apartmentToDelete && (
        <div
          aria-modal="true"
          role="dialog"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setApartmentToDelete(null)}
          />
          <div className="relative w-full max-w-md bg-black text-white border border-white/10 shadow-2xl rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Apartment löschen?</h3>
            <div className="space-y-2 text-white/85 mb-5">
              <p>
                Möchten Sie das Apartment{' '}
                <span className="font-semibold text-white">
                  {apartmentToDelete.name}
                </span>{' '}
                wirklich entfernen?
              </p>
              {apartmentToDelete.address && (
                <p className="text-white/70">
                  Adresse:{' '}
                  <span className="text-white">{apartmentToDelete.address}</span>
                </p>
              )}
              <p className="text-red-400 text-sm mt-2">
                Hinweis: Alle zugehörigen Reinigungsaufträge werden ebenfalls gelöscht.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={confirmDeleteApartment}
                className="w-full sm:flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md"
              >
                Löschen
              </button>
              <button
                onClick={() => setApartmentToDelete(null)}
                className="w-full sm:flex-1 px-4 py-2 bg-white/10 text-white hover:bg-white/20 rounded-md"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  Info,
} from 'lucide-react';
import {
  getApartments,
  createApartment,
  updateApartment,
  deleteApartment,
  getCleaners,
} from '../../lib/api';
import { Modal } from '../../components/forms/Modal';
import type { User, ApartmentWithCleaner, Cleaner } from '../../types/db';

interface ContextType {
  user: User;
}

export function Apartments() {
  const { user } = useOutletContext<ContextType>();
  const [apartments, setApartments] = useState<ApartmentWithCleaner[]>([]);
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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
    return <div className="text-white px-4 sm:px-6 md:px-8">Loading...</div>;
  }

  return (
    <div className="px-4 sm:px-6 md:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Apartments</h2>
        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto px-4 py-2 bg-white text-black hover:bg-white/90 transition-colors font-medium flex items-center justify-center gap-2 rounded-md"
        >
          <Plus className="w-5 h-5" />
          Apartment hinzufügen
        </button>
      </div>

      {/* Apartment Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {apartments.map((apartment) => (
          <div
            key={apartment.listing_id}
            className="bg-[#1a1a1a] border border-white/10 p-4 sm:p-5 rounded-2xl transition-all duration-500 hover:border-white hover:shadow-[0_0_15px_2px_rgba(255,255,255,0.2)]"
          >
            <div className="flex flex-col gap-3">
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 flex items-center gap-2">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white/80 shrink-0" />
                  <span className="truncate">{apartment.name}</span>
                </h3>

                <p className="text-white/70 text-xs sm:text-sm mb-2 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-white/60 shrink-0" />
                  <span className="truncate">Listing ID: {apartment.listing_id}</span>
                </p>

                {apartment.address && (
                  <p className="text-white/60 text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-white/50 shrink-0" />
                    <span className="truncate">{apartment.address}</span>
                  </p>
                )}

                {apartment.default_cleaner && (
                  <p className="text-white/50 text-xs sm:text-sm flex items-center gap-2">
                    <User_Icon className="w-4 h-4 text-white/40 shrink-0" />
                    <span className="truncate">
                      Stammreinigungskraft: {apartment.default_cleaner.name}
                    </span>
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                <button
                  onClick={() => openEditModal(apartment)}
                  className="w-full sm:w-auto p-2 rounded-md hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-5 h-5 text-white" />
                  <span className="sm:hidden text-sm">Bearbeiten</span>
                </button>

                <button
                  onClick={() => setApartmentToDelete(apartment)}
                  className="w-full sm:w-auto p-2 rounded-md hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                  <span className="sm:hidden text-sm text-red-400">Löschen</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {apartments.length === 0 && (
          <div className="col-span-full text-center py-10 sm:py-12 text-white/60 text-sm sm:text-base">
            Noch keine Apartments. Füge dein erstes Apartment hinzu, um zu starten.
          </div>
        )}
      </div>

      {/* Modal für Apartment Hinzufügen / Bearbeiten */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Apartment bearbeiten' : 'Apartment hinzufügen'}
      >
        <form onSubmit={handleSubmit} className="bg-[#111111] text-white p-1 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-white text-sm font-medium mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="z. B. City Loft"
              className="w-full px-3 py-2 bg-[#2b2b2b] text-white rounded-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          {/* Listing ID */}
          <div>
            <label className="block text-white text-sm font-medium mb-1">
              Listing ID
            </label>
            <input
              type="text"
              value={formData.listing_id}
              onChange={(e) =>
                setFormData({ ...formData, listing_id: e.target.value })
              }
              required
              disabled={!!editingId}
              placeholder="z. B. APT-001"
              className="w-full px-3 py-2 bg-[#2b2b2b] text-white rounded-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-60"
            />
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-white text-sm font-medium mb-1">
              Adresse (optional)
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Straße, PLZ, Stadt"
              className="w-full px-3 py-2 bg-[#2b2b2b] text-white rounded-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          {/* Cleaner */}
          <div>
            <label className="block text-white text-sm font-medium mb-1">
              Stammreinigungskraft (optional)
            </label>
            <select
              value={formData.default_cleaner_id}
              onChange={(e) =>
                setFormData({ ...formData, default_cleaner_id: e.target.value })
              }
              className="w-full px-3 py-2 bg-[#2b2b2b] text-white rounded-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="">Keine</option>
              {cleaners.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Info-Box */}
          <div className="flex items-start gap-2 border border-blue-500/30 bg-blue-500/10 text-blue-200 rounded-md px-3 py-2 text-sm">
            <Info className="w-4 h-4 mt-[2px]" />
            <p>
              Beim Speichern wird das Apartment automatisch im System registriert.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="w-full sm:w-1/2 px-4 py-2 bg-[#2b2b2b] text-white border border-white/20 hover:bg-[#3a3a3a] rounded-md transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="w-full sm:w-1/2 px-4 py-2 bg-white text-black font-medium rounded-md hover:bg-gray-200 transition-colors"
            >
              {editingId ? 'Aktualisieren' : 'Erstellen'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      {apartmentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setApartmentToDelete(null)}
          />
          <div className="relative w-full max-w-md bg-[#111111] text-white border border-white/10 shadow-2xl rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-3">Apartment löschen?</h3>
            <p className="text-white/80 mb-4">
              Möchtest du das Apartment{' '}
              <span className="font-semibold text-white">
                {apartmentToDelete.name}
              </span>{' '}
              wirklich löschen?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={confirmDeleteApartment}
                className="w-full sm:w-1/2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white font-medium transition-colors"
              >
                Löschen
              </button>
              <button
                onClick={() => setApartmentToDelete(null)}
                className="w-full sm:w-1/2 px-4 py-2 bg-[#2b2b2b] hover:bg-[#3a3a3a] text-white rounded-md border border-white/20 transition-colors"
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

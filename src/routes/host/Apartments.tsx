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
import { getApartments, createApartment, updateApartment, deleteApartment, getCleaners } from '../../lib/api';
import { Modal } from '../../components/forms/Modal';
import { Input } from '../../components/forms/Input';
import { Select } from '../../components/forms/Select';
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
  const [apartmentToDelete, setApartmentToDelete] = useState<ApartmentWithCleaner | null>(null);

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
    // Hinweis: hier wird die listing_id als editingId verwendet (verträglich mit updateApartment-Aufruf unten)
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

  // ----- Delete-Flow -----
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
    return <div className="px-4 sm:px-6 md:px-8 text-gray-600">Loading...</div>;
  }

  return (
    <div className="px-4 sm:px-6 md:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Apartments</h2>
        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto px-4 py-2 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Apartment hinzufügen
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {apartments.map((apartment) => (
          <div
            key={apartment.listing_id}
            className="bg-white border border-gray-200 p-4 sm:p-5 rounded-2xl transition-all duration-300 hover:shadow-md"
          >
            <div className="flex flex-col gap-3">
              {/* Titel & Infos */}
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" />
                  <span className="truncate">{apartment.name}</span>
                </h3>

                <p className="text-gray-700 text-xs sm:text-sm mb-2 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-gray-500 shrink-0" />
                  <span className="truncate">Listing ID: {apartment.listing_id}</span>
                </p>

                {apartment.address && (
                  <p className="text-gray-600 text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="truncate">{apartment.address}</span>
                  </p>
                )}

                {apartment.default_cleaner && (
                  <p className="text-gray-600 text-xs sm:text-sm flex items-center gap-2">
                    <User_Icon className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="truncate">
                      Stammreinigungskraft: {apartment.default_cleaner.name}
                    </span>
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                <button
                  onClick={() => openEditModal(apartment)}
                  className="w-full sm:w-auto px-3 py-2 rounded-md bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors flex items-center justify-center gap-2 text-gray-800"
                  title="Bearbeiten"
                >
                  <Edit className="w-5 h-5" />
                  <span className="sm:hidden text-sm">Bearbeiten</span>
                </button>

                <button
                  onClick={() => openDeleteModal(apartment)}
                  className="w-full sm:w-auto px-3 py-2 rounded-md bg-red-50 hover:bg-red-100 border border-red-200 transition-colors flex items-center justify-center gap-2 text-red-700"
                  title="Löschen"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="sm:hidden text-sm">Löschen</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {apartments.length === 0 && (
          <div className="col-span-full text-center py-10 sm:py-12 text-gray-600 text-sm sm:text-base">
            Noch keine Apartments. Füge dein erstes Apartment hinzu, um zu starten.
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Apartment bearbeiten' : 'Apartment hinzufügen'}
      >
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <Input
            label="Listing ID"
            value={formData.listing_id}
            onChange={(e) => setFormData({ ...formData, listing_id: e.target.value })}
            required
            disabled={!!editingId}
            placeholder="z. B. APT-001"
          />

          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="z. B. Downtown Studio"
          />

          <Input
            label="Adresse"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Vollständige Adresse"
          />

          <Select
            label="Stammreinigungskraft"
            value={formData.default_cleaner_id}
            onChange={(e) => setFormData({ ...formData, default_cleaner_id: e.target.value })}
            options={[
              { value: '', label: 'Keine' },
              ...cleaners.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />

          {/* Modal-Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
            <button
              type="submit"
              className="w-full sm:flex-1 px-4 py-2 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium"
            >
              {editingId ? 'Aktualisieren' : 'Erstellen'}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="w-full sm:flex-1 px-4 py-2 rounded-md bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      {apartmentToDelete && (
        <div
          aria-modal="true"
          role="dialog"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setApartmentToDelete(null)}
          />
          {/* Dialog */}
          <div className="relative w-full max-w-md bg-white text-gray-900 border border-gray-200 shadow-2xl rounded-xl p-5 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Apartment löschen?</h3>

            <div className="space-y-2 text-gray-800 mb-5 sm:mb-6">
              <p>
                Möchten Sie das Apartment{' '}
                <span className="font-semibold">
                  {apartmentToDelete.name}
                </span>{' '}
                wirklich entfernen?
              </p>
              {apartmentToDelete.address && (
                <p className="text-gray-600">
                  Adresse: <span className="text-gray-800">{apartmentToDelete.address}</span>
                </p>
              )}
              <p className="text-red-600 text-xs sm:text-sm mt-2">
                Hinweis: Alle zugehörigen Reinigungsaufträge werden ebenfalls gelöscht.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={confirmDeleteApartment}
                className="w-full sm:flex-1 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
              >
                Löschen
              </button>
              <button
                onClick={() => setApartmentToDelete(null)}
                className="w-full sm:flex-1 px-4 py-2 rounded-md bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 transition-colors"
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

import { useEffect, useState, FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
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
    // WICHTIG: editingId ist die echte DB-ID, nicht listing_id
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
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div>
     <div className="flex items-center justify-between mb-6">
  <h2 className="text-2xl font-bold text-white">Apartments</h2>
  <button
    onClick={openCreateModal}
    className="px-4 py-2 bg-white text-black hover:bg-white/90 transition-colors font-medium flex items-center gap-2 rounded-md"
  >
    <Plus className="w-5 h-5" />
    Add Apartment
  </button>
</div>

      <div className="grid gap-4">
        {apartments.map((apartment) => (
          <div
            key={apartment.listing_id}
            className="bg-white/5 border border-white/10 p-6 rounded-2xl transition-all duration-500
                       hover:border-2 hover:border-white
                       hover:shadow-[0_0_15px_2px_rgba(255,255,255,0.45)]"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {apartment.name}
                </h3>
                <p className="text-white/70 text-sm mb-2">
                  Listing ID: {apartment.listing_id}
                </p>

                {apartment.address && (
                  <p className="text-white/60 text-sm mb-2">{apartment.address}</p>
                )}

                {apartment.default_cleaner && (
                  <p className="text-white/50 text-sm">
                    Default Cleaner: {apartment.default_cleaner.name}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(apartment)}
                  className="p-2 rounded-md hover:bg-white/10 transition-colors"
                  title="Edit"
                >
                  <Edit className="w-5 h-5 text-white" />
                </button>

                <button
                  onClick={() => openDeleteModal(apartment)}
                  className="p-2 rounded-md hover:bg-red-500/20 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {apartments.length === 0 && (
          <div className="text-center py-12 text-white/50">
            No apartments yet. Add your first apartment to get started.
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Apartment' : 'Add Apartment'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Listing ID"
            value={formData.listing_id}
            onChange={(e) => setFormData({ ...formData, listing_id: e.target.value })}
            required
            disabled={!!editingId}
            placeholder="e.g., APT-001"
          />

          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="e.g., Downtown Studio"
          />

          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Full address"
          />

          <Select
            label="Default Cleaner"
            value={formData.default_cleaner_id}
            onChange={(e) => setFormData({ ...formData, default_cleaner_id: e.target.value })}
            options={[
              { value: '', label: 'None' },
              ...cleaners.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-white text-black hover:bg-white/90 transition-colors font-medium"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Cancel
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
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setApartmentToDelete(null)}
          />
          {/* Dialog */}
          <div className="relative w-full max-w-md bg-black text-white border border-white/10 shadow-2xl rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Apartment löschen?</h3>

            <div className="space-y-2 text-white/85 mb-6">
              <p>
                Möchten Sie das Apartment{' '}
                <span className="font-semibold text-white">
                  {apartmentToDelete.name}
                </span>{' '}
                wirklich entfernen?
              </p>
              {apartmentToDelete.address && (
                <p className="text-white/70">
                  Adresse: <span className="text-white">{apartmentToDelete.address}</span>
                </p>
              )}
              <p className="text-red-400 text-sm mt-2">
                Hinweis: Alle zugehörigen Reinigungsaufträge werden ebenfalls gelöscht.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmDeleteApartment}
                className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors font-medium rounded-md"
              >
                Löschen
              </button>
              <button
                onClick={() => setApartmentToDelete(null)}
                className="flex-1 px-4 py-2 bg-white/10 text-white hover:bg-white/20 transition-colors rounded-md"
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

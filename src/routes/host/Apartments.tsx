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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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
    setEditingId(apartment.id);
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

  async function handleDelete(id: string) {
    if (!confirm('Delete this apartment? All related tasks will also be deleted.')) return;
    try {
      await deleteApartment(id);
      loadData();
    } catch (error: any) {
      alert(error.message);
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
          className="px-4 py-2 bg-white text-black hover:bg-white/90 transition-colors font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Apartment
        </button>
      </div>

      <div className="grid gap-4">
       {apartments.map((apartment) => ( <div key={apartment.id} className="bg-white/5 border border-white/10 p-6" > <div className="flex items-start justify-between"> <div className="flex-1"> <h3 className="text-xl font-semibold text-white mb-2"> {apartment.name} </h3> <p className="text-white/70 text-sm mb-2"> Listing ID: {apartment.listing_id} </p> {apartment.address && ( <p className="text-white/60 text-sm mb-2">{apartment.address}</p> )} {apartment.default_cleaner && ( <p className="text-white/50 text-sm"> Default Cleaner: {apartment.default_cleaner.name} </p> )} </div> <div className="flex gap-2"> <button onClick={() => openEditModal(apartment)} className="p-2 hover:bg-white/10 transition-colors" title="Edit" > <Edit className="w-5 h-5 text-white" /> </button> <button onClick={() => handleDelete(apartment.id)} className="p-2 hover:bg-red-500/20 transition-colors" title="Delete" > <Trash2 className="w-5 h-5 text-red-500" /> </button> </div> </div> </div> ))}

        {apartments.length === 0 && (
          <div className="text-center py-12 text-white/50">
            No apartments yet. Add your first apartment to get started.
          </div>
        )}
      </div>

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
    </div>
  );
}

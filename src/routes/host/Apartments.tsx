// src/routes/host/Apartments.tsx  (nur Styles angepasst)
import { useEffect, useState, FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Edit, Trash2, Building2, KeyRound, MapPin, User as User_Icon } from 'lucide-react';
import { getApartments, createApartment, updateApartment, deleteApartment, getCleaners } from '../../lib/api';
import { Modal } from '../../components/forms/Modal';
import { Input } from '../../components/forms/Input';
import { Select } from '../../components/forms/Select';
import type { User, ApartmentWithCleaner, Cleaner } from '../../types/db';

interface ContextType { user: User; }

export function Apartments() {
  const { user } = useOutletContext<ContextType>();
  const [apartments, setApartments] = useState<ApartmentWithCleaner[]>([]);
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [apartmentToDelete, setApartmentToDelete] = useState<ApartmentWithCleaner | null>(null);

  const [formData, setFormData] = useState({ listing_id: '', name: '', address: '', default_cleaner_id: '' });

  useEffect(() => { loadData(); }, [user.id]);
  async function loadData() {
    setLoading(true);
    try {
      const [a, c] = await Promise.all([getApartments(user.id), getCleaners(user.id)]);
      setApartments(a); setCleaners(c);
    } finally { setLoading(false); }
  }

  function openCreateModal() {
    setEditingId(null);
    setFormData({ listing_id: '', name: '', address: '', default_cleaner_id: '' });
    setIsModalOpen(true);
  }

  function openEditModal(ap: ApartmentWithCleaner) {
    setEditingId(ap.listing_id);
    setFormData({
      listing_id: ap.listing_id,
      name: ap.name,
      address: ap.address || '',
      default_cleaner_id: ap.default_cleaner_id || '',
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
    } catch (err: any) {
      alert(err.message);
    }
  }

  function openDeleteModal(ap: ApartmentWithCleaner) { setApartmentToDelete(ap); }
  async function confirmDeleteApartment() {
    if (!apartmentToDelete) return;
    try { await deleteApartment(apartmentToDelete.listing_id); setApartmentToDelete(null); loadData(); } catch {}
  }

  if (loading) return <div className="text-gray-900 px-4">Loading...</div>;

  return (
    <div className="px-4 sm:px-6 md:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Apartments</h2>
        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium rounded-md flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" /> Apartment hinzufügen
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {apartments.map((ap) => (
          <div key={ap.listing_id} className="bg-white border border-gray-200 p-5 rounded-2xl hover:shadow-md transition">
            <div className="flex flex-col gap-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-gray-600 shrink-0" />
                  <span className="truncate">{ap.name}</span>
                </h3>

                <p className="text-gray-700 text-sm mb-1 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-gray-500" />
                  <span className="truncate">Listing ID: {ap.listing_id}</span>
                </p>

                {ap.address && (
                  <p className="text-gray-600 text-sm mb-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="truncate">{ap.address}</span>
                  </p>
                )}

                {ap.default_cleaner && (
                  <p className="text-gray-500 text-sm flex items-center gap-2">
                    <User_Icon className="w-4 h-4 text-gray-400" />
                    <span className="truncate">Stammreinigungskraft: {ap.default_cleaner.name}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                <button
                  onClick={() => openEditModal(ap)}
                  className="w-full sm:w-auto p-2 rounded-md hover:bg-gray-100 transition flex items-center justify-center gap-2"
                  title="Edit"
                >
                  <Edit className="w-5 h-5 text-gray-900" />
                  <span className="sm:hidden text-sm">Bearbeiten</span>
                </button>

                <button
                  onClick={() => openDeleteModal(ap)}
                  className="w-full sm:w-auto p-2 rounded-md hover:bg-red-50 transition flex items-center justify-center gap-2"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <span className="sm:hidden text-sm text-red-600">Löschen</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {apartments.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            Noch keine Apartments. Füge dein erstes Apartment hinzu.
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Apartment bearbeiten' : 'Apartment hinzufügen'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Listing ID" value={formData.listing_id} onChange={(e) => setFormData({ ...formData, listing_id: e.target.value })} required disabled={!!editingId} placeholder="z. B. APT-001" />
          <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="z. B. Downtown Studio" />
          <Input label="Adresse" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Vollständige Adresse" />
          <Select
            label="Stammreinigungskraft"
            value={formData.default_cleaner_id}
            onChange={(e) => setFormData({ ...formData, default_cleaner_id: e.target.value })}
            options={[{ value: '', label: 'Keine' }, ...cleaners.map((c) => ({ value: c.id, label: c.name }))]}
          />
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="submit" className="w-full sm:flex-1 px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium rounded-md">
              {editingId ? 'Aktualisieren' : 'Erstellen'}
            </button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:flex-1 px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors rounded-md">
              Abbrechen
            </button>
          </div>
        </form>
      </Modal>

      {apartmentToDelete && (
        <div aria-modal="true" role="dialog" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setApartmentToDelete(null)} />
          <div className="relative w-full max-w-md bg-white text-gray-900 border border-gray-200 shadow-2xl rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Apartment löschen?</h3>
            <div className="space-y-2 text-gray-800 mb-6">
              <p>
                Möchten Sie das Apartment <span className="font-semibold">{apartmentToDelete.name}</span> wirklich entfernen?
              </p>
              {apartmentToDelete.address && <p className="text-gray-600">Adresse: <span className="text-gray-800">{apartmentToDelete.address}</span></p>}
              <p className="text-red-600 text-sm mt-2">Hinweis: Alle zugehörigen Reinigungsaufträge werden ebenfalls gelöscht.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={confirmDeleteApartment} className="w-full sm:flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors font-medium rounded-md">
                Löschen
              </button>
              <button onClick={() => setApartmentToDelete(null)} className="w-full sm:flex-1 px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors rounded-md">
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Apartments;

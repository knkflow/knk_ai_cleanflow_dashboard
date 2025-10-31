import { useEffect, useState, FormEvent, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
  getCleaners,
  updateCleaner,
  deleteCleanerCascade,
  createCleanerAndInvite,
} from '../../lib/api';
import { Modal } from '../../components/forms/Modal';
import { Input } from '../../components/forms/Input';
import type { User, Cleaner } from '../../types/db';

interface ContextType {
  user: User;
}

export function Cleaners() {
  const { user } = useOutletContext<ContextType>();

  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedCleaner, setSelectedCleaner] = useState<Cleaner | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    hourly_rate: '',
  });

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCleaners(user.id);
      setCleaners(data);
    } catch (e) {
      console.error('[Cleaners] loadData error:', e);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  function openCreateModal() {
    console.log('[Cleaners] openCreateModal clicked');
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', hourly_rate: '' });
    setIsModalOpen(true);
  }

  function openEditModal(cleaner: Cleaner) {
    setEditingId(cleaner.id);
    setFormData({
      name: cleaner.name,
      email: cleaner.email || '',
      phone: cleaner.phone || '',
      hourly_rate: cleaner.hourly_rate?.toString() || '',
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const payload = {
        host_id: user.id,
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        send_magic_link: true,
      };

      if (editingId) {
        await updateCleaner(editingId, {
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          hourly_rate: payload.hourly_rate,
        });
      } else {
        // Edge Function (Name = "smart-function")
        const data = await createCleanerAndInvite(payload);
        console.log('✅ Cleaner created via Edge Function:', data);
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error('[Cleaners] handleSubmit error:', err);
      alert(err?.message ?? 'Unbekannter Fehler beim Speichern');
    } finally {
      setSubmitting(false);
    }
  }

  function handleDelete(cleaner: Cleaner) {
    setSelectedCleaner(cleaner);
    setIsConfirmOpen(true);
  }

  async function handleDeleteConfirmed() {
    if (!selectedCleaner) return;
    try {
      await deleteCleanerCascade(selectedCleaner.id);
      setIsConfirmOpen(false);
      await loadData();
    } catch (error: any) {
      console.error('[Cleaners] delete error:', error);
      alert(error.message ?? 'Löschen fehlgeschlagen');
    }
  }

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div>
      {/* Header – mit hohem z-index und gesichert klickbarem Button */}
      <div className="relative z-[50] flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Reinigungskräfte</h2>
        <button
          type="button"
          onClick={openCreateModal}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openCreateModal(); }}
          className="px-4 py-2 bg-white text-black hover:bg-white/90 transition-colors font-medium flex items-center gap-2 rounded-md focus:outline-none focus:ring focus:ring-white/50"
          style={{ position: 'relative', zIndex: 50, pointerEvents: 'auto' }}
          aria-label="Add Cleaner"
        >
          <Plus className="w-5 h-5" />
          Add Cleaner
        </button>
      </div>

      {/* (Optional) Floating FAB, falls doch irgendwo ein Overlay Klicks blockiert */}
      <button
        type="button"
        onClick={openCreateModal}
        className="fixed bottom-6 right-6 md:hidden rounded-full w-14 h-14 bg-white text-black shadow-lg focus:outline-none focus:ring focus:ring-white/50"
        style={{ zIndex: 60 }}
        aria-label="Add Cleaner (floating)"
      >
        <span className="sr-only">Add Cleaner</span>
        <Plus className="w-6 h-6 m-auto" />
      </button>

      {/* Info Box */}
      <div className="mb-6 bg-blue-500/10 border border-blue-500/30 p-4 text-blue-400 text-sm rounded-lg">
        <p className="font-medium mb-2">How Cleaner Invitations Work:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Add a cleaner with their email address (or phone).</li>
          <li>A magic link (email) is sent for first-time login.</li>
          <li>Role is set to <b>Cleaner</b> automatically.</li>
          <li>Cleaner can then access assignments and set a password.</li>
        </ol>
      </div>

      {/* Cleaner Cards */}
      <div className="grid gap-4">
        {cleaners.map((cleaner) => (
          <div
            key={cleaner.id}
            className="bg-white/5 border border-white/10 p-6 rounded-2xl transition-all duration-500 hover:border-2 hover:border-white hover:shadow-[0_0_15px_2px_rgba(255,255,255,0.45)]"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-white">{cleaner.name}</h3>
                  {cleaner.user_id ? (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-md">
                      REGISTERED
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-md">
                      PENDING
                    </span>
                  )}
                </div>

                {cleaner.email && <p className="text-white/70 text-sm mb-1">{cleaner.email}</p>}
                {cleaner.phone && <p className="text-white/60 text-sm mb-1">{cleaner.phone}</p>}
                {cleaner.hourly_rate && (
                  <p className="text-white/50 text-sm">
                    Rate: €{cleaner.hourly_rate.toFixed(2)}/hour
                  </p>
                )}
                <p className="text-white/40 text-xs mt-2">
                  Unavailable days: {Array.isArray(cleaner.availability) ? cleaner.availability.length : 0}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(cleaner)}
                  className="p-2 rounded-md hover:bg-white/10 transition-colors"
                  title="Edit"
                >
                  <Edit className="w-5 h-5 text-white" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cleaner)}
                  className="p-2 rounded-md hover:bg-red-500/20 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {cleaners.length === 0 && (
          <div className="text-center py-12 text-white/50">
            No cleaners yet. Add your first cleaner to get started.
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Cleaner' : 'Add Cleaner'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Full name"
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@example.com"
          />

          <Input
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+49 123 456789"
          />

          <Input
            label="Hourly Rate (€)"
            type="number"
            step="0.01"
            min="0"
            value={formData.hourly_rate}
            onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
            placeholder="15.00"
          />

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-white text-black hover:bg-white/90 disabled:opacity-60 transition-colors font-medium rounded-md"
            >
              {submitting ? 'Saving…' : editingId ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-white/10 text-white hover:bg-white/20 disabled:opacity-60 transition-colors rounded-md"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Popup */}
      {isConfirmOpen && selectedCleaner && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 text-white border border-white/20 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-semibold mb-3">Wirklich entfernen?</h3>
            <p className="text-white/70 mb-6">
              Möchten Sie den Cleaner{' '}
              <span className="text-white font-semibold">{selectedCleaner.name}</span>{' '}
              wirklich dauerhaft löschen?
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 border border-white/30 text-white hover:border-white/60 transition-colors rounded-md"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                className="px-5 py-2 bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors rounded-md"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

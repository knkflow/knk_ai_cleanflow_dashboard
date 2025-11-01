import { useEffect, useState, FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Edit, Trash2, Lightbulb } from 'lucide-react';
import {
  getCleaners,
  getCleanerByUserId,
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

  const [errorModal, setErrorModal] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    hourly_rate: '',
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, user.role, user.auth_id]);

  async function loadData() {
    setLoading(true);
    try {
      if (user.role === 'Cleaner') {
        // Cleaner sieht nur sich selbst (über auth.users.id)
        const me = await getCleanerByUserId(user.auth_id);
        setCleaners(me ? [me] : []);
        if (!me) {
          setErrorModal({
            open: true,
            message: 'Kein persönlicher Cleaner-Datensatz gefunden.',
          });
        }
      } else {
        // Host sieht alle seine Cleaner
        const data = await getCleaners(user.id);
        setCleaners(data);
        if (data.length === 0) {
          // Freundliche Benutzer-Nachricht, keine technische Meldung
          setErrorModal({
            open: true,
            message: 'Sie haben noch keine Cleaner erstellt.',
          });
        }
      }
    } catch (e: any) {
      setErrorModal({
        open: true,
        message: e?.message ?? 'Fehler beim Laden der Cleaner',
      });
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
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

  function normalize(s: string) {
    return (s || '').trim().toLowerCase();
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

      // Duplikatprüfung nur bei Neuanlage
      if (!editingId) {
        const nameKey = normalize(payload.name);
        const emailKey = normalize(payload.email ?? '');
        const duplicate =
          cleaners.some((c) => normalize(c.name) === nameKey) ||
          (!!emailKey && cleaners.some((c) => normalize(c.email || '') === emailKey));

        if (duplicate) {
          setErrorModal({
            open: true,
            message: payload.email
              ? `Cleaner "${payload.name}" oder "${payload.email}" existiert bereits.`
              : `Cleaner "${payload.name}" existiert bereits.`,
          });
          return;
        }
      }

      if (editingId) {
        await updateCleaner(editingId, {
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          hourly_rate: payload.hourly_rate,
        });
      } else {
        try {
          const res = await createCleanerAndInvite(payload);
          const msg = String((res as any)?.message ?? '').toLowerCase();
          const err = String((res as any)?.error ?? '').toLowerCase();
          if (
            msg.includes('already exists') ||
            err.includes('already exists') ||
            err.includes('duplicate')
          ) {
            setErrorModal({
              open: true,
              message: `Cleaner "${payload.name}" / "${payload.email}" existiert bereits.`,
            });
            return;
          }
        } catch (err: any) {
          const m = String(err?.message ?? '').toLowerCase();
          setErrorModal({
            open: true,
            message: m.includes('already exists') || m.includes('duplicate')
              ? `Cleaner "${payload.name}" existiert bereits.`
              : 'Fehler beim Erstellen des Cleaners.',
          });
          return;
        }
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorModal({
        open: true,
        message: err?.message ?? 'Unbekannter Fehler beim Speichern',
      });
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
      setErrorModal({
        open: true,
        message: error?.message ?? 'Löschen fehlgeschlagen',
      });
    }
  }

  if (loading) return <div className="text-white">Loading...</div>;

  const getAvailCount = (c: Cleaner) => {
    const a: any = (c as any).availability;
    return Array.isArray(a) ? a.length : 0;
  };

  const canCreate = user.role === 'Host';

  return (
    <div>
      {/* Header */}
      <div className="relative z-[50] flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          {user.role === 'Cleaner' ? 'Mein Profil' : 'Reinigungskräfte'}
        </h2>

        {canCreate && (
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 bg-white text-black hover:bg-white/90 transition-colors font-medium flex items-center gap-2 rounded-md focus:outline-none focus:ring focus:ring-white/50"
          >
            <Plus className="w-5 h-5" />
            Add Cleaner
          </button>
        )}
      </div>

      {/* Info Box */}
      {canCreate && (
        <div className="mb-6 bg-blue-500/10 border border-blue-500/30 p-4 text-blue-400 text-sm rounded-lg">
          <p className="font-medium mb-2">How Cleaner Invitations Work:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Add a cleaner with their email address (or phone).</li>
            <li>A magic link is sent for first-time login.</li>
            <li>Role is automatically set to <b>Cleaner</b>.</li>
            <li>Cleaner can then log in and set their password.</li>
          </ol>
        </div>
      )}

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
                {typeof cleaner.hourly_rate === 'number' && (
                  <p className="text-white/50 text-sm">
                    Rate: €{Number(cleaner.hourly_rate).toFixed(2)}/hour
                  </p>
                )}

                <p className="text-white/40 text-xs mt-2">
                  Unavailable days: {getAvailCount(cleaner)}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(cleaner)}
                  className="p-2 rounded-md hover:bg-white/10 transition-colors"
                >
                  <Edit className="w-5 h-5 text-white" />
                </button>

                {canCreate && (
                  <button
                    type="button"
                    onClick={() => handleDelete(cleaner)}
                    className="p-2 rounded-md hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {cleaners.length === 0 && (
          <div className="text-center py-12 text-white/50">
            Sie haben noch keine Cleaner erstellt.
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {canCreate && (
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
      )}

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

      {/* Error / Hinweis Popup */}
      {errorModal.open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 text-white border border-white/20 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-semibold mb-3">Hinweis</h3>
            <p className="text-white/80 mb-6">{errorModal.message}</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setErrorModal({ open: false, message: '' })}
                className="px-5 py-2 bg-white text-black font-semibold rounded-md hover:bg-white/80 transition-colors"
              >
                Zurück
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cleaners;

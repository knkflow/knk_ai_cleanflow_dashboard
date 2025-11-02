import { useEffect, useState, FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Lightbulb, Edit, Trash2, Mail, Phone, Euro } from 'lucide-react';
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

  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, user.role, user.auth_id]);

  async function loadData() {
    setLoading(true);
    try {
      if (user.role === 'Cleaner') {
        const me = await getCleanerByUserId(user.auth_id);
        setCleaners(me ? [me] : []);
      } else {
        const data = await getCleaners(user.id);
        setCleaners(data);
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
        await updateCleaner(editingId, payload);
      } else {
        await createCleanerAndInvite(payload);
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorModal({
        open: true,
        message: err?.message ?? 'Fehler beim Speichern',
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
  const canCreate = user.role === 'Host';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          {user.role === 'Cleaner' ? 'Mein Profil' : 'Reinigungskräfte'}
        </h2>

        {canCreate && (
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 bg-white text-black hover:bg-white/90 transition-colors font-medium flex items-center gap-2 rounded-md"
          >
            <Plus className="w-5 h-5" />
            Reinigungskraft hinzufügen
          </button>
        )}
      </div>

      {/* Info-Box */}
      {canCreate && (
        <div className="hidden md:block mb-6 bg-blue-500/10 border border-blue-500/30 p-4 text-blue-400 text-sm rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-5 h-5 text-blue-400" />
            <p className="font-medium">So funktioniert die Einladung:</p>
          </div>
          <ol className="list-decimal list-inside space-y-1">
            <li>Füge eine Reinigungskraft mit E-Mail oder Telefonnummer hinzu.</li>
            <li>Sie erhält automatisch einen Einladungslink.</li>
            <li>Die Rolle wird automatisch auf <b>Cleaner</b> gesetzt.</li>
            <li>Nach dem ersten Login kann ein Passwort festgelegt werden.</li>
          </ol>
        </div>
      )}

      {/* Cleaner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {cleaners.map((cleaner) => (
          <div
            key={cleaner.id}
            className="
              bg-white/5 border border-white/10 p-4 sm:p-5 rounded-2xl
              transition-all duration-500
              hover:border-2 hover:border-white
              hover:shadow-[0_0_15px_2px_rgba(255,255,255,0.45)]
            "
          >
            <div className="mb-3 flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">{cleaner.name}</h3>
              {cleaner.user_id ? (
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[11px] font-medium rounded-md">
                  REGISTERED
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[11px] font-medium rounded-md">
                  PENDING
                </span>
              )}
            </div>

            <div className="space-y-1">
              {cleaner.email && (
                <p className="text-white/70 text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-white/60" />
                  {cleaner.email}
                </p>
              )}
              {cleaner.phone && (
                <p className="text-white/60 text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4 text-white/50" />
                  {cleaner.phone}
                </p>
              )}
              {typeof cleaner.hourly_rate === 'number' && (
                <p className="text-white/50 text-sm flex items-center gap-2">
                  <Euro className="w-4 h-4 text-white/40" />
                  Rate: €{Number(cleaner.hourly_rate).toFixed(2)}/hour
                </p>
              )}
              <p className="text-white/40 text-xs pt-1">
                Unavailable days:{' '}
                {Array.isArray((cleaner as any).availability)
                  ? (cleaner as any).availability.length
                  : 0}
              </p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
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
        ))}

        {cleaners.length === 0 && (
          <div className="col-span-full text-center py-12 text-white/50">
            Sie haben noch keine Cleaner erstellt.
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? 'Cleaner bearbeiten' : 'Cleaner hinzufügen'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              placeholder="Vor- und Nachname"
              value={formData.name}
              onChange={(e: any) => setFormData((p) => ({ ...p, name: e.target.value }))}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="E-Mail (optional)"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e: any) => setFormData((p) => ({ ...p, email: e.target.value }))}
              />
              <Input
                label="Telefon (optional)"
                type="tel"
                placeholder="+49 ..."
                value={formData.phone}
                onChange={(e: any) => setFormData((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>

            <Input
              label="Stundenlohn (optional)"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="z. B. 18.50"
              value={formData.hourly_rate}
              onChange={(e: any) => setFormData((p) => ({ ...p, hourly_rate: e.target.value }))}
            />

            {/* Hinweis zur Einladung */}
            <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg text-blue-300 text-sm">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                <span>
                  Beim Speichern erhält die Reinigungskraft automatisch einen Einladungslink (Magic Link).
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-white/30 text-white rounded-md hover:border-white/60 transition-colors"
                disabled={submitting}
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-white text-black font-semibold rounded-md hover:bg-white/90 transition-colors disabled:opacity-70"
                disabled={submitting || !formData.name.trim()}
              >
                {submitting ? (editingId ? 'Speichern…' : 'Einladen…') : (editingId ? 'Speichern' : 'Einladen')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm + Error Popups */}
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

      {errorModal.open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 text-white border border-white/20 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-semibold mb-3">Hinweis</h3>
            <p className="text-white/80 mb-6">{errorModal.message}</p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setErrorModal({ open: false, message: '' })}
                className="px-5 py-2 bg-white text-black font-semibold rounded-md hover:bg:white/80 transition-colors"
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

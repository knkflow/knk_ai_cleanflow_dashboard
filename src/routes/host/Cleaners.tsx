// src/routes/host/Cleaners.tsx  (nur Styles angepasst)
import { useEffect, useState, FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Lightbulb, Edit, Trash2, Mail, Phone, Euro } from 'lucide-react';
import { getCleaners, getCleanerByUserId, updateCleaner, deleteCleanerCascade, createCleanerAndInvite } from '../../lib/api';
import { Modal } from '../../components/forms/Modal';
import { Input } from '../../components/forms/Input';
import type { User, Cleaner } from '../../types/db';

interface ContextType { user: User; }

export function Cleaners() {
  const { user } = useOutletContext<ContextType>();

  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedCleaner, setSelectedCleaner] = useState<Cleaner | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [errorModal, setErrorModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', hourly_rate: '' });
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);

  useEffect(() => { loadData(); }, [user.id, user.role, user.auth_id]);

  async function loadData() {
    setLoading(true);
    try {
      if (user.role === 'Cleaner') {
        const me = await getCleanerByUserId(user.auth_id);
        setCleaners(me ? [me] : []);
        if (!me) setErrorModal({ open: true, message: 'Kein persönlicher Cleaner-Datensatz gefunden.' });
      } else {
        const data = await getCleaners(user.id);
        setCleaners(data);
        if (data.length === 0) setErrorModal({ open: true, message: 'Sie haben noch keine Cleaner erstellt.' });
      }
    } catch (e: any) {
      setErrorModal({ open: true, message: e?.message ?? 'Fehler beim Laden der Cleaner' });
    } finally { setLoading(false); }
  }

  function openCreateModal() {
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', hourly_rate: '' });
    setIsModalOpen(true);
  }

  function openEditModal(c: Cleaner) {
    setEditingId(c.id);
    setFormData({
      name: c.name,
      email: c.email || '',
      phone: c.phone || '',
      hourly_rate: c.hourly_rate?.toString() || '',
    });
    setIsModalOpen(true);
  }

  function normalize(s: string) { return (s || '').trim().toLowerCase(); }

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

      if (!editingId) {
        const nameKey = normalize(payload.name);
        const emailKey = normalize(payload.email ?? '');
        const duplicate =
          cleaners.some((c) => normalize(c.name) === nameKey) ||
          (!!emailKey && cleaners.some((c) => normalize(c.email || '') === emailKey));
        if (duplicate) {
          setErrorModal({ open: true, message: payload.email ? `Cleaner "${payload.name}" oder "${payload.email}" existiert bereits.` : `Cleaner "${payload.name}" existiert bereits.` });
          return;
        }
      }

      if (editingId) {
        await updateCleaner(editingId, { name: payload.name, email: payload.email, phone: payload.phone, hourly_rate: payload.hourly_rate });
      } else {
        try {
          const res = await createCleanerAndInvite(payload);
          const msg = String((res as any)?.message ?? '').toLowerCase();
          const err = String((res as any)?.error ?? '').toLowerCase();
          if (msg.includes('already exists') || err.includes('already exists') || err.includes('duplicate')) {
            setErrorModal({ open: true, message: `Cleaner "${payload.name}" / "${payload.email}" existiert bereits.` });
            return;
          }
        } catch (err: any) {
          const m = String(err?.message ?? '').toLowerCase();
          setErrorModal({ open: true, message: m.includes('already exists') || m.includes('duplicate') ? `Cleaner "${payload.name}" existiert bereits.` : 'Fehler beim Erstellen des Cleaners.' });
          return;
        }
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorModal({ open: true, message: err?.message ?? 'Unbekannter Fehler beim Speichern' });
    } finally { setSubmitting(false); }
  }

  function handleDelete(c: Cleaner) { setSelectedCleaner(c); setIsConfirmOpen(true); }
  async function handleDeleteConfirmed() {
    if (!selectedCleaner) return;
    try { await deleteCleanerCascade(selectedCleaner.id); setIsConfirmOpen(false); await loadData(); }
    catch (error: any) { setErrorModal({ open: true, message: error?.message ?? 'Löschen fehlgeschlagen' }); }
  }

  if (loading) return <div className="text-gray-900">Loading...</div>;

  const getAvailCount = (c: Cleaner) => {
    const a: any = (c as any).availability;
    return Array.isArray(a) ? a.length : 0;
  };
  const canCreate = user.role === 'Host';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{user.role === 'Cleaner' ? 'Mein Profil' : 'Reinigungskräfte'}</h2>
        {canCreate && (
          <button type="button" onClick={openCreateModal} className="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium flex items-center gap-2 rounded-md">
            <Plus className="w-5 h-5" /> Add Cleaner
          </button>
        )}
      </div>

      {canCreate && (
        <>
          <div className="md:hidden mb-6">
            <button
              type="button"
              onClick={() => setMobileInfoOpen((v) => !v)}
              aria-expanded={mobileInfoOpen}
              aria-controls="invite-info-mobile"
              className="w-full flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-500 text-white shadow active:scale-[0.99] transition-all"
            >
              <Lightbulb className="w-5 h-5" />
              <span className="font-medium">So funktioniert die Einladung</span>
            </button>
            {mobileInfoOpen && (
              <div id="invite-info-mobile" className="mt-3 bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm rounded-xl">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Cleaner mit E-Mail oder Telefon hinzufügen.</li>
                  <li>Sie erhalten automatisch einen Einladungslink.</li>
                  <li>Rolle automatisch <b>Cleaner</b>.</li>
                  <li>Nach erstem Login Passwort festlegen.</li>
                </ol>
              </div>
            )}
          </div>

          <div className="hidden md:block mb-6 bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5" />
              <p className="font-medium">So funktioniert die Einladung</p>
            </div>
            <ol className="list-decimal list-inside space-y-1">
              <li>Cleaner mit E-Mail oder Telefon hinzufügen.</li>
              <li>Automatischer Einladungslink.</li>
              <li>Rolle <b>Cleaner</b>.</li>
              <li>Erstes Login → Passwort setzen.</li>
            </ol>
          </div>
        </>
      )}

      <div className="grid gap-4">
        {cleaners.map((c) => (
          <div key={c.id} className="bg-white border border-gray-200 p-6 rounded-2xl hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{c.name}</h3>
                  {c.user_id ? (
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-md border border-emerald-200">REGISTERED</span>
                  ) : (
                    <span className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-md border border-yellow-200">PENDING</span>
                  )}
                </div>

                {c.email && <p className="text-gray-700 text-sm mb-1 flex items-center gap-2"><Mail className="w-4 h-4 text-gray-500" />{c.email}</p>}
                {c.phone && <p className="text-gray-600 text-sm mb-1 flex items-center gap-2"><Phone className="w-4 h-4 text-gray-500" />{c.phone}</p>}
                {typeof c.hourly_rate === 'number' && (
                  <p className="text-gray-500 text-sm flex items-center gap-2"><Euro className="w-4 h-4 text-gray-400" />Rate: €{Number(c.hourly_rate).toFixed(2)}/hour</p>
                )}
                <p className="text-gray-400 text-xs mt-2">Unavailable days: {getAvailCount(c)}</p>
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => openEditModal(c)} className="p-2 rounded-md hover:bg-gray-100 transition-colors">
                  <Edit className="w-5 h-5 text-gray-900" />
                </button>
                {canCreate && (
                  <button type="button" onClick={() => handleDelete(c)} className="p-2 rounded-md hover:bg-red-50 transition-colors">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {cleaners.length === 0 && <div className="text-center py-12 text-gray-500">Sie haben noch keine Cleaner erstellt.</div>}
      </div>

      {canCreate && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Cleaner' : 'Add Cleaner'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="Full name" />
            <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" />
            <Input label="Phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+49 123 456789" />
            <Input label="Hourly Rate (€)" type="number" step="0.01" min="0" value={formData.hourly_rate} onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })} placeholder="15.00" />
            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60 transition-colors font-medium rounded-md">
                {submitting ? 'Saving…' : editingId ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => setIsModalOpen(false)} disabled={submitting} className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-60 transition-colors rounded-md">
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {isConfirmOpen && selectedCleaner && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white text-gray-900 border border-gray-200 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-semibold mb-3">Wirklich entfernen?</h3>
            <p className="text-gray-700 mb-6">
              Möchten Sie den Cleaner <span className="text-gray-900 font-semibold">{selectedCleaner.name}</span> wirklich dauerhaft löschen?
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsConfirmOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-800 hover:bg-gray-100 transition-colors rounded-md">
                Abbrechen
              </button>
              <button type="button" onClick={handleDeleteConfirmed} className="px-5 py-2 bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors rounded-md">
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}

      {errorModal.open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white text-gray-900 border border-gray-200 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-semibold mb-3">Hinweis</h3>
            <p className="text-gray-700 mb-6">{errorModal.message}</p>
            <div className="flex justify-end">
              <button type="button" onClick={() => setErrorModal({ open: false, message: '' })} className="px-5 py-2 bg-emerald-500 text-white font-semibold rounded-md hover:bg-emerald-600 transition-colors">
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

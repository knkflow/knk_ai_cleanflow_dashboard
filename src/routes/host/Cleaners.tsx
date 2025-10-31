import { useEffect, useState, FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
  getCleaners,
  updateCleaner,
  deleteCleanerCascade, // 🧩 geändert – richtige Delete-Funktion
  createCleanerAndInvite, // 🧩 neu hinzugefügt – aus lib/api.ts
} from '../../lib/api'; // ✅ importiere beide aus deiner API

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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    hourly_rate: '',
  });

  useEffect(() => {
    loadData();
  }, [user.id]);

  async function loadData() {
    try {
      const data = await getCleaners(user.id);
      setCleaners(data);
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
        // 🧩 richtiger Funktionsname laut Supabase Dashboard:
        const result = await createCleanerAndInvite(payload);

        if (!result?.ok) {
          throw new Error(result?.error || 'Edge Function error');
        }

        console.log('✅ Cleaner created:', result);
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message ?? 'Unbekannter Fehler beim Speichern');
    }
  }

  function handleDelete(cleaner: Cleaner) {
    setSelectedCleaner(cleaner);
    setIsConfirmOpen(true);
  }

  async function handleDeleteConfirmed() {
    if (!selectedCleaner) return;
    try {
      // 🧩 Aufruf deiner Edge Function
      await deleteCleanerCascade(selectedCleaner.id);

      setIsConfirmOpen(false);
      await loadData();
    } catch (error: any) {
      alert(error.message ?? 'Löschen fehlgeschlagen');
    }
  }

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Reinigungskräfte</h2>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-white text-black hover:bg-white/90 transition-colors font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Cleaner
        </button>
      </div>

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
                  Unavailable days: {cleaner.availability.length}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(cleaner)}
                  className="p-2 rounded-md hover:bg-white/10 transition-colors"
                  title="Edit"
                >
                  <Edit className="w-5 h-5 text-white" />
                </button>
                <button
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
    </div>
  );
}

// src/routes/host/Tasks.tsx
import { useEffect, useState, FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Plus,
  RotateCcw,
  AlertCircle,
  Edit,
  Trash2,
  CalendarDays,
  User as User_Icon,
  StickyNote,
  AlarmClock,
  Lightbulb,
} from 'lucide-react';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getApartments,
  getCleaners,
} from '../../lib/api';
import { Modal } from '../../components/forms/Modal';
import { Input } from '../../components/forms/Input';
import { Select } from '../../components/forms/Select';
import { isValidDateString } from '../../lib/dates';
import type {
  User,
  CleaningTaskWithDetails,
  ApartmentWithCleaner,
  Cleaner,
} from '../../types/db';

interface ContextType {
  user: User;
}

export function Tasks() {
  const { user } = useOutletContext<ContextType>();
  const [tasks, setTasks] = useState<CleaningTaskWithDetails[]>([]);
  const [apartments, setApartments] = useState<ApartmentWithCleaner[]>([]);
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] =
    useState<CleaningTaskWithDetails | null>(null);

  const [quickFilters, setQuickFilters] = useState<string[]>([]);
  const [apartmentQuery, setApartmentQuery] = useState('');
  const [cleanerQuery, setCleanerQuery] = useState('');
  const [withDeadlineOnly, setWithDeadlineOnly] = useState(false);

  const [formData, setFormData] = useState({
    listing_id: '',
    cleaner_id: '',
    date: '',
    deadline: '',
    note: '',
  });

  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);

  function parseISODateYMD(dateStr: string): Date | null {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
    const [y, m, d] = dateStr.split('-').map((n) => parseInt(n, 10));
    const dt = new Date(y, m - 1, d, 0, 0, 0, 0);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d)
      return null;
    return dt;
  }

  function formatDisplayDate(dateStr?: string | null): string {
    if (!dateStr) return '';
    const dt = parseISODateYMD(dateStr);
    if (!dt) return dateStr;

    const parts = new Intl.DateTimeFormat('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Europe/Berlin',
    }).formatToParts(dt);

    let wd = parts.find((p) => p.type === 'weekday')?.value ?? '';
    wd = wd.replace(/\.$/, '');
    const day = parts.find((p) => p.type === 'day')?.value ?? '';
    const month = parts.find((p) => p.type === 'month')?.value ?? '';
    const year = parts.find((p) => p.type === 'year')?.value ?? '';

    return `${wd}, ${day}.${month}.${year}`;
  }

  function startOfWeek(d = new Date()) {
    const date = new Date(d);
    const day = (date.getDay() + 6) % 7;
    date.setDate(date.getDate() - day);
    date.setHours(0, 0, 0, 0);
    return date;
  }
  function endOfWeek(d = new Date()) {
    const s = startOfWeek(d);
    const e = new Date(s);
    e.setDate(s.getDate() + 6);
    e.setHours(23, 59, 59, 999);
    return e;
  }

  useEffect(() => {
    loadData();
  }, [user.id]);

  async function loadData() {
    setLoading(true);
    try {
      const [tasksRes, apartmentsRes, cleanersRes] = await Promise.allSettled([
        getTasks(user.id),
        getApartments(user.id),
        getCleaners(user.id),
      ]);

      if (apartmentsRes.status === 'fulfilled') setApartments(apartmentsRes.value);
      if (cleanersRes.status === 'fulfilled') setCleaners(cleanersRes.value);
      if (tasksRes.status === 'fulfilled') {
        setTasks(tasksRes.value);
      } else {
        console.error('getTasks failed:', tasksRes.reason);
        setTasks([]);
      }
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingId(null);
    setFormData({
      listing_id: '',
      cleaner_id: '',
      date: '',
      deadline: '',
      note: '',
    });
    setIsModalOpen(true);
  }

  function openEditModal(task: CleaningTaskWithDetails) {
    setEditingId(task.id);
    setFormData({
      listing_id: task.listing_id,
      cleaner_id: task.cleaner_id || '',
      date: task.date,
      deadline: task.deadline || '',
      note: task.note || '',
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const data = {
        listing_id: formData.listing_id,
        cleaner_id: formData.cleaner_id || null,
        date: formData.date,
        deadline: formData.deadline || null,
        note: formData.note || null,
      };
      if (editingId) await updateTask(editingId, data);
      else await createTask(data);
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      console.error(error);
    }
  }

  function openDeleteModal(task: CleaningTaskWithDetails) {
    setTaskToDelete(task);
  }

  async function confirmDelete() {
    if (!taskToDelete) return;
    try {
      await deleteTask(taskToDelete.id);
      setTaskToDelete(null);
      loadData();
    } catch (error: any) {
      console.error(error);
    }
  }

  function getCleanerById(id?: string | null) {
    if (!id) return undefined;
    return cleaners.find((c) => c.id === id);
  }

  function isCleanerUnavailableForDate(
    cleaner: Cleaner,
    dateStr: string | null | undefined
  ): boolean {
    if (!dateStr) return false;
    const availability = (cleaner as any)?.availability;
    return Array.isArray(availability) && availability.includes(dateStr);
  }

  function isCleanerAvailableForDate(
    cleaner: Cleaner,
    dateStr: string | null | undefined
  ): boolean {
    if (!dateStr || !isValidDateString(dateStr)) return true;
    return !isCleanerUnavailableForDate(cleaner, dateStr);
  }

  function isCleanerUnavailable(task: CleaningTaskWithDetails): boolean {
    if (!task.cleaner_id) return false;
    const cleaner = getCleanerById(task.cleaner_id);
    if (!cleaner) return false;
    return isCleanerUnavailableForDate(cleaner, task.date);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const sow = startOfWeek(today);
  const eow = endOfWeek(today);

  function isInQuickRanges(dateStr: string) {
    if (quickFilters.length === 0 || quickFilters.includes('ALL')) return true;
    const d = parseISODateYMD(dateStr);
    if (!d) return false;

    const checks: boolean[] = [];
    if (quickFilters.includes('TODAY')) checks.push(d.getTime() === today.getTime());
    if (quickFilters.includes('TOMORROW'))
      checks.push(d.getTime() === tomorrow.getTime());
    if (quickFilters.includes('THIS_WEEK')) checks.push(d >= sow && d <= eow);
    return checks.some(Boolean);
  }

  const filteredTasks = tasks.filter((t) => {
    if (!isInQuickRanges(t.date)) return false;
    if (apartmentQuery.trim()) {
      const q = apartmentQuery.toLowerCase();
      const name = (t.apartment?.name || '').toLowerCase();
      const addr = (t.apartment?.address || '').toLowerCase();
      if (!name.includes(q) && !addr.includes(q)) return false;
    }
    if (cleanerQuery.trim()) {
      const cq = cleanerQuery.toLowerCase();
      const cn = (getCleanerById(t.cleaner_id)?.name || '').toLowerCase();
      if (!cn.includes(cq)) return false;
    }
    if (withDeadlineOnly && !t.deadline) return false;
    return true;
  });

  function toggleQuickFilter(id: 'TODAY' | 'TOMORROW' | 'THIS_WEEK' | 'ALL') {
    setQuickFilters((prev) => {
      if (id === 'ALL') return prev.includes('ALL') ? [] : ['ALL'];
      const base = prev.filter((x) => x !== 'ALL');
      return base.includes(id) ? base.filter((x) => x !== id) : [...base, id];
    });
  }

  function resetFilters() {
    setQuickFilters([]);
    setApartmentQuery('');
    setCleanerQuery('');
    setWithDeadlineOnly(false);
  }

  if (loading) return <div className="text-gray-900">Loading...</div>;

  const cleanerOptionsForDate = [
    { value: '', label: 'Stammreinigungskraft' },
    ...cleaners
      .filter((c) => isCleanerAvailableForDate(c, formData.date))
      .map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Geplante Reinigungen</h2>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium flex items-center gap-2 rounded-md"
        >
          <Plus className="w-5 h-5" />
          Reinigung hinzufügen
        </button>
      </div>

      {/* Info Box (responsive) */}
      <div className="md:hidden mb-6">
        <button
          type="button"
          onClick={() => setMobileInfoOpen((v) => !v)}
          aria-expanded={mobileInfoOpen}
          aria-controls="cleanflow-info-mobile"
          className="w-full flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-500 text-white shadow active:scale-[0.99] transition-all"
        >
          <Lightbulb className="w-5 h-5" />
          <span className="font-medium">Wie entsteht der Reinigungsplan?</span>
        </button>

        {mobileInfoOpen && (
          <div
            id="cleanflow-info-mobile"
            className="mt-3 bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm rounded-xl"
          >
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Cleanflow ist mit dem PMS (Property Management System) Ihrer Wahl
                verbunden (z. B. Guesty).
              </li>
              <li>
                Neue/änderte/stornierte Reservierungen werden in Echtzeit synchronisiert.
              </li>
              <li>
                Aufgaben lassen sich zuweisen und mit Notizen für Cleaner versehen.
              </li>
              <li>
                Cleaner erhalten Tagespläne & Live-Updates per WhatsApp/Dashboard.
              </li>
            </ol>
          </div>
        )}
      </div>

      <div className="hidden md:block mb-6 bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-5 h-5" />
          <p className="font-medium">Wie entsteht Cleanflow&apos;s Reinigungsplan?</p>
        </div>
        <ol className="list-decimal list-inside space-y-1">
          <li>PMS verbinden (z. B. Guesty, Airbnb).</li>
          <li>Echtzeit-Sync der Reservierungen → Aufgaben entstehen automatisch.</li>
          <li>Zuweisen/Notieren, falls spezielle Hinweise nötig sind.</li>
          <li>Tagespläne & Live-Updates für Cleaner.</li>
        </ol>
      </div>

      {/* Filter */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {[
            { id: 'TODAY', label: 'Heute' },
            { id: 'TOMORROW', label: 'Morgen' },
            { id: 'THIS_WEEK', label: 'Diese Woche' },
            { id: 'ALL', label: 'Alle' },
          ].map((btn) => {
            const selected = quickFilters.includes(btn.id);
            return (
              <button
                key={btn.id}
                onClick={() => toggleQuickFilter(btn.id as any)}
                className={`px-4 py-2 rounded-full text-sm transition-all duration-300 border ${
                  selected
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 shadow-sm'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                {btn.label}
              </button>
            );
          })}

          <button
            onClick={resetFilters}
            className="ml-1 px-4 py-2 rounded-full text-sm transition-all duration-300 border border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 flex items-center gap-2"
            title="Filter zurücksetzen"
          >
            <RotateCcw className="w-4 h-4" />
            Zurücksetzen
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            value={apartmentQuery}
            onChange={(e) => setApartmentQuery(e.target.value)}
            placeholder="Nach Name/Adresse des Apartments suchen"
            className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 text-sm rounded-md placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
          <input
            type="text"
            value={cleanerQuery}
            onChange={(e) => setCleanerQuery(e.target.value)}
            placeholder="Nach Reinigungskraft suchen"
            className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 text-sm rounded-md placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 select-none">
            <input
              type="checkbox"
              checked={withDeadlineOnly}
              onChange={(e) => setWithDeadlineOnly(e.target.checked)}
              className="h-4 w-4 rounded border-gray-400 text-emerald-600 focus:ring-emerald-300"
            />
            Nur Reinigungen mit Frist anzeigen?
          </label>
        </div>
      </div>

      {/* Task Cards */}
      <div className="grid gap-4">
        {filteredTasks.map((task) => {
          const unavailable = isCleanerUnavailable(task);
          const taskCleaner = getCleanerById(task.cleaner_id);

          return (
            <div
              key={task.id}
              className={`p-6 rounded-2xl transition-all duration-300 ${
                unavailable
                  ? 'border-2 border-red-300 bg-red-50'
                  : 'bg-white border border-gray-200 hover:shadow-md'
              }`}
            >
              {unavailable && (
                <div className="flex items-center gap-2 mb-3 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>
                    Die zugeordnete Reinigungskraft ist am Tag der Reinigung nicht
                    verfügbar.
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {task.apartment?.name || 'Unknown Apartment'}
                    </h3>

                    {task.deadline && (
                      <span
                        className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-300 inline-flex items-center gap-1.5"
                        title="Deadline"
                      >
                        <AlarmClock className="w-3.5 h-3.5" />
                        Frist bis {formatDisplayDate(task.deadline)}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-700 text-sm mb-1 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-gray-500" />
                    <span>Tag der Reinigung: {formatDisplayDate(task.date)}</span>
                  </p>

                  {taskCleaner && (
                    <p className="text-gray-700 text-sm mb-1 flex items-center gap-2">
                      <User_Icon className="w-4 h-4 text-gray-500" />
                      <span>Reinigungskraft: {taskCleaner.name}</span>
                    </p>
                  )}

                  {!taskCleaner && (
                    <p className="text-gray-700 text-sm mb-1 flex items-center gap-2">
                      <User_Icon className="w-4 h-4 text-gray-500" />
                      <span>
                        Stammreinigungskraft von Apartment{' '}
                        {task.apartment?.name || 'Unknown Apartment'}
                      </span>
                    </p>
                  )}

                  {task.note && (
                    <div className="mt-3 inline-flex items-start gap-2 rounded-md border border-gray-200 text-gray-700 font-medium text-sm px-3 py-2 bg-gray-50">
                      <StickyNote className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
                      <span>{task.note}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(task)}
                    className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5 text-gray-700" />
                  </button>

                  <button
                    onClick={() => openDeleteModal(task)}
                    className="p-2 rounded-md hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Keine Reinigungen gefunden.
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Bestehende Reinigung bearbeiten' : 'Neue Reinigung erstellen'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Apartment"
            value={formData.listing_id}
            onChange={(e) =>
              setFormData({ ...formData, listing_id: e.target.value })
            }
            required
            options={[
              { value: '', label: 'Select apartment' },
              ...apartments.map((a) => ({
                value: String(a.listing_id),
                label: a.name,
              })),
            ]}
          />

          <Input
            label="Tag der Reinigung (yyyy-mm-dd)"
            value={formData.date}
            onChange={(e) => {
              const nextDate = e.target.value;
              const selectedCleaner = cleaners.find(
                (c) => c.id === formData.cleaner_id
              );
              const stillAvailable =
                !selectedCleaner ||
                isCleanerAvailableForDate(selectedCleaner, nextDate);
              setFormData({
                ...formData,
                date: nextDate,
                cleaner_id: stillAvailable ? formData.cleaner_id : '',
              });
            }}
            required
            placeholder="2025-12-31"
          />

          <Select
            label="Reinigungskraft (Optional)"
            value={formData.cleaner_id}
            onChange={(e) =>
              setFormData({ ...formData, cleaner_id: e.target.value })
            }
            options={cleanerOptionsForDate}
          />

          <Input
            label="Frist (yyyy-mm-dd)"
            value={formData.deadline}
            onChange={(e) =>
              setFormData({ ...formData, deadline: e.target.value })
            }
            placeholder="2025-12-31"
          />

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Notiz (Fügen Sie hier weitere Anweisungen für die Reinigungskraft
              hinzu)
            </label>
            <textarea
              value={formData.note}
              onChange={(e) =>
                setFormData({ ...formData, note: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none rounded-md"
              placeholder="Zwei neue Bettlaken mitbringen."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium rounded-md"
            >
              {editingId ? 'Aktualisieren' : 'Erstellen'}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors rounded-md"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      {taskToDelete && (
        <div
          aria-modal="true"
          role="dialog"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setTaskToDelete(null)}
          />
          <div className="relative w-full max-w-md bg-white text-gray-900 border border-gray-200 shadow-2xl rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Task löschen?</h3>

            <p className="text-gray-700 mb-6">
              Möchten Sie die Reinigung für{' '}
              <span className="font-semibold text-gray-900">
                {taskToDelete.apartment?.name || 'Unbekanntes Apartment'}
              </span>{' '}
              am{' '}
              <span className="font-semibold text-gray-900">
                {formatDisplayDate(taskToDelete.date) || 'Unbekanntes Datum'}
              </span>{' '}
              wirklich entfernen?
            </p>

            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors font-medium rounded-md"
              >
                Löschen
              </button>
              <button
                onClick={() => setTaskToDelete(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors rounded-md"
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
export default Tasks;

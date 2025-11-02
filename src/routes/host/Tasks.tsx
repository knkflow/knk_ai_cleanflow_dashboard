import { useEffect, useState, useMemo, FormEvent } from 'react';
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
  Lightbulb
} from 'lucide-react';
import { getTasks, createTask, updateTask, deleteTask, getApartments, getCleaners } from '../../lib/api';
import { Modal } from '../../components/forms/Modal';
import { Input } from '../../components/forms/Input';
import { Select } from '../../components/forms/Select';
import { isValidDateString } from '../../lib/dates';
import type { User, CleaningTaskWithDetails, ApartmentWithCleaner, Cleaner } from '../../types/db';

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
  const [taskToDelete, setTaskToDelete] = useState<CleaningTaskWithDetails | null>(null);

  // Live-Filter States
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

  // Neu: Mobile Info Toggle State
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);

  function parseISODateYMD(dateStr: string): Date | null {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
    const [y, m, d] = dateStr.split('-').map((n) => parseInt(n, 10));
    const dt = new Date(y, m - 1, d, 0, 0, 0, 0);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
    return dt;
  }

  // Anzeigeformat exakt: "Mi, 20.05.2025" (ohne Punkt nach Wochentag, mit Komma)
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

    let wd = parts.find(p => p.type === 'weekday')?.value ?? '';
    wd = wd.replace(/\.$/, ''); // Punkt am Ende entfernen (z.B. "Mi." -> "Mi")
    const day = parts.find(p => p.type === 'day')?.value ?? '';
    const month = parts.find(p => p.type === 'month')?.value ?? '';
    const year = parts.find(p => p.type === 'year')?.value ?? '';

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
    setFormData({ listing_id: '', cleaner_id: '', date: '', deadline: '', note: '' });
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

  // Helper: Cleaner per ID holen
  function getCleanerById(id?: string | null) {
    if (!id) return undefined;
    return cleaners.find((c) => c.id === id);
  }

  // Prüft, ob der Cleaner an diesem Tag UNavailable ist (Datenfeld enthält gesperrte Tage)
  function isCleanerUnavailableForDate(cleaner: Cleaner, dateStr: string | null | undefined): boolean {
    if (!dateStr) return false;
    const availability = (cleaner as any)?.availability;
    return Array.isArray(availability) && availability.includes(dateStr);
  }

  // Umkehrung: verfügbar, wenn nicht als unavailable markiert
  function isCleanerAvailableForDate(cleaner: Cleaner, dateStr: string | null | undefined): boolean {
    if (!dateStr || !isValidDateString(dateStr)) return true; // solange kein Datum gesetzt ist, alle zeigen
    return !isCleanerUnavailableForDate(cleaner, dateStr);
  }

  // Prüft für Badge auf der Karte
  function isCleanerUnavailable(task: CleaningTaskWithDetails): boolean {
    if (!task.cleaner_id) return false;
    const cleaner = getCleanerById(task.cleaner_id);
    if (!cleaner) return false;
    return isCleanerUnavailableForDate(cleaner, task.date);
  }

  // === Filter ===
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

    if (quickFilters.includes('TODAY')) {
      checks.push(d.getTime() === today.getTime());
    }
    if (quickFilters.includes('TOMORROW')) {
      checks.push(d.getTime() === tomorrow.getTime());
    }
    if (quickFilters.includes('THIS_WEEK')) {
      checks.push(d >= sow && d <= eow);
    }

    return checks.some(Boolean);
  }

  // Live-Filterung per useMemo (Apartmentname/Adresse & Cleaner-Name & QuickFilter & Deadline)
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
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
  }, [tasks, apartmentQuery, cleanerQuery, withDeadlineOnly, quickFilters]);

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

  if (loading) return <div className="text-white">Loading...</div>;

  // Cleaner-Optionen im Modal: nur Verfügbare für formData.date
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
        <h2 className="text-2xl font-bold text-white">Geplante Reinigungen</h2>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-white text-black hover:bg-white/90 transition-colors font-medium flex items-center gap-2 rounded-md"
        >
          <Plus className="w-5 h-5" />
          Reinigung hinzufügen
        </button>
      </div>

      {/* Info Box (responsive) */}
      {/* Mobile: Button + Collapsible */}
      <div className="md:hidden mb-6">
        <button
          type="button"
          onClick={() => setMobileInfoOpen((v) => !v)}
          aria-expanded={mobileInfoOpen}
          aria-controls="cleanflow-info-mobile"
          className="w-full flex items-center gap-2 px-4 py-3 rounded-full bg-blue-600 text-white shadow active:scale-[0.99] transition-all"
        >
          <Lightbulb className="w-5 h-5" />
          <span className="font-medium">Wie entsteht der Reinigungsplan?</span>
        </button>

        {mobileInfoOpen && (
          <div
            id="cleanflow-info-mobile"
            className="mt-3 bg-blue-500/10 border border-blue-500/30 p-4 text-blue-300 text-sm rounded-xl"
          >
            <ol className="list-decimal list-inside space-y-1">
              <li>Im Hintergrund ist Cleanflow mit dem PMS (Property Management System) ihrer Wahl verbunden (z. B. Guesty).</li>
              <li>Neue, geänderte und stornierte Reservierungen werden in Echtzeit mit Cleanflow synchronisiert. Entsprechende Reinigungen werden hinzugefügt oder gelöscht. </li>
              <li>Ordnen Sie geplanten Reinigungen eine andere Reinigungskraft zu oder geben Sie der Reinigungskraft spezifische Anweisungen als Notiz mit.</li>
              <li>Die Reinigungskräfte erhalten personalisierte Tagespläne und Live-Updates zu allen für sie relevanten Änderungen, per WhatsApp sowie über das Dashboard.</li>
            </ol>
          </div>
        )}
      </div>

      {/* Desktop/Tablet: alter Infokasten bleibt */}
      <div className="hidden md:block mb-6 bg-blue-500/10 border border-blue-500/30 p-4 text-blue-400 text-sm rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-5 h-5 text-blue-400" />
          <p className="font-medium">Wie entsteht Cleanflow&apos;s Reinigungsplan?</p>
        </div>

        <ol className="list-decimal list-inside space-y-1">
          <li>Im Hintergrund ist Cleanflow mit dem PMS (Property Management System) ihrer Wahl verbunden (z. B. Guesty).</li>
          <li>Neue, geänderte und stornierte Reservierungen werden in Echtzeit mit Cleanflow synchronisiert. Entsprechende Reinigungen werden hinzugefügt oder gelöscht. </li>
          <li>Ordnen Sie geplanten Reinigungen eine andere Reinigungskraft zu oder geben Sie der Reinigungskraft spezifische Anweisungen als Notiz mit.</li>
          <li>Die Reinigungskräfte erhalten personalisierte Tagespläne und Live-Updates zu allen für sie relevanten Änderungen, per WhatsApp sowie über das Dashboard.</li>
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
                className={`px-4 py-2 rounded-full text-sm transition-all duration-300
                border ${selected ? 'border-blue-400 bg-blue-500/10 shadow-[0_0_14px_rgba(59,130,246,0.45)]' : 'border-white/20'}
                hover:border-white hover:shadow-[0_0_12px_rgba(255,255,255,0.35)]
              `}
              >
                {btn.label}
              </button>
            );
          })}

          <button
            onClick={resetFilters}
            className="ml-1 px-4 py-2 rounded-full text-sm transition-all duration-300 border border-white/20
                     hover:border-white hover:shadow-[0_0_12px_rgba(255,255,255,0.35)] flex items-center gap-2"
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
            className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white text-sm rounded-md
                     placeholder-white/50 focus:outline-none focus:border-white"
          />
          <input
            type="text"
            value={cleanerQuery}
            onChange={(e) => setCleanerQuery(e.target.value)}
            placeholder="Nach Reinigungskraft suchen"
            className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white text-sm rounded-md
                     placeholder-white/50 focus:outline-none focus:border-white"
          />
          <label className="inline-flex items-center gap-2 text-sm text-white/80 select-none">
            <input
              type="checkbox"
              checked={withDeadlineOnly}
              onChange={(e) => setWithDeadlineOnly(e.target.checked)}
              className="h-4 w-4 appearance-none rounded border border-white/40 bg-transparent checked:bg-white/70 checked:border-white focus:ring-0 transition-colors duration-150"
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
              className={`p-6 rounded-2xl transition-all duration-500 ${
                unavailable
                  ? 'border-2 border-red-500 bg-red-500/5 hover:shadow-[0_0_20px_3px_rgba(255,80,80,0.45)]'
                  : 'bg-white/5 border border-white/10 hover:border-white hover:shadow-[0_0_15px_2px_rgba(255,255,255,0.45)]'
              }`}
            >
              {unavailable && (
                <div className="flex items-center gap-2 mb-3 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Die zugeordnete Reinigungskraft ist am Tag der Reinigung nicht verfügbar.</span>
                </div>
              )}

              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Titel + Deadline nebeneinander */}
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-xl font-semibold text-white">
                      {task.apartment?.name || 'Unknown Apartment'}
                    </h3>

                    {task.deadline && (
                      <span
                        className="px-3 py-1 text-xs font-semibold rounded-full
                                 bg-red-600/20 text-red-300 border border-red-500/60 inline-flex items-center gap-1.5"
                        title="Deadline"
                      >
                        <AlarmClock className="w-3.5 h-3.5" />
                        Frist bis {formatDisplayDate(task.deadline)}
                      </span>
                    )}
                  </div>

                  {/* Datum */}
                  <p className="text-white/70 text-sm mb-1 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-white/60" />
                    <span>Tag der Reinigung: {formatDisplayDate(task.date)}</span>
                  </p>

                  {/* Reinigungskraft */}
                  {taskCleaner && (
                    <p className="text-white/70 text-sm mb-1 flex items-center gap-2">
                      <User_Icon className="w-4 h-4 text-white/60" />
                      <span>Reinigungskraft: {taskCleaner.name}</span>
                    </p>
                  )}

                  {!taskCleaner && (
                    <p className="text-white/70 text-sm mb-1 flex items-center gap-2">
                      <User_Icon className="w-4 h-4 text-white/60" />
                      <span>
                        Stammreinigungskraft von Apartment {task.apartment?.name || 'Unknown Apartment'}
                      </span>
                    </p>
                  )}

                  {/* Notiz */}
                  {task.note && (
                    <div className="mt-3 inline-flex items-start gap-2 rounded-md border border-white/15 text-white/65 font-medium text-sm px-3 py-2 backdrop-blur-sm shadow-inner shadow-white/5 max-w-full break-words">
                      <StickyNote className="w-4 h-4 mt-0.5 text-white/60 flex-shrink-0" />
                      <span>{task.note}</span>
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(task)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5 text-white" />
                  </button>
                
                  <button
                    onClick={() => openDeleteModal(task)}
                    className="p-2 rounded-full hover:bg-red-500/20 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>

              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12 text-white/50">
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
            onChange={(e) => setFormData({ ...formData, listing_id: e.target.value })}
            required
            options={[
              { value: '', label: 'Select apartment' },
              ...apartments.map((a) => ({ value: String(a.listing_id), label: a.name })),
            ]}
          />

          <Input
            label="Tag der Reinigung (yyyy-mm-dd)"
            value={formData.date}
            onChange={(e) => {
              const nextDate = e.target.value;
              const selectedCleaner = cleaners.find((c) => c.id === formData.cleaner_id);
              const stillAvailable =
                !selectedCleaner || isCleanerAvailableForDate(selectedCleaner, nextDate);
              setFormData({
                ...formData,
                date: nextDate,
                cleaner_id: stillAvailable ? formData.cleaner_id : '', // reset, falls nicht mehr verfügbar
              });
            }}
            required
            placeholder="2025-12-31"
          />

          <Select
            label="Reinigungskraft (Optional)"
            value={formData.cleaner_id}
            onChange={(e) => setFormData({ ...formData, cleaner_id: e.target.value })}
            options={cleanerOptionsForDate}
          />

          <Input
            label="Frist (yyyy-mm-dd)"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            placeholder="2025-12-31"
          />

          <div>
            <label className="block text-sm font-medium text-white mb-2">Notiz (Fügen Sie hier weitere Anweisungen für die Reinigungskraft hinzu)</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white focus:border-white focus:outline-none"
              placeholder="Zwei neue Bettlacken mitbringen."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-white text-black hover:bg-white/90 transition-colors font-medium"
            >
              {editingId ? 'Aktualisieren' : 'Erstellen'}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 bg-white/10 text-white hover:bg-white/20 transition-colors"
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
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setTaskToDelete(null)}
          />
          <div className="relative w-full max-w-md bg-black text-white border border-white/10 shadow-2xl rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Task löschen?</h3>

            <p className="text-white/80 mb-6">
              Möchten Sie die Reinigung für{' '}
              <span className="font-semibold text-white">
                {taskToDelete.apartment?.name || 'Unbekanntes Apartment'}
              </span>{' '}
              am{' '}
              <span className="font-semibold text-white">
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

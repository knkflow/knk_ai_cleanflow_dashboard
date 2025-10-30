import { useEffect, useState, FormEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { getTasks, createTask, updateTask, deleteTask, getApartments, getCleaners } from '../../lib/api';
import { Modal } from '../../components/forms/Modal';
import { Input } from '../../components/forms/Input';
import { Select } from '../../components/forms/Select';
import { toDdMmYyyy, fromDdMmYyyy, isValidDateString } from '../../lib/dates';
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
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    cleanerId: '',
  });
  const [formData, setFormData] = useState({
    listing_id: '',
    cleaner_id: '',
    date: '',
    deadline: '',
    note: '',
  });

  useEffect(() => {
    loadData();
  }, [user.id, filters]);

  async function loadData() {
    setLoading(true);
    try {
      const [tasksRes, apartmentsRes, cleanersRes] = await Promise.allSettled([
        getTasks(user.id, {
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
          cleanerId: filters.cleanerId || undefined,
        }),
        getApartments(user.id),
        getCleaners(user.id),
      ]);
  
      if (apartmentsRes.status === 'fulfilled') {
        setApartments(apartmentsRes.value);
      } else {
        console.error('getApartments failed:', apartmentsRes.reason);
      }
  
      if (cleanersRes.status === 'fulfilled') {
        setCleaners(cleanersRes.value);
      } else {
        console.error('getCleaners failed:', cleanersRes.reason);
      }
  
      if (tasksRes.status === 'fulfilled') {
        setTasks(tasksRes.value);
      } else {
        console.error('getTasks failed:', tasksRes.reason);
        // Optional: setTasks([]) explizit, oder alten Zustand behalten
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

      if (editingId) {
        await updateTask(editingId, data);
      } else {
        await createTask(data);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  }

  function isCleanerUnavailable(task: CleaningTaskWithDetails): boolean {
    if (!task.cleaner || !isValidDateString(task.date)) return false;
    return task.cleaner.availability.includes(task.date);
  }

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Cleaning Tasks</h2>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-white text-black hover:bg-white/90 transition-colors font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/5 border border-white/10">
        <div>
          <label className="block text-sm text-white/70 mb-2">From Date</label>
          <input
            type="text"
            placeholder="dd-MM-yyyy"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-white/70 mb-2">To Date</label>
          <input
            type="text"
            placeholder="dd-MM-yyyy"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-white/70 mb-2">Cleaner</label>
          <select
            value={filters.cleanerId}
            onChange={(e) => setFilters({ ...filters, cleanerId: e.target.value })}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white text-sm"
          >
            <option value="">All</option>
            {cleaners.map((c) => (
              <option key={c.id} value={c.id} className="bg-neutral-900">
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {tasks.map((task) => {
          const unavailable = isCleanerUnavailable(task);
          return (
            <div
              key={task.id}
              className={`bg-white/5 p-6 ${
                unavailable ? 'border-2 border-red-500' : 'border border-white/10'
              }`}
            >
              {unavailable && (
                <div className="flex items-center gap-2 mb-3 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Cleaner unavailable on this date</span>
                </div>
              )}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {task.apartment?.name || 'Unknown Apartment'}
                  </h3>
                  <p className="text-white/70 text-sm mb-1">
                    Date: {task.date}
                  </p>
                  {task.deadline && (
                    <p className="text-white/60 text-sm mb-1">
                      Deadline: {task.deadline}
                    </p>
                  )}
                  {task.cleaner && (
                    <p className="text-white/70 text-sm mb-1">
                      Cleaner: {task.cleaner.name}
                    </p>
                  )}
                  {task.note && (
                    <p className="text-white/50 text-sm mt-2">{task.note}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(task)}
                    className="p-2 hover:bg-white/10 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 hover:bg-red-500/20 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div className="text-center py-12 text-white/50">
            No tasks found. Add a task to get started.
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Task' : 'Add Task'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Apartment"
            value={formData.listing_id}
            onChange={(e) => setFormData({ ...formData, listing_id: e.target.value })}
            required
            options={[
              { value: '', label: 'Select apartment' },
              ...apartments.map((a) => ({ value: String(a.listing_id), label: a.listing_id })),
            ]}
          />

          <Select
            label="Cleaner (optional - uses default if empty)"
            value={formData.cleaner_id}
            onChange={(e) => setFormData({ ...formData, cleaner_id: e.target.value })}
            options={[
              { value: '', label: 'Use default cleaner' },
              ...cleaners.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />

          <Input
            label="Date (dd-MM-yyyy)"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            placeholder="31-12-2025"
          />

          <Input
            label="Deadline (dd-MM-yyyy)"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            placeholder="31-12-2025"
          />

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Note
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white focus:border-white focus:outline-none"
              placeholder="Additional instructions..."
            />
          </div>

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

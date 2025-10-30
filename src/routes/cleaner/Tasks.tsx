import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getTasksForCleaner, getCleanerByUserId } from '../../lib/api';
import { toDdMmYyyy, getTodayPlusN, formatDateLabel } from '../../lib/dates';
import type { User, CleaningTaskWithDetails } from '../../types/db';

interface ContextType {
  user: User;
}

export function Tasks() {
  const { user } = useOutletContext<ContextType>();
  const [tasks, setTasks] = useState<CleaningTaskWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [dayOffset, setDayOffset] = useState(0);

  useEffect(() => {
    loadData();
  }, [user.id, dayOffset]);

  async function loadData() {
    try {
      const cleaner = await getCleanerByUserId(user.id);
      if (cleaner) {
        const today = getTodayPlusN(dayOffset);
        const dateStr = toDdMmYyyy(today);
        const data = await getTasksForCleaner(cleaner.id, dateStr, dateStr);
        setTasks(data);
      }
    } finally {
      setLoading(false);
    }
  }

  const currentDate = getTodayPlusN(dayOffset);
  const dateLabel = formatDateLabel(currentDate);

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">My Tasks</h2>
        <p className="text-white/70 text-sm">
          View your cleaning assignments for each day
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 p-4 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setDayOffset(Math.max(0, dayOffset - 1))}
            disabled={dayOffset === 0}
            className="p-2 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <div className="text-center">
            <h3 className="text-xl font-semibold text-white">{dateLabel}</h3>
            <p className="text-sm text-white/50">{toDdMmYyyy(currentDate)}</p>
          </div>

          <button
            onClick={() => setDayOffset(Math.min(7, dayOffset + 1))}
            disabled={dayOffset === 7}
            className="p-2 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white/5 border border-white/10 p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-2">
              {task.apartment?.name || 'Unknown Apartment'}
            </h3>
            {task.apartment?.address && (
              <p className="text-white/70 text-sm mb-2">{task.apartment.address}</p>
            )}
            <p className="text-white/60 text-sm mb-1">
              Date: {task.date}
            </p>
            {task.deadline && (
              <p className="text-white/60 text-sm mb-1">
                Deadline: {task.deadline}
              </p>
            )}
            {task.note && (
              <div className="mt-3 p-3 bg-white/5 border border-white/10">
                <p className="text-sm font-medium text-white/70 mb-1">Notes:</p>
                <p className="text-white/80 text-sm">{task.note}</p>
              </div>
            )}
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-12 text-white/50">
            No tasks for {dateLabel.toLowerCase()}
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-white/50 text-sm">
        Use the arrows to view tasks for the next 7 days
      </div>
    </div>
  );
}

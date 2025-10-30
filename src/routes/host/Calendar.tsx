import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MonthCalendar } from '../../components/calendar/MonthCalendar';
import { getCleaners } from '../../lib/api';
import type { User, Cleaner } from '../../types/db';
import type { MonthDay } from '../../lib/dates';

interface ContextType {
  user: User;
}

export function Calendar() {
  const { user } = useOutletContext<ContextType>();
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  useEffect(() => {
    loadCleaners();
  }, [user.id]);

  async function loadCleaners() {
    try {
      const data = await getCleaners(user.id);
      setCleaners(data);
    } finally {
      setLoading(false);
    }
  }

  function getUnavailableCleaners(dateStr: string): string[] {
    return cleaners
      .filter((c) => c.availability.includes(dateStr))
      .map((c) => c.name);
  }

  function renderDay(day: MonthDay) {
    const unavailable = getUnavailableCleaners(day.dateStr);
    const isUnavailable = unavailable.length > 0;

    return (
      <div
        className={`h-full ${
          day.isCurrentMonth ? '' : 'opacity-40'
        }`}
      >
        <div
          className={`text-xs mb-1 ${
            day.isToday
              ? 'font-bold text-white'
              : day.isCurrentMonth
              ? 'text-white/70'
              : 'text-white/40'
          }`}
        >
          {day.date.getDate()}
        </div>
        {day.isCurrentMonth && isUnavailable && (
          <div className={`text-xs p-1 ${
            isUnavailable ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
          }`}>
            {unavailable.map((name, idx) => (
              <div key={idx} className="truncate">
                {name}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Cleaner Availability Calendar</h2>
        <p className="text-white/70 text-sm">
          Red days indicate when cleaners are unavailable
        </p>
      </div>

      <MonthCalendar
        year={year}
        month={month}
        onMonthChange={(y, m) => {
          setYear(y);
          setMonth(m);
        }}
        renderDay={renderDay}
      />

      <div className="mt-6 bg-white/5 border border-white/10 p-4">
        <h3 className="text-white font-semibold mb-3">Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-red-500/20 border border-red-500"></div>
            <span className="text-white/70 text-sm">One or more cleaners unavailable</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-white/5 border border-white/10"></div>
            <span className="text-white/70 text-sm">All cleaners available</span>
          </div>
        </div>
      </div>
    </div>
  );
}

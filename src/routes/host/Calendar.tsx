import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MonthCalendar } from '../../components/calendar/MonthCalendar';
import { getCleaners } from '../../lib/api';
import type { User, Cleaner } from '../../types/db';
import type { MonthDay } from '../../lib/dates';

interface ContextType {
  user: User;
}

// Hilfsfunktion: safely JSONB → string[]
const toDateArray = (val: unknown): string[] =>
  Array.isArray(val) ? val.map((v) => String(v)) : [];

export function Calendar() {
  const { user } = useOutletContext<ContextType>();
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  useEffect(() => {
    loadCleaners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  async function loadCleaners() {
    try {
      const data = await getCleaners(user.id);
      setCleaners(data ?? []);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Gibt Namen der Cleaner zurück, die an einem bestimmten Tag NICHT verfügbar sind.
   * Feld `available` in der DB = Liste von Tagen, an denen Cleaner NICHT verfügbar ist.
   */
  function getUnavailableCleaners(dateStr: string): string[] {
    return cleaners
      .filter((c: any) => {
        const arr = toDateArray(c?.available);
        // Wenn der Tag in available enthalten ist → Cleaner ist NICHT verfügbar
        return arr.includes(dateStr);
      })
      .map((c) => c.name);
  }

  function renderDay(day: MonthDay) {
    const unavailable = getUnavailableCleaners(day.dateStr);
    const isUnavailable = unavailable.length > 0;

    const boxClass = isUnavailable
      ? 'bg-red-500/20 text-red-300 border-red-500/40'
      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35';

    return (
      <div className={`h-full ${day.isCurrentMonth ? '' : 'opacity-40'}`}>
        {/* Datum */}
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

        {/* Tagesstatus */}
        {day.isCurrentMonth && (
          <div className={`text-xs p-1 rounded border ${boxClass}`}>
            {isUnavailable ? (
              <>
                <div className="font-medium truncate">Nicht verfügbar</div>
                {unavailable.map((name, idx) => (
                  <div key={idx} className="truncate">{name}</div>
                ))}
              </>
            ) : (
              <div className="truncate">Alle verfügbar</div>
            )}
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
        <h2 className="text-2xl font-bold text-white mb-2">
          Cleaner Availability Calendar
        </h2>
        <p className="text-white/70 text-sm">
          🔴 Rot = Mindestens ein Cleaner ist nicht verfügbar<br />
          🟢 Grün = Alle Cleaner sind verfügbar
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

      {/* Legende */}
      <div className="mt-6 bg-white/5 border border-white/10 p-4 rounded-lg">
        <h3 className="text-white font-semibold mb-3">Legende</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded border bg-red-500/20 border-red-500/40"></div>
            <span className="text-white/70 text-sm">Mindestens ein Cleaner nicht verfügbar</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded border bg-emerald-500/15 border-emerald-500/35"></div>
            <span className="text-white/70 text-sm">Alle verfügbar</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calendar;

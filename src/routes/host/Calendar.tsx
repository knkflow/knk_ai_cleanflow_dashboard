import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MonthCalendar } from '../../components/calendar/MonthCalendar';
import { getCleaners } from '../../lib/api';
import type { User, Cleaner } from '../../types/db';
import type { MonthDay } from '../../lib/dates';

interface ContextType {
  user: User;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Calendar() {
  const { user } = useOutletContext<ContextType>();
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-basiert (0 = Jan)

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

  /** Check: welche Cleaner sind an einem gegebenen ISO-Tag (yyyy-mm-dd) unavailable? */
  function getUnavailableCleaners(dateStr: string): string[] {
    return cleaners
      .filter((c) => c.availability.includes(dateStr))
      .map((c) => c.name);
  }

  /** Hilfsfunktion: ISO-String -> Date (lokal, 00:00) */
  function parseIsoDate(dateStr: string): Date | null {
    // Erwartet yyyy-mm-dd
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return null;
    const dt = new Date(y, m - 1, d, 0, 0, 0, 0);
    return isNaN(dt.getTime()) ? null : dt;
  }

  /** Set roter Spalten (Wochentage), falls im sichtbaren Monat mind. ein unavailable-Tag in der Spalte */
  const redWeekdays = useMemo(() => {
    const set = new Set<number>();
    for (const c of cleaners) {
      for (const ds of c.availability) {
        const dt = parseIsoDate(ds);
        if (!dt) continue;
        if (dt.getFullYear() === year && dt.getMonth() === month) {
          set.add(dt.getDay()); // 0=Sun,...,6=Sat
        }
      }
    }
    return set;
  }, [cleaners, year, month]);

  function renderDay(day: MonthDay) {
    const unavailableList = getUnavailableCleaners(day.dateStr);
    const isUnavailable = unavailableList.length > 0;
    const isOtherMonth = !day.isCurrentMonth;

    return (
      <div className={`h-full`}>
        {/* Zahl/Bubble */}
        <div className="mb-1">
          <span
            className={[
              'inline-block px-2 py-0.5 rounded-full text-xs',
              day.isToday
                ? 'bg-black text-white'
                : 'bg-transparent',
              isOtherMonth ? 'opacity-50' : '',
            ].join(' ')}
          >
            {day.date.getDate()}
          </span>
        </div>

        {/* Box des Tages */}
        <div
          className={[
            'min-h-[68px] rounded-md border p-2',
            isUnavailable
              ? 'bg-red-500 text-white border-red-600'
              : 'bg-white text-black border-neutral-200',
            isOtherMonth ? 'opacity-60' : '',
          ].join(' ')}
          title={
            isUnavailable
              ? `Unavailable: ${unavailableList.join(', ')}`
              : 'All cleaners available'
          }
        >
          {/* Optional: Liste der Unavailable-Namen in klein */}
          {isUnavailable && (
            <div className="text-xs leading-4">
              {unavailableList.map((name, idx) => (
                <div key={idx} className="truncate">
                  {name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-white mb-1">Cleaner Availability Calendar</h2>
        <p className="text-white/70 text-sm">Rote Tage/Spalten = mindestens ein Cleaner nicht verfügbar</p>
      </div>

      {/* Eigener Header für Wochentage */}
      <div className="grid grid-cols-7 gap-2">
        {WEEKDAY_LABELS.map((label, idx) => {
          const isRed = redWeekdays.has(idx);
          return (
            <div
              key={label}
              className={[
                'text-center rounded-md px-2 py-2 font-medium',
                isRed ? 'bg-red-500 text-white' : 'bg-green-500 text-white',
              ].join(' ')}
            >
              {label}
            </div>
          );
        })}
      </div>

      {/* Monatskalender (Grids/Cells kommen aus MonthCalendar – wir liefern renderDay) */}
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
      <div className="mt-4 bg-white/5 border border-white/10 p-4 rounded-md">
        <h3 className="text-white font-semibold mb-3">Legende</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-sm bg-red-500 border border-red-600"></div>
            <span className="text-white/80 text-sm">Mindestens ein Cleaner nicht verfügbar</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-sm bg-white border border-neutral-200"></div>
            <span className="text-white/80 text-sm">Alle Cleaner verfügbar</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-sm bg-green-500 border border-green-600"></div>
            <span className="text-white/80 text-sm">Wochentags-Header (grün) / rot falls Spalte betroffen</span>
          </div>
        </div>
      </div>
    </div>
  );
}

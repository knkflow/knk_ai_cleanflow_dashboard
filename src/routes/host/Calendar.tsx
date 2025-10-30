import { useEffect, useMemo, useState } from 'react';
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
  const [month, setMonth] = useState(now.getMonth()); // 0-11

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

  // Map: 'yyyy-mm-dd' -> Set(cleanerName) der NICHT verfügbaren Cleaner
  const unavailableMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const c of cleaners) {
      const days = c.availability || [];
      for (const iso of days) {
        if (!map.has(iso)) map.set(iso, new Set());
        map.get(iso)!.add(c.name);
      }
    }
    return map;
  }, [cleaners]);

  function toISO(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  // Header-Färbung: welche Wochentage (0=Sun..6=Sat) sind im aktuellen Monat rot?
  const redWeekdays = useMemo(() => {
    const red = new Set<number>();
    for (const [iso, names] of unavailableMap.entries()) {
      if (!names || names.size === 0) continue;
      const [yy, mm, dd] = iso.split('-').map(Number);
      if (yy === year && (mm - 1) === month) {
        const wd = new Date(yy, mm - 1, dd).getDay(); // 0..6
        red.add(wd);
      }
    }
    return red;
  }, [unavailableMap, year, month]);

  function getUnavailableCleaners(dateStr: string): string[] {
    const names = unavailableMap.get(dateStr);
    return names ? Array.from(names) : [];
  }

  // Rendering eines Tages (Zelle) – Design analog Vorgabe
  function renderDay(day: MonthDay) {
    const missingNames = getUnavailableCleaners(day.dateStr);
    const isUnavailable = day.isCurrentMonth && missingNames.length > 0;

    return (
      <div className={`h-full relative`}>
        {/* Tagnummer oben rechts */}
        <div
          className={`absolute top-2 right-3 text-xs ${
            day.isToday
              ? 'font-bold text-white'
              : day.isCurrentMonth
              ? 'text-white/70'
              : 'text-white/40'
          }`}
        >
          {day.date.getDate()}
        </div>

        {/* Card */}
        <div
          className={[
            'absolute left-2.5 right-2.5 bottom-2.5',
            'rounded-[10px]',
            'transition-colors duration-300',
            day.isCurrentMonth
              ? isUnavailable
                ? 'top-8 bg-red-600 text-white'
                : 'top-8 bg-white text-black'
              : 'top-8 bg-neutral-400 text-black',
          ].join(' ')}
        >
          {/* Namen der fehlenden Cleaner oben links, nur wenn rot */}
          {isUnavailable && (
            <div className="absolute top-2 left-3 pr-3 text-[12px] font-semibold text-white">
              {missingNames.join(', ')}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  // Labels (englisch wie in deinem Beispiel; bei Bedarf eindeutschen)
  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function goPrevMonth() {
    const d = new Date(year, month, 1);
    d.setMonth(d.getMonth() - 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }
  function goNextMonth() {
    const d = new Date(year, month, 1);
    d.setMonth(d.getMonth() + 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  const monthTitle = new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div>
      {/* Topbar */}
      <div className="grid grid-cols-[60px_1fr_60px] items-center mb-3">
        <div className="flex items-center justify-center">
          <button
            onClick={goPrevMonth}
            className="w-9 h-9 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 transition"
            aria-label="Voriger Monat"
          >
            ⟨
          </button>
        </div>
        <div className="text-center font-bold text-[22px]">{monthTitle}</div>
        <div className="flex items-center justify-end">
          <button
            onClick={goNextMonth}
            className="w-9 h-9 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 transition"
            aria-label="Nächster Monat"
          >
            ⟩
          </button>
        </div>
      </div>

      {/* Kalender-Panel */}
      <div className="border border-neutral-800 rounded-md overflow-hidden bg-neutral-900">
        {/* Header der Wochentage */}
        <div className="grid grid-cols-7 border-b border-neutral-800">
          {weekdayLabels.map((label, idx) => (
            <div
              key={label}
              className={[
                'px-3 py-2 text-left text-[12px] font-semibold',
                redWeekdays.has(idx) ? 'bg-red-600 text-white' : 'bg-green-600 text-white',
              ].join(' ')}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Grid vom vorhandenen MonthCalendar */}
        <MonthCalendar
          year={year}
          month={month}
          onMonthChange={(y, m) => {
            setYear(y);
            setMonth(m);
          }}
          renderDay={renderDay}
        />
      </div>

      {/* Legende */}
      <div className="mt-6 bg-white/5 border border-white/10 p-4">
        <h3 className="text-white font-semibold mb-3">Legende</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-red-600 border border-red-500" />
            <span className="text-white/70 text-sm">
              Mindestens ein Cleaner nicht verfügbar (Namen stehen oben links)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-white border border-neutral-300" />
            <span className="text-white/70 text-sm">Alle verfügbar (Standard)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-neutral-400 border border-neutral-500" />
            <span className="text-white/70 text-sm">Tag liegt nicht im aktuellen Monat</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/routes/.../Calendar.tsx
import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MonthCalendar } from '../../components/calendar/MonthCalendar';
import { getCleaners } from '../../lib/api';
import type { User, Cleaner } from '../../types/db';
import type { MonthDay } from '../../lib/dates';

interface ContextType { user: User; }

/* ---------------- Helpers ---------------- */

function pad2(n: number) {
  return n.toString().padStart(2, '0');
}

/** Normalisiert diverse Eingaben (Date, 'YYYY-M-D', 'YYYY-MM-DD', 'YYYY-MM-DDTHH:MM:SSZ') zu 'YYYY-MM-DD' */
function normalizeYMD(input: string | Date | undefined | null): string {
  if (!input) return '';
  if (input instanceof Date) {
    return `${input.getFullYear()}-${pad2(input.getMonth() + 1)}-${pad2(input.getDate())}`;
  }
  let s = String(input);
  if (s.includes('T')) s = s.split('T')[0];
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return `${m[1]}-${pad2(+m[2])}-${pad2(+m[3])}`;
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }
  return s; // Fallback
}

/** jsonb -> string[] → normalisiert auf 'YYYY-MM-DD' */
const toDateArray = (val: unknown): string[] =>
  Array.isArray(val) ? val.map((v) => normalizeYMD(String(v))) : [];

/** Prüft, ob der Cleaner an diesem Tag NICHT verfügbar ist */
function isCleanerUnavailableForDate(cleaner: Cleaner, ymd: string): boolean {
  const unavailableDays = toDateArray((cleaner as any).availability);
  return unavailableDays.includes(ymd);
}

export function Calendar() {
  const { user } = useOutletContext<ContextType>();

  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  // Filter: null = Alle
  const [selectedCleanerId, setSelectedCleanerId] = useState<string | null>(null);
  const isAllView = selectedCleanerId === null;

  useEffect(() => {
    void loadCleaners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  async function loadCleaners() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await getCleaners(user.id);
      setCleaners(data ?? []);
      if (!data || data.length === 0) {
        setErrorMsg('Sie haben noch keine Cleaner erstellt.');
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Fehler beim Laden der Cleaner.');
    } finally {
      setLoading(false);
    }
  }

  /** Für O(1)-Lookups: Map<cleanerId, Set<'YYYY-MM-DD'>> */
  const unavailableIndex = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const c of cleaners) {
      const arr = toDateArray((c as any).availability);
      m.set(c.id, new Set(arr));
    }
    return m;
  }, [cleaners]);

  /** Liste der Namen, die an diesem Tag NICHT verfügbar sind – abhängig vom Filter */
  function getUnavailableNames(dateStr: string | undefined): string[] {
    const ymd = normalizeYMD(dateStr);
    if (!ymd) return [];

    if (isAllView) {
      const names: string[] = [];
      for (const c of cleaners) {
        const set = unavailableIndex.get(c.id);
        if (set && set.has(ymd)) names.push(c.name);
      }
      return names;
    } else {
      const c = cleaners.find((x) => x.id === selectedCleanerId);
      if (!c) return [];
      const set = unavailableIndex.get(c.id);
      return set && set.has(ymd) ? [c.name] : [];
    }
  }

  function renderDay(day: MonthDay) {
    // Nutze IMMER normalisierte YMD (unabhängig davon, ob dateStr vorhanden ist)
    const ymd = normalizeYMD(day.dateStr ?? day.date);

    const unavailableNames = getUnavailableNames(ymd);
    const isUnavailable = unavailableNames.length > 0;

    const boxClass = isUnavailable
      ? 'bg-red-500/20 text-red-300 border-red-500/40'
      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35';

    const primaryText = isAllView
      ? (isUnavailable ? 'Nicht verfügbar (>1)' : 'Alle verfügbar')
      : (isUnavailable ? 'Nicht verfügbar' : 'Verfügbar');

    const showNamesBadge = isAllView && isUnavailable;

    return (
      <div className={`h-full ${day.isCurrentMonth ? '' : 'opacity-40'}`}>
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

        {day.isCurrentMonth && (
          <div className={`relative text-xs p-1 rounded border transition-shadow ${boxClass}`}>
            <div className="truncate">{primaryText}</div>

            {/* Tooltip mit Namen nur in "Alle"-Ansicht */}
            {showNamesBadge && (
              <div className="absolute left-1 top-1">
                <div className="group relative">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full
                               bg-red-500/25 text-red-200 border border-red-500/60
                               shadow-[inset_0_0_0_1px_rgba(255,0,0,0.25)] backdrop-blur-[1px] cursor-default"
                  >
                    <span className="text-[10px] font-semibold tracking-wide">Wer:</span>
                  </span>

                  <div
                    className="pointer-events-none absolute z-20 mt-1 hidden min-w-[140px] max-w-[220px]
                               whitespace-normal break-words rounded-lg border border-red-500/40
                               bg-red-900/90 px-3 py-2 text-[11px] text-red-100 shadow-lg group-hover:block"
                  >
                    <div className="mb-1 text-[10px] uppercase tracking-wider text-red-200/80">
                      Abwesend:
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {unavailableNames.map((n, i) => (
                        <li key={i} className="leading-tight">{n}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  const sortedCleaners = useMemo(
    () => [...cleaners].sort((a, b) => a.name.localeCompare(b.name)),
    [cleaners]
  );

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div>
      {errorMsg && (
        <div className="mb-3 rounded border border-yellow-500/40 bg-yellow-500/10 p-3 text-yellow-200 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Filter-Kacheln: Alle + einzelne Cleaner */}
      {cleaners.length > 0 && (
        <div className="mb-4">
          <div className="text-white font-semibold mb-2">Cleaner auswählen</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* Alle */}
            <button
              onClick={() => setSelectedCleanerId(null)}
              className={`group relative w-full rounded-xl px-3 py-3 text-left
                border transition
                ${
                  isAllView
                    ? 'border-white/60 bg-white/10 shadow-[0_0_0_2px_rgba(255,255,255,0.35)]'
                    : 'border-white/10 bg-white/5 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:border-white/30'
                }
                focus:outline-none focus:ring-2 focus:ring-white/40`}
              title="Alle Cleaner anzeigen"
            >
              <div className="text-sm font-medium text-white">Alle</div>
              <div className="text-xs text-white/60 mt-0.5">Gesamtübersicht</div>
            </button>

            {/* Einzelne Cleaner */}
            {sortedCleaners.map((c) => {
              const active = selectedCleanerId === c.id;
              const initials =
                c.name?.split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase() || 'C';

              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCleanerId(c.id)}
                  className={`group relative w-full rounded-xl px-3 py-3 text-left
                    border transition
                    ${
                      active
                        ? 'border-white/60 bg-white/10 shadow-[0_0_0_2px_rgba(255,255,255,0.35)]'
                        : 'border-white/10 bg-white/5 hover:shadow-[0_0_24px_rgba(255,255,255,0.45)] hover:border-white/30'
                    }
                    focus:outline-none focus:ring-2 focus:ring-white/40`}
                  title={`Nur ${c.name} anzeigen`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg
                        ${active ? 'bg-white/80 text-black' : 'bg-white/10 text-white/80'}
                      `}
                    >
                      <span className="text-xs font-bold">{initials}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white truncate">{c.name}</div>
                      <div className="text-[11px] text-white/60">
                        {active ? 'Ausgewählt' : 'Klicken zum Anzeigen'}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-3 text-xs text-white/60">
            {isAllView
              ? 'Ansicht: Alle Reinigungskräfte'
              : `Ansicht gefiltert auf: ${sortedCleaners.find((x) => x.id === selectedCleanerId)?.name ?? 'Unbekannt'}`}
          </div>
        </div>
      )}

      {/* Kalender */}
      <MonthCalendar
        year={year}
        month={month}
        onMonthChange={(y, m) => { setYear(y); setMonth(m); }}
        renderDay={renderDay}
      />

      {/* Legende */}
      <div className="mt-6 bg-white/5 border border-white/10 p-4 rounded-lg">
        <h3 className="text-white font-semibold mb-3">Legende</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded border bg-red-500/20 border-red-500/40"></div>
            <span className="text-white/80">
              {isAllView ? 'Mindestens eine Reinigungskraft abwesend' : 'Cleaner abwesend'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded border bg-emerald-500/15 border-emerald-500/35"></div>
            <span className="text-white/80">
              {isAllView ? 'Alle verfügbar' : 'Cleaner verfügbar'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calendar;

// src/routes/.../Calendar.tsx
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import { MonthCalendar } from '../../components/calendar/MonthCalendar';
import { getCleaners } from '../../lib/api';
import type { User, Cleaner } from '../../types/db';
import type { MonthDay } from '../../lib/dates';

interface ContextType { user: User; }

/* ---------------------- Helfer ---------------------- */

const pad2 = (n: number) => n.toString().padStart(2, '0');

function ymdFromUTC(y: number, m1: number, d: number): string {
  return `${y}-${pad2(m1)}-${pad2(d)}`;
}

function isValidYMD(y: number, m1: number, d: number): boolean {
  if (!Number.isInteger(y) || !Number.isInteger(m1) || !Number.isInteger(d)) return false;
  if (m1 < 1 || m1 > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m1 - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m1 - 1 && dt.getUTCDate() === d;
}

/** Normalisiert alle möglichen Datumsformen → 'YYYY-MM-DD' */
function normalizeYMD(input: unknown): string {
  if (input == null) return '';
  if (input instanceof Date)
    return ymdFromUTC(input.getUTCFullYear(), input.getUTCMonth() + 1, input.getUTCDate());

  let s = String(input).trim();
  if (!s) return '';

  if (s.includes('T')) {
    const dt = new Date(s);
    if (!isNaN(dt.getTime()))
      return ymdFromUTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
  }

  const m1 = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m1) {
    const y = +m1[1], mo = +m1[2], d = +m1[3];
    return isValidYMD(y, mo, d) ? ymdFromUTC(y, mo, d) : '';
  }

  const m2 = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m2) {
    const d = +m2[1], mo = +m2[2], y = +m2[3];
    return isValidYMD(y, mo, d) ? ymdFromUTC(y, mo, d) : '';
  }

  const m3 = s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (m3) {
    const y = +m3[1], mo = +m3[2], d = +m3[3];
    return isValidYMD(y, mo, d) ? ymdFromUTC(y, mo, d) : '';
  }

  const dt = new Date(s);
  if (!isNaN(dt.getTime()))
    return ymdFromUTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());

  return '';
}

/** availability(jsonb) → Set<'YYYY-MM-DD'> (beliebig robust) */
function availabilityToSet(av: unknown): Set<string> {
  const set = new Set<string>();
  const add = (x: unknown) => {
    const y = normalizeYMD(x);
    if (y) set.add(y);
  };
  const walk = (val: unknown) => {
    if (val == null) return;
    if (Array.isArray(val)) { for (const v of val) walk(v); return; }
    const s = String(val).trim();
    if (!s) return;
    if (s.includes(',') || s.includes(';') || /\s/.test(s)) {
      for (const part of s.split(/[,;\s]+/)) add(part);
    } else {
      add(s);
    }
  };
  walk(av);
  return set;
}

function dayToYMD(day: MonthDay): string {
  return normalizeYMD((day as any).dateStr ?? day.date);
}

/** Fallback-Label für Cleaner (falls name leer/fehlend) */
function getCleanerLabel(c: Cleaner): string {
  const n = (c as any)?.name;
  if (typeof n === 'string' && n.trim().length > 0) return n.trim();
  const e = (c as any)?.email;
  if (typeof e === 'string' && e.trim().length > 0) return e.trim();
  const p = (c as any)?.phone;
  if (typeof p === 'string' && p.trim().length > 0) return p.trim();
  return '[Unbenannt]';
}

/* ---------------------- Komponente ---------------------- */

export function Calendar() {
  const { user } = useOutletContext<ContextType>();
  const location = useLocation();

  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const [selectedCleanerId, setSelectedCleanerId] = useState<string | null>(null);
  const isAllView = selectedCleanerId === null;

  // Neu laden bei Benutzerwechsel / Navigationswechsel / Fokus / Sichtbarkeit
  useEffect(() => { void loadCleaners(); }, [user.id]);
  useEffect(() => { void loadCleaners(); }, [location.key]);
  useEffect(() => {
    const onFocus = () => void loadCleaners();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);
  useEffect(() => {
    const onVis = () => { if (!document.hidden) void loadCleaners(); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  async function loadCleaners() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await getCleaners(user.id);
      console.debug('[Calendar] getCleaners() raw:', data);
      setCleaners(data ?? []);
      if (!data?.length) setErrorMsg('Sie haben noch keine Cleaner erstellt.');
    } catch (e: any) {
      setErrorMsg(e?.message || 'Fehler beim Laden der Cleaner.');
    } finally {
      setLoading(false);
    }
  }

  /** Map<cleanerId, Set<'YYYY-MM-DD'>> + Debug log mit Fallback-Name */
  const unavailableIndex = useMemo(() => {
    const m = new Map<string, Set<string>>();
    console.group('[Calendar] Build unavailableIndex');
    for (const c of cleaners) {
      const label = getCleanerLabel(c);
      const set = availabilityToSet((c as any).availability);
      m.set(c.id, set);
      console.debug(`- ${label} (${c.id}) availability ->`, Array.from(set));
      if (!('name' in c) || (typeof (c as any).name !== 'string') || !(c as any).name?.trim()) {
        console.warn(`  ⚠️ Cleaner hat keinen sichtbaren Namen. Genutztes Label: ${label}`);
      }
    }
    console.groupEnd();
    return m;
  }, [cleaners]);

  /** Wer ist an diesem Tag nicht verfügbar? */
  function getUnavailableNames(ymd: string): string[] {
    if (!ymd) return [];
    const names: string[] = [];

    if (isAllView) {
      for (const c of cleaners) {
        const label = getCleanerLabel(c);
        const set = unavailableIndex.get(c.id);
        if (!set) {
          console.warn(`[Calendar] ⚠️ Kein availability-Set für ${label}`);
          continue;
        }
        const hit = set.has(ymd);
        console.debug(`[Calendar] ${ymd} → ${label}: ${hit ? '❌ UNAVAILABLE' : '✅ available'}`);
        if (hit) names.push(label);
      }
    } else {
      const c = cleaners.find(x => x.id === selectedCleanerId);
      if (c) {
        const label = getCleanerLabel(c);
        const set = unavailableIndex.get(c.id);
        if (!set) {
          console.warn(`[Calendar] ⚠️ Kein availability-Set für ${label}`);
        } else if (set.has(ymd)) {
          console.debug(`[Calendar] (Filter ${label}) ${ymd}: ❌ UNAVAILABLE`);
          names.push(label);
        } else {
          console.debug(`[Calendar] (Filter ${label}) ${ymd}: ✅ available`);
        }
      } else {
        console.warn(`[Calendar] ⚠️ Kein Cleaner mit ID ${selectedCleanerId} gefunden.`);
      }
    }

    if (names.length > 0)
      console.debug(`[Calendar] 🔴 ${ymd} ->`, names);
    else
      console.debug(`[Calendar] 🟢 ${ymd} -> alle verfügbar`);

    return names;
  }

  function renderDay(day: MonthDay) {
    const ymd = dayToYMD(day);
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
            day.isToday ? 'font-bold text-white'
              : day.isCurrentMonth ? 'text-white/70'
              : 'text-white/40'
          }`}
        >
          {day.date.getDate()}
        </div>

        {day.isCurrentMonth && (
          <div className={`relative text-xs p-1 rounded border transition-shadow ${boxClass}`}>
            <div className="truncate">{primaryText}</div>

            {showNamesBadge && (
              <div className="absolute left-1 top-1">
                <div className="group relative">
                  <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded-full
                                   bg-red-500/25 text-red-200 border border-red-500/60">
                    <span className="text-[10px] font-semibold tracking-wide">Wer:</span>
                  </span>
                  <div className="pointer-events-none absolute z-20 mt-1 hidden min-w-[140px] max-w-[220px]
                                  whitespace-normal break-words rounded-lg border border-red-500/40
                                  bg-red-900/90 px-3 py-2 text-[11px] text-red-100 shadow-lg group-hover:block">
                    <div className="mb-1 text-[10px] uppercase tracking-wider text-red-200/80">
                      Abwesend:
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {unavailableNames.map((n, i) => <li key={i}>{n}</li>)}
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
    () => [...cleaners].sort((a, b) => getCleanerLabel(a).localeCompare(getCleanerLabel(b))),
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

      {/* Filter-Kacheln */}
      {cleaners.length > 0 && (
        <div className="mb-4">
          <div className="text-white font-semibold mb-2">Cleaner auswählen</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* Alle */}
            <button
              onClick={() => setSelectedCleanerId(null)}
              className={`rounded-xl px-3 py-3 border transition
                ${isAllView
                  ? 'border-white/60 bg-white/10 shadow-[0_0_0_2px_rgba(255,255,255,0.35)]'
                  : 'border-white/10 bg-white/5 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:border-white/30'}
              `}
            >
              <div className="text-sm font-medium text-white">Alle</div>
              <div className="text-xs text-white/60">Gesamtübersicht</div>
            </button>

            {/* Einzelne */}
            {sortedCleaners.map((c) => {
              const active = selectedCleanerId === c.id;
              const label = getCleanerLabel(c);
              const initials = label.split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase() || 'C';

              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCleanerId(c.id)}
                  className={`rounded-xl px-3 py-3 border transition
                    ${active
                      ? 'border-white/60 bg-white/10 shadow-[0_0_0_2px_rgba(255,255,255,0.35)]'
                      : 'border-white/10 bg-white/5 hover:shadow-[0_0_24px_rgba(255,255,255,0.45)] hover:border-white/30'}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center
                      ${active ? 'bg-white/80 text-black' : 'bg-white/10 text-white/80'}`}>
                      <span className="text-xs font-bold">{initials}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white truncate">{label}</div>
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
              : `Ansicht gefiltert auf: ${sortedCleaners.find(x => x.id === selectedCleanerId)?.name ?? getCleanerLabel(sortedCleaners.find(x => x.id === selectedCleanerId) as Cleaner)}`}
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
      <div className="mt-6 bg-white/5 border border-white/10 p-4 rounded-lg text-sm text-white/80">
        <h3 className="font-semibold mb-3 text-white">Legende</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded border bg-red-500/20 border-red-500/40"></div>
            {isAllView ? 'Mindestens eine Reinigungskraft abwesend' : 'Cleaner abwesend'}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded border bg-emerald-500/15 border-emerald-500/35"></div>
            {isAllView ? 'Alle verfügbar' : 'Cleaner verfügbar'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calendar;

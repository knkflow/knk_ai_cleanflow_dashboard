// src/routes/.../Calendar.tsx
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import { MonthCalendar } from '../../components/calendar/MonthCalendar';
import { getCleaners, getTasks } from '../../lib/api'; // <-- NEU: getTasks
import type { User, Cleaner } from '../../types/db';
import type { MonthDay } from '../../lib/dates';

interface ContextType { user: User; }

/* ---------------- Helpers ---------------- */

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

  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) {
    const y = +m[1], mo = +m[2], d = +m[3];
    return isValidYMD(y, mo, d) ? ymdFromUTC(y, mo, d) : '';
  }
  m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/); // DD.MM.YYYY
  if (m) {
    const d = +m[1], mo = +m[2], y = +m[3];
    return isValidYMD(y, mo, d) ? ymdFromUTC(y, mo, d) : '';
  }
  m = s.match(/^(\d{4})(\d{2})(\d{2})$/); // YYYYMMDD
  if (m) {
    const y = +m[1], mo = +m[2], d = +m[3];
    return isValidYMD(y, mo, d) ? ymdFromUTC(y, mo, d) : '';
  }

  const dt = new Date(s);
  if (!isNaN(dt.getTime()))
    return ymdFromUTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());

  return '';
}

/** availability(jsonb/Strings) → Set<'YYYY-MM-DD'> (robust) */
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

function getCleanerLabel(c: Cleaner): string {
  const n = (c as any)?.name; if (typeof n === 'string' && n.trim()) return n.trim();
  const e = (c as any)?.email; if (typeof e === 'string' && e.trim()) return e.trim();
  const p = (c as any)?.phone; if (typeof p === 'string' && p.trim()) return p.trim();
  return '[Unbenannt]';
}

/* ---------------- Component ---------------- */

type AssignmentIndex = Map<string, Map<string, string[]>>; // cleanerId -> ymd -> [apartment names]

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

  // NEU: Index für Aufgaben nach Cleaner/Datum
  const [assignmentsIndex, setAssignmentsIndex] = useState<AssignmentIndex>(new Map());

  // Throttle/Guards fürs Laden
  const inFlightRef = useRef(false);
  const lastFetchTsRef = useRef(0);
  const THROTTLE_MS = 500;

  const loadCleaners = useCallback(async () => {
    const nowTs = Date.now();
    if (inFlightRef.current) return;
    if (nowTs - lastFetchTsRef.current < THROTTLE_MS) return;

    inFlightRef.current = true;
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await getCleaners(user.id);
      setCleaners(data ?? []);
      if (!data?.length) setErrorMsg('Sie haben noch keine Cleaner erstellt.');
    } catch (e: any) {
      setErrorMsg(e?.message || 'Fehler beim Laden der Cleaner.');
    } finally {
      lastFetchTsRef.current = Date.now();
      inFlightRef.current = false;
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { void loadCleaners(); }, [loadCleaners]);

  useEffect(() => {
    const path = location.pathname || '';
    if (path.toLowerCase().includes('calendar')) {
      void loadCleaners();
    }
  }, [location.pathname, loadCleaners]);

  useEffect(() => {
    const onFocus = () => void loadCleaners();
    const onVis = () => { if (!document.hidden) void loadCleaners(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [loadCleaners]);

  /** Map<cleanerId, Set<'YYYY-MM-DD'>> */
  const unavailableIndex = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const c of cleaners) {
      const set = availabilityToSet((c as any).availability);
      m.set(c.id, set);
    }
    return m;
  }, [cleaners]);

  /** NEU: Tasks des Monats laden und indexieren (Cleaner → Datum → Apartments[]) */
  const loadAssignments = useCallback(async () => {
    try {
      // Spannweite des aktuellen Monats
      const startYMD = ymdFromUTC(year, month + 1, 1);
      const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      const endYMD = ymdFromUTC(year, month + 1, lastDay);

      const rows: any[] = await getTasks(user.id, { dateFrom: startYMD, dateTo: endYMD });

      const idx: AssignmentIndex = new Map();
      for (const t of rows ?? []) {
        const ymd = normalizeYMD(t?.date);
        const cleanerId = t?.cleaner_id as string | undefined;
        const aptName = t?.apartment?.name as string | undefined;
        if (!ymd || !cleanerId || !aptName) continue;

        const byDate = idx.get(cleanerId) ?? new Map<string, string[]>();
        const list = byDate.get(ymd) ?? [];
        list.push(aptName);
        byDate.set(ymd, list);
        idx.set(cleanerId, byDate);
      }
      setAssignmentsIndex(idx);
    } catch {
      // optional: Logging
    }
  }, [user.id, year, month]);

  useEffect(() => { void loadAssignments(); }, [loadAssignments]);

  /** Wer ist an diesem Tag nicht verfügbar? */
  const getUnavailableNames = useCallback((ymd: string): string[] => {
    if (!ymd) return [];
    if (isAllView) {
      const names: string[] = [];
      for (const c of cleaners) {
        const label = getCleanerLabel(c);
        const set = unavailableIndex.get(c.id);
        if (set?.has(ymd)) names.push(label);
      }
      return names;
    } else {
      const c = cleaners.find(x => x.id === selectedCleanerId);
      if (!c) return [];
      return unavailableIndex.get(c.id)?.has(ymd) ? [getCleanerLabel(c)] : [];
    }
  }, [cleaners, isAllView, selectedCleanerId, unavailableIndex]);

  /** NEU: Apartments für ausgewählten Cleaner am Tag */
  const getAssignedAptsForSelected = useCallback((ymd: string): string[] => {
    if (!selectedCleanerId) return [];
    return assignmentsIndex.get(selectedCleanerId)?.get(ymd) ?? [];
  }, [assignmentsIndex, selectedCleanerId]);

  const renderDay = useCallback((day: MonthDay) => {
    const ymd = dayToYMD(day);
    const unavailableNames = getUnavailableNames(ymd);
    const isUnavailable = unavailableNames.length > 0;

    const boxClass = isUnavailable
      ? 'bg-red-500/20 text-red-300 border-red-500/40'
      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35';

    // Einzellansicht: Text im Kasten; Alle-Ansicht: kein Text im roten Kasten
    const showTextInsideBox = !isAllView || !isUnavailable;

    // Text-Logik:
    // - Grün (nicht unavailable): überall "Verfügbar"
    // - Rot:
    //    • Alle: kein Text (nur Namensliste)
    //    • Einzel: kein Text (wir zeigen stattdessen die Apartmentliste)
    const primaryText = isUnavailable ? '' : 'Verfügbar';

    const showNamesList = isAllView && isUnavailable;
    const assignedApts = !isAllView && isUnavailable ? getAssignedAptsForSelected(ymd) : [];

    return (
      <div className={`h-full ${day.isCurrentMonth ? '' : 'opacity-40'}`}>
        {/* Kopfzeile: Datum + rotes Badge nur in Einzelansicht */}
        <div className="text-xs mb-1 flex items-center gap-2">
          <span className={
            day.isToday
              ? 'font-bold text-white'
              : day.isCurrentMonth
              ? 'text-white/70'
              : 'text-white/40'
          }>
            {day.date.getDate()}
          </span>

          {/* Badge nur in Einzelansicht + wenn abwesend */}
          {!isAllView && isUnavailable && (
            <span className="inline-flex items-center rounded-sm px-1.5 py-[1px] text-[10px] font-semibold bg-red-600/90 text-white">
              Nicht verfügbar
            </span>
          )}
        </div>

        {day.isCurrentMonth && (
          <div className={`relative text-xs p-1 rounded border transition-shadow ${boxClass}`}>
            {/* Text nur, wenn erlaubt (siehe oben) */}
            {showTextInsideBox && !!primaryText && (
              <div className="truncate">{primaryText}</div>
            )}

            {/* In "Alle + rot": Liste der Namen */}
            {showNamesList && (
              <ul className="mt-1 space-y-0.5 pl-4 list-disc">
                {unavailableNames.map((n, i) => (
                  <li key={i} className="whitespace-nowrap overflow-hidden text-ellipsis" title={n}>
                    {n}
                  </li>
                ))}
              </ul>
            )}

            {/* In "Einzel + rot": Liste der Apartments (mit Bindestrich) */}
            {!isAllView && isUnavailable && assignedApts.length > 0 && (
              <ul className="mt-1 space-y-0.5 pl-4 list-disc">
                {assignedApts.map((name, i) => (
                  <li key={i} className="whitespace-nowrap overflow-hidden text-ellipsis" title={name}>
                    - {name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    );
  }, [getUnavailableNames, isAllView, getAssignedAptsForSelected]);

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
              title="Alle Cleaner anzeigen"
            >
              <div className="text-sm font-medium text-white">Alle</div>
              <div className="text-xs text-white/60 mt-0.5">Gesamtübersicht</div>
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
                  title={`Nur ${label} anzeigen`}
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
              : `Ansicht gefiltert auf: ${
                  getCleanerLabel(sortedCleaners.find(x => x.id === selectedCleanerId) as Cleaner)
                }`}
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
            {isAllView ? 'Mindestens eine Reinigungskraft abwesend' : 'Cleaner abwesend (zeigt Wohnungen)'}
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

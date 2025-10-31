// src/routes/.../Calendar.tsx
import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MonthCalendar } from '../../components/calendar/MonthCalendar';
import { getCleaners } from '../../lib/api';
import type { User, Cleaner } from '../../types/db';
import type { MonthDay } from '../../lib/dates';

interface ContextType { user: User; }

/* -------------------------- ROBUSTE NORMALISIERUNG -------------------------- */

const pad2 = (n: number) => n.toString().padStart(2, '0');

/** Baut ein YMD aus UTC-Komponenten (vermeidet Off-by-One durch Zeitzonen). */
function ymdFromUTC(y: number, m1: number, d: number): string {
  return `${y}-${pad2(m1)}-${pad2(d)}`;
}

/** Prüft Plausibilität eines gregorianischen Datums. */
function isValidYMD(y: number, m1: number, d: number): boolean {
  if (!Number.isInteger(y) || !Number.isInteger(m1) || !Number.isInteger(d)) return false;
  if (m1 < 1 || m1 > 12) return false;
  if (d < 1 || d > 31) return false;
  // Schnellcheck: Date.UTC und Rückprüfung
  const t = Date.UTC(y, m1 - 1, d);
  const dt = new Date(t);
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m1 - 1 &&
    dt.getUTCDate() === d
  );
}

/** Versucht, eine Eingabe zu 'YYYY-MM-DD' zu normalisieren (leer = nicht erkennbar). */
function normalizeYMD(input: unknown): string {
  if (input == null) return '';
  // Falls es bereits ein Date ist: UTC-extrahiert
  if (input instanceof Date) {
    return ymdFromUTC(input.getUTCFullYear(), input.getUTCMonth() + 1, input.getUTCDate());
  }
  let s = String(input).trim();
  if (!s) return '';

  // Falls sehr häufig: ISO mit Zeitanteil -> über Date (UTC) parsen
  if (s.includes('T')) {
    const dt = new Date(s);
    if (!isNaN(dt.getTime())) {
      return ymdFromUTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
    }
    // Wenn Date failt, weiter unten andere Pfade probieren
  }

  // 1) YYYY-M-D oder YYYY-MM-DD
  {
    const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (m) {
      const y = +m[1], mo = +m[2], d = +m[3];
      if (isValidYMD(y, mo, d)) return ymdFromUTC(y, mo, d);
      return '';
    }
  }

  // 2) YYYY/MM/DD
  {
    const m = s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
    if (m) {
      const y = +m[1], mo = +m[2], d = +m[3];
      if (isValidYMD(y, mo, d)) return ymdFromUTC(y, mo, d);
      return '';
    }
  }

  // 3) DD.MM.YYYY (europäisch)
  {
    const m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (m) {
      const d = +m[1], mo = +m[2], y = +m[3];
      if (isValidYMD(y, mo, d)) return ymdFromUTC(y, mo, d);
      return '';
    }
  }

  // 4) MM/DD/YYYY (US)
  {
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) {
      const mo = +m[1], d = +m[2], y = +m[3];
      if (isValidYMD(y, mo, d)) return ymdFromUTC(y, mo, d);
      return '';
    }
  }

  // 5) YYYYMMDD (8-stellig)
  {
    const m = s.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (m) {
      const y = +m[1], mo = +m[2], d = +m[3];
      if (isValidYMD(y, mo, d)) return ymdFromUTC(y, mo, d);
      return '';
    }
  }

  // 6) Letzter Versuch: Date-Parse der reinen Zeichenkette (kann lokal sein → deshalb wieder UTC extrahieren)
  {
    const dt = new Date(s);
    if (!isNaN(dt.getTime())) {
      return ymdFromUTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
    }
  }

  return ''; // nicht erkennbar
}

/** Spaltet "Listen" in Strings sicher auf: Komma, Semikolon, Whitespace/Zeilenumbrüche. */
function splitLooseList(s: string): string[] {
  return s
    .split(/[,;\s]+/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

/** availability(jsonb) in *beliebigen* Formen → Set<'YYYY-MM-DD'> */
function availabilityToSet(av: unknown): Set<string> {
  const set = new Set<string>();

  const pushNormalized = (v: unknown) => {
    const ymd = normalizeYMD(v);
    if (ymd) set.add(ymd);
  };

  const walk = (val: unknown) => {
    if (val == null) return;
    if (Array.isArray(val)) {
      for (const x of val) walk(x); // flatten
      return;
    }
    if (val instanceof Date) {
      pushNormalized(val);
      return;
    }
    const s = String(val).trim();
    if (!s) return;

    // Klassische JSONB-Array-Strings sind bereits mit Kommas; aber wenn jemand
    // "2025-10-31,2025-11-02" speichert, splitten wir defensiv:
    if (s.includes(',') || s.includes(';') || /\s/.test(s)) {
      for (const piece of splitLooseList(s)) pushNormalized(piece);
      return;
    }

    // Einzelwert als String/Zahl
    pushNormalized(s);
  };

  walk(av);
  return set;
}

/** Ermittelt 'YYYY-MM-DD' eines Day-Objekts (sicher & robust). */
function dayToYMD(day: MonthDay): string {
  // MonthCalendar liefert idR day.dateStr === 'YYYY-MM-DD'. Falls nicht vorhanden, aus Date bauen.
  const candidate = (day as any).dateStr ?? day.date;
  return normalizeYMD(candidate);
}

/* -------------------------- KOMPONENTE -------------------------- */

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
    (async () => {
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
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  /** Map<cleanerId, Set<'YYYY-MM-DD'>> für O(1)-Lookups */
  const unavailableIndex = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const c of cleaners) {
      m.set(c.id, availabilityToSet((c as any).availability));
    }
    return m;
  }, [cleaners]);

  /** Wer ist an diesem Tag NICHT verfügbar? */
  function getUnavailableNames(ymd: string): string[] {
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
    const ymd = dayToYMD(day);           // <- robustes, zeitzonenfreies 'YYYY-MM-DD'
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

      {/* Filter-Kacheln */}
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

            {/* Einzelne */}
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

// src/routes/.../Calendar.tsx
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import { MonthCalendar } from '../../components/calendar/MonthCalendar';
import { getCleaners, getTasks } from '../../lib/api';
import type { User, Cleaner } from '../../types/db';
import type { MonthDay } from '../../lib/dates';
import {
  Building2,
  MapPin,
  Calendar as CalendarIcon,
  Brush,
  User as UserIcon,
  Mail,
  Phone,
  X,
} from 'lucide-react';

interface ContextType {
  user: User;
}

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

function normalizeYMD(input: unknown): string {
  if (input == null) return '';
  if (input instanceof Date)
    return ymdFromUTC(input.getUTCFullYear(), input.getUTCMonth() + 1, input.getUTCDate());
  const s = String(input).trim();
  if (!s) return '';
  if (s.includes('T')) {
    const dt = new Date(s);
    if (!isNaN(dt.getTime()))
      return ymdFromUTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
  }
  const m =
    s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/) ||
    s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/) ||
    s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (m) {
    const [a, b, c] = m.slice(1).map(Number);
    const [y, mo, d] = s.includes('.') ? [c, b, a] : [a, b, c];
    return isValidYMD(y, mo, d) ? ymdFromUTC(y, mo, d) : '';
  }
  const dt = new Date(s);
  if (!isNaN(dt.getTime()))
    return ymdFromUTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
  return '';
}

function availabilityToSet(av: unknown): Set<string> {
  const set = new Set<string>();
  const add = (x: unknown) => { const y = normalizeYMD(x); if (y) set.add(y); };
  const walk = (val: unknown) => {
    if (val == null) return;
    if (Array.isArray(val)) return val.forEach(walk);
    const s = String(val).trim();
    if (!s) return;
    for (const part of s.split(/[,;\s]+/)) add(part);
  };
  walk(av);
  return set;
}

function dayToYMD(day: MonthDay): string {
  return normalizeYMD((day as any).dateStr ?? day.date);
}

function getCleanerLabel(c: Cleaner): string {
  const n = (c as any)?.name;
  if (typeof n === 'string' && n.trim()) return n.trim();
  const e = (c as any)?.email;
  if (typeof e === 'string' && e.trim()) return e.trim();
  const p = (c as any)?.phone;
  if (typeof p === 'string' && p.trim()) return p.trim();
  return '[Unbenannt]';
}

/* ---------------- Component ---------------- */

type AssignmentDetail = { name: string; address?: string | null; date: string };
type DetailIndex = Map<string, Map<string, AssignmentDetail[]>>;

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
  const [detailsIndex, setDetailsIndex] = useState<DetailIndex>(new Map());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState<string>('');
  const [modalItems, setModalItems] = useState<AssignmentDetail[]>([]);
  const [peopleModalOpen, setPeopleModalOpen] = useState(false);
  const [peopleModalDate, setPeopleModalDate] = useState<string>('');
  const [peopleList, setPeopleList] = useState<Cleaner[]>([]);

  const inFlightRef = useRef(false);
  const lastFetchTsRef = useRef(0);
  const initialLoadDone = useRef(false);
  const THROTTLE_MS = 500;

  /* ---- CLEANERS LADEN ---- */
  const loadCleaners = useCallback(async (opts?: { silent?: boolean }) => {
    const nowTs = Date.now();
    if (inFlightRef.current || nowTs - lastFetchTsRef.current < THROTTLE_MS) return;
    inFlightRef.current = true;
    if (!opts?.silent && !initialLoadDone.current) setLoading(true);
    setErrorMsg(null);
    try {
      const data = await getCleaners(user.id);
      setCleaners(data ?? []);
      if (!data?.length) setErrorMsg('Sie haben noch keine Cleaner erstellt.');
      initialLoadDone.current = true;
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
    if (path.toLowerCase().includes('calendar')) void loadCleaners({ silent: true });
  }, [location.pathname, loadCleaners]);

  /* ---- INDEX: Abwesenheiten ---- */
  const unavailableIndex = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const c of cleaners) m.set(c.id, availabilityToSet((c as any).availability));
    return m;
  }, [cleaners]);

  /* ---- TASKS LADEN ---- */
  const loadAssignments = useCallback(async () => {
    try {
      const startYMD = ymdFromUTC(year, month + 1, 1);
      const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      const endYMD = ymdFromUTC(year, month + 1, lastDay);
      const rows: any[] = await getTasks(user.id, { dateFrom: startYMD, dateTo: endYMD });
      const idx: DetailIndex = new Map();
      for (const t of rows ?? []) {
        const ymd = normalizeYMD(t?.date);
        const cleanerId = t?.cleaner_id;
        const aptName = t?.apartment?.name;
        const address = t?.apartment?.address;
        if (!ymd || !cleanerId || !aptName) continue;
        const detail: AssignmentDetail = { name: aptName, address: address ?? null, date: ymd };
        const byDate = idx.get(cleanerId) ?? new Map();
        const list = byDate.get(ymd) ?? [];
        list.push(detail);
        byDate.set(ymd, list);
        idx.set(cleanerId, byDate);
      }
      setDetailsIndex(idx);
    } catch { /* ignore */ }
  }, [user.id, year, month]);

  useEffect(() => { void loadAssignments(); }, [loadAssignments]);

  const monthStart = useMemo(() => ymdFromUTC(year, month + 1, 1), [year, month]);
  const monthEnd = useMemo(() => ymdFromUTC(year, month + 1, new Date(Date.UTC(year, month + 1, 0)).getUTCDate()), [year, month]);

  const isInVisibleMonth = useCallback(
    (ymd: string) => ymd >= monthStart && ymd <= monthEnd,
    [monthStart, monthEnd]
  );

  const monthUnavailableAll = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const c of cleaners) {
      const set = unavailableIndex.get(c.id);
      if (!set) continue;
      const label = getCleanerLabel(c);
      for (const ymd of set) {
        if (!isInVisibleMonth(ymd)) continue;
        if (!map.has(ymd)) map.set(ymd, []);
        map.get(ymd)!.push(label);
      }
    }
    return map;
  }, [cleaners, unavailableIndex, isInVisibleMonth]);

  const selectedCleanerLabel = useMemo(() => {
    if (!selectedCleanerId) return '';
    const c = cleaners.find((x) => x.id === selectedCleanerId);
    return c ? getCleanerLabel(c) : '';
  }, [cleaners, selectedCleanerId]);

  const getUnavailableNames = useCallback(
    (ymd: string): string[] => {
      if (isAllView) return monthUnavailableAll.get(ymd) ?? [];
      const set = unavailableIndex.get(selectedCleanerId!);
      return set?.has(ymd) ? [selectedCleanerLabel] : [];
    },
    [isAllView, monthUnavailableAll, selectedCleanerId, unavailableIndex, selectedCleanerLabel]
  );

  const getUnavailableCleaners = useCallback(
    (ymd: string): Cleaner[] =>
      cleaners.filter((c) => unavailableIndex.get(c.id)?.has(ymd)),
    [cleaners, unavailableIndex]
  );

  const getAssignedDetailsForSelected = useCallback(
    (ymd: string): AssignmentDetail[] =>
      detailsIndex.get(selectedCleanerId ?? '')?.get(ymd) ?? [],
    [detailsIndex, selectedCleanerId]
  );

  const openModalFor = useCallback((ymd: string, items: AssignmentDetail[]) => {
    setModalDate(ymd); setModalItems(items); setModalOpen(true);
  }, []);

  const openPeopleModal = useCallback((ymd: string, people: Cleaner[]) => {
    setPeopleModalDate(ymd); setPeopleList(people); setPeopleModalOpen(true);
  }, []);

  /* ---- renderDay ---- */
  const renderDay = useCallback(
    (day: MonthDay) => {
      const ymd = dayToYMD(day);
      if (!ymd) return <div className={`h-full ${day.isCurrentMonth ? '' : 'opacity-40'}`} />;
      const unavailableNames = getUnavailableNames(ymd);
      const isUnavailable = unavailableNames.length > 0;
      const boxClass = isUnavailable
        ? 'bg-red-500/15 text-red-200 border-red-500/30'
        : 'bg-emerald-500/10 text-emerald-200 border-emerald-500/25';
      const assignedDetails = (!isAllView && isUnavailable ? getAssignedDetailsForSelected(ymd) : []) ?? [];
      const unavailableCleaners = isAllView && isUnavailable ? getUnavailableCleaners(ymd) : [];

      return (
        <div className={`h-full ${day.isCurrentMonth ? '' : 'opacity-40'} select-none`}>
          <div className="text-xs mb-1 flex items-center gap-2">
            <span className={day.isToday ? 'font-bold text-white' : 'text-white/70'}>
              {day.date.getDate()}
            </span>
          </div>

          {day.isCurrentMonth && (
            <div className={`relative text-xs p-1.5 rounded-md border ${boxClass}`}>
              {!isUnavailable && <div className="truncate text-center">Verfügbar</div>}

              {/* ALLE Ansicht */}
              {isAllView && isUnavailable && (
                <>
                  <div className="mt-1 max-h-16 overflow-y-auto pr-1 hidden sm:block">
                    <ul className="space-y-1">
                      {unavailableNames.map((n, i) => (
                        <li key={i} className="whitespace-nowrap text-[11px] text-white/90">
                          <span className="text-white/60">Cleaner:</span>{' '}
                          <span className="font-medium">{n}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-1 flex items-center justify-center sm:hidden">
                    <button
                      onClick={() => openPeopleModal(ymd, unavailableCleaners)}
                      className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white text-black border border-white/60 hover:bg-white/90 transition-colors"
                    >
                      <Brush className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}

              {/* EINZEL Ansicht */}
              {!isAllView && isUnavailable && (
                assignedDetails.length > 0 ? (
                  <div className="mt-1 flex items-center justify-center">
                    <button
                      onClick={() => openModalFor(ymd, assignedDetails)}
                      className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white text-black border border-white/60 hover:bg-white/90 transition-colors"
                    >
                      <Building2 className="w-4 h-4" />
                      <span className="text-[11px] font-semibold hidden sm:inline">Geplante Einsätze</span>
                    </button>
                  </div>
                ) : (
                  // Wenn keine getTasks: rotes X Symbol
                  <div className="flex items-center justify-center mt-2">
                    <X
                      className="w-5 h-5 text-red-500 drop-shadow-[0_0_8px_rgba(255,0,0,0.5)] animate-pulse"
                      title="Keine geplanten Einsätze"
                    />
                  </div>
                )
              )}
            </div>
          )}
        </div>
      );
    },
    [getUnavailableNames, isAllView, getAssignedDetailsForSelected, getUnavailableCleaners, openModalFor, openPeopleModal]
  );

  const sortedCleaners = useMemo(
    () => [...cleaners].sort((a, b) => getCleanerLabel(a).localeCompare(getCleanerLabel(b))),
    [cleaners]
  );

  if (loading) return <div className="text-white">Loading...</div>;

  /* ---- RENDER ---- */
  return (
    <div>
      {errorMsg && (
        <div className="mb-3 rounded border border-yellow-500/40 bg-yellow-500/10 p-3 text-yellow-200 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Cleaner Auswahl */}
      {cleaners.length > 0 && (
        <div className="mb-4">
          <div className="text-white font-semibold mb-2">Cleaner auswählen</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <button
              onClick={() => setSelectedCleanerId(null)}
              className={`rounded-xl px-3 py-3 border transition
                ${isAllView ? 'border-white/60 bg-white/10 shadow-[0_0_0_2px_rgba(255,255,255,0.35)]'
                  : 'border-white/10 bg-white/5 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:border-white/30'}`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-sm font-medium text-white">Alle</div>
                <div className="text-[11px] text-white/60">{sortedCleaners.length} Cleaner</div>
              </div>
              <div className="text-xs text-white/60 mt-0.5">Gesamtübersicht</div>
            </button>

            {sortedCleaners.map((c) => {
              const active = selectedCleanerId === c.id;
              const label = getCleanerLabel(c);
              const initials = label.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCleanerId(c.id)}
                  className={`rounded-xl px-3 py-3 border transition
                    ${active ? 'border-white/60 bg-white/10 shadow-[0_0_0_2px_rgba(255,255,255,0.35)]'
                      : 'border-white/10 bg-white/5 hover:shadow-[0_0_24px_rgba(255,255,255,0.45)] hover:border-white/30'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center
                      ${active ? 'bg-white/80 text-black' : 'bg-white/10 text-white/80'}`}>
                      <span className="text-xs font-bold">{initials}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white truncate">{label}</div>
                      <div className="text-[11px] text-white/60">{active ? 'Ausgewählt' : 'Klicken'}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Kalender mit Glow */}
      <div className="rounded-2xl border border-white/20 bg-black p-3 sm:p-4 ring-1 ring-white/10 shadow-[0_0_28px_rgba(255,255,255,0.08)]">
        <MonthCalendar
          year={year}
          month={month}
          onMonthChange={(y, m) => { setYear(y); setMonth(m); }}
          renderDay={renderDay}
        />
      </div>
    </div>
  );
}

export default Calendar;

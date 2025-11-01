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
  X as CloseIcon,
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

  const unavailableIndex = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const c of cleaners) m.set(c.id, availabilityToSet((c as any).availability));
    return m;
  }, [cleaners]);

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
  const monthEnd = useMemo(
    () => ymdFromUTC(year, month + 1, new Date(Date.UTC(year, month + 1, 0)).getUTCDate()),
    [year, month]
  );

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

  const closeModals = useCallback(() => {
    setModalOpen(false);
    setPeopleModalOpen(false);
  }, []);

  /* ---- Farb-Logik für den Tag ---- */
  const dayStyles = useCallback((isUnavailable: boolean) => {
    if (isUnavailable) {
      // Rot (nicht verfügbar)
      return 'bg-red-600/10 text-red-100 border-red-400/30 shadow-[0_0_0_1px_rgba(239,68,68,0.18)_inset]';
    }
    // Grün (verfügbar)
    return 'bg-emerald-600/10 text-emerald-100 border-emerald-400/30 shadow-[0_0_0_1px_rgba(16,185,129,0.18)_inset]';
  }, []);

  /* ---- renderDay ---- */
  const renderDay = useCallback(
    (day: MonthDay) => {
      const ymd = dayToYMD(day);
      if (!ymd) return <div className={`h-full ${day.isCurrentMonth ? '' : 'opacity-40'}`} />;
      const unavailableNames = getUnavailableNames(ymd);
      const isUnavailable = unavailableNames.length > 0;
      const boxClass = dayStyles(isUnavailable);
      const assignedDetails = (!isAllView && isUnavailable ? getAssignedDetailsForSelected(ymd) : []) ?? [];
      const unavailableCleaners = isAllView && isUnavailable ? getUnavailableCleaners(ymd) : [];

      return (
        <div className={`h-full ${day.isCurrentMonth ? '' : 'opacity-40'} select-none`}>
          <div className="text-xs mb-1 flex items-center gap-2">
            <span className={day.isToday ? 'font-bold text-white' : 'text-white/80'}>
              {day.date.getDate()}
            </span>
            {day.isToday && (
              <span className="inline-flex items-center rounded-full bg-sky-500/20 text-sky-100 px-1.5 py-0.5 text-[10px] border border-sky-400/30">
                Heute
              </span>
            )}
          </div>

          {day.isCurrentMonth && (
            <div className={`relative text-xs p-1.5 rounded-md border ${boxClass}`}>
              {!isUnavailable && (
                <div className="truncate text-center font-medium">
                  Verfügbar
                </div>
              )}

              {/* ALLE Ansicht */}
              {isAllView && isUnavailable && (
                <>
                  <div className="mt-1 max-h-16 overflow-y-auto pr-1 hidden sm:block">
                    <ul className="space-y-1">
                      {unavailableNames.map((n, i) => (
                        <li key={i} className="whitespace-nowrap text-[11px] text-red-50">
                          <span className="text-red-200">Cleaner:</span>{' '}
                          <span className="font-semibold">{n}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-1 flex items-center justify-center sm:hidden">
                    <button
                      onClick={() => openPeopleModal(ymd, unavailableCleaners)}
                      className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white text-black border border-blue-600/40 hover:bg-blue-50 transition-colors"
                      title="Nicht verfügbare Cleaner anzeigen"
                    >
                      <Brush className="w-4 h-4 text-blue-700" />
                      <span className="text-[11px] font-semibold">Details</span>
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
                      className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white text-black border border-blue-600/40 hover:bg-blue-50 transition-colors"
                    >
                      <Building2 className="w-4 h-4 text-blue-700" />
                      <span className="text-[11px] font-semibold hidden sm:inline">Geplante Einsätze</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center mt-2">
                    <span
                      className="sm:hidden inline-flex items-center justify-center h-7 w-7 rounded-full
                                 bg-red-900/40 border border-red-700/60
                                 shadow-[0_0_16px_rgba(225,29,72,0.55)] ring-1 ring-red-800/50"
                    >
                      <X
                        className="w-5 h-5 text-red-200"
                        strokeWidth={2.75}
                        title="Keine geplanten Einsätze"
                        aria-label="Keine geplanten Einsätze"
                      />
                    </span>
                    <span className="hidden sm:inline text-red-200 font-medium tracking-wide">
                      – Keine geplanten Einsätze –
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      );
    },
    [
      getUnavailableNames,
      isAllView,
      getAssignedDetailsForSelected,
      getUnavailableCleaners,
      openModalFor,
      openPeopleModal,
      dayStyles
    ]
  );

  const sortedCleaners = useMemo(
    () => [...cleaners].sort((a, b) => getCleanerLabel(a).localeCompare(getCleanerLabel(b))),
    [cleaners]
  );

  /* ---- LOADING ---- */
  if (loading) {
    return (
      <div className="relative min-h-[60vh] text-white">
        {/* dezent: nur Grün/Blau */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-48 -left-48 h-[40rem] w-[40rem] rounded-full blur-3xl opacity-45"
               style={{ background: 'radial-gradient(40% 40% at 50% 50%, rgba(16,185,129,0.6) 0%, transparent 60%)' }} />
          <div className="absolute -bottom-64 -right-80 h-[40rem] w-[40rem] rounded-full blur-3xl opacity-35"
               style={{ background: 'radial-gradient(40% 40% at 50% 50%, rgba(2,132,199,0.6) 0%, transparent 60%)' }} />
        </div>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  /* ---- RENDER ---- */
  return (
    <div className="relative text-white">
      {/* --- BACKGROUND (nur Grün/Blau mit leichter Conic-Note) --- */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[50rem] w-[50rem] rounded-full blur-3xl opacity-35"
           style={{ background: 'radial-gradient(40% 40% at 50% 50%, rgba(16,185,129,0.55) 0%, transparent 60%)' }} />
      <div className="pointer-events-none absolute -bottom-56 -right-72 h-[50rem] w-[50rem] rounded-full blur-3xl opacity-30"
           style={{ background: 'radial-gradient(40% 40% at 50% 50%, rgba(2,132,199,0.55) 0%, transparent 60%)' }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08]"
           style={{ backgroundImage: 'conic-gradient(from 90deg at 50% 50%, #0EA5E9, #10B981, #0EA5E9)' }} />
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:32px_32px]" />

      {errorMsg && (
        <div className="mb-3 relative">
          <div className="rounded-xl p-[1px] bg-gradient-to-r from-sky-500 to-emerald-500">
            <div className="rounded-xl bg-[#0b0f1a] px-4 py-3 text-sky-100 text-sm border border-white/10">
              {errorMsg}
            </div>
          </div>
        </div>
      )}

      {/* Cleaner Auswahl */}
      {cleaners.length > 0 && (
        <div className="mb-4">
          <div className="text-white font-semibold mb-2">Cleaner auswählen</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <button
              onClick={() => setSelectedCleanerId(null)}
              className={`group rounded-xl px-3 py-3 border transition relative overflow-hidden
                ${isAllView
                  ? 'border-white/60 bg-white/10 shadow-[0_0_0_2px_rgba(255,255,255,0.35)]'
                  : 'border-sky-600/40 bg-white/5 hover:shadow-[0_0_24px_rgba(14,165,233,0.45)] hover:border-sky-400/60'}`}
            >
              <span className="pointer-events-none absolute -inset-[1px] rounded-xl bg-gradient-to-r from-emerald-500 via-sky-500 to-emerald-500 opacity-0 group-hover:opacity-25 blur-sm transition" />
              <div className="relative flex items-baseline justify-between gap-2">
                <div className="text-sm font-medium text-white">Alle</div>
                <div className="text-[11px] text-white/70">{sortedCleaners.length} Cleaner</div>
              </div>
              <div className="relative text-xs text-white/70 mt-0.5">Gesamtübersicht</div>
            </button>

            {sortedCleaners.map((c) => {
              const active = selectedCleanerId === c.id;
              const label = getCleanerLabel(c);
              const initials = label.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCleanerId(c.id)}
                  className={`group rounded-xl px-3 py-3 border transition relative overflow-hidden
                    ${active
                      ? 'border-emerald-400 bg-emerald-600/10 shadow-[0_0_0_2px_rgba(16,185,129,0.35)]'
                      : 'border-sky-600/40 bg-white/5 hover:shadow-[0_0_24px_rgba(14,165,233,0.45)] hover:border-sky-400/60'}`}
                >
                  <span className="pointer-events-none absolute -inset-[1px] rounded-xl bg-gradient-to-r from-emerald-500 via-sky-500 to-emerald-500 opacity-0 group-hover:opacity-25 blur-sm transition" />
                  <div className="relative flex items-center gap-2">
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center
                      ${active ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-900/40 text-sky-100'}`}>
                      <span className="text-xs font-bold">{initials}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white truncate">{label}</div>
                      <div className={`text-[11px] ${active ? 'text-emerald-200' : 'text-sky-200'}`}>
                        {active ? 'Ausgewählt' : 'Klicken'}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Kalender-Wrapper */}
      <div className="relative rounded-2xl border border-sky-600/30 bg-sky-900/10 p-3 sm:p-4 ring-1 ring-white/10 shadow-[0_0_28px_rgba(14,165,233,0.25)] overflow-hidden">
        <div className="pointer-events-none absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-emerald-500/15 via-sky-500/15 to-emerald-500/15 blur-md" aria-hidden />
        <div className="relative">
          <MonthCalendar
            year={year}
            month={month}
            onMonthChange={(y, m) => { setYear(y); setMonth(m); }}
            renderDay={renderDay}
          />
        </div>
      </div>

      {/* ===== MODALS ===== */}

      {/* Modal: Geplante Einsätze */}
      {modalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="assignments-title"
            className="w-full max-w-lg mx-4 bg-[#0c111b] text-white border border-sky-600/30 rounded-2xl shadow-2xl
                       max-h-[90vh] overflow-y-auto p-4 sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="assignments-title" className="text-lg sm:text-xl font-semibold">
                  Geplante Einsätze
                </h3>
                <p className="text-sky-200 text-sm mt-0.5 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {modalDate}
                </p>
              </div>
              <button
                aria-label="Schließen"
                onClick={closeModals}
                className="p-2 rounded-md hover:bg-white/10 transition-colors"
              >
                <CloseIcon className="w-5 h-5 text-white/80" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {modalItems.map((it, idx) => (
                <div
                  key={`${it.name}-${idx}`}
                  className="rounded-xl border border-emerald-600/25 bg-emerald-900/10 p-3"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-300" />
                    <div className="font-medium">{it.name}</div>
                  </div>
                  {it.address && (
                    <div className="mt-1 flex items-center gap-2 text-sm text-emerald-200">
                      <MapPin className="w-4 h-4" />
                      <span>{it.address}</span>
                    </div>
                  )}
                </div>
              ))}

              {modalItems.length === 0 && (
                <div className="text-sky-100 text-sm">Keine Einsätze gefunden.</div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModals}
                className="px-5 py-2 min-h-[44px] bg-white text-black font-semibold rounded-md hover:bg-blue-50 transition-colors w-full sm:w-auto border border-sky-600/30"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nicht verfügbare Cleaner */}
      {peopleModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="people-title"
            className="w-full max-w-lg mx-4 bg-[#0c111b] text-white border border-sky-600/30 rounded-2xl shadow-2xl
                       max-h-[90vh] overflow-y-auto p-4 sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="people-title" className="text-lg sm:text-xl font-semibold">
                  Nicht verfügbare Cleaner
                </h3>
                <p className="text-sky-200 text-sm mt-0.5 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {peopleModalDate}
                </p>
              </div>
              <button
                aria-label="Schließen"
                onClick={closeModals}
                className="p-2 rounded-md hover:bg-white/10 transition-colors"
              >
                <CloseIcon className="w-5 h-5 text-white/80" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {peopleList.map((c) => {
                const label = getCleanerLabel(c);
                return (
                  <div
                    key={c.id}
                    className="rounded-xl border border-red-600/25 bg-red-900/10 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-red-300" />
                      <div className="font-medium">{label}</div>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-red-200">
                      {c.email && (
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="w-4 h-4" />
                          {c.email}
                        </span>
                      )}
                      {c.phone && (
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="w-4 h-4" />
                          {c.phone}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {peopleList.length === 0 && (
                <div className="text-sky-100 text-sm">Keine Einträge.</div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModals}
                className="px-5 py-2 min-h-[44px] bg-white text-black font-semibold rounded-md hover:bg-blue-50 transition-colors w-full sm:w-auto border border-sky-600/30"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ===== /MODALS ===== */}
    </div>
  );
}

export default Calendar;

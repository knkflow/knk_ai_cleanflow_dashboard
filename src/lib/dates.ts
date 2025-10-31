// src/lib/dates.ts
import {
  format,
  parse,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addDays,
} from 'date-fns';

export const DATE_FORMAT = 'yyyy-MM-dd'; // <- NEUES Format

export function toDdMmYyyy(date: Date): string {
  // liefert jetzt YYYY-MM-DD
  return format(date, DATE_FORMAT);
}

export function fromDdMmYyyy(dateStr: string): Date {
  // erwartet jetzt YYYY-MM-DD
  return parse(dateStr, DATE_FORMAT, new Date());
}

export function isValidDateString(dateStr: string): boolean {
  try {
    const parsed = fromDdMmYyyy(dateStr);
    // Strenger Check: zurückformatiert muss identisch sein, sonst war parse „zu freundlich“
    return !isNaN(parsed.getTime()) && format(parsed, DATE_FORMAT) === dateStr;
  } catch {
    return false;
  }
}

export interface MonthDay {
  date: Date;
  dateStr: string;      // YYYY-MM-DD
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function getMonthMatrix(year: number, month: number): MonthDay[][] {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(new Date(year, month));

  // Woche beginnt (wie bisher) am Sonntag: getDay() -> 0=So ... 6=Sa
  const startDay = getDay(start);
  const monthStart = addDays(start, -startDay);

  const endDay = getDay(end);
  const monthEnd = addDays(end, 6 - endDay);

  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const todayStr = toDdMmYyyy(new Date());

  const days: MonthDay[] = allDays.map((date) => {
    const dateStr = toDdMmYyyy(date); // YYYY-MM-DD
    return {
      date,
      dateStr,
      isCurrentMonth: date.getMonth() === month,
      isToday: dateStr === todayStr,
    };
  });

  const weeks: MonthDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return weeks;
}

export function getNextMonth(year: number, month: number): { year: number; month: number } {
  const next = addMonths(new Date(year, month), 1);
  return { year: next.getFullYear(), month: next.getMonth() };
}

export function getPrevMonth(year: number, month: number): { year: number; month: number } {
  const prev = subMonths(new Date(year, month), 1);
  return { year: prev.getFullYear(), month: prev.getMonth() };
}

export function getMonthLabel(year: number, month: number): string {
  // Nur Anzeige — bleibt lokalisiert. (Kalender-Kopfzeile)
  return format(new Date(year, month), 'MMMM yyyy');
}

export function getTodayPlusN(days: number): Date {
  return addDays(new Date(), days);
}

export function formatDateLabel(date: Date): string {
  // Anzeige-Badge „Heute/Morgen“ bleibt wie gehabt.
  const today = new Date();
  const tomorrow = addDays(today, 1);

  if (toDdMmYyyy(date) === toDdMmYyyy(today)) {
    return 'Heute';
  }
  if (toDdMmYyyy(date) === toDdMmYyyy(tomorrow)) {
    return 'Morgen';
  }
  // Reines Anzeigeformat für Labels:
  return format(date, 'dd.MM.yyyy');
}

export function getDateRange(startDate: Date, endDate: Date): string[] {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  // liefert Array in YYYY-MM-DD
  return days.map(toDdMmYyyy);
}

import { format, parse, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addDays } from 'date-fns';

export const DATE_FORMAT = 'dd-MM-yyyy';

export function toDdMmYyyy(date: Date): string {
  return format(date, DATE_FORMAT);
}

export function fromDdMmYyyy(dateStr: string): Date {
  return parse(dateStr, DATE_FORMAT, new Date());
}

export function isValidDateString(dateStr: string): boolean {
  try {
    const parsed = fromDdMmYyyy(dateStr);
    return !isNaN(parsed.getTime());
  } catch {
    return false;
  }
}

export interface MonthDay {
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function getMonthMatrix(year: number, month: number): MonthDay[][] {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(new Date(year, month));

  const startDay = getDay(start);
  const monthStart = addDays(start, -startDay);

  const endDay = getDay(end);
  const monthEnd = addDays(end, 6 - endDay);

  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const today = toDdMmYyyy(new Date());

  const days: MonthDay[] = allDays.map(date => ({
    date,
    dateStr: toDdMmYyyy(date),
    isCurrentMonth: date.getMonth() === month,
    isToday: toDdMmYyyy(date) === today,
  }));

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
  return format(new Date(year, month), 'MMMM yyyy');
}

export function getTodayPlusN(days: number): Date {
  return addDays(new Date(), days);
}

export function formatDateLabel(date: Date): string {
  const today = new Date();
  const tomorrow = addDays(today, 1);

  if (toDdMmYyyy(date) === toDdMmYyyy(today)) {
    return 'Heute';
  }
  if (toDdMmYyyy(date) === toDdMmYyyy(tomorrow)) {
    return 'Morgen';
  }
  return format(date, 'dd.MM.yyyy');
}

export function getDateRange(startDate: Date, endDate: Date): string[] {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  return days.map(toDdMmYyyy);
}

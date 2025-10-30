import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MonthCalendar } from '../../components/calendar/MonthCalendar';
import { getCleanerByUserId, updateCleaner } from '../../lib/api';
import { toDdMmYyyy, fromDdMmYyyy, getDateRange, isValidDateString } from '../../lib/dates';
import type { User, Cleaner } from '../../types/db';
import type { MonthDay } from '../../lib/dates';

interface ContextType {
  user: User;
}

export function Calendar() {
  const { user } = useOutletContext<ContextType>();
  const [cleaner, setCleaner] = useState<Cleaner | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');

  useEffect(() => {
    loadCleaner();
  }, [user.id]);

  async function loadCleaner() {
    try {
      const data = await getCleanerByUserId(user.id);
      setCleaner(data);
    } finally {
      setLoading(false);
    }
  }

  async function toggleDate(dateStr: string) {
    if (!cleaner || updating) return;

    setUpdating(true);
    try {
      const newAvailability = cleaner.availability.includes(dateStr)
        ? cleaner.availability.filter((d) => d !== dateStr)
        : [...cleaner.availability, dateStr];

      const updated = await updateCleaner(cleaner.id, {
        availability: newAvailability,
      });
      setCleaner(updated);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUpdating(false);
    }
  }

  async function setRange(isUnavailable: boolean) {
    if (!cleaner || !rangeStart || !rangeEnd || updating) return;

    if (!isValidDateString(rangeStart) || !isValidDateString(rangeEnd)) {
      alert('Invalid date format. Use dd-MM-yyyy');
      return;
    }

    setUpdating(true);
    try {
      const start = fromDdMmYyyy(rangeStart);
      const end = fromDdMmYyyy(rangeEnd);

      if (start > end) {
        alert('Start date must be before end date');
        return;
      }

      const rangeDates = getDateRange(start, end);

      let newAvailability: string[];
      if (isUnavailable) {
        const uniqueDates = new Set([...cleaner.availability, ...rangeDates]);
        newAvailability = Array.from(uniqueDates);
      } else {
        newAvailability = cleaner.availability.filter((d) => !rangeDates.includes(d));
      }

      const updated = await updateCleaner(cleaner.id, {
        availability: newAvailability,
      });
      setCleaner(updated);
      setRangeStart('');
      setRangeEnd('');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUpdating(false);
    }
  }

  function renderDay(day: MonthDay) {
    if (!cleaner || !day.isCurrentMonth) {
      return (
        <div className="h-full opacity-40">
          <div className="text-xs text-white/40">{day.date.getDate()}</div>
        </div>
      );
    }

    const isUnavailable = cleaner.availability.includes(day.dateStr);

    return (
      <button
        onClick={() => toggleDate(day.dateStr)}
        disabled={updating}
        className={`w-full h-full text-left p-1 transition-colors ${
          isUnavailable
            ? 'bg-red-500/20 hover:bg-red-500/30'
            : 'hover:bg-white/5'
        } ${updating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      >
        <div
          className={`text-xs mb-1 ${
            day.isToday ? 'font-bold text-white' : 'text-white/70'
          }`}
        >
          {day.date.getDate()}
        </div>
        {isUnavailable && (
          <div className="text-xs text-red-400 font-medium">Unavailable</div>
        )}
      </button>
    );
  }

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  if (!cleaner) {
    return (
      <div className="text-white">
        <p>Your cleaner profile is not set up yet. Please contact your host.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">My Availability</h2>
        <p className="text-white/70 text-sm">
          Click on days to mark as unavailable. Click again to mark as available.
        </p>
      </div>

      <div className="mb-6 bg-white/5 border border-white/10 p-6">
        <h3 className="text-white font-semibold mb-4">Set Date Range</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">
              From (dd-MM-yyyy)
            </label>
            <input
              type="text"
              value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
              placeholder="31-12-2025"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white focus:border-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-2">
              To (dd-MM-yyyy)
            </label>
            <input
              type="text"
              value={rangeEnd}
              onChange={(e) => setRangeEnd(e.target.value)}
              placeholder="07-01-2026"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white focus:border-white focus:outline-none"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setRange(true)}
            disabled={updating || !rangeStart || !rangeEnd}
            className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Mark Range Unavailable
          </button>
          <button
            onClick={() => setRange(false)}
            disabled={updating || !rangeStart || !rangeEnd}
            className="flex-1 px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Mark Range Available
          </button>
        </div>
      </div>

      <MonthCalendar
        year={year}
        month={month}
        onMonthChange={(y, m) => {
          setYear(y);
          setMonth(m);
        }}
        renderDay={renderDay}
      />

      <div className="mt-6 bg-white/5 border border-white/10 p-4">
        <h3 className="text-white font-semibold mb-3">Statistics</h3>
        <p className="text-white/70 text-sm">
          Total unavailable days: <span className="text-white font-medium">{cleaner.availability.length}</span>
        </p>
      </div>
    </div>
  );
}

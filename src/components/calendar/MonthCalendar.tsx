import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthMatrix, getNextMonth, getPrevMonth, getMonthLabel } from '../../lib/dates';
import type { MonthDay } from '../../lib/dates';

interface MonthCalendarProps {
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
  renderDay: (day: MonthDay) => React.ReactNode;
}

export function MonthCalendar({ year, month, onMonthChange, renderDay }: MonthCalendarProps) {
  const weeks = getMonthMatrix(year, month);
  const next = getNextMonth(year, month);
  const prev = getPrevMonth(year, month);

  return (
    <div className="bg-white/5 border border-white/10">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <button
          onClick={() => onMonthChange(prev.year, prev.month)}
          className="p-2 hover:bg-white/10 transition-colors"
          title={`← ${getMonthLabel(prev.year, prev.month)}`}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <h3 className="text-lg font-semibold text-white">
          {getMonthLabel(year, month)}
        </h3>
        <button
          onClick={() => onMonthChange(next.year, next.month)}
          className="p-2 hover:bg-white/10 transition-colors"
          title={`${getMonthLabel(next.year, next.month)} →`}
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-white/10">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-xs font-medium text-white/70 border-r border-white/10 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {weeks.map((week, weekIdx) => (
        <div key={weekIdx} className="grid grid-cols-7 border-b border-white/10 last:border-b-0">
          {week.map((day, dayIdx) => (
            <div
              key={dayIdx}
              className="min-h-[80px] p-2 border-r border-white/10 last:border-r-0"
            >
              {renderDay(day)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

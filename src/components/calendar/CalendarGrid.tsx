import type { MonthData } from '@/types/calendar';
import { DayCell } from './DayCell';
import { WeekRowTotal } from './WeekRowTotal';

const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface CalendarGridProps {
  monthData: MonthData;
  selectedDateKey: string | null;
  onDayClick: (dateKey: string) => void;
}

export function CalendarGrid({ monthData, selectedDateKey, onDayClick }: CalendarGridProps) {
  return (
    <div className="grid grid-cols-[repeat(7,1fr)_auto] gap-1.5">
      {/* Day headers */}
      {DAY_HEADERS.map((d) => (
        <div key={d} className="text-center text-xs font-semibold text-gray-500 py-1 tracking-wider uppercase">
          {d}
        </div>
      ))}
      <div /> {/* Empty corner for week total column */}

      {/* Week rows */}
      {monthData.weeks.map((week) => (
        <>
          {week.days.map((day) => (
            <DayCell
              key={day.dateKey}
              day={day}
              isSelected={selectedDateKey === day.dateKey}
              rowIndex={week.weekIndex}
              onClick={onDayClick}
            />
          ))}
          <WeekRowTotal weeklyPnL={week.weeklyPnL} />
        </>
      ))}
    </div>
  );
}

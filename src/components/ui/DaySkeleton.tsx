export function DaySkeleton() {
  return (
    <div className="aspect-square min-h-[70px] rounded-lg bg-gray-800 animate-pulse" />
  );
}

export function CalendarSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(7,1fr)_auto] gap-1.5">
      {/* Day headers */}
      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', ''].map((d, i) => (
        <div key={i} className="text-center text-xs font-medium text-gray-500 py-1">
          {d}
        </div>
      ))}
      {/* 5 weeks × 8 cells */}
      {Array.from({ length: 40 }).map((_, i) => (
        <DaySkeleton key={i} />
      ))}
    </div>
  );
}

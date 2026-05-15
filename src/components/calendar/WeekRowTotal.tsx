interface WeekRowTotalProps {
  weeklyPnL: number;
}

export function WeekRowTotal({ weeklyPnL }: WeekRowTotalProps) {
  if (weeklyPnL === 0) {
    return <div className="flex items-center justify-end pr-1 text-xs text-gray-600">—</div>;
  }

  const sign = weeklyPnL > 0 ? '+' : '';
  const formatted =
    Math.abs(weeklyPnL) >= 1000
      ? `${sign}$${(weeklyPnL / 1000).toFixed(1)}k`
      : `${sign}$${weeklyPnL.toFixed(0)}`;

  return (
    <div
      className={`flex items-center justify-end pr-1 text-xs font-bold tabular-nums ${
        weeklyPnL > 0 ? 'text-green-400' : 'text-red-400'
      }`}
    >
      {formatted}
    </div>
  );
}

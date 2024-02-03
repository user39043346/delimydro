export default function ExpenseDate({ time }: { time: Date | null }) {
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  if (!time) {
    return <></>;
  }

  return (
    <div className="w-[24px]">
      <div className="text-gray-500 text-[9px] font-bold">{months[time.getMonth()]}</div>
      <div className="text-gray-500 text-[11px] font-extrabold">{time.getDate()}</div>
    </div>
  );
}

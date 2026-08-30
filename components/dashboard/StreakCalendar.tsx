import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

interface StreakCalendarProps {
  studiedDates: string[]; // ISO date strings like "2024-01-15"
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function StreakCalendar({ studiedDates }: StreakCalendarProps) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const studiedSet = new Set(studiedDates.map((d) => d.slice(0, 10)));
  const daysStudied = studiedDates.filter((d) => d.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)).length;

  const monthName = today.toLocaleString("en-IN", { month: "long" });
  const days = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-neutral-800">{monthName} {year}</h3>
        <span className="text-xs text-success-600 font-medium">
          {daysStudied} day{daysStudied !== 1 ? "s" : ""} studied
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => (
          <div key={i} className="text-center text-2xs text-neutral-400 pb-1 font-medium">
            {d}
          </div>
        ))}

        {/* Empty cells for first day offset */}
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = day === today.getDate();
          const studied = studiedSet.has(dateStr);
          const future = day > today.getDate();

          return (
            <div
              key={day}
              title={dateStr}
              className={cn(
                "aspect-square rounded-md flex items-center justify-center text-2xs font-medium transition-colors",
                studied && "bg-brand-500 text-white",
                isToday && !studied && "ring-2 ring-brand-400 text-brand-600",
                !studied && !isToday && !future && "bg-neutral-100 text-neutral-400",
                future && "text-neutral-200"
              )}
            >
              {day}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-neutral-400 mt-3 text-center">
        You studied on {daysStudied} day{daysStudied !== 1 ? "s" : ""} this month. Keep it up!
      </p>
    </Card>
  );
}

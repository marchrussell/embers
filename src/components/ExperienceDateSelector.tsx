import { useSuspenseQuery } from "@tanstack/react-query";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { formatTime, ScheduledExperienceDate } from "@/lib/experienceDateUtils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

interface Props {
  eventId: string;
  time: string; // fallback time from config if date row has no override
  onDateSelect: (date: ScheduledExperienceDate | null) => void;
  selectedDate: ScheduledExperienceDate | null;
}

interface BookingCount {
  experience_date: string | null;
  quantity: number;
}

interface ExperienceDateRow {
  id: string;
  experience_type: string;
  date: string;
  time: string | null;
  is_cancelled: boolean;
  max_capacity: number;
}

function formatDateToReadable(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function EventDateSelector({ eventId, time, onDateSelect, selectedDate }: Props) {
  const today = new Date().toISOString().split("T")[0];

  const { data: availableDates } = useSuspenseQuery<ScheduledExperienceDate[]>({
    queryKey: ["experience-dates", eventId, today],
    queryFn: async () => {
      try {
        const { data: dbDates } = await db
          .from("experience_dates")
          .select("*")
          .eq("experience_type", eventId)
          .eq("is_cancelled", false)
          .gte("date", today)
          .order("date", { ascending: true })
          .limit(24);

        const rows: ExperienceDateRow[] = dbDates ?? [];

        const counts: Record<string, number> = {};
        try {
          const { data: bookings } = await db
            .from("experiences_bookings")
            .select("experience_date, quantity")
            .eq("experience_type", eventId)
            .eq("payment_status", "paid");
          ((bookings as unknown as BookingCount[] | null) ?? []).forEach((b) => {
            if (b.experience_date)
              counts[b.experience_date] = (counts[b.experience_date] || 0) + b.quantity;
          });
        } catch {
          // booking count errors don't block dates from showing
        }

        return rows
          .map((row) => {
            const d = new Date(row.date + "T00:00:00");
            const maxCapacity = row.max_capacity;
            const spotsRemaining = maxCapacity - (counts[row.date] || 0);
            return {
              date: row.date,
              displayDate: formatDateToReadable(d),
              time: row.time ?? time,
              dayOfWeek: d.toLocaleDateString("en-GB", { weekday: "short" }),
              isOnline: maxCapacity >= 9999,
              maxCapacity,
              spotsRemaining,
            } satisfies ScheduledExperienceDate;
          })
          .filter((date) => date.spotsRemaining > 0);
      } catch {
        return [];
      }
    },
  });

  if (availableDates.length === 0) {
    return (
      <div className="flex h-14 w-full items-center rounded-md border border-white/20 bg-white/5 px-3 text-[15px] text-white/50">
        No upcoming dates available
      </div>
    );
  }

  return (
    <Select
      value={selectedDate?.date || ""}
      onValueChange={(value) => {
        const date = availableDates.find((d) => d.date === value) || null;
        onDateSelect(date);
      }}
    >
      <SelectTrigger className="h-14 w-full border-white/20 bg-white/5 py-5 text-[15px] text-white">
        <SelectValue placeholder="Select a date" />
      </SelectTrigger>
      <SelectContent className="max-h-[300px] border-white/20 bg-[#1A1A1A] text-white">
        {availableDates.map((date) => (
          <SelectItem
            key={date.date}
            value={date.date}
            className="min-h-[44px] py-3 text-[15px] text-white hover:bg-white/10 focus:bg-white/10 focus:text-white"
          >
            <div className="flex w-full items-center justify-between gap-4">
              <span>
                {date.displayDate} — {formatTime(date.time)}
              </span>
              {!date.isOnline && date.spotsRemaining !== undefined && (
                <span className="text-xs text-white/50">
                  {date.spotsRemaining} {date.spotsRemaining === 1 ? "spot" : "spots"} left
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Re-export for backward compat
export type { Props as EventDateSelectorProps };

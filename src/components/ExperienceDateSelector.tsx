import { useQuery } from "@tanstack/react-query";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { RecurrenceRule } from "@/lib/experienceDateUtils";
import {
  EVENT_CAPACITY_CONFIG,
  formatTime,
  getUpcomingEventDates,
  ScheduledEventDate,
} from "@/lib/experienceSchedule2026";

interface Props {
  eventId: string;
  eventTitle: string;
  recurrence: RecurrenceRule;
  time: string;
  onDateSelect: (date: ScheduledEventDate | null) => void;
  selectedDate: ScheduledEventDate | null;
}

interface BookingCount {
  event_date: string | null;
  quantity: number;
}

export function EventDateSelector({
  eventId,
  eventTitle,
  recurrence,
  time,
  onDateSelect,
  selectedDate,
}: Props) {
  const { data: availableDates = [], isLoading: loading } = useQuery<ScheduledEventDate[]>({
    queryKey: ["event-bookings", eventId, recurrence, time],
    queryFn: async () => {
      const config = EVENT_CAPACITY_CONFIG[eventId] || { isOnline: true, maxCapacity: 9999 };
      const dates = getUpcomingEventDates(recurrence, time, config.isOnline, 24);

      const { data: bookings } = await supabase
        .from("event_bookings")
        .select("event_date, quantity")
        .eq("event_type", eventId)
        .eq("payment_status", "paid");

      const counts: Record<string, number> = {};
      ((bookings as unknown as BookingCount[] | null) ?? []).forEach((booking) => {
        if (booking.event_date)
          counts[booking.event_date] = (counts[booking.event_date] || 0) + booking.quantity;
      });

      return dates
        .map((date) => ({ ...date, spotsRemaining: date.maxCapacity - (counts[date.date] || 0) }))
        .filter((date) => date.spotsRemaining > 0);
    },
    enabled: !!eventId,
  });

  if (loading) {
    return (
      <div className="w-full rounded-lg border border-white/20 bg-white/5 p-3 text-sm text-white/50">
        Loading available dates...
      </div>
    );
  }

  if (availableDates.length === 0) {
    return (
      <div className="w-full rounded-lg border border-white/20 bg-white/5 p-3 text-sm text-white/50">
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
      <SelectTrigger className="w-full border-white/20 bg-white/5 text-white">
        <SelectValue placeholder="Select a date" />
      </SelectTrigger>
      <SelectContent className="max-h-[300px] border-white/20 bg-[#1A1A1A]">
        {availableDates.map((date) => (
          <SelectItem
            key={date.date}
            value={date.date}
            className="text-white hover:bg-white/10 focus:bg-white/10"
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

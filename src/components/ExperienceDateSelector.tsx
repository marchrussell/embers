import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { getUpcomingEventDates, formatTime, ScheduledEventDate, EVENT_CAPACITY_CONFIG } from "@/lib/experienceSchedule2026";
import { RecurrenceRule } from "@/lib/experienceDateUtils";

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

export function EventDateSelector({ eventId, eventTitle, recurrence, time, onDateSelect, selectedDate }: Props) {
  const [availableDates, setAvailableDates] = useState<ScheduledEventDate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailableDates();
  }, [eventId, recurrence, time]);

  const loadAvailableDates = async () => {
    try {
      setLoading(true);
      
      // Get event capacity config
      const config = EVENT_CAPACITY_CONFIG[eventId] || { isOnline: true, maxCapacity: 9999 };
      
      // Generate upcoming dates
      const dates = getUpcomingEventDates(recurrence, time, config.isOnline, 24);
      
      // Get booking counts for these dates using raw query
      const { data: bookings, error } = await supabase
        .from('event_bookings')
        .select('event_date, quantity')
        .eq('event_type', eventId)
        .eq('payment_status', 'paid');
      
      // Calculate booked counts per date
      const counts: Record<string, number> = {};
      if (bookings && !error) {
        (bookings as unknown as BookingCount[]).forEach((booking) => {
          const dateKey = booking.event_date;
          if (dateKey) {
            counts[dateKey] = (counts[dateKey] || 0) + booking.quantity;
          }
        });
      }
      
      // Filter out dates that are at capacity
      const availableDatesWithSpots = dates.map(date => ({
        ...date,
        spotsRemaining: date.maxCapacity - (counts[date.date] || 0)
      })).filter(date => date.spotsRemaining > 0);
      
      setAvailableDates(availableDatesWithSpots);
    } catch (error) {
      console.error('Error loading available dates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-3 rounded-lg border border-white/20 bg-white/5 text-white/50 text-sm">
        Loading available dates...
      </div>
    );
  }

  if (availableDates.length === 0) {
    return (
      <div className="w-full p-3 rounded-lg border border-white/20 bg-white/5 text-white/50 text-sm">
        No upcoming dates available
      </div>
    );
  }

  return (
    <Select
      value={selectedDate?.date || ""}
      onValueChange={(value) => {
        const date = availableDates.find(d => d.date === value) || null;
        onDateSelect(date);
      }}
    >
      <SelectTrigger className="w-full bg-white/5 border-white/20 text-white">
        <SelectValue placeholder="Select a date" />
      </SelectTrigger>
      <SelectContent className="bg-[#1A1A1A] border-white/20 max-h-[300px]">
        {availableDates.map((date) => (
          <SelectItem 
            key={date.date} 
            value={date.date}
            className="text-white hover:bg-white/10 focus:bg-white/10"
          >
            <div className="flex items-center justify-between w-full gap-4">
              <span>{date.displayDate} — {formatTime(date.time)}</span>
              {!date.isOnline && date.spotsRemaining !== undefined && (
                <span className="text-xs text-white/50">
                  {date.spotsRemaining} {date.spotsRemaining === 1 ? 'spot' : 'spots'} left
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

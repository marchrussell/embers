import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export interface GuestTeacher {
  id: string;
  name: string;
  title: string;
  short_description: string | null;
  photo_url: string | null;
  session_date: string;
  session_title: string;
  what_to_expect: string[];
  is_active: boolean;
}

export function useNextGuestTeacher() {
  const {
    data: teacher = null,
    isLoading: loading,
    error,
  } = useQuery<GuestTeacher | null>({
    queryKey: ["next-guest-teacher"],
    queryFn: async () => {
      const now = new Date().toISOString();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: fetchError } = await (supabase as any)
        .from("live_session_details")
        .select("*")
        .eq("is_active", true)
        // .gte("session_date", now)
        .order("session_date", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;
      return data;
    },
  });

  return { teacher, loading, error: error as Error | null };
}

// Helper function to calculate next 3rd Thursday
export function getNextThirdThursday(): Date {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();

  // Find 3rd Thursday of current month
  let thirdThursday = getThirdThursdayOfMonth(year, month);

  // If it's past, get next month's
  if (thirdThursday < now) {
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
    thirdThursday = getThirdThursdayOfMonth(year, month);
  }

  // Set time to 7:30 PM GMT
  thirdThursday.setUTCHours(19, 30, 0, 0);

  return thirdThursday;
}

function getThirdThursdayOfMonth(year: number, month: number): Date {
  const firstDay = new Date(year, month, 1);
  const dayOfWeek = firstDay.getDay();

  // Days until first Thursday (Thursday = 4)
  const daysUntilThursday = (4 - dayOfWeek + 7) % 7;

  // Third Thursday is 14 days after first Thursday
  const thirdThursday = new Date(year, month, 1 + daysUntilThursday + 14);

  return thirdThursday;
}

// Format the session date for display
export function formatGuestSessionDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// Parse a UTC ISO date string for display — extracts the UTC date to avoid
// local timezone shifting the day (e.g. 7:30 PM GMT appearing as the next day
// for users in UTC+5+)
export function parseUTCDateForDisplay(isoString: string): Date {
  const [year, month, day] = isoString.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
}

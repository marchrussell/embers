import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export interface LiveSessionEnrichment {
  id: string;
  name: string | null;
  title: string | null;
  session_title: string | null;
  short_description: string | null;
  photo_url: string | null;
  what_to_expect: string[] | null;
  is_active: boolean;
  session_date: string;
}

type RawSessionRow = {
  id: string;
  start_time: string;
  session_type: string;
  live_session_details: LiveSessionEnrichment | LiveSessionEnrichment[] | null;
};

/**
 * Fetches the live_session_details record linked to the next upcoming
 * live_sessions row for the given session_type.
 *
 * Queries from the live_sessions side so session_type filtering is done at the
 * database level (live_session_details has no session_type column).
 */
export function useNextLiveSessionDetails(sessionType: string) {
  return useQuery<LiveSessionEnrichment | null>({
    queryKey: ["next-session-details", sessionType],
    queryFn: async () => {
      const now = new Date().toISOString();

      const { data, error } = (await db
        .from("live_sessions")
        .select("id, start_time, session_type, live_session_details!linked_session_id(*)")
        .eq("session_type", sessionType)
        .gte("start_time", now)
        .order("start_time", { ascending: true })
        .limit(1)
        .maybeSingle()) as { data: RawSessionRow | null; error: unknown };

      if (error) throw error;
      if (!data) return null;

      const details = Array.isArray(data.live_session_details)
        ? (data.live_session_details[0] ?? null)
        : data.live_session_details;

      return details;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

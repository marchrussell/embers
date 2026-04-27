import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

import { LiveSessionEnrichment } from "./useNextLiveSessionDetails";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export interface LiveSessionWithDetails extends LiveSessionEnrichment {
  startTime: string; // live_sessions.start_time (ISO)
}

type RawSessionRow = {
  id: string;
  start_time: string;
  session_type: string;
  live_session_details: LiveSessionEnrichment | LiveSessionEnrichment[] | null;
};

/**
 * Fetches the next upcoming live_sessions row (with enrichment) for every
 * session_type in a single query, returning a map keyed by session_type.
 * Use this on pages that need dates for multiple session types at once.
 */
export function useNextLiveSessionDetailsByType() {
  return useQuery<Record<string, LiveSessionWithDetails>>({
    queryKey: ["next-session-details-by-type"],
    queryFn: async () => {
      const now = new Date().toISOString();

      const { data, error } = (await db
        .from("live_sessions")
        .select("id, start_time, session_type, live_session_details!linked_session_id(*)")
        .gte("start_time", now)
        .order("start_time", { ascending: true })
        .limit(20)) as { data: RawSessionRow[] | null; error: unknown };

      console.log("Fetched next live sessions by type:", data);
      if (error) throw error;
      if (!data) return {};

      const map: Record<string, LiveSessionWithDetails> = {};
      for (const row of data) {
        if (map[row.session_type]) continue;
        const details = Array.isArray(row.live_session_details)
          ? (row.live_session_details[0] ?? null)
          : row.live_session_details;
        if (details) {
          map[row.session_type] = { ...details, startTime: row.start_time };
        }
      }

      console.log("Session details by type map:", map);
      return map;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

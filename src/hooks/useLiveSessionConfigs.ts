import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export interface LiveSessionConfig {
  id: string;
  session_type: string;
  title: string;
  subtitle: string | null;
  recurrence_type: "weekly" | "nthWeekday" | null;
  weekdays: number[] | null;
  weekday: number | null;
  nth: number | null;
  time: string | null;
  timezone: string;
  duration: string | null;
  recurrence_label: string | null;
  cta_label: string | null;
  event_type: string | null;
  format: string | null;
  is_active: boolean;
  image_url: string | null;
}

export function useLiveSessionConfigs() {
  return useQuery<LiveSessionConfig[]>({
    queryKey: ["live-session-configs"],
    queryFn: async () => {
      const { data, error } = await db
        .from("live_session_configs")
        .select("*")
        .eq("is_active", true)
        .order("created_at");

      if (error) throw error;
      return (data ?? []) as LiveSessionConfig[];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

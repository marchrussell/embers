import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

import { LiveSessionConfig } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export const useAdminLiveSessionConfigs = () => {
  const { isAdmin } = useAuth();

  return useQuery<LiveSessionConfig[]>({
    queryKey: ["admin-live-session-configs"],
    queryFn: async (): Promise<LiveSessionConfig[]> => {
      const { data, error } = await db
        .from("live_session_configs")
        .select("*")
        .order("session_type");
      if (error) throw error;
      return (data as unknown as LiveSessionConfig[]) ?? [];
    },
    enabled: !!isAdmin,
  });
};

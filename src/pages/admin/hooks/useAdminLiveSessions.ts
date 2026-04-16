import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

import { LiveSession, LiveSessionDetails } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

type SessionsData = {
  sessions: LiveSession[];
  sessionDetails: Map<string, LiveSessionDetails>;
};

const EMPTY: SessionsData = { sessions: [], sessionDetails: new Map() };

export const useAdminLiveSessions = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery<SessionsData>({
    queryKey: ["admin-live-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_sessions")
        .select("*")
        .order("start_time", { ascending: false });
      if (error) throw error;

      const sessionList = (data ?? []) as unknown as LiveSession[];
      const detailsMap = new Map<string, LiveSessionDetails>();

      if (sessionList.length > 0) {
        const { data: detailsData } = await db
          .from("live_session_details")
          .select("*")
          .in(
            "linked_session_id",
            sessionList.map((s) => s.id)
          );
        ((detailsData ?? []) as LiveSessionDetails[]).forEach((d) => {
          detailsMap.set(d.linked_session_id, d);
        });
      }

      return { sessions: sessionList, sessionDetails: detailsMap };
    },
    enabled: !!isAdmin,
  });

  const fetchRecordingMutation = useMutation({
    mutationFn: async ({ sessionId, roomName }: { sessionId: string; roomName: string }) => {
      const { data, error } = await supabase.functions.invoke("daily-fetch-recording", {
        body: { sessionId, roomName },
      });
      if (error) throw error;
      return data as { recording_url: string };
    },
    onSuccess: (data, { sessionId }) => {
      queryClient.setQueryData<SessionsData>(["admin-live-sessions"], (prev) =>
        prev
          ? {
              ...prev,
              sessions: prev.sessions.map((s) =>
                s.id === sessionId ? { ...s, recording_url: data.recording_url } : s
              ),
            }
          : prev
      );
      toast.success("Recording URL saved");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to fetch recording");
    },
  });

  return {
    sessionsData: query.data ?? EMPTY,
    isLoading: query.isLoading,
    fetchRecordingMutation,
  };
};

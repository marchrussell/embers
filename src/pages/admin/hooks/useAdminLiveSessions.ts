import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

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

// ── Schemas ───────────────────────────────────────────────

const DeleteSessionSchema = z.string().uuid();

const StatusChangeSchema = z.object({
  sessionId: z.string().uuid(),
  newStatus: z.enum(["scheduled", "live", "ended"]),
});
type StatusChangeInput = z.infer<typeof StatusChangeSchema>;

const SaveSessionSchema = z.object({
  form: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    start_time: z.string().min(1, "Start time is required"),
    end_time: z.string().optional(),
    session_type: z.string().min(1, "Session type is required"),
    recording_enabled: z.boolean(),
    recording_url: z.string().optional(),
  }),
  editingSessionId: z.string().uuid().nullable(),
  createdBy: z.string().uuid().optional(),
  detailsPayload: z
    .object({
      session_title: z.string().nullable(),
      short_description: z.string().nullable(),
      photo_url: z.string().nullable(),
      what_to_expect: z.array(z.string()),
      name: z.string().nullable(),
      title: z.string().nullable(),
    })
    .nullable(),
  existingDetailsId: z.string().uuid().optional(),
});
export type SaveSessionInput = z.infer<typeof SaveSessionSchema>;

// ── Hook ──────────────────────────────────────────────────

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
    mutationFn: async ({
      sessionId,
      roomName,
      sessionType,
    }: {
      sessionId: string;
      roomName: string;
      sessionType: string | null;
    }) => {
      const { data, error } = await supabase.functions.invoke("daily-fetch-recording", {
        body: { sessionId, roomName, sessionType },
      });
      if (error) {
        let message = error.message;
        try {
          const body = await (error as { context?: Response }).context?.json?.();
          if (body?.error) message = body.error;
        } catch { /* ignore parse errors */ }
        throw new Error(message);
      }
      if (data?.error) throw new Error(data.error);
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

  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      DeleteSessionSchema.parse(sessionId);
      // Delete child row first to satisfy FK constraint on live_session_details.linked_session_id
      await db.from("live_session_details").delete().eq("linked_session_id", sessionId);
      const { error } = await supabase.from("live_sessions").delete().eq("id", sessionId);
      if (error) throw error;
    },
    onSuccess: (_, sessionId) => {
      queryClient.setQueryData<SessionsData>(["admin-live-sessions"], (prev) => {
        if (!prev) return prev;
        const next = new Map(prev.sessionDetails);
        next.delete(sessionId);
        return { sessions: prev.sessions.filter((s) => s.id !== sessionId), sessionDetails: next };
      });
      toast.success("Session deleted");
    },
    onError: (err) => {
      const msg = err instanceof z.ZodError ? err.errors[0].message : "Failed to delete session";
      toast.error(msg);
    },
  });

  const statusChangeMutation = useMutation({
    mutationFn: async (input: StatusChangeInput) => {
      const { sessionId, newStatus } = StatusChangeSchema.parse(input);
      const { error } = await supabase
        .from("live_sessions")
        .update({ status: newStatus })
        .eq("id", sessionId);
      if (error) throw error;
      return { sessionId, newStatus };
    },
    onSuccess: ({ sessionId, newStatus }) => {
      queryClient.setQueryData<SessionsData>(["admin-live-sessions"], (prev) =>
        prev
          ? {
              ...prev,
              sessions: prev.sessions.map((s) =>
                s.id === sessionId ? { ...s, status: newStatus } : s
              ),
            }
          : prev
      );
      toast.success(newStatus === "live" ? "Session started" : "Session ended");
    },
    onError: (err) => {
      const msg =
        err instanceof z.ZodError ? err.errors[0].message : "Failed to update session status";
      toast.error(msg);
    },
  });

  const saveSessionMutation = useMutation({
    mutationFn: async (input: SaveSessionInput) => {
      const { form, editingSessionId, createdBy, detailsPayload, existingDetailsId } =
        SaveSessionSchema.parse(input);

      let sessionId: string;

      if (editingSessionId) {
        const { error } = await supabase
          .from("live_sessions")
          .update({
            title: form.title,
            description: form.description || null,
            start_time: form.start_time,
            end_time: form.end_time || null,
            session_type: form.session_type,
            recording_enabled: form.recording_enabled,
            recording_url: form.recording_url || null,
          })
          .eq("id", editingSessionId);
        if (error) throw error;
        sessionId = editingSessionId;
      } else {
        const { data: newSession, error } = await supabase
          .from("live_sessions")
          .insert({
            title: form.title,
            description: form.description || null,
            start_time: form.start_time,
            end_time: form.end_time || null,
            session_type: form.session_type,
            recording_enabled: form.recording_enabled,
            created_by: createdBy,
          })
          .select()
          .single();
        if (error) throw error;
        sessionId = newSession.id;

        // Await room creation so the invalidate in onSuccess sees the updated room name.
        // Don't throw on failure — session is already saved; just surface the error.
        const { error: roomError } = await supabase.functions.invoke("daily-create-room", {
          body: {
            sessionId,
            title: form.title,
            startTime: form.start_time,
            endTime: form.end_time,
            recordingEnabled: form.recording_enabled,
          },
        });
        if (roomError) {
          console.error("Daily.co room creation failed:", roomError);
          toast.error("Room creation failed — session saved but may need a room retry");
        }
      }

      if (detailsPayload) {
        const payload = {
          linked_session_id: sessionId,
          session_date: form.start_time,
          ...detailsPayload,
        };
        if (existingDetailsId) {
          await db.from("live_session_details").update(payload).eq("id", existingDetailsId);
        } else {
          await db.from("live_session_details").insert(payload);
        }
      } else if (editingSessionId && existingDetailsId) {
        await db
          .from("live_session_details")
          .update({ session_date: form.start_time })
          .eq("id", existingDetailsId);
      }

      return { sessionId, isNew: !editingSessionId };
    },
    onSuccess: ({ isNew }) => {
      toast.success(isNew ? "Session created" : "Session updated");
      queryClient.invalidateQueries({ queryKey: ["admin-live-sessions"] });
    },
    onError: (err) => {
      const msg =
        err instanceof z.ZodError
          ? err.errors[0].message
          : err instanceof Error
            ? err.message
            : "Failed to save session";
      toast.error(msg);
    },
  });

  return {
    sessionsData: query.data ?? EMPTY,
    isLoading: query.isLoading,
    fetchRecordingMutation,
    deleteSessionMutation,
    statusChangeMutation,
    saveSessionMutation,
  };
};

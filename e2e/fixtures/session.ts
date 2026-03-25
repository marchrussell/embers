import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role bypasses RLS
);

export interface TestSession {
  id: string;
  cleanup: () => Promise<void>;
}

export type SessionStatus = "scheduled" | "live" | "ended";

interface CreateTestSessionOptions {
  status?: SessionStatus;
  accessLevel?: "members" | "public";
  /** If true, seeds a fake daily_room_url so join can proceed without calling the edge function */
  withFakeRoom?: boolean;
  /** Guest token to store (for testing guest flows) */
  guestToken?: string;
  /** If set, guest_link_expires_at will be set to a past date */
  guestTokenExpired?: boolean;
}

/**
 * Creates a live_session row in the database for testing.
 * Always cleans up after the test.
 *
 * Usage:
 *   const session = await createTestSession({ status: "live" });
 *   // ... run test ...
 *   await session.cleanup();
 */
export async function createTestSession(
  opts: CreateTestSessionOptions = {}
): Promise<TestSession> {
  const {
    status = "scheduled",
    accessLevel = "public",
    withFakeRoom = true,
    guestToken,
    guestTokenExpired = false,
  } = opts;

  const now = new Date();
  const startTime = new Date(now.getTime() - 30 * 60_000); // 30 min ago
  const endTime = new Date(now.getTime() + 60 * 60_000); // 1 hr from now

  const guestExpiry = guestTokenExpired
    ? new Date(now.getTime() - 1000).toISOString() // expired 1s ago
    : new Date(now.getTime() + 24 * 60 * 60_000).toISOString(); // 24h from now

  const { data, error } = await supabase
    .from("live_sessions")
    .insert({
      title: "E2E Test Session",
      description: "Automated test session — safe to delete",
      status,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      access_level: accessLevel,
      session_type: "weekly-reset",
      daily_room_url: withFakeRoom ? "https://march.daily.co/test-room" : null,
      daily_room_name: withFakeRoom ? "test-room" : null,
      guest_token: guestToken ?? null,
      guest_link_expires_at: guestToken ? guestExpiry : null,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to create test session: ${error.message}`);

  const id = data.id as string;

  return {
    id,
    cleanup: async () => {
      await supabase.from("live_session_attendance").delete().eq("session_id", id);
      await supabase.from("live_sessions").delete().eq("id", id);
    },
  };
}

/** Update a test session's status (e.g. scheduled → live) */
export async function updateSessionStatus(
  sessionId: string,
  status: SessionStatus
): Promise<void> {
  const { error } = await supabase
    .from("live_sessions")
    .update({ status })
    .eq("id", sessionId);
  if (error) throw new Error(`Failed to update session status: ${error.message}`);
}

import DailyIframe, { DailyCall } from "@daily-co/daily-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, Clock, ExternalLink, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { FullPageSkeleton } from "@/components/skeletons/FullPageSkeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

/**
 * Live Session Room
 *
 * HARD REQUIREMENTS:
 * 1. Participants and guest teachers NEVER see participant count
 * 2. Guest teachers join via secure link, not admin access
 * 3. Waiting room exists before session goes live
 * 4. Host can test sound privately before going live
 * 5. Session only begins when host explicitly starts it
 */

interface SessionData {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  status: string;
  daily_room_url: string | null;
  access_level: string;
}

const LiveSessionRoom = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [callFrame, setCallFrame] = useState<DailyCall | null>(null);
  const [inWaitingRoom, setInWaitingRoom] = useState(false);
  const [isAudioSharing, setIsAudioSharing] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioTrackRef = useRef<MediaStreamTrack | null>(null);

  const role = searchParams.get("role");
  const guestToken = searchParams.get("token");

  const {
    data: session,
    isLoading,
    isError,
  } = useQuery<SessionData | null>({
    queryKey: ["live-session", sessionId],
    queryFn: async () => {
      const { data, error: fetchError } = await supabase
        .from("live_sessions")
        .select("*")
        .eq("id", sessionId!)
        .maybeSingle();
      if (fetchError) throw fetchError;
      return data as SessionData | null;
    },
    enabled: !!sessionId,
  });

  // Initialise waiting room state once session data is available
  useEffect(() => {
    if (session && session.status !== "live" && role !== "host") {
      setInWaitingRoom(true);
    }
  }, [session, role]);

  // Poll for session status changes (for waiting room)
  useEffect(() => {
    if (!inWaitingRoom || !sessionId) return;

    const checkStatus = async () => {
      const { data } = await supabase
        .from("live_sessions")
        .select("status")
        .eq("id", sessionId)
        .maybeSingle();

      if (data?.status === "live") {
        setInWaitingRoom(false);
        queryClient.setQueryData(["live-session", sessionId], (prev: SessionData | null) =>
          prev ? { ...prev, status: "live" } : null
        );
        toast.success("Session is starting now!");
      }
    };

    // Poll every 5 seconds
    pollIntervalRef.current = setInterval(checkStatus, 5000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [inWaitingRoom, sessionId]);

  // Join the session
  const handleJoin = useCallback(async () => {
    if (!session || !sessionId) return;

    setIsJoining(true);
    setJoinError(null);

    try {
      // Request meeting token from backend
      const { data, error: invokeError } = await supabase.functions.invoke("daily-get-token", {
        body: {
          sessionId,
          role: role || "audience",
          guestToken: guestToken || undefined,
        },
      });

      if (invokeError) throw invokeError;

      // Handle waiting room response
      if (data.waitingRoom) {
        setInWaitingRoom(true);
        setIsJoining(false);
        return;
      }

      // Create Daily call frame
      const container = document.getElementById("daily-container");
      if (!container) {
        throw new Error("Video container not found");
      }

      const frame = DailyIframe.createFrame(container, {
        iframeStyle: {
          width: "100%",
          height: "100%",
          border: "0",
          borderRadius: "12px",
        },
        showLeaveButton: true,
        showFullscreenButton: true,
        // CRITICAL: Never show participant count to guests or audience
        showParticipantsBar: data.role === "host",
        showLocalVideo: data.role !== "audience",
        activeSpeakerMode: true,
        layoutConfig: {
          grid: {
            maxTilesPerPage: 1,
          },
        },
        theme: {
          colors: {
            accent: "#D97757",
            accentText: "#FFFFFF",
            background: "#1A1A1A",
            backgroundAccent: "#2D2D2D",
            baseText: "#FFFFFF",
            border: "#3D3D3D",
            mainAreaBg: "#000000",
            mainAreaBgAccent: "#1A1A1A",
            mainAreaText: "#FFFFFF",
            supportiveText: "#A0A0A0",
          },
        },
      });

      // Handle events
      frame.on("joined-meeting", () => {
        console.log("Joined meeting as:", data.role);
        setHasJoined(true);
        setIsJoining(false);
      });

      frame.on("left-meeting", () => {
        console.log("Left meeting");
        setHasJoined(false);
        audioTrackRef.current?.stop();
        audioTrackRef.current = null;
        setIsAudioSharing(false);
        frame.destroy();
        setCallFrame(null);
      });

      frame.on("error", (event) => {
        console.error("Daily error:", event);
        toast.error("Connection issue. Please try again.");
      });

      // Join with token; lock media off at call-object level for audience
      await frame.join({
        url: data.roomUrl,
        token: data.token,
        ...(data.role === "audience" && {
          startVideoOff: true,
          startAudioOff: true,
        }),
      });

      setCallFrame(frame);
    } catch (err) {
      console.error("Error joining session:", err);
      setJoinError(err instanceof Error ? err.message : "Failed to join session");
      setIsJoining(false);
    }
  }, [session, sessionId, user, role, guestToken]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callFrame) {
        callFrame.destroy();
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      audioTrackRef.current?.stop();
      audioTrackRef.current = null;
    };
  }, [callFrame]);

  // Share system/tab audio without screen video
  const handleShareAudio = useCallback(async () => {
    if (!callFrame) return;
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      // Discard video — we only want the audio track
      stream.getVideoTracks().forEach((t) => t.stop());
      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) {
        toast.error("No audio captured — make sure to enable audio in the picker");
        return;
      }
      audioTrackRef.current = audioTrack;
      // Handle host stopping via browser's built-in stop button
      audioTrack.addEventListener("ended", () => {
        setIsAudioSharing(false);
        audioTrackRef.current = null;
      });
      // Send as screen audio so the host's mic remains active simultaneously
      callFrame.startScreenShare({ mediaStream: new MediaStream([audioTrack]) });
      setIsAudioSharing(true);
    } catch {
      // User dismissed the picker — not an error worth surfacing
    }
  }, [callFrame]);

  const handleStopAudio = useCallback(() => {
    callFrame?.stopScreenShare();
    audioTrackRef.current?.stop();
    audioTrackRef.current = null;
    setIsAudioSharing(false);
  }, [callFrame]);

  // Leave session
  const handleLeave = useCallback(() => {
    if (callFrame) {
      callFrame.leave();
    }
  }, [callFrame]);

  // Open in new tab fallback
  const handleOpenInTab = useCallback(async () => {
    if (!session?.daily_room_url) return;

    try {
      const { data, error: invokeError } = await supabase.functions.invoke("daily-get-token", {
        body: {
          sessionId,
          role: role || "audience",
          guestToken: guestToken || undefined,
        },
      });

      if (!invokeError && data?.token) {
        window.open(`${data.roomUrl}?t=${data.token}`, "_blank");
      }
    } catch (err) {
      console.error("Error opening in new tab:", err);
      toast.error("Failed to open session");
    }
  }, [session, sessionId, user, role, guestToken]);

  if (isLoading) {
    return <FullPageSkeleton variant="minimal" />;
  }

  if ((isError || (!isLoading && !session)) && !hasJoined && !inWaitingRoom) {
    const errorMsg = !session ? "Session not found" : "Failed to load session";
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <div className="max-w-md space-y-6 text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-destructive" />
          <h1 className="text-2xl font-medium text-foreground">{errorMsg}</h1>
          <p className="text-muted-foreground">
            {errorMsg.includes("membership")
              ? "This live session is available for members only."
              : "Please check the link and try again."}
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => navigate("/online")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {errorMsg.includes("membership") && (
              <Button onClick={() => navigate("/explore")}>Become a Member</Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Session not found</p>
      </div>
    );
  }

  // WAITING ROOM VIEW
  if (inWaitingRoom && role !== "host") {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/online")}
            className="text-white/70 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <span className="text-sm text-white/50">
            {role === "guest" ? "Guest Teacher" : "Viewer"}
          </span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <div className="max-w-lg space-y-8 text-center">
            {/* Waiting indicator */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <Clock className="h-10 w-10 animate-pulse text-white/60" />
            </div>

            <div className="space-y-4">
              <h1 className="font-editorial text-3xl text-white md:text-4xl">{session.title}</h1>
              <p className="text-lg text-white/70">Waiting for the session to begin...</p>
            </div>

            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-8">
              <p className="text-white/90">The host hasn't started the session yet.</p>
              <p className="text-sm text-white/60">
                This page will automatically update when the session begins. Feel free to take a
                breath and settle in.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => navigate("/online")}
              className="border-white/20 text-white/70 hover:text-white"
            >
              Return to Studio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      {/* Header - hidden when in session */}
      {!hasJoined && (
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/online")}
            className="text-white/70 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <span className="text-sm text-white/50">
            {role === "guest" ? "Guest Teacher" : role === "host" ? "Host" : "Viewer"}
          </span>
        </div>
      )}

      {/* Pre-join screen */}
      {!hasJoined && (
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <div className="max-w-lg space-y-10 text-center">
            {/* Session info */}
            <div className="space-y-4">
              <h1 className="font-editorial text-3xl text-white md:text-4xl">{session.title}</h1>
              {session.description && (
                <p className="text-lg text-white/70">{session.description}</p>
              )}
            </div>

            {/* Calm pre-join message */}
            <div className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-10">
              <p className="text-lg text-white/90">
                {role === "host" ? "Ready to begin." : "Arrive, get settled."}
              </p>
              <div>
                <p className="text-white/60">
                  {role === "host"
                    ? session.status === "live"
                      ? "Session is live. You can join now."
                      : "Session is not live yet."
                    : role === "guest"
                      ? "You'll join as a guest presenter with video and audio enabled."
                      : "You're joining a quiet, view-only space."}
                </p>
                <p className="text-white/60">
                  {role === "host"
                    ? session.status === "live"
                      ? "You can join now."
                      : "Join to test your setup privately."
                    : role === "guest"
                      ? ""
                      : "Your camera and mic will be turned off."}
                </p>
              </div>
            </div>

            {/* Join button */}
            <div className="space-y-4">
              <Button
                onClick={handleJoin}
                disabled={isJoining}
                className="h-14 w-full max-w-xs rounded-full bg-white text-lg text-black hover:bg-white/90"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : role === "host" ? (
                  session.status === "live" ? (
                    "Join Live Session"
                  ) : (
                    "Join to Test Setup"
                  )
                ) : (
                  "Join Live Session"
                )}
              </Button>

              {joinError && <p className="text-sm text-red-400">{joinError}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Video container - shown when joined */}
      <div
        id="daily-container"
        className={`flex-1 ${hasJoined ? "block" : "hidden"}`}
        style={{ minHeight: hasJoined ? "calc(100vh - 60px)" : "0" }}
      />

      {/* Controls when joined */}
      {hasJoined && (
        <div className="flex items-center justify-center gap-4 border-t border-white/10 bg-black/50 p-4">
          {(role === "host" || role === "guest") && (
            <Button
              variant="outline"
              onClick={isAudioSharing ? handleStopAudio : handleShareAudio}
              className="border-white/20 text-white/70 hover:text-white"
            >
              {isAudioSharing ? "Stop Audio" : "Share Audio"}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleOpenInTab}
            className="border-white/20 text-white/70 hover:text-white"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in New Tab
          </Button>
          <Button variant="destructive" onClick={handleLeave}>
            Leave Session
          </Button>
        </div>
      )}
    </div>
  );
};

export default LiveSessionRoom;

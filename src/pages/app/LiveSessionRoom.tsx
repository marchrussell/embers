import { Button } from "@/components/ui/button";
import { FullPageSkeleton } from "@/components/skeletons/FullPageSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getFunctionUrl } from "@/lib/supabaseConfig";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";
import { AlertCircle, ArrowLeft, Clock, ExternalLink, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

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
  
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [callFrame, setCallFrame] = useState<DailyCall | null>(null);
  const [inWaitingRoom, setInWaitingRoom] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const role = searchParams.get("role");
  const guestToken = searchParams.get("token");

  // Fetch session details
  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) {
        setError("Session not found");
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("live_sessions")
          .select("*")
          .eq("id", sessionId)
          .maybeSingle();

        if (fetchError) throw fetchError;
        if (!data) {
          setError("Session not found");
          setIsLoading(false);
          return;
        }

        setSession(data);
        
        // If session is not live and user is not host, show waiting room
        if (data.status !== 'live' && role !== 'host') {
          setInWaitingRoom(true);
        }
      } catch (err) {
        console.error("Error fetching session:", err);
        setError("Failed to load session");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, role]);

  // Poll for session status changes (for waiting room)
  useEffect(() => {
    if (!inWaitingRoom || !sessionId) return;

    const checkStatus = async () => {
      const { data } = await supabase
        .from("live_sessions")
        .select("status")
        .eq("id", sessionId)
        .maybeSingle();
      
      if (data?.status === 'live') {
        setInWaitingRoom(false);
        setSession(prev => prev ? { ...prev, status: 'live' } : null);
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
    setError(null);

    try {
      // Get auth token if user is logged in
      let authHeaders: Record<string, string> = {};
      if (user) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.access_token) {
          authHeaders["Authorization"] = `Bearer ${sessionData.session.access_token}`;
        }
      }

      // Request meeting token from backend
      const response = await fetch(
        getFunctionUrl('daily-get-token'),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({
            sessionId,
            role: role || "audience",
            guestToken: guestToken || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join session");
      }

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
        showParticipantsBar: data.role === 'host',
        showLocalVideo: data.role !== "audience",
        activeSpeakerMode: true,
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
        frame.destroy();
        setCallFrame(null);
      });

      frame.on("error", (event) => {
        console.error("Daily error:", event);
        toast.error("Connection issue. Please try again.");
      });

      // Join with token
      await frame.join({
        url: data.roomUrl,
        token: data.token,
      });

      setCallFrame(frame);
    } catch (err) {
      console.error("Error joining session:", err);
      setError(err instanceof Error ? err.message : "Failed to join session");
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
    };
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
      let authHeaders: Record<string, string> = {};
      if (user) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.access_token) {
          authHeaders["Authorization"] = `Bearer ${sessionData.session.access_token}`;
        }
      }

      const response = await fetch(
        getFunctionUrl('daily-get-token'),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({
            sessionId,
            role: role || "audience",
            guestToken: guestToken || undefined,
          }),
        }
      );

      const data = await response.json();
      if (response.ok && data.token) {
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

  if (error && !hasJoined && !inWaitingRoom) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="max-w-md text-center space-y-6">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-medium text-foreground">{error}</h1>
          <p className="text-muted-foreground">
            {error.includes("membership") 
              ? "This live session is available for members only."
              : "Please check the link and try again."}
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate("/studio")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Studio
            </Button>
            {error.includes("membership") && (
              <Button onClick={() => navigate("/explore")}>
                Become a Member
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Session not found</p>
      </div>
    );
  }

  // WAITING ROOM VIEW
  if (inWaitingRoom && role !== 'host') {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <Button variant="ghost" onClick={() => navigate("/studio")} className="text-white/70 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <span className="text-white/50 text-sm">
            {role === "guest" ? "Guest Teacher" : "Viewer"}
          </span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-lg text-center space-y-8">
            {/* Waiting indicator */}
            <div className="w-20 h-20 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Clock className="w-10 h-10 text-white/60 animate-pulse" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-editorial text-white">
                {session.title}
              </h1>
              <p className="text-white/70 text-lg">
                Waiting for the session to begin...
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-8 space-y-4 border border-white/10">
              <p className="text-white/90">
                The host hasn't started the session yet.
              </p>
              <p className="text-white/60 text-sm">
                This page will automatically update when the session begins. Feel free to take a breath and settle in.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => navigate("/studio")}
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
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header - hidden when in session */}
      {!hasJoined && (
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <Button variant="ghost" onClick={() => navigate("/studio")} className="text-white/70 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <span className="text-white/50 text-sm">
            {role === "guest" ? "Guest Teacher" : role === "host" ? "Host" : "Viewer"}
          </span>
        </div>
      )}

      {/* Pre-join screen */}
      {!hasJoined && (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="max-w-lg text-center space-y-8">
            {/* Session info */}
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-editorial text-white">
                {session.title}
              </h1>
              {session.description && (
                <p className="text-white/70 text-lg">{session.description}</p>
              )}
            </div>

            {/* Calm pre-join message */}
            <div className="bg-white/5 rounded-2xl p-8 space-y-4 border border-white/10">
              <p className="text-white/90 text-lg">
                {role === "host" 
                  ? "Ready to begin." 
                  : "Arrive, get settled."}
              </p>
              <p className="text-white/60">
                {role === "host"
                  ? session.status === 'live' 
                    ? "Session is live. You can join now."
                    : "Session is not live yet. Join to test your setup privately."
                  : role === "guest"
                  ? "You'll join as a guest presenter with video and audio enabled."
                  : "You're joining a quiet, view-only space. Your camera and mic will be off."}
              </p>
            </div>

            {/* Join button */}
            <div className="space-y-4">
              <Button
                onClick={handleJoin}
                disabled={isJoining}
                className="w-full max-w-xs h-14 text-lg rounded-full bg-white text-black hover:bg-white/90"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : role === "host" ? (
                  session.status === 'live' ? "Join Live Session" : "Join to Test Setup"
                ) : (
                  "Join Live Session"
                )}
              </Button>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
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
        <div className="p-4 flex items-center justify-center gap-4 bg-black/50 border-t border-white/10">
          <Button
            variant="outline"
            onClick={handleOpenInTab}
            className="border-white/20 text-white/70 hover:text-white"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in New Tab
          </Button>
          <Button
            variant="destructive"
            onClick={handleLeave}
          >
            Leave Session
          </Button>
        </div>
      )}
    </div>
  );
};

export default LiveSessionRoom;

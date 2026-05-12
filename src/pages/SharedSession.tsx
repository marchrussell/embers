import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface SessionData {
  id: string;
  title: string;
  is_published: boolean;
  requires_subscription: boolean;
}

const SharedSession = () => {
  const { sessionId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const sessionTarget = `/online/session/${sessionId}`;

  const {
    data: session,
    isLoading,
    isError,
    error,
  } = useQuery<SessionData>({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      const { data, error: fetchError } = await supabase
        .from("classes")
        .select("id, title, is_published, requires_subscription")
        .eq("id", sessionId!)
        .single();

      if (fetchError || !data) throw new Error("This session could not be found");
      if (!data.is_published) throw new Error("This session is no longer available");
      return data;
    },
    enabled: !!sessionId,
  });

  useEffect(() => {
    if (authLoading || isLoading || !session) return;
    if (user) navigate(sessionTarget, { replace: true });
  }, [user, authLoading, isLoading, session, navigate, sessionTarget]);

  if (!sessionId || isError) {
    const message = !sessionId
      ? "No session specified"
      : ((error as Error)?.message ?? "Something went wrong");
    return (
      <>
        <NavBar />
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
          <div className="mx-auto max-w-2xl space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="mb-6 text-5xl font-normal text-white">Session Not Found</h1>
              <p className="text-lg leading-relaxed text-white/80">
                {message}. The link may have expired or the session may have been removed.
              </p>
            </div>
            <Button
              onClick={() => navigate("/")}
              className="rounded-full border-2 border-white bg-white/5 px-12 py-6 text-lg text-white backdrop-blur-md transition-all hover:bg-white/10"
            >
              Go to Homepage <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (isLoading || authLoading) {
    return (
      <>
        <NavBar />
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-white/60" />
        </div>
      </>
    );
  }

  if (!user && session) {
    return (
      <>
        <NavBar />
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
          <div className="mx-auto max-w-2xl space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="mb-6 text-5xl font-normal text-white">
                A Session Was Shared With You
              </h1>
              <p className="mb-4 text-xl font-light text-[#D4A574]">"{session.title}"</p>
              <p className="text-lg leading-relaxed text-white/80">
                Someone thought you'd benefit from this breathwork session. Sign up now to access
                this session and our full library of transformative practices.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                onClick={() => navigate("/auth", { state: { redirectTo: sessionTarget } })}
                className="rounded-full border-2 border-white bg-white/5 px-12 py-6 text-lg text-white backdrop-blur-md transition-all hover:bg-white/10"
              >
                Sign Up to Access <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => navigate("/auth", { state: { redirectTo: sessionTarget } })}
                variant="ghost"
                className="text-base text-[#E6DBC7] hover:text-[#E6DBC7]/80"
              >
                Already have an account? Sign In
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
};

export default SharedSession;

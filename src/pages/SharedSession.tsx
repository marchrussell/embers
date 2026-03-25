import { ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
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
  const { user, hasSubscription, isAdmin, isTestUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch and validate session
  useEffect(() => {
    const validateSession = async () => {
      if (!sessionId) {
        setError("No session specified");
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("classes")
          .select("id, title, is_published, requires_subscription")
          .eq("id", sessionId)
          .single();

        if (fetchError || !data) {
          setError("This session could not be found");
          setLoading(false);
          return;
        }

        if (!data.is_published) {
          setError("This session is no longer available");
          setLoading(false);
          return;
        }

        setSession(data);
        setLoading(false);
      } catch (err) {
        setError("Something went wrong");
        setLoading(false);
      }
    };

    validateSession();
  }, [sessionId]);

  // Handle redirect for logged-in users once auth and session are loaded
  useEffect(() => {
    if (authLoading || loading || !session) return;

    if (user) {
      // Check if user has access to this session
      const hasAccess = !session.requires_subscription || hasSubscription || isAdmin || isTestUser;

      if (hasAccess) {
        // User has access - redirect to session
        navigate(`/app/session/${sessionId}`, { replace: true });
      } else {
        // User doesn't have subscription access - redirect to session page
        // (SessionDetail will handle showing the subscription modal)
        navigate(`/app/session/${sessionId}`, { replace: true });
      }
    }
  }, [
    user,
    hasSubscription,
    isAdmin,
    isTestUser,
    authLoading,
    loading,
    session,
    sessionId,
    navigate,
  ]);

  // Show loading state
  if (loading || authLoading) {
    return (
      <>
        <NavBar />
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-white/60" />
        </div>
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <>
        <NavBar />
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
          <div className="mx-auto max-w-2xl space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="mb-6 text-5xl font-normal text-white">Session Not Found</h1>
              <p className="text-lg leading-relaxed text-white/80">
                {error}. The link may have expired or the session may have been removed.
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

  // Guest user - show sign up prompt with session title
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
                onClick={() =>
                  navigate("/auth", { state: { redirectTo: `/app/session/${sessionId}` } })
                }
                className="rounded-full border-2 border-white bg-white/5 px-12 py-6 text-lg text-white backdrop-blur-md transition-all hover:bg-white/10"
              >
                Sign Up to Access <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() =>
                  navigate("/auth", { state: { redirectTo: `/app/session/${sessionId}` } })
                }
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

import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
          .from('classes')
          .select('id, title, is_published, requires_subscription')
          .eq('id', sessionId)
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
  }, [user, hasSubscription, isAdmin, isTestUser, authLoading, loading, session, sessionId, navigate]);

  // Show loading state
  if (loading || authLoading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
        </div>
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-normal text-white mb-6">
                Session Not Found
              </h1>
              <p className="text-lg text-white/80 leading-relaxed">
                {error}. The link may have expired or the session may have been removed.
              </p>
            </div>

            <Button
              onClick={() => navigate('/')}
              className="bg-white/5 backdrop-blur-md text-white border-2 border-white px-12 py-6 text-lg rounded-full hover:bg-white/10 transition-all"
            >
              Go to Homepage <ArrowRight className="w-5 h-5 ml-2" />
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
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-normal text-white mb-6">
                A Session Was Shared With You
              </h1>
              <p className="text-xl text-[#D4A574] font-light mb-4">
                "{session.title}"
              </p>
              <p className="text-lg text-white/80 leading-relaxed">
                Someone thought you'd benefit from this breathwork session.
                Sign up now to access this session and our full library of transformative practices.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => navigate('/auth', { state: { redirectTo: `/app/session/${sessionId}` } })}
                className="bg-white/5 backdrop-blur-md text-white border-2 border-white px-12 py-6 text-lg rounded-full hover:bg-white/10 transition-all"
              >
                Sign Up to Access <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                onClick={() => navigate('/auth', { state: { redirectTo: `/app/session/${sessionId}` } })}
                variant="ghost"
                className="text-[#E6DBC7] hover:text-[#E6DBC7]/80 text-base"
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

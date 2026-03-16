// @refresh reset
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isTestUser: boolean;
  hasSubscription: boolean;
  hasMentorshipDiy: boolean;
  hasMentorshipGuided: boolean;
  hasCompletedOnboarding: boolean;
  hasAcceptedSafetyDisclosure: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<User | null>;
  signOut: () => Promise<void>;
  checkSubscription: () => Promise<void>;
  refreshOnboardingStatus: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTestUser, setIsTestUser] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [hasMentorshipDiy, setHasMentorshipDiy] = useState(false);
  const [hasMentorshipGuided, setHasMentorshipGuided] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [hasAcceptedSafetyDisclosure, setHasAcceptedSafetyDisclosure] = useState(false);
  const isCheckingSubscriptionRef = useRef(false);
  const initialLoadRef = useRef(true);
  const authCheckedRef = useRef(false);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error || !data) {
        setIsAdmin(false);
        setIsTestUser(false);
        setHasMentorshipDiy(false);
        setHasMentorshipGuided(false);
        return false;
      }
      
      const roles = new Set(data.map((r: any) => r.role));
      setIsAdmin(roles.has("admin"));
      setIsTestUser(roles.has("test_user"));
      setHasMentorshipDiy(roles.has("mentorship_diy") || roles.has("mentorship_guided"));
      setHasMentorshipGuided(roles.has("mentorship_guided"));
      return true;
    } catch (err) {
      setIsAdmin(false);
      setIsTestUser(false);
      setHasMentorshipDiy(false);
      setHasMentorshipGuided(false);
      return false;
    }
  };

  const checkOnboardingStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("has_completed_onboarding, has_accepted_safety_disclosure")
        .eq("id", userId)
        .single();
      
      if (error || !data) {
        setHasCompletedOnboarding(false);
        setHasAcceptedSafetyDisclosure(false);
        return false;
      }
      
      setHasCompletedOnboarding(data.has_completed_onboarding || false);
      setHasAcceptedSafetyDisclosure(data.has_accepted_safety_disclosure || false);
      
      return data.has_completed_onboarding || false;
    } catch (err) {
      setHasCompletedOnboarding(false);
      setHasAcceptedSafetyDisclosure(false);
      return false;
    }
  };

  // Expose refresh function for manual use
  const refreshOnboardingStatus = async () => {
    if (user?.id) {
      await checkOnboardingStatus(user.id);
    }
  };

  const checkSubscription = async (userId?: string, accessToken?: string) => {
    // Prevent concurrent calls
    if (isCheckingSubscriptionRef.current) {
      return;
    }

    isCheckingSubscriptionRef.current = true;

    try {
      // Get user ID from parameter or current user
      const targetUserId = userId || user?.id;
      if (!targetUserId) {
        setHasSubscription(false);
        return;
      }

      // Check local database for active subscription - FAST and RELIABLE
      const { data: localSub, error: localError } = await supabase
        .from("user_subscriptions")
        .select("status")
        .eq("user_id", targetUserId)
        .in("status", ["active", "trialing", "past_due"])
        .maybeSingle();

      if (!localError && localSub) {
        setHasSubscription(true);
        return;
      }

      // Fallback: call edge function to check Stripe (only if no local subscription found)
      const token = accessToken ?? (await supabase.auth.getSession()).data.session?.access_token;
      if (token) {
        const { data } = await supabase.functions.invoke("check-subscription", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHasSubscription(data?.subscribed || false);
      } else {
        setHasSubscription(false);
      }
    } catch (error) {
      console.error("AuthContext: Error checking subscription:", error);
      setHasSubscription(false);
    } finally {
      isCheckingSubscriptionRef.current = false;
    }
  };

  useEffect(() => {
    // Safety timeout - reduced to 3 seconds
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 3000);

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Skip if this is the initial load
        if (initialLoadRef.current) return;

        // On token refresh, just update session/user — no need to re-run DB checks
        if (event === "TOKEN_REFRESHED") {
          setSession(session);
          setUser(session?.user ?? null);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          authCheckedRef.current = true;
          setLoading(true);
          
          // Identify user in PostHog (dynamic import to defer analytics bundle)
          import("@/lib/posthog").then(({ identifyUser }) =>
            identifyUser(session.user.id, {
              email: session.user.email,
              created_at: session.user.created_at,
            })
          );
          
          // Run checks in parallel
          await Promise.all([
            checkAdminRole(session.user.id),
            checkSubscription(session.user.id, session.access_token),
            checkOnboardingStatus(session.user.id)
          ]).catch(() => {});
          
          setLoading(false);
        } else {
          authCheckedRef.current = false;
          setIsAdmin(false);
          setIsTestUser(false);
          setHasSubscription(false);
          setHasMentorshipDiy(false);
          setHasMentorshipGuided(false);
          setHasCompletedOnboarding(false);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      initialLoadRef.current = false;
      
      if (session?.user && !authCheckedRef.current) {
        authCheckedRef.current = true;
        
        // Identify user in PostHog (dynamic import to defer analytics bundle)
        import("@/lib/posthog").then(({ identifyUser }) =>
          identifyUser(session.user.id, {
            email: session.user.email,
            created_at: session.user.created_at,
          })
        );
        
        // Run all checks in parallel with individual error handling
        try {
          await Promise.all([
            checkAdminRole(session.user.id).catch(() => {}),
            checkSubscription(session.user.id, session.access_token).catch(() => {}),
            checkOnboardingStatus(session.user.id).catch(() => {})
          ]);
        } catch (err) {
          // Ignore errors - individual checks handle their own state
        }
      } else if (!session?.user) {
        setIsAdmin(false);
        setIsTestUser(false);
        setHasSubscription(false);
        setHasMentorshipDiy(false);
        setHasMentorshipGuided(false);
        setHasCompletedOnboarding(false);
      }
      
      // ALWAYS set loading to false
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    return () => {
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Removed auto-refresh to prevent session lock issues
  // Subscription is checked on login and can be manually refreshed if needed

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Immediately update state with the returned session so the UI reflects
    // the logged-in state before signIn() returns. onAuthStateChange (SIGNED_IN)
    // will fire next and run the DB checks (admin, subscription, onboarding).
    if (data.session) {
      setSession(data.session);
      setUser(data.session.user);

      // Identify user in PostHog (dynamic import to defer analytics bundle)
      import("@/lib/posthog").then(({ identifyUser }) =>
        identifyUser(data.session.user.id, {
          email: data.session.user.email,
          created_at: data.session.user.created_at,
        })
      );
    }
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<User | null> => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;
    return data.user;
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      // Ignore session errors - may already be expired
      if (error && !error.message?.toLowerCase().includes("session")) {
        throw error;
      }
      
      // Reset PostHog user
      import("@/lib/posthog").then(({ resetUser }) => resetUser());
      
      // Always clear local state
      setIsAdmin(false);
      setIsTestUser(false);
      setHasSubscription(false);
      setHasMentorshipDiy(false);
      setHasMentorshipGuided(false);
      setHasCompletedOnboarding(false);
      setUser(null);
      setSession(null);
    } catch (error) {
      // Reset PostHog user even on error
      import("@/lib/posthog").then(({ resetUser }) => resetUser());
      
      // Clear state even on error
      setIsAdmin(false);
      setIsTestUser(false);
      setHasSubscription(false);
      setHasMentorshipDiy(false);
      setHasMentorshipGuided(false);
      setHasCompletedOnboarding(false);
      setUser(null);
      setSession(null);
      throw error;
    }
  };

  const openCustomerPortal = async () => {
    if (!user) {
      toast.error("Please sign in to manage your subscription");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to open customer portal");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        isTestUser,
        hasSubscription,
        hasMentorshipDiy,
        hasMentorshipGuided,
        hasCompletedOnboarding,
        hasAcceptedSafetyDisclosure,
        signIn,
        signUp,
        signOut,
        checkSubscription,
        refreshOnboardingStatus,
        openCustomerPortal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

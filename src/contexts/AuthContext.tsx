// @refresh reset
import { Session, User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { identifyUser, resetUser } from "@/lib/posthog";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isTestUser: boolean;
  hasSubscription: boolean;
  hasCompletedOnboarding: boolean;
  hasAcceptedSafetyDisclosure: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<User | null>;
  signOut: () => Promise<void>;
  checkSubscription: () => Promise<void>;
  refreshOnboardingStatus: () => Promise<void>;
  acceptSafetyDisclosure: () => void;
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
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [hasAcceptedSafetyDisclosure, setHasAcceptedSafetyDisclosure] = useState(false);
  const isCheckingSubscriptionRef = useRef(false);
  const initialLoadRef = useRef(true);
  const authCheckedRef = useRef(false);
  const safetyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error || !data) {
        setIsAdmin(false);
        setIsTestUser(false);
        return false;
      }

      const roles = new Set(data.map((r: any) => r.role));
      setIsAdmin(roles.has("admin"));
      setIsTestUser(roles.has("test_user"));
      return true;
    } catch (err) {
      setIsAdmin(false);
      setIsTestUser(false);
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

  const acceptSafetyDisclosure = () => {
    setHasAcceptedSafetyDisclosure(true);
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
          headers: { Authorization: `Bearer ${token}` },
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

  // Resets all derived auth state (roles, subscription, onboarding).
  // Called on sign-out and cross-tab sign-out detection.
  const clearAuthState = () => {
    setIsAdmin(false);
    setIsTestUser(false);
    setHasSubscription(false);
    setHasCompletedOnboarding(false);
    setHasAcceptedSafetyDisclosure(false);
  };

  useEffect(() => {
    const log = (...args: unknown[]) => console.debug("[auth]", ...args);

    // Runs the three DB checks in parallel. Defined inside the effect so it doesn't
    // need to be listed as a dependency (it's only called from within this effect).
    const runAuthChecks = async (userId: string, accessToken?: string) => {
      log("runAuthChecks start", { userId });
      await Promise.all([
        checkAdminRole(userId).catch(() => {}),
        checkSubscription(userId, accessToken).catch(() => {}),
        checkOnboardingStatus(userId).catch(() => {}),
      ]);
      log("runAuthChecks done");
    };

    // Safety timeout — last-resort fallback if neither INITIAL_SESSION nor getSession() resolves
    safetyTimeoutRef.current = setTimeout(() => {
      log("safety timeout fired — forcing loading=false");
      setLoading(false);
    }, 3000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      log("onAuthStateChange", event, { hasSession: !!session, userId: session?.user?.id });

      // INITIAL_SESSION fires when the listener is registered with the session read
      // directly from localStorage — no server round-trip. Handling it here (instead of
      // relying on getSession()) ensures second-tab loads work even when getSession()
      // races with another tab's concurrent token refresh.
      if (event === "INITIAL_SESSION") {
        if (session?.user) {
          // Valid session found in localStorage — handle immediately.
          if (safetyTimeoutRef.current) {
            clearTimeout(safetyTimeoutRef.current);
            safetyTimeoutRef.current = null;
          }
          initialLoadRef.current = false;
          setSession(session);
          setUser(session.user);
          if (!authCheckedRef.current) {
            log("INITIAL_SESSION: user found, running auth checks");
            authCheckedRef.current = true;
            identifyUser(session.user.id, {
              email: session.user.email,
              created_at: session.user.created_at,
            });
            await runAuthChecks(session.user.id, session.access_token);
          } else {
            log("INITIAL_SESSION: authCheckedRef already true, skipping checks");
          }
          setLoading(false);
        } else {
          // Null session — access token is likely expired.
          // Don't mark initial load complete; let getSession() perform the server-side refresh.
          // The safety timeout (already running) will unblock loading if getSession() also fails.
          log("INITIAL_SESSION: no session — deferring to getSession() for token refresh recovery");
        }
        return;
      }

      // Skip all other events until INITIAL_SESSION has been processed
      if (initialLoadRef.current) {
        log("skipping event — initialLoad not complete yet");
        return;
      }

      // On token refresh, update session/user. If INITIAL_SESSION fired with null
      // (expired token), auth checks haven't run yet — run them now with the fresh token.
      if (event === "TOKEN_REFRESHED") {
        log("TOKEN_REFRESHED: updating session/user");
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user && !authCheckedRef.current) {
          log("TOKEN_REFRESHED: first auth — running checks");
          authCheckedRef.current = true;
          identifyUser(session.user.id, {
            email: session.user.email,
            created_at: session.user.created_at,
          });
          await runAuthChecks(session.user.id, session.access_token);
        }
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        log("SIGNED_IN: running auth checks");
        // Only show loading state on first authentication — re-auth events (e.g.
        // cross-tab sign-in triggering SIGNED_IN via setSession) should refresh
        // auth data silently without flashing a loading screen.
        const isFirstAuth = !authCheckedRef.current;
        authCheckedRef.current = true;
        if (isFirstAuth) setLoading(true);
        identifyUser(session.user.id, {
          email: session.user.email,
          created_at: session.user.created_at,
        });
        await runAuthChecks(session.user.id, session.access_token);
        if (isFirstAuth) setLoading(false);
      } else {
        log("SIGNED_OUT: clearing auth state");
        authCheckedRef.current = false;
        clearAuthState();
        setLoading(false);
      }
    });

    // Cross-tab auth sync via storage events.
    // The storage event fires in other tabs when localStorage changes — not in the
    // tab that wrote it. This covers the case where INITIAL_SESSION fires with null
    // (expired token, refresh race with another tab) and that tab later writes a
    // fresh session after its own token refresh.
    const handleStorageEvent = async (event: StorageEvent) => {
      if (!event.key?.endsWith("-auth-token")) return;
      log("storage event", { key: event.key, hasNewValue: !!event.newValue });

      if (!event.newValue) {
        log("storage: sign-out detected from another tab");
        setUser(null);
        setSession(null);
        clearAuthState();
        authCheckedRef.current = false;
        setLoading(false);
        return;
      }

      // Another tab wrote a new/refreshed session. setSession() triggers SIGNED_IN
      // in onAuthStateChange, which calls runAuthChecks and sets all auth state.
      try {
        const parsed = JSON.parse(event.newValue);
        if (parsed?.access_token && parsed?.refresh_token) {
          log("storage: calling setSession with tokens from another tab");
          await supabase.auth.setSession({
            access_token: parsed.access_token,
            refresh_token: parsed.refresh_token,
          });
        } else {
          log(
            "storage: parsed value missing access_token or refresh_token",
            Object.keys(parsed ?? {})
          );
        }
      } catch (err) {
        log("storage: failed to parse newValue", err);
      }
    };

    window.addEventListener("storage", handleStorageEvent);

    // getSession() is a safety fallback for environments where INITIAL_SESSION
    // may not fire. If INITIAL_SESSION already ran, initialLoadRef is false and
    // this becomes a no-op.
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        log("getSession resolved", {
          hasSession: !!session,
          initialLoadPending: initialLoadRef.current,
        });
        if (!initialLoadRef.current) return;
        log("getSession fallback active — INITIAL_SESSION did not fire");
        if (safetyTimeoutRef.current) {
          clearTimeout(safetyTimeoutRef.current);
          safetyTimeoutRef.current = null;
        }
        initialLoadRef.current = false;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user && !authCheckedRef.current) {
          authCheckedRef.current = true;
          identifyUser(session.user.id, {
            email: session.user.email,
            created_at: session.user.created_at,
          });
          await runAuthChecks(session.user.id, session.access_token);
        } else if (!session?.user) {
          clearAuthState();
        }
        setLoading(false);
      })
      .catch((err) => {
        log("getSession error", err);
        if (initialLoadRef.current) {
          initialLoadRef.current = false;
          setLoading(false);
        }
      });

    return () => {
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
      subscription.unsubscribe();
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

      identifyUser(data.session.user.id, {
        email: data.session.user.email,
        created_at: data.session.user.created_at,
      });
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<User | null> => {
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

      resetUser();
      clearAuthState();
      setUser(null);
      setSession(null);
    } catch (error) {
      resetUser();
      clearAuthState();
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
        hasCompletedOnboarding,
        hasAcceptedSafetyDisclosure,
        signIn,
        signUp,
        signOut,
        checkSubscription,
        refreshOnboardingStatus,
        acceptSafetyDisclosure,
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

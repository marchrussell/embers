// @refresh reset
import { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useAuthOnboarding } from "@/hooks/auth/useAuthOnboarding";
import { useAuthRoles } from "@/hooks/auth/useAuthRoles";
import { useAuthSubscription } from "@/hooks/auth/useAuthSubscription";
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
  const [identityLoading, setIdentityLoading] = useState(true);
  // Optimistic local override: set immediately when user accepts safety disclosure,
  // before the onboarding query re-fetches from the DB.
  const [acceptedSafetyLocal, setAcceptedSafetyLocal] = useState(false);
  const safetyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();

  // Derived state via TanStack Query — gated on user identity being resolved.
  // Queries re-run automatically whenever user changes (handles cross-tab sync).
  const { isAdmin, isTestUser, isLoading: rolesIsLoading } = useAuthRoles(user?.id);
  const { hasSubscription, isLoading: subIsLoading } = useAuthSubscription(user?.id);
  const {
    hasCompletedOnboarding,
    hasAcceptedSafetyDisclosure: savedSafetyDisclosure,
    isLoading: onboardingIsLoading,
  } = useAuthOnboarding(user?.id);

  const hasAcceptedSafetyDisclosure = acceptedSafetyLocal || savedSafetyDisclosure;

  // loading is true until user identity is resolved AND all derived queries settle.
  // This prevents AdminRoute / ProtectedRoute from seeing an intermediate state where
  // user is set but isAdmin / hasSubscription are still their default (false).
  const loading =
    identityLoading || (!!user && (rolesIsLoading || subIsLoading || onboardingIsLoading));

  useEffect(() => {
    const log = (...args: unknown[]) => console.debug("[auth]", ...args);

    // Each effect invocation owns its initialLoadComplete flag. This is a closure
    // variable (not a React ref) so that React StrictMode's double-invocation gives
    // each mount its own clean state — no cross-contamination between invocations.
    let initialLoadComplete = false;

    // Safety timeout — last resort if INITIAL_SESSION never fires at all (broken env).
    // Cancelled as soon as INITIAL_SESSION fires (null or not), because at that point
    // getSession() is in control of the null-session path.
    safetyTimeoutRef.current = setTimeout(() => {
      if (!initialLoadComplete) {
        log("safety timeout — INITIAL_SESSION never fired, forcing identityLoading=false");
        setIdentityLoading(false);
      }
    }, 3000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      log("onAuthStateChange", event, { hasSession: !!session, userId: session?.user?.id });

      if (event === "INITIAL_SESSION") {
        // INITIAL_SESSION fired — cancel safety timeout regardless of null/non-null session.
        // If session is null (expired token), getSession() (already running) handles recovery.
        if (safetyTimeoutRef.current) {
          clearTimeout(safetyTimeoutRef.current);
          safetyTimeoutRef.current = null;
        }
        if (session?.user) {
          initialLoadComplete = true;
          setSession(session);
          setUser(session.user);
          identifyUser(session.user.id, {
            email: session.user.email,
            created_at: session.user.created_at,
          });
          setIdentityLoading(false);
        }
        // null session: identity not resolved yet — defer to TOKEN_REFRESHED or getSession()
        return;
      }

      // TOKEN_REFRESHED: primary handler for the "expired access token + valid refresh token"
      // initial-load path. Never blocked — allows the expired-token case to resolve directly
      // without waiting for the getSession() fallback.
      if (event === "TOKEN_REFRESHED") {
        if (!initialLoadComplete) {
          // Mark complete so getSession() fallback skips its processing
          initialLoadComplete = true;
        }
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          identifyUser(session.user.id, {
            email: session.user.email,
            created_at: session.user.created_at,
          });
        }
        setIdentityLoading(false);
        return;
      }

      // SIGNED_IN: handles cross-tab sign-in and direct sign-in after initial load.
      // Just update user/session — TanStack queries re-run automatically when user changes,
      // so derived state (isAdmin, hasSubscription, etc.) stays in sync without any
      // imperative DB calls here.
      if (event === "SIGNED_IN") {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          identifyUser(session.user.id, {
            email: session.user.email,
            created_at: session.user.created_at,
          });
        }
        return;
      }

      // SIGNED_OUT: clear identity. Derived state resets automatically — queries are
      // disabled when user is null (enabled: !!user?.id) and default to false.
      setSession(null);
      setUser(null);
      setAcceptedSafetyLocal(false);
      resetUser();
    });

    // Supabase JS v2 fires cross-tab auth events (SIGNED_IN, TOKEN_REFRESHED, SIGNED_OUT)
    // in all tabs via its own internal storage listener. No custom storage handler needed.

    // getSession() fallback — covers two cases:
    // 1. Environments where INITIAL_SESSION doesn't fire
    // 2. INITIAL_SESSION fired null (expired token) but TOKEN_REFRESHED didn't fire
    //    (no valid refresh token → user is genuinely logged out)
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        log("getSession resolved", { hasSession: !!session, initialLoadComplete });
        if (initialLoadComplete) return; // INITIAL_SESSION (with user) or TOKEN_REFRESHED handled it
        log("getSession fallback — resolving identity");
        initialLoadComplete = true;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          identifyUser(session.user.id, {
            email: session.user.email,
            created_at: session.user.created_at,
          });
        }
        setIdentityLoading(false);
      })
      .catch((err) => {
        log("getSession error", err);
        if (!initialLoadComplete) {
          initialLoadComplete = true;
          setIdentityLoading(false);
        }
      });

    return () => {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
      subscription.unsubscribe();
    };
  }, []);

  const checkSubscription = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["auth-subscription", user?.id] });
  }, [queryClient, user?.id]);

  const refreshOnboardingStatus = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["auth-onboarding", user?.id] });
  }, [queryClient, user?.id]);

  const acceptSafetyDisclosure = useCallback(() => {
    setAcceptedSafetyLocal(true);
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Immediately update state with the returned session so the UI reflects
    // the logged-in state before signIn() returns. onAuthStateChange (SIGNED_IN)
    // will fire next and update state again (no-op since it's the same session).
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
      setAcceptedSafetyLocal(false);
      setUser(null);
      setSession(null);
      // Remove cached derived state so a re-login as a different user gets fresh data
      queryClient.removeQueries({ queryKey: ["auth-roles"] });
      queryClient.removeQueries({ queryKey: ["auth-subscription"] });
      queryClient.removeQueries({ queryKey: ["auth-onboarding"] });
    } catch (error) {
      resetUser();
      setAcceptedSafetyLocal(false);
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

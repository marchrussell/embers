import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

// How long a past_due subscription keeps access after its period ended.
// Stripe dunning retries span roughly three weeks before cancelling.
const PAST_DUE_GRACE_MS = 21 * 24 * 60 * 60 * 1000;

function grantsAccess(sub: {
  status: string;
  cancel_at_period_end: boolean | null;
  current_period_end: string | null;
}): boolean {
  if (sub.status === "active") return true;
  // Cancelled trials keep access until the trial end date — Stripe fires
  // customer.subscription.deleted at trial end, which flips status to 'canceled'.
  if (sub.status === "trialing") return true;
  // past_due keeps access only during the dunning grace window — without a
  // bound, a permanently-failing card would retain access forever.
  if (sub.status === "past_due") {
    if (!sub.current_period_end) return false;
    return Date.now() < new Date(sub.current_period_end).getTime() + PAST_DUE_GRACE_MS;
  }
  return false;
}

export function useAuthSubscription(userId: string | undefined) {
  const { data, isLoading } = useQuery({
    queryKey: ["auth-subscription", userId],
    queryFn: async () => {
      const { data: localSub, error } = await supabase
        .from("user_subscriptions")
        .select("status, cancel_at_period_end, current_period_end")
        .eq("user_id", userId!)
        .in("status", ["active", "trialing", "past_due"])
        .maybeSingle();
      if (!error && localSub) return { hasSubscription: grantsAccess(localSub) };
      // Fallback: edge function to check Stripe
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (token) {
        const { data } = await supabase.functions.invoke("check-subscription", {
          headers: { Authorization: `Bearer ${token}` },
        });
        return { hasSubscription: data?.subscribed || false };
      }
      return { hasSubscription: false };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    // Always revalidate when the tab regains focus — covers returning from the
    // Stripe billing portal (opened in a new tab) after cancelling.
    refetchOnWindowFocus: "always",
  });
  return {
    hasSubscription: data?.hasSubscription ?? false,
    isLoading,
  };
}

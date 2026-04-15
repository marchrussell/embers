import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export function useAuthSubscription(userId: string | undefined) {
  const { data, isLoading } = useQuery({
    queryKey: ["auth-subscription", userId],
    queryFn: async () => {
      const { data: localSub, error } = await supabase
        .from("user_subscriptions")
        .select("status")
        .eq("user_id", userId!)
        .in("status", ["active", "trialing", "past_due"])
        .maybeSingle();
      if (!error && localSub) return { hasSubscription: true };
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
  });
  return {
    hasSubscription: data?.hasSubscription ?? false,
    isLoading,
  };
}

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

export const useStartHereVisibility = () => {
  const { user, hasSubscription, isAdmin, isTestUser } = useAuth();

  const { data: subscriptionStartDate } = useQuery({
    queryKey: ["subscription-start", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_subscriptions")
        .select("created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      return data?.created_at ? new Date(data.created_at) : null;
    },
    enabled: !!user?.id && hasSubscription && !isAdmin && !isTestUser,
    staleTime: 10 * 60 * 1000,
  });

  // Admins and test users always see it
  if (isAdmin || isTestUser) return true;
  // Non-subscribers see it (locked)
  if (!hasSubscription) return true;
  // Subscribed but start date not yet loaded → show (avoid flicker)
  if (!subscriptionStartDate) return true;
  // Hide after 14 days
  return Date.now() - subscriptionStartDate.getTime() < TWO_WEEKS_MS;
};

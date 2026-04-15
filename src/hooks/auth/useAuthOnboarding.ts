import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export function useAuthOnboarding(userId: string | undefined) {
  const { data, isLoading } = useQuery({
    queryKey: ["auth-onboarding", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("has_completed_onboarding, has_accepted_safety_disclosure")
        .eq("id", userId!)
        .single();
      if (error || !data)
        return { hasCompletedOnboarding: false, hasAcceptedSafetyDisclosure: false };
      return {
        hasCompletedOnboarding: data.has_completed_onboarding || false,
        hasAcceptedSafetyDisclosure: data.has_accepted_safety_disclosure || false,
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
  return {
    hasCompletedOnboarding: data?.hasCompletedOnboarding ?? false,
    hasAcceptedSafetyDisclosure: data?.hasAcceptedSafetyDisclosure ?? false,
    isLoading,
  };
}

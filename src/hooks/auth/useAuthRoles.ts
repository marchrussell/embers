import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export function useAuthRoles(userId: string | undefined) {
  const { data, isLoading } = useQuery({
    queryKey: ["auth-roles", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId!);
      if (error || !data) return { isAdmin: false, isTestUser: false };
      const roles = new Set(data.map((r: any) => r.role));
      return { isAdmin: roles.has("admin"), isTestUser: roles.has("test_user") };
    },
    enabled: !!userId,
    staleTime: Infinity, // roles are stable within a session
    gcTime: 10 * 60 * 1000,
  });
  return {
    isAdmin: data?.isAdmin ?? false,
    isTestUser: data?.isTestUser ?? false,
    isLoading,
  };
}

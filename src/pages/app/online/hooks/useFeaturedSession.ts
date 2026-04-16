import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

import { FeaturedSession } from "../types";

export const useFeaturedSession = () => {
  const { data: featuredSession = null, isLoading } = useQuery<FeaturedSession | null>({
    queryKey: ["featured-session"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("is_featured", true)
        .eq("is_published", true)
        .maybeSingle();

      if (error) throw error;
      return data ?? null;
    },
    staleTime: 10 * 60 * 1000,
  });

  return { featuredSession, isLoading };
};

import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

import { QuickResetSession } from "../types";

export const useQuickResets = () => {
  const { data: quickResets = [], isLoading } = useQuery<QuickResetSession[]>({
    queryKey: ["quick-resets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select(
          "id, title, short_description, image_url, teacher_name, duration_minutes, requires_subscription, intensity, technique"
        )
        .eq("is_quick_reset", true)
        .eq("is_published", true)
        .order("order_index");

      if (error) throw error;
      return data ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });

  return { quickResets, isLoading };
};

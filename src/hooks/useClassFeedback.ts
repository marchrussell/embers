import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export interface ClassFeedbackRow {
  id: string;
  user_id: string;
  class_id: string;
  rating: number | null;
  helped_with_goal: boolean | null;
  feedback_text: string | null;
  created_at: string | null;
  user_email: string | null;
  user_name: string | null;
}

export function useClassFeedback(classId: string | null) {
  return useQuery<ClassFeedbackRow[]>({
    queryKey: ["class-feedback", classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("session_feedback")
        .select("id, user_id, class_id, rating, helped_with_goal, feedback_text, created_at")
        .eq("class_id", classId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      const userIds = [...new Set(data.map((r) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name, first_name, last_name")
        .in("id", userIds);

      const profilesMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

      return data.map((row) => {
        const profile = profilesMap.get(row.user_id);
        return {
          ...row,
          user_email: profile?.email ?? null,
          user_name:
            profile?.full_name ||
            (profile?.first_name && profile?.last_name
              ? `${profile.first_name} ${profile.last_name}`
              : null),
        };
      });
    },
    enabled: !!classId,
  });
}

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function useMarkSessionComplete() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (classId: string) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data: existing } = await supabase
        .from("user_progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("class_id", classId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("user_progress")
          .update({
            completed: true,
            completed_at: new Date().toISOString(),
            last_position_seconds: 0,
          })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_progress").insert({
          user_id: user.id,
          class_id: classId,
          completed: true,
          completed_at: new Date().toISOString(),
          last_position_seconds: 0,
        });
        if (error) throw error;
      }
    },
    onError: () => {
      toast.error("Failed to save session progress");
    },
  });
}

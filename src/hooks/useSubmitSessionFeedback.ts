import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

interface FeedbackInput {
  userId: string;
  sessionId: string;
  rating: number;
  helpedWithGoal: boolean | null;
  feedbackText: string;
}

export function useSubmitSessionFeedback() {
  return useMutation({
    mutationFn: async ({ userId, sessionId, rating, helpedWithGoal, feedbackText }: FeedbackInput) => {
      const { error } = await supabase.from("session_feedback").insert({
        user_id: userId,
        class_id: sessionId,
        rating,
        helped_with_goal: helpedWithGoal,
        feedback_text: feedbackText || null,
      });
      if (error) throw error;

      const { data: currentPrefs } = await supabase
        .from("user_preferences")
        .select("engagement_patterns")
        .eq("user_id", userId)
        .maybeSingle();

      const patterns = (currentPrefs?.engagement_patterns as Record<string, unknown>) || {};
      const sessionRatings = (patterns.session_ratings as Record<string, unknown>) || {};
      sessionRatings[sessionId] = {
        rating,
        helped: helpedWithGoal,
        timestamp: new Date().toISOString(),
      };

      await supabase.from("user_preferences").upsert({
        user_id: userId,
        engagement_patterns: {
          ...patterns,
          session_ratings: sessionRatings,
          last_feedback_date: new Date().toISOString(),
        } as unknown as import("@/integrations/supabase/types").Json,
      });
    },
    onSuccess: () => {
      toast.success("Thank you for your feedback! 💛");
    },
    onError: () => {
      toast.error("Failed to save feedback");
    },
  });
}

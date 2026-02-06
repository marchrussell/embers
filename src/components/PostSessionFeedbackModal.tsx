import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Sparkles } from "lucide-react";
import { ButtonLoadingSpinner } from "@/components/skeletons";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PostSessionFeedbackModalProps {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  sessionTitle: string;
  userId: string;
}

export function PostSessionFeedbackModal({
  open,
  onClose,
  sessionId,
  sessionTitle,
  userId,
}: PostSessionFeedbackModalProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [helpedWithGoal, setHelpedWithGoal] = useState<boolean | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating) {
      toast.error("Please rate your session");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save feedback
      const { error } = await supabase.from("session_feedback").insert({
        user_id: userId,
        class_id: sessionId,
        rating,
        helped_with_goal: helpedWithGoal,
        feedback_text: feedbackText || null,
      });

      if (error) throw error;

      // Update user preferences engagement_patterns with this feedback
      const { data: currentPrefs } = await supabase
        .from("user_preferences")
        .select("engagement_patterns")
        .eq("user_id", userId)
        .maybeSingle();

      const patterns = (currentPrefs?.engagement_patterns as any) || {};
      const sessionRatings = patterns.session_ratings || {};
      sessionRatings[sessionId] = {
        rating,
        helped: helpedWithGoal,
        timestamp: new Date().toISOString(),
      };

      await supabase
        .from("user_preferences")
        .upsert({
          user_id: userId,
          engagement_patterns: {
            ...patterns,
            session_ratings: sessionRatings,
            last_feedback_date: new Date().toISOString(),
          },
        });

      toast.success("Thank you for your feedback! 💛");
      onClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to save feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md backdrop-blur-xl bg-black/30 border border-white/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-editorial text-[#E6DBC7]">
            <Sparkles className="w-6 h-6" />
            How was that session?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rating */}
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Rate your experience with "{sessionTitle}"
            </p>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      rating && star <= rating
                        ? "fill-[#E6DBC7] text-[#E6DBC7]"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Goal achievement */}
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Did this help with what you needed?
            </p>
            <div className="flex gap-3">
              <Button
                variant={helpedWithGoal === true ? "default" : "outline"}
                onClick={() => setHelpedWithGoal(true)}
                className="flex-1"
              >
                Yes, it helped
              </Button>
              <Button
                variant={helpedWithGoal === false ? "default" : "outline"}
                onClick={() => setHelpedWithGoal(false)}
                className="flex-1"
              >
                Not quite
              </Button>
            </div>
          </div>

          {/* Optional text feedback */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Anything else you'd like to share? (optional)
            </p>
            <Textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Your thoughts help me suggest better sessions for you..."
              className="min-h-[80px] bg-background/50"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="flex-1"
              disabled={isSubmitting}
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-[hsl(var(--warm-amber))] to-[hsl(var(--warm-peach))]"
              disabled={isSubmitting || !rating}
            >
              {isSubmitting ? <ButtonLoadingSpinner /> : "Submit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Send, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const FeedbackSection = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    if (!user?.id) {
      toast.error("You must be signed in to submit feedback");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("feedback").insert({
        user_id: user.id,
        message: feedback.trim(),
      });

      if (error) throw error;

      toast.success("Thank you! Your feedback has been submitted.");
      setFeedback("");
      setOpen(false);
    } catch (error: any) {
      console.error("Feedback submission error:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-28">
        <button
          onClick={() => setOpen(true)}
          className="group w-full rounded-2xl border border-white/20 bg-transparent px-8 py-6 transition-colors duration-300 hover:border-white/40 hover:bg-white/5"
        >
          <div className="flex items-center justify-between">
            <div className="pl-2 text-left">
              <h3 className="font-editorial text-2xl text-[#E6DBC7] md:text-3xl">
                Give Feedback / Make A Suggestion
              </h3>
              <p className="mt-1 text-base font-light text-[#E6DBC7]/60">
                Help us improve your experience
              </p>
            </div>
            <Send className="mr-6 h-5 w-5 text-[#E6DBC7]/60 transition-colors group-hover:text-[#E6DBC7]" />
          </div>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          hideClose
          className="w-[96vw] max-w-[640px] overflow-hidden rounded-[28px] border border-white/15 bg-black/80 p-0 backdrop-blur-xl"
        >
          <DialogTitle className="sr-only">Share Your Thoughts</DialogTitle>

          {/* Close Button */}
          <button
            onClick={() => setOpen(false)}
            className="absolute right-6 top-6 z-50 text-white/60 transition-colors hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="px-10 py-12 md:px-14 md:py-16">
            {/* Header */}
            <div className="mb-10">
              <h2 className="mb-4 font-editorial text-3xl text-[#E6DBC7] md:text-4xl">
                Share Your Thoughts
              </h2>
              <p className="text-base font-light leading-relaxed text-white/60 md:text-lg">
                We value your feedback. Let us know what you think or suggest improvements.
              </p>
            </div>

            {/* Textarea */}
            <div className="mb-10">
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Type your feedback or suggestion here..."
                className="min-h-[200px] resize-none rounded-xl border-white/15 bg-white/5 p-5 text-base font-light text-white placeholder:text-white/40 focus:border-white/30 focus:ring-0"
                disabled={isSubmitting}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setFeedback("");
                }}
                className="h-14 flex-1 rounded-full border-white/20 bg-transparent text-base font-light text-white hover:bg-white/5 hover:text-white"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="h-14 flex-1 rounded-full bg-[#E6DBC7] text-base font-medium text-[#1A1A1A] hover:bg-[#F0E8DA]"
                disabled={isSubmitting || !feedback.trim()}
              >
                {isSubmitting ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

import { useState } from "react";
import { MessageSquare, Send, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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
      const { error } = await supabase
        .from("feedback")
        .insert({
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
        {/* Reassuring Message */}
        <p className="text-center text-[#E6DBC7]/70 font-editorial italic text-lg mb-48">
          If you drift away for weeks or months, this remains a place you can return to without guilt.
        </p>
        
        <button
          onClick={() => setOpen(true)}
          className="group w-full bg-transparent border border-white/20 hover:border-white/40 hover:bg-white/5 rounded-2xl py-6 px-8 transition-colors duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="text-left pl-2">
              <h3 className="text-[#E6DBC7] text-2xl md:text-3xl font-editorial">
                Give Feedback / Make A Suggestion
              </h3>
              <p className="text-[#E6DBC7]/60 text-base font-light mt-1">
                Help us improve your experience
              </p>
            </div>
            <Send className="w-5 h-5 text-[#E6DBC7]/60 group-hover:text-[#E6DBC7] transition-colors mr-6" />
          </div>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent 
          hideClose 
          className="w-[96vw] max-w-[640px] backdrop-blur-xl bg-black/80 border border-white/15 rounded-[28px] p-0 overflow-hidden"
        >
          <DialogTitle className="sr-only">Share Your Thoughts</DialogTitle>
          
          {/* Close Button */}
          <button 
            onClick={() => setOpen(false)} 
            className="absolute right-6 top-6 z-50 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="px-10 py-12 md:px-14 md:py-16">
            {/* Header */}
            <div className="mb-10">
              <h2 className="text-[#E6DBC7] text-3xl md:text-4xl font-editorial mb-4">
                Share Your Thoughts
              </h2>
              <p className="text-white/60 text-base md:text-lg font-light leading-relaxed">
                We value your feedback. Let us know what you think or suggest improvements.
              </p>
            </div>
            
            {/* Textarea */}
            <div className="mb-10">
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Type your feedback or suggestion here..."
                className="min-h-[200px] bg-white/5 border-white/15 text-white placeholder:text-white/40 resize-none focus:border-white/30 focus:ring-0 font-light text-base rounded-xl p-5"
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
                className="flex-1 h-14 border-white/20 bg-transparent text-white hover:bg-white/5 hover:text-white rounded-full text-base font-light"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 h-14 bg-[#E6DBC7] hover:bg-[#F0E8DA] text-[#1A1A1A] rounded-full text-base font-medium"
                disabled={isSubmitting || !feedback.trim()}
              >
                {isSubmitting ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
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

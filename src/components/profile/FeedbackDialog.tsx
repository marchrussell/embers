import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedback: string;
  setFeedback: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const FeedbackDialog = ({
  open,
  onOpenChange,
  feedback,
  setFeedback,
  onSubmit,
  isSubmitting,
}: FeedbackDialogProps) => {
  const handleClose = () => {
    onOpenChange(false);
    setFeedback("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="backdrop-blur-xl bg-black/50 border border-white/30 p-0 overflow-hidden rounded-xl max-w-md">
        <div className="p-8 md:p-10">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-white text-xl md:text-2xl font-editorial mb-3">
              Share Your Thoughts
            </DialogTitle>
            <DialogDescription className="text-white/60 font-light text-sm">
              We value your feedback. Let us know what you think or suggest improvements.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Type your feedback or suggestion here..."
              className="min-h-[180px] bg-white/5 border-white/20 text-white placeholder:text-white/40 resize-none focus:border-white/40 font-light"
              disabled={isSubmitting}
            />
            
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-2 border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white/40 h-12 font-light"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={onSubmit}
                className="flex-1 border-2 border-white text-white bg-transparent hover:bg-white/10 h-12 font-light"
                disabled={isSubmitting || !feedback.trim()}
              >
                {isSubmitting ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

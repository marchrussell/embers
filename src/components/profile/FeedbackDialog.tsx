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
      <DialogContent className="max-w-md overflow-hidden rounded-xl border border-white/20 bg-black/50 p-0 backdrop-blur-xl">
        <div className="p-10 md:p-12">
          <DialogHeader className="mb-8">
            <DialogTitle className="mb-3 font-editorial text-xl text-white md:text-2xl">
              Share Your Thoughts
            </DialogTitle>
            <DialogDescription className="text-sm font-light text-white/60">
              We value your feedback. Let us know what you think or suggest improvements.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Type your feedback or suggestion here..."
              className="min-h-[180px] resize-none border-white/20 bg-white/5 font-light text-white placeholder:text-white/40 focus:border-white/40"
              disabled={isSubmitting}
            />

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="h-12 flex-1 border-2 border-white/20 bg-transparent font-light text-white hover:border-white/40 hover:bg-white/10"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={onSubmit}
                className="h-12 flex-1 border-2 border-white bg-transparent font-light text-white hover:bg-white/10"
                disabled={isSubmitting || !feedback.trim()}
              >
                {isSubmitting ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
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

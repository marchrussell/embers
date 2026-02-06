import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { useNavigate } from "react-router-dom";

interface QuickTipsModalProps {
  open: boolean;
  onClose: () => void;
}

export const QuickTipsModal = ({ open, onClose }: QuickTipsModalProps) => {
  const navigate = useNavigate();

  const handleExploreSession = () => {
    onClose();
    navigate("/studio");
  };

  const handleSafetyGuidelines = () => {
    onClose();
    navigate("/safety-disclosure");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent hideClose className="max-w-2xl backdrop-blur-xl bg-black/75 border border-white/30">
        <ModalCloseButton onClose={onClose} size="lg" position="loose" />
        <DialogHeader>
          <DialogTitle className="text-2xl font-light mb-4 text-white pt-8">
            🌿 Quick Tips for Getting Started
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 text-white pt-4">
          <div>
            <h3 className="font-medium mb-2 text-white">1. Start small, breathe slow.</h3>
            <p className="text-white/80">
              Begin with short sessions (3–5 minutes) to get used to the techniques and sensations. 
              Consistency matters more than duration.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2 text-white">2. Find your space.</h3>
            <p className="text-white/80">
              Choose a quiet spot where you can sit or lie down comfortably, free from distractions. 
              Get some headphones or a speaker if you have some. It'll enhance your experience.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2 text-white">3. Stay within your comfort zone.</h3>
            <p className="text-white/80">
              If at any time you feel dizzy, tingly, or uncomfortable - simply return to a normal, gentle breath.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2 text-white">4. Morning or night?</h3>
            <p className="text-white/80">
              When the day first begins or softly ends, your mind is most malleable and receptive - 
              tap into that window with breathwork and realign your system.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2 text-white">5. Track your journey.</h3>
            <p className="text-white/80">
              Keep an eye on how your mood, focus, and energy shift over time - awareness deepens results.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2 text-white">6. Your breath is your guide.</h3>
            <p className="text-white/80">
              Breathe within your own window of capacity. Learn to listen to your body and let it lead the way.
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/20">
            <Button 
              onClick={handleExploreSession}
              className="flex-1"
            >
              Explore your first session now
            </Button>
            <Button 
              onClick={handleSafetyGuidelines}
              variant="outline"
              className="flex-1"
            >
              Learn more about safe practice
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
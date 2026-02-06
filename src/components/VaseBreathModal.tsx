import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface VaseBreathModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSubscription: () => void;
}

export const VaseBreathModal = ({ open, onOpenChange }: VaseBreathModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideClose className="w-[94%] sm:w-[90%] max-w-4xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto backdrop-blur-xl bg-black/75 border border-white/20 rounded-[28px] p-0">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-6 top-6 sm:right-8 sm:top-8 md:right-10 md:top-10 z-50 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <div className="px-6 pt-14 pb-10 sm:px-10 sm:pt-16 md:px-12 md:pt-20 md:pb-12 space-y-5 sm:space-y-6">
          <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl text-white">
            Vase Breath
          </h2>

          <div className="space-y-4 sm:space-y-5">
            <p className="text-base sm:text-lg md:text-xl text-white leading-relaxed">
              This is a short 10 minute practice called Vase Breath. It's an ancient Tibetan breath tool which has been a solid rock for me and my go to. I hope it can be the same for you. You know that feeling when your thoughts are everywhere and you just can't seem to settle. Well this practice can help with that, soothing any nerves and anxiety, quietening the busy mind, dropping deeper into presence.
            </p>

            <p className="text-base sm:text-lg md:text-xl text-white leading-relaxed">
              Give it a go if you have a spare 10 minutes and let me know how you get on in the comments below.
            </p>

            <p className="text-base sm:text-lg md:text-xl text-white leading-relaxed">
              March x
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

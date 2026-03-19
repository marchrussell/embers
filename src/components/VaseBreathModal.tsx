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
      <DialogContent
        hideClose
        className="max-h-[92vh] w-[94%] max-w-4xl overflow-y-auto rounded-[28px] border border-white/20 bg-black/75 p-0 backdrop-blur-xl sm:max-h-[88vh] sm:w-[90%]"
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-6 top-6 z-50 opacity-70 transition-opacity hover:opacity-100 sm:right-8 sm:top-8 md:right-10 md:top-10"
        >
          <X className="h-6 w-6 text-white" />
        </button>

        <div className="space-y-5 px-6 pb-10 pt-14 sm:space-y-6 sm:px-10 sm:pt-16 md:px-12 md:pb-12 md:pt-20">
          <h2 className="font-editorial text-3xl text-white sm:text-4xl md:text-5xl">
            Vase Breath
          </h2>

          <div className="space-y-4 sm:space-y-5">
            <p className="text-base leading-relaxed text-white sm:text-lg md:text-xl">
              This is a short 10 minute practice called Vase Breath. It's an ancient Tibetan breath
              tool which has been a solid rock for me and my go to. I hope it can be the same for
              you. You know that feeling when your thoughts are everywhere and you just can't seem
              to settle. Well this practice can help with that, soothing any nerves and anxiety,
              quietening the busy mind, dropping deeper into presence.
            </p>

            <p className="text-base leading-relaxed text-white sm:text-lg md:text-xl">
              Give it a go if you have a spare 10 minutes and let me know how you get on in the
              comments below.
            </p>

            <p className="text-base leading-relaxed text-white sm:text-lg md:text-xl">March x</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

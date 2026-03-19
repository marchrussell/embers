import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { GlowButton } from "@/components/ui/glow-button";
import { ArrowRight, X } from "lucide-react";
import { useState } from "react";
import { RiseArcApplicationForm } from "./RiseArcApplicationForm";
interface RiseArcIntroModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const RiseArcIntroModal = ({ open, onOpenChange }: RiseArcIntroModalProps) => {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const handleApplyClick = () => {
    onOpenChange(false);
    setShowApplicationForm(true);
  };
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          hideClose
          className="max-h-[92vh] w-[94%] max-w-[720px] overflow-y-auto rounded-[28px] border border-white/20 bg-black/75 p-0 backdrop-blur-xl sm:max-h-[88vh] sm:w-[90%]"
        >
          <DialogTitle className="sr-only">The Rise ARC Method</DialogTitle>

          {/* Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-6 top-6 z-50 opacity-70 transition-opacity hover:opacity-100 sm:right-8 sm:top-8 md:right-10 md:top-10"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          <div className="px-6 pb-10 pt-14 sm:px-10 sm:pt-16 md:px-12 md:pb-12 md:pt-20">
            {/* Header */}
            <div className="mb-6 text-center sm:mb-8 md:mb-10">
              <h2
                className="mb-6 font-editorial text-[#E6DBC7]"
                style={{
                  fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                }}
              >
                The Rise ARC Method
              </h2>

              {/* Main intro paragraph */}
              <p
                className="mb-6 leading-relaxed text-[#E6DBC7]/90 sm:mb-8 md:mb-10"
                style={{
                  fontSize: "clamp(1rem, 1.15vw, 1.1rem)",
                  lineHeight: 1.7,
                }}
              >
                A 3-month guided process that works with the deeper systems shaping how you feel,
                respond, and relate — so life becomes available again, not just manageable.
              </p>
            </div>

            {/* Body content */}
            <div className="mb-6 space-y-6">
              <p
                className="leading-relaxed text-[#E6DBC7]/80"
                style={{
                  fontSize: "clamp(0.95rem, 1.05vw, 1.02rem)",
                  lineHeight: 1.7,
                }}
              >
                If you've been feeling constantly on, overwhelmed, numb, or not like yourself,
                there's nothing wrong with you. Your nervous system has just adapted to more
                pressure than it was designed to carry.
              </p>

              <p
                className="leading-relaxed text-[#E6DBC7]/80"
                style={{
                  fontSize: "clamp(0.95rem, 1.05vw, 1.02rem)",
                  lineHeight: 1.7,
                }}
              >
                The Rise ARC Method supports your nervous system, emotional world, and sense of self
                to come out of long-held protection and disconnection — restoring resilience,
                clarity, presence, and genuine connection.
              </p>

              <p
                className="leading-relaxed text-[#E6DBC7]/90"
                style={{
                  fontSize: "clamp(0.95rem, 1.05vw, 1.02rem)",
                  lineHeight: 1.7,
                }}
              >
                Not quick fixes. Not coping tools. A grounded, physiological reconnection with real
                impact.
              </p>
            </div>

            {/* CTA */}
            <div className="border-t border-white/10 pt-6 text-center">
              <GlowButton
                variant="solid"
                size="lg"
                onClick={handleApplyClick}
                className="gap-3 px-8 md:px-10"
                style={{
                  fontSize: "clamp(0.95rem, 1.1vw, 1.05rem)",
                }}
              >
                Apply to The Rise ARC Method <ArrowRight className="h-5 w-5" />
              </GlowButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <RiseArcApplicationForm open={showApplicationForm} onOpenChange={setShowApplicationForm} />
    </>
  );
};
export default RiseArcIntroModal;

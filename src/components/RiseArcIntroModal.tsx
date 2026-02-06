import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { GlowButton } from "@/components/ui/glow-button";
import { ArrowRight, X } from "lucide-react";
import { useState } from "react";
import { RiseArcApplicationForm } from "./RiseArcApplicationForm";
interface RiseArcIntroModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const RiseArcIntroModal = ({
  open,
  onOpenChange
}: RiseArcIntroModalProps) => {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const handleApplyClick = () => {
    onOpenChange(false);
    setShowApplicationForm(true);
  };
  return <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent hideClose className="w-[94%] sm:w-[90%] max-w-[720px] max-h-[92vh] sm:max-h-[88vh] overflow-y-auto backdrop-blur-xl bg-black/75 border border-white/20 rounded-[28px] p-0">
          <DialogTitle className="sr-only">The Rise ARC Method</DialogTitle>

          {/* Close Button */}
          <button onClick={() => onOpenChange(false)} className="absolute right-6 top-6 sm:right-8 sm:top-8 md:right-10 md:top-10 z-50 opacity-70 hover:opacity-100 transition-opacity">
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="px-6 pt-14 pb-10 sm:px-10 sm:pt-16 md:px-12 md:pt-20 md:pb-12">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8 md:mb-10">
              <h2 className="font-editorial text-[#E6DBC7] mb-6" style={{
              fontSize: 'clamp(1.75rem, 3vw, 2.5rem)'
            }}>
                The Rise ARC Method
              </h2>
              
              {/* Main intro paragraph */}
              <p className="text-[#E6DBC7]/90 leading-relaxed mb-6 sm:mb-8 md:mb-10" style={{
              fontSize: 'clamp(1rem, 1.15vw, 1.1rem)',
              lineHeight: 1.7
            }}>A 3-month guided process that works with the deeper systems shaping how you feel, respond, and relate — so life becomes available again, not just manageable.</p>
            </div>

            {/* Body content */}
            <div className="space-y-6 mb-6">
              <p className="text-[#E6DBC7]/80 leading-relaxed" style={{
              fontSize: 'clamp(0.95rem, 1.05vw, 1.02rem)',
              lineHeight: 1.7
            }}>
                If you've been feeling constantly on, overwhelmed, numb, or not like yourself, there's nothing wrong with you. Your nervous system has just adapted to more pressure than it was designed to carry.
              </p>

              <p className="text-[#E6DBC7]/80 leading-relaxed" style={{
              fontSize: 'clamp(0.95rem, 1.05vw, 1.02rem)',
              lineHeight: 1.7
            }}>
                The Rise ARC Method supports your nervous system, emotional world, and sense of self to come out of long-held protection and disconnection — restoring resilience, clarity, presence, and genuine connection.
              </p>

              <p className="text-[#E6DBC7]/90 leading-relaxed" style={{
              fontSize: 'clamp(0.95rem, 1.05vw, 1.02rem)',
              lineHeight: 1.7
            }}>
                Not quick fixes. Not coping tools. A grounded, physiological reconnection with real impact.
              </p>
            </div>

            {/* CTA */}
            <div className="text-center pt-6 border-t border-white/10">
              <GlowButton variant="solid" size="lg" onClick={handleApplyClick} className="px-8 md:px-10 gap-3" style={{
              fontSize: 'clamp(0.95rem, 1.1vw, 1.05rem)'
            }}>
                Apply to The Rise ARC Method <ArrowRight className="w-5 h-5" />
              </GlowButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <RiseArcApplicationForm open={showApplicationForm} onOpenChange={setShowApplicationForm} />
    </>;
};
export default RiseArcIntroModal;
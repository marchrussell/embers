import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight, X, Leaf, Flame, HandHeart } from "lucide-react";
import { RiseArcApplicationForm } from "./RiseArcApplicationForm";
import { ArcProgramModal } from "./ArcProgramModal";

// Background images
import arcSelfStudyBg from "@/assets/arc-self-study-bg.jpg";
import arcGroupMentorshipBg from "@/assets/arc-group-mentorship-bg.jpg";
import arc11MentorshipBg from "@/assets/arc-1-1-mentorship-bg.jpg";

interface ArcCardsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArcCardsModal({ open, onOpenChange }: ArcCardsModalProps) {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showArcProgramModal, setShowArcProgramModal] = useState(false);
  const [arcProgramType, setArcProgramType] = useState<'self-study' | 'group' | 'one-on-one'>('self-study');

  const handleSelfStudyClick = () => {
    setArcProgramType('self-study');
    setShowArcProgramModal(true);
  };

  const handleGroupClick = () => {
    setArcProgramType('group');
    setShowArcProgramModal(true);
  };

  const handleOneOnOneClick = () => {
    setArcProgramType('one-on-one');
    setShowArcProgramModal(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          hideClose 
          className="w-[96vw] max-w-[1320px] max-h-[92vh] overflow-y-auto backdrop-blur-xl bg-black/70 border border-white/15 rounded-[28px] p-0"
        >
          <DialogTitle className="sr-only">The Rise ARC Method</DialogTitle>
          
          {/* Close Button */}
          <button 
            onClick={() => onOpenChange(false)} 
            className="fixed right-6 top-6 md:right-10 md:top-10 z-50 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="px-8 py-[12vh] md:px-14 md:py-[14vh] lg:px-20 lg:py-[16vh]">
            {/* Cards Grid - EXACT copy from Explore page */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-6 w-full">
              
              {/* Card 1 — Self-Study */}
              <div className="relative rounded-sm overflow-hidden text-left flex flex-col h-full transition-colors duration-300 border border-white/[0.12]">
                {/* Background image with blur */}
                <div className="absolute inset-0 z-0">
                  <img src={arcSelfStudyBg} alt="" className="w-full h-full object-cover" style={{ filter: 'blur(3px) brightness(0.6)', transform: 'scale(1.05)' }} />
                </div>
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.5) 100%)' }} />
                {/* Content */}
                <div className="relative z-10 p-8 lg:p-10 flex flex-col h-full">
                  {/* Header */}
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-3 text-white/70 text-xs uppercase tracking-[0.15em] mb-4" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                      <Leaf className="w-5 h-5 text-white" />
                      Self-Paced
                    </span>
                    <h4 className="text-white font-editorial text-2xl lg:text-3xl mb-2" style={{
                      fontWeight: 300,
                      textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                    }}>
                      ARC Self-Study
                    </h4>
                  </div>

                  {/* Description */}
                  <p className="text-white/90 text-sm leading-relaxed mb-6" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                    A structured, private 4-month journey to stabilise your nervous system, improve sleep and energy, reduce anxiety, and build real internal steadiness — at your own pace.
                  </p>

                  {/* Perfect for */}
                  <div className="mb-8">
                    <p className="text-white/50 text-xs uppercase tracking-[0.12em] mb-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>Perfect for</p>
                    <p className="text-white/80 text-sm leading-relaxed" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                      People who want depth, privacy, and structured support without live sessions.
                    </p>
                  </div>

                  {/* Bottom section - pushed to bottom */}
                  <div className="mt-auto">
                    {/* CTA */}
                    <button 
                      onClick={handleSelfStudyClick}
                      className="w-full bg-white/20 backdrop-blur-sm text-white border border-white/40 px-5 py-4 rounded-none text-sm font-normal tracking-wide hover:bg-white/30 hover:border-white/60 transition-all flex items-center justify-center"
                    >
                      Explore Self-Study
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2 — Group Programme */}
              <div className="relative rounded-sm overflow-hidden text-left flex flex-col h-full transition-colors duration-300 border border-white/[0.12]">
                {/* Background image with blur */}
                <div className="absolute inset-0 z-0">
                  <img src={arcGroupMentorshipBg} alt="" className="w-full h-full object-cover" style={{ filter: 'blur(3px) brightness(0.6)', transform: 'scale(1.05)' }} />
                </div>
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.5) 100%)' }} />
                {/* Content */}
                <div className="relative z-10 p-8 lg:p-10 flex flex-col h-full">
                  {/* Header */}
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-3 text-white/70 text-xs uppercase tracking-[0.15em] mb-4" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                      <Flame className="w-5 h-5 text-white" />
                      Live Group
                    </span>
                    <h4 className="text-white font-editorial text-2xl lg:text-3xl mb-2" style={{
                      fontWeight: 300,
                      textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                    }}>
                      ARC Group Programme
                    </h4>
                  </div>

                  {/* Description */}
                  <p className="text-white/90 text-sm leading-relaxed mb-6" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                    A guided live experience blending nervous system repair, emotional processing and relational connection — inside a supportive community.
                  </p>

                  {/* Perfect for */}
                  <div className="mb-8">
                    <p className="text-white/50 text-xs uppercase tracking-[0.12em] mb-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>Perfect for</p>
                    <p className="text-white/80 text-sm leading-relaxed" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                      People who want accountability, guidance, and to feel more regulated, connected, and steady day-to-day.
                    </p>
                  </div>

                  {/* Bottom section - pushed to bottom */}
                  <div className="mt-auto">
                    {/* CTA */}
                    <button 
                      onClick={handleGroupClick}
                      className="w-full bg-white/20 backdrop-blur-sm text-white border border-white/40 px-5 py-4 rounded-none text-sm font-normal tracking-wide hover:bg-white/30 hover:border-white/60 transition-all flex items-center justify-center"
                    >
                      Explore Group Programme
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 3 — 1:1 Programme */}
              <div className="relative rounded-sm overflow-hidden text-left flex flex-col h-full transition-colors duration-300 border border-white/[0.12]">
                {/* Background image with blur */}
                <div className="absolute inset-0 z-0">
                  <img src={arc11MentorshipBg} alt="" className="w-full h-full object-cover" style={{ filter: 'blur(3px) brightness(0.6)', transform: 'scale(1.05)' }} />
                </div>
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.5) 100%)' }} />
                {/* Content */}
                <div className="relative z-10 p-8 lg:p-10 flex flex-col h-full">
                  {/* Header */}
                  <div className="mb-6">
                    <span className="inline-flex items-center gap-3 text-white/70 text-xs uppercase tracking-[0.15em] mb-4" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                      <HandHeart className="w-5 h-5 text-white" />
                      High-Touch
                    </span>
                    <h4 className="text-white font-editorial text-2xl lg:text-3xl mb-2" style={{
                      fontWeight: 300,
                      textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                    }}>
                      ARC 1:1 Programme
                    </h4>
                  </div>

                  {/* Description */}
                  <p className="text-white/90 text-sm leading-relaxed mb-6" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                    A personalised, high-touch 4-month immersion for emotional clarity, patterns that won't shift alone, and deep nervous-system repatterning.
                  </p>

                  {/* Perfect for */}
                  <div className="mb-8">
                    <p className="text-white/50 text-xs uppercase tracking-[0.12em] mb-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>Perfect for</p>
                    <p className="text-white/80 text-sm leading-relaxed" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                      People ready for precise guidance, real-time regulation support, and lasting internal change.
                    </p>
                  </div>

                  {/* Bottom section - pushed to bottom */}
                  <div className="mt-auto">
                    {/* CTA */}
                    <button 
                      onClick={handleOneOnOneClick}
                      className="w-full bg-white/20 backdrop-blur-sm text-white border border-white/40 px-5 py-4 rounded-none text-sm font-normal tracking-wide hover:bg-white/30 hover:border-white/60 transition-all flex items-center justify-center"
                    >
                      Explore 1:1 Programme
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ArcProgramModal 
        open={showArcProgramModal} 
        onOpenChange={setShowArcProgramModal}
        programType={arcProgramType}
        onApply={() => {
          setShowArcProgramModal(false);
          setShowApplicationForm(true);
        }}
      />
      <RiseArcApplicationForm open={showApplicationForm} onOpenChange={setShowApplicationForm} />
    </>
  );
}

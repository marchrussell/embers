import { Flame, HandHeart, Leaf, X } from "lucide-react";
import { useState } from "react";

// Background images
import arc11MentorshipBg from "@/assets/arc-1-1-mentorship-bg.jpg";
import arcGroupMentorshipBg from "@/assets/arc-group-mentorship-bg.jpg";
import arcSelfStudyBg from "@/assets/arc-self-study-bg.jpg";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { GlowButton } from "@/components/ui/glow-button";

import { ArcProgramModal } from "./ArcProgramModal";
import { RiseArcApplicationForm } from "./RiseArcApplicationForm";

interface ArcCardProps {
  backgroundImage: string;
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
  perfectFor: string;
  buttonText: string;
  disabled?: boolean;
  onClick: () => void;
}

function ArcCard({
  backgroundImage,
  icon,
  label,
  title,
  description,
  perfectFor,
  buttonText,
  disabled,
  onClick,
}: ArcCardProps) {
  return (
    <div className="relative flex min-h-[420px] flex-col overflow-hidden rounded-[24px] border border-white/[0.12] bg-transparent text-left transition-colors duration-300">
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage}
          alt=""
          className="h-full w-full object-cover"
          style={{ filter: "blur(3px) brightness(0.6)", transform: "scale(1.05)" }}
        />
      </div>
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.5) 100%)",
        }}
      />
      <div className="relative z-10 flex h-full flex-col p-8 lg:p-10">
        <div className="mb-6">
          <span
            className="mb-4 inline-flex items-center gap-3 text-xs uppercase tracking-[0.15em] text-white/70"
            style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
          >
            {icon}
            {label}
          </span>
          <h4
            className="mb-2 font-editorial text-2xl text-white lg:text-3xl"
            style={{ fontWeight: 300, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
          >
            {title}
          </h4>
        </div>
        <p
          className="mb-6 text-sm leading-relaxed text-white/90"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}
        >
          {description}
        </p>
        <div className="mb-8">
          <p
            className="mb-2 text-xs uppercase tracking-[0.12em] text-white/50"
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
          >
            Perfect for
          </p>
          <p
            className="text-sm leading-relaxed text-white/80"
            style={{ textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}
          >
            {perfectFor}
          </p>
        </div>
        <div className="mt-auto">
          <GlowButton variant="white" disabled={disabled} onClick={onClick} className="w-full">
            {buttonText}
          </GlowButton>
        </div>
      </div>
    </div>
  );
}

interface ArcCardsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArcCardsModal({ open, onOpenChange }: ArcCardsModalProps) {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showArcProgramModal, setShowArcProgramModal] = useState(false);
  const [arcProgramType, setArcProgramType] = useState<"self-study" | "group" | "one-on-one">(
    "self-study"
  );

  const handleSelfStudyClick = () => {
    setArcProgramType("self-study");
    setShowArcProgramModal(true);
  };

  const handleGroupClick = () => {
    setArcProgramType("group");
    setShowArcProgramModal(true);
  };

  const handleOneOnOneClick = () => {
    window.open("https://www.marchrussell.com/explore", "_blank");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          hideClose
          className="max-h-[92vh] w-[96vw] max-w-[1320px] overflow-y-auto rounded-[28px] border border-white/15 bg-black/70 p-0 backdrop-blur-xl"
        >
          <DialogTitle className="sr-only">The Rise ARC Method</DialogTitle>

          <button
            onClick={() => onOpenChange(false)}
            className="fixed right-6 top-6 z-50 text-white/60 transition-colors hover:text-white md:right-10 md:top-10"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="px-8 py-[12vh] md:px-14 md:py-[14vh] lg:px-20 lg:py-[16vh]">
            <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-6">
              <ArcCard
                backgroundImage={arcSelfStudyBg}
                icon={<Leaf className="h-5 w-5 text-white" />}
                label="Self-Paced"
                title="ARC Self-Study"
                description="A structured, private 4-month journey to stabilise your nervous system, improve sleep and energy, reduce anxiety, and build real internal steadiness — at your own pace."
                perfectFor="People who want depth, privacy, and structured support without live sessions."
                buttonText="Coming Soon"
                disabled
                onClick={handleSelfStudyClick}
              />
              <ArcCard
                backgroundImage={arcGroupMentorshipBg}
                icon={<Flame className="h-5 w-5 text-white" />}
                label="Live Group"
                title="ARC Group Programme"
                description="A guided live experience blending nervous system repair, emotional processing and relational connection — inside a supportive community."
                perfectFor="People who want accountability, guidance, and to feel more regulated, connected, and steady day-to-day."
                buttonText="Coming Soon"
                disabled
                onClick={handleGroupClick}
              />
              <ArcCard
                backgroundImage={arc11MentorshipBg}
                icon={<HandHeart className="h-5 w-5 text-white" />}
                label="High-Touch"
                title="ARC 1:1 Programme"
                description="A personalised, high-touch 4-month immersion for emotional clarity, patterns that won't shift alone, and deep nervous-system repatterning."
                perfectFor="People ready for precise guidance, real-time regulation support, and lasting internal change."
                buttonText="Explore"
                onClick={handleOneOnOneClick}
              />
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

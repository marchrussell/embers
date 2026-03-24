import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Flame, HandHeart, Leaf, X } from "lucide-react";
import { useState } from "react";
import { ArcProgramModal } from "./ArcProgramModal";
import { RiseArcApplicationForm } from "./RiseArcApplicationForm";

// Background images
import arc11MentorshipBg from "@/assets/arc-1-1-mentorship-bg.jpg";
import arcGroupMentorshipBg from "@/assets/arc-group-mentorship-bg.jpg";
import arcSelfStudyBg from "@/assets/arc-self-study-bg.jpg";

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
    setArcProgramType("one-on-one");
    setShowArcProgramModal(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          hideClose
          className="max-h-[92vh] w-[96vw] max-w-[1320px] overflow-y-auto rounded-[28px] border border-white/15 bg-black/70 p-0 backdrop-blur-xl"
        >
          <DialogTitle className="sr-only">The Rise ARC Method</DialogTitle>

          {/* Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="fixed right-6 top-6 z-50 text-white/60 transition-colors hover:text-white md:right-10 md:top-10"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="px-8 py-[12vh] md:px-14 md:py-[14vh] lg:px-20 lg:py-[16vh]">
            {/* Cards Grid - EXACT copy from Explore page */}
            <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-6">
              {/* Card 1 — Self-Study */}
              <div className="relative flex h-full flex-col overflow-hidden rounded-sm border border-white/[0.12] text-left transition-colors duration-300">
                {/* Background image with blur */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={arcSelfStudyBg}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ filter: "blur(3px) brightness(0.6)", transform: "scale(1.05)" }}
                  />
                </div>
                {/* Glassmorphism overlay */}
                <div
                  className="absolute inset-0 z-[1]"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.5) 100%)",
                  }}
                />
                {/* Content */}
                <div className="relative z-10 flex h-full flex-col p-8 lg:p-10">
                  {/* Header */}
                  <div className="mb-6">
                    <span
                      className="mb-4 inline-flex items-center gap-3 text-xs uppercase tracking-[0.15em] text-white/70"
                      style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
                    >
                      <Leaf className="h-5 w-5 text-white" />
                      Self-Paced
                    </span>
                    <h4
                      className="mb-2 font-editorial text-2xl text-white lg:text-3xl"
                      style={{
                        fontWeight: 300,
                        textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                      }}
                    >
                      ARC Self-Study
                    </h4>
                  </div>

                  {/* Description */}
                  <p
                    className="mb-6 text-sm leading-relaxed text-white/90"
                    style={{ textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}
                  >
                    A structured, private 4-month journey to stabilise your nervous system, improve
                    sleep and energy, reduce anxiety, and build real internal steadiness — at your
                    own pace.
                  </p>

                  {/* Perfect for */}
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
                      People who want depth, privacy, and structured support without live sessions.
                    </p>
                  </div>

                  {/* Bottom section - pushed to bottom */}
                  <div className="mt-auto">
                    {/* CTA */}
                    <button
                      disabled
                      className="flex w-full items-center justify-center rounded-none border border-white/40 bg-white/20 px-5 py-4 text-sm font-normal tracking-wide text-white backdrop-blur-sm transition-all hover:border-white/60 hover:bg-white/30"
                      onClick={handleSelfStudyClick}
                    >
                      Coming Soon
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2 — Group Programme */}
              <div className="relative flex h-full flex-col overflow-hidden rounded-sm border border-white/[0.12] text-left transition-colors duration-300">
                {/* Background image with blur */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={arcGroupMentorshipBg}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ filter: "blur(3px) brightness(0.6)", transform: "scale(1.05)" }}
                  />
                </div>
                {/* Glassmorphism overlay */}
                <div
                  className="absolute inset-0 z-[1]"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.5) 100%)",
                  }}
                />
                {/* Content */}
                <div className="relative z-10 flex h-full flex-col p-8 lg:p-10">
                  {/* Header */}
                  <div className="mb-6">
                    <span
                      className="mb-4 inline-flex items-center gap-3 text-xs uppercase tracking-[0.15em] text-white/70"
                      style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
                    >
                      <Flame className="h-5 w-5 text-white" />
                      Live Group
                    </span>
                    <h4
                      className="mb-2 font-editorial text-2xl text-white lg:text-3xl"
                      style={{
                        fontWeight: 300,
                        textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                      }}
                    >
                      ARC Group Programme
                    </h4>
                  </div>

                  {/* Description */}
                  <p
                    className="mb-6 text-sm leading-relaxed text-white/90"
                    style={{ textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}
                  >
                    A guided live experience blending nervous system repair, emotional processing
                    and relational connection — inside a supportive community.
                  </p>

                  {/* Perfect for */}
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
                      People who want accountability, guidance, and to feel more regulated,
                      connected, and steady day-to-day.
                    </p>
                  </div>

                  {/* Bottom section - pushed to bottom */}
                  <div className="mt-auto">
                    {/* CTA */}
                    <button
                      onClick={handleGroupClick}
                      className="flex w-full items-center justify-center rounded-none border border-white/40 bg-white/20 px-5 py-4 text-sm font-normal tracking-wide text-white backdrop-blur-sm transition-all hover:border-white/60 hover:bg-white/30"
                    >
                      Coming Soon
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 3 — 1:1 Programme */}
              <div className="relative flex h-full flex-col overflow-hidden rounded-sm border border-white/[0.12] text-left transition-colors duration-300">
                {/* Background image with blur */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={arc11MentorshipBg}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ filter: "blur(3px) brightness(0.6)", transform: "scale(1.05)" }}
                  />
                </div>
                {/* Glassmorphism overlay */}
                <div
                  className="absolute inset-0 z-[1]"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.5) 100%)",
                  }}
                />
                {/* Content */}
                <div className="relative z-10 flex h-full flex-col p-8 lg:p-10">
                  {/* Header */}
                  <div className="mb-6">
                    <span
                      className="mb-4 inline-flex items-center gap-3 text-xs uppercase tracking-[0.15em] text-white/70"
                      style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
                    >
                      <HandHeart className="h-5 w-5 text-white" />
                      High-Touch
                    </span>
                    <h4
                      className="mb-2 font-editorial text-2xl text-white lg:text-3xl"
                      style={{
                        fontWeight: 300,
                        textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                      }}
                    >
                      ARC 1:1 Programme
                    </h4>
                  </div>

                  {/* Description */}
                  <p
                    className="mb-6 text-sm leading-relaxed text-white/90"
                    style={{ textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}
                  >
                    A personalised, high-touch 4-month immersion for emotional clarity, patterns
                    that won't shift alone, and deep nervous-system repatterning.
                  </p>

                  {/* Perfect for */}
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
                      People ready for precise guidance, real-time regulation support, and lasting
                      internal change.
                    </p>
                  </div>

                  {/* Bottom section - pushed to bottom */}
                  <div className="mt-auto">
                    {/* CTA */}
                    <button
                      onClick={handleOneOnOneClick}
                      className="flex w-full items-center justify-center rounded-none border border-white/40 bg-white/20 px-5 py-4 text-sm font-normal tracking-wide text-white backdrop-blur-sm transition-all hover:border-white/60 hover:bg-white/30"
                    >
                      Explore
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

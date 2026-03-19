import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import SessionDetailModal from "@/pages/app/SessionDetail";
import { OptimizedImage } from "@/components/OptimizedImage";
import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/supabaseImageOptimization";

// Pre-selected session IDs - these should be configured to actual session IDs
const BREATH_PRACTICE_ID = ""; // Short breath practice 8-12 min
const SOMATIC_PRACTICE_ID = ""; // Gentle somatic practice

interface StartHereOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionClick: (sessionId: string) => void;
  weeklyResetStatus: "live" | "replay" | "upcoming";
  onWeeklyResetClick: () => void;
  sessions?: {
    breathPractice?: {
      id: string;
      title: string;
      duration: number;
      image_url: string;
    };
    somaticPractice?: {
      id: string;
      title: string;
      duration: number;
      image_url: string;
    };
  };
}

const StartHereOnboardingModal = ({
  isOpen,
  onClose,
  onSessionClick,
  weeklyResetStatus,
  onWeeklyResetClick,
  sessions,
}: StartHereOnboardingModalProps) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const handleSessionClick = (sessionId: string) => {
    if (sessionId) {
      setSelectedSessionId(sessionId);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-3xl overflow-y-auto rounded-2xl border border-[#E6DBC7]/15 bg-[#1A1A1A] p-0">
          <div className="p-8 md:p-12">
            {/* Screen title */}
            <DialogTitle className="mb-8 font-editorial text-3xl font-light tracking-tight text-[#E6DBC7] md:text-4xl">
              A Simple Place to Begin
            </DialogTitle>

            {/* Verbatim copy */}
            <div className="mb-12 space-y-4 text-base font-light leading-relaxed text-[#E6DBC7]/80 md:text-lg">
              <p>You don't need to do everything here.</p>
              <p>
                This space is designed to help you arrive gently and find your footing — without
                pressure or expectation.
              </p>
              <p>
                If all you do in your first two weeks is try these few practices and come to the
                Weekly Reset, that's more than enough.
              </p>
            </div>

            {/* Three session items */}
            <div className="mb-12 space-y-4">
              {/* Item 1: Short breath practice */}
              <SessionCard
                title={sessions?.breathPractice?.title || "Short Breath Practice"}
                subtitle="A brief breathwork session to settle your system"
                duration={sessions?.breathPractice?.duration || 10}
                imageUrl={sessions?.breathPractice?.image_url}
                onClick={() =>
                  sessions?.breathPractice?.id && handleSessionClick(sessions.breathPractice.id)
                }
              />

              {/* Item 2: Gentle somatic practice */}
              <SessionCard
                title={sessions?.somaticPractice?.title || "Gentle Somatic Practice"}
                subtitle="Simple, slow, grounding movements"
                duration={sessions?.somaticPractice?.duration || 12}
                imageUrl={sessions?.somaticPractice?.image_url}
                onClick={() =>
                  sessions?.somaticPractice?.id && handleSessionClick(sessions.somaticPractice.id)
                }
              />

              {/* Item 3: Weekly Reset */}
              <div
                onClick={onWeeklyResetClick}
                className="group flex cursor-pointer items-center gap-4 rounded-lg border border-[#E6DBC7]/10 bg-transparent p-4 transition-all hover:border-[#E6DBC7]/20 hover:bg-[#E6DBC7]/5"
              >
                <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[#EC9037]/30 to-[#E6DBC7]/10">
                  <Play className="h-8 w-8 text-[#E6DBC7]/60" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="mb-1 font-editorial text-lg text-[#E6DBC7] md:text-xl">
                    Weekly Reset
                  </h4>
                  <p className="text-sm font-light text-[#E6DBC7]/60 md:text-base">
                    {weeklyResetStatus === "live"
                      ? "Live now — join the session"
                      : weeklyResetStatus === "replay"
                        ? "Watch the latest replay"
                        : "Every Tuesday at 7pm GMT"}
                  </p>
                </div>
                <div className="pr-2">
                  <span className="text-sm font-light text-[#EC9037]">
                    {weeklyResetStatus === "live"
                      ? "Join Live"
                      : weeklyResetStatus === "replay"
                        ? "Watch Replay"
                        : "View"}
                  </span>
                </div>
              </div>
            </div>

            {/* Single CTA */}
            <Button
              onClick={onClose}
              className="w-full rounded-full border border-[#E6DBC7]/60 bg-transparent px-12 py-3 text-base font-light text-[#E6DBC7] transition-all hover:border-[#E6DBC7] hover:bg-white/5 md:w-auto"
            >
              Begin gently
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Session Detail Modal */}
      <SessionDetailModal
        sessionId={selectedSessionId}
        open={!!selectedSessionId}
        onClose={() => setSelectedSessionId(null)}
      />
    </>
  );
};

// Simple session card component (no progress tracking)
const SessionCard = ({
  title,
  subtitle,
  duration,
  imageUrl,
  onClick,
}: {
  title: string;
  subtitle: string;
  duration: number;
  imageUrl?: string;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className="group flex cursor-pointer items-center gap-4 rounded-lg border border-[#E6DBC7]/10 bg-transparent p-4 transition-all hover:border-[#E6DBC7]/20 hover:bg-[#E6DBC7]/5"
  >
    <div
      className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[#2A2A2A]"
      style={
        imageUrl
          ? {
              backgroundImage: `url('${getOptimizedImageUrl(imageUrl, IMAGE_PRESETS.thumbnail)}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {}
      }
    >
      {!imageUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Play className="h-6 w-6 text-[#E6DBC7]/40" />
        </div>
      )}
    </div>
    <div className="min-w-0 flex-1">
      <h4 className="mb-1 font-editorial text-lg text-[#E6DBC7] md:text-xl">{title}</h4>
      <p className="text-sm font-light text-[#E6DBC7]/60 md:text-base">{subtitle}</p>
    </div>
    <div className="pr-2">
      <span className="text-sm font-light text-[#E6DBC7]/50">{duration} min</span>
    </div>
  </div>
);

export default StartHereOnboardingModal;

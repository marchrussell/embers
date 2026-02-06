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
  sessions
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
        <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto bg-[#1A1A1A] border border-[#E6DBC7]/15 rounded-2xl p-0">
          <div className="p-8 md:p-12">
            {/* Screen title */}
            <DialogTitle className="font-editorial text-3xl md:text-4xl text-[#E6DBC7] font-light tracking-tight mb-8">
              A Simple Place to Begin
            </DialogTitle>
            
            {/* Verbatim copy */}
            <div className="space-y-4 mb-12 text-[#E6DBC7]/80 font-light text-base md:text-lg leading-relaxed">
              <p>You don't need to do everything here.</p>
              <p>
                This space is designed to help you arrive gently and find your footing — without pressure or expectation.
              </p>
              <p>
                If all you do in your first two weeks is try these few practices and come to the Weekly Reset, that's more than enough.
              </p>
            </div>

            {/* Three session items */}
            <div className="space-y-4 mb-12">
              {/* Item 1: Short breath practice */}
              <SessionCard
                title={sessions?.breathPractice?.title || "Short Breath Practice"}
                subtitle="A brief breathwork session to settle your system"
                duration={sessions?.breathPractice?.duration || 10}
                imageUrl={sessions?.breathPractice?.image_url}
                onClick={() => sessions?.breathPractice?.id && handleSessionClick(sessions.breathPractice.id)}
              />
              
              {/* Item 2: Gentle somatic practice */}
              <SessionCard
                title={sessions?.somaticPractice?.title || "Gentle Somatic Practice"}
                subtitle="Simple, slow, grounding movements"
                duration={sessions?.somaticPractice?.duration || 12}
                imageUrl={sessions?.somaticPractice?.image_url}
                onClick={() => sessions?.somaticPractice?.id && handleSessionClick(sessions.somaticPractice.id)}
              />
              
              {/* Item 3: Weekly Reset */}
              <div
                onClick={onWeeklyResetClick}
                className="flex items-center gap-4 p-4 bg-transparent hover:bg-[#E6DBC7]/5 transition-all border border-[#E6DBC7]/10 hover:border-[#E6DBC7]/20 rounded-lg cursor-pointer group"
              >
                <div className="relative w-20 h-20 bg-gradient-to-br from-[#EC9037]/30 to-[#E6DBC7]/10 flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center">
                  <Play className="w-8 h-8 text-[#E6DBC7]/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg md:text-xl font-editorial text-[#E6DBC7] mb-1">
                    Weekly Reset
                  </h4>
                  <p className="text-sm md:text-base text-[#E6DBC7]/60 font-light">
                    {weeklyResetStatus === "live" 
                      ? "Live now — join the session"
                      : weeklyResetStatus === "replay"
                      ? "Watch the latest replay"
                      : "Every Tuesday at 7pm GMT"
                    }
                  </p>
                </div>
                <div className="pr-2">
                  <span className="text-sm text-[#EC9037] font-light">
                    {weeklyResetStatus === "live" ? "Join Live" : weeklyResetStatus === "replay" ? "Watch Replay" : "View"}
                  </span>
                </div>
              </div>
            </div>

            {/* Single CTA */}
            <Button
              onClick={onClose}
              className="bg-transparent text-[#E6DBC7] border border-[#E6DBC7]/60 hover:bg-white/5 hover:border-[#E6DBC7] transition-all font-light px-12 py-3 rounded-full text-base w-full md:w-auto"
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
  onClick
}: {
  title: string;
  subtitle: string;
  duration: number;
  imageUrl?: string;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className="flex items-center gap-4 p-4 bg-transparent hover:bg-[#E6DBC7]/5 transition-all border border-[#E6DBC7]/10 hover:border-[#E6DBC7]/20 rounded-lg cursor-pointer group"
  >
    <div 
      className="relative w-20 h-20 bg-[#2A2A2A] flex-shrink-0 rounded-lg overflow-hidden"
      style={imageUrl ? { backgroundImage: `url('${getOptimizedImageUrl(imageUrl, IMAGE_PRESETS.thumbnail)}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      {!imageUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Play className="w-6 h-6 text-[#E6DBC7]/40" />
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-lg md:text-xl font-editorial text-[#E6DBC7] mb-1">
        {title}
      </h4>
      <p className="text-sm md:text-base text-[#E6DBC7]/60 font-light">
        {subtitle}
      </p>
    </div>
    <div className="pr-2">
      <span className="text-sm text-[#E6DBC7]/50 font-light">{duration} min</span>
    </div>
  </div>
);

export default StartHereOnboardingModal;

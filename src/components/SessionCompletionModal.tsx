import { Award, Share2, Target, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { PostSessionFeedbackModal } from "@/components/PostSessionFeedbackModal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { copyLink } from "@/lib/copyLink";

interface SessionCompletionModalProps {
  open: boolean;
  onClose: () => void;
  userName: string;
  sessionId?: string;
  sessionTitle?: string;
  userId?: string;
  userStats?: {
    totalSessions?: number;
    totalMinutes?: number;
    currentStreak?: number;
  };
}

export const SessionCompletionModal = ({
  open,
  onClose,
  userName,
  sessionId,
  sessionTitle,
  userId,
  userStats,
}: SessionCompletionModalProps) => {
  const navigate = useNavigate();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const handleDone = () => {
    // Show feedback modal if we have session details
    if (sessionId && sessionTitle && userId) {
      onClose();
      setShowFeedbackModal(true);
    } else {
      onClose();
      navigate("/online");
    }
  };

  const handleCloseFeedback = () => {
    setShowFeedbackModal(false);
    navigate("/online");
  };

  const handleShare = () => {
    const shareText = `I just completed a breathwork session! 🧘‍♀️\n\n${userStats?.totalSessions || 0} sessions completed\n${userStats?.totalMinutes || 0} minutes practiced`;
    copyLink(shareText, "Copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-h-[95vh] w-[95%] max-w-md overflow-hidden overflow-y-auto rounded-lg border border-white/30 bg-black/75 p-0 backdrop-blur-xl md:rounded-none"
        hideClose
      >
        {/* Ambient gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-white/[0.02]" />
        <div className="absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative space-y-8 p-8 md:space-y-10 md:p-12">
          {/* Celebration Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 scale-150 rounded-full bg-white/5 blur-3xl" />
              <div className="relative rounded-full border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-2xl backdrop-blur-xl md:p-8">
                <Award className="h-10 w-10 text-white md:h-12 md:w-12" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-3 text-center">
            <h2 className="font-['PP_Editorial_Old'] text-3xl text-white md:text-4xl">
              Nice one, {userName}
            </h2>
          </div>

          {/* Stats Grid */}
          {userStats && (
            <div className="grid grid-cols-3 gap-3 py-4 md:gap-4 md:py-6">
              {userStats.totalSessions !== undefined && (
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-4 text-center shadow-xl backdrop-blur-sm md:p-5">
                  <Zap
                    className="mx-auto mb-2 h-5 w-5 text-white/90 md:mb-3 md:h-6 md:w-6"
                    strokeWidth={1.5}
                  />
                  <div className="mb-1 font-['PP_Editorial_Old'] text-2xl text-white md:text-3xl">
                    {userStats.totalSessions}
                  </div>
                  <div className="text-[10px] font-light uppercase tracking-wider text-white/50 md:text-xs">
                    Sessions
                  </div>
                </div>
              )}

              {userStats.totalMinutes !== undefined && (
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-4 text-center shadow-xl backdrop-blur-sm md:p-5">
                  <Target
                    className="mx-auto mb-2 h-5 w-5 text-white/90 md:mb-3 md:h-6 md:w-6"
                    strokeWidth={1.5}
                  />
                  <div className="mb-1 font-['PP_Editorial_Old'] text-2xl text-white md:text-3xl">
                    {userStats.totalMinutes}
                  </div>
                  <div className="text-[10px] font-light uppercase tracking-wider text-white/50 md:text-xs">
                    Minutes
                  </div>
                </div>
              )}

              {userStats.currentStreak !== undefined && (
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-4 text-center shadow-xl backdrop-blur-sm md:p-5">
                  <Award
                    className="mx-auto mb-2 h-5 w-5 text-white/90 md:mb-3 md:h-6 md:w-6"
                    strokeWidth={1.5}
                  />
                  <div className="mb-1 font-['PP_Editorial_Old'] text-2xl text-white md:text-3xl">
                    {userStats.currentStreak}
                  </div>
                  <div className="text-[10px] font-light uppercase tracking-wider text-white/50 md:text-xs">
                    Day Streak
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4 sm:flex-row md:pt-6">
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex-1 rounded-full border-white/20 py-5 text-sm font-light text-white shadow-lg transition-all hover:border-white/60 hover:bg-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] md:py-6 md:text-base"
            >
              <Share2 className="h-4 w-4" strokeWidth={1.5} />
              Share
            </Button>
            <Button
              onClick={handleDone}
              variant="outline"
              className="flex-1 rounded-full border-white/20 py-5 text-sm font-light text-white shadow-lg transition-all hover:border-white/60 hover:bg-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] md:py-6 md:text-base"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Post-session feedback modal */}
      {sessionId && sessionTitle && userId && (
        <PostSessionFeedbackModal
          open={showFeedbackModal}
          onClose={handleCloseFeedback}
          sessionId={sessionId}
          sessionTitle={sessionTitle}
          userId={userId}
        />
      )}
    </Dialog>
  );
};

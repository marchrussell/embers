import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { PostSessionFeedbackModal } from "@/components/PostSessionFeedbackModal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useShareSession } from "@/hooks/useShareSession";

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
  const { handleShare: shareSession } = useShareSession();

  const handleDone = () => {
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
    shareSession(sessionId ?? null, true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent
          className="content-start border border-white/20 bg-black/30 backdrop-blur-xl"
          hideClose
        >
          <DialogHeader>
            <DialogTitle className="mb-10 text-center font-['PP_Editorial_Old'] text-2xl text-white md:text-3xl">
              Nice one, {userName}
            </DialogTitle>
          </DialogHeader>

          {userStats && (
            <div className="grid grid-cols-3 gap-3 py-2">
              {userStats.totalSessions !== undefined && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-center">
                  <div className="font-['PP_Editorial_Old'] text-2xl text-white">
                    {userStats.totalSessions}
                  </div>
                  <div className="text-[10px] font-light uppercase tracking-wider text-white/50">
                    Sessions
                  </div>
                </div>
              )}

              {userStats.totalMinutes !== undefined && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-center">
                  <div className="font-['PP_Editorial_Old'] text-2xl text-white">
                    {userStats.totalMinutes}
                  </div>
                  <div className="text-[10px] font-light uppercase tracking-wider text-white/50">
                    Minutes
                  </div>
                </div>
              )}

              {userStats.currentStreak !== undefined && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-center">
                  <div className="font-['PP_Editorial_Old'] text-2xl text-white">
                    {userStats.currentStreak}
                  </div>
                  <div className="text-[10px] font-light uppercase tracking-wider text-white/50">
                    Day Streak
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex-1 rounded-full border-white/20 py-5 text-sm font-light text-white transition-all hover:border-white/60 hover:bg-white/20"
            >
              Share
            </Button>
            <Button
              onClick={handleDone}
              variant="outline"
              className="flex-1 rounded-full border-white/20 py-5 text-sm font-light text-white transition-all hover:border-white/60 hover:bg-white/20"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {sessionId && sessionTitle && userId && (
        <PostSessionFeedbackModal
          open={showFeedbackModal}
          onClose={handleCloseFeedback}
          sessionId={sessionId}
          sessionTitle={sessionTitle}
          userId={userId}
        />
      )}
    </>
  );
};

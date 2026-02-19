import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, Target, Zap, ArrowRight, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { PostSessionFeedbackModal } from "@/components/PostSessionFeedbackModal";

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
  userStats 
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
      navigate('/online');
    }
  };

  const handleCloseFeedback = () => {
    setShowFeedbackModal(false);
    navigate('/online');
  };
  
  const handleShare = async () => {
    const shareText = `I just completed a breathwork session! 🧘‍♀️\n\n${userStats?.totalSessions || 0} sessions completed\n${userStats?.totalMinutes || 0} minutes practiced`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Breathwork Journey',
          text: shareText,
        });
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          await navigator.clipboard.writeText(shareText);
          toast.success("Copied to clipboard");
        }
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success("Copied to clipboard");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="w-[95%] max-w-md max-h-[95vh] overflow-y-auto backdrop-blur-xl bg-black/75 border border-white/30 p-0 overflow-hidden rounded-lg md:rounded-none"
        hideClose
      >
        {/* Ambient gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-white/[0.02] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative p-8 md:p-12 space-y-8 md:space-y-10">
          {/* Celebration Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-white/5 rounded-full blur-3xl scale-150" />
              <div className="relative p-6 md:p-8 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-xl shadow-2xl">
                <Award className="w-10 h-10 md:w-12 md:h-12 text-white" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-3">
            <h2 className="font-['PP_Editorial_Old'] text-3xl md:text-4xl text-white">
              Nice one, {userName}
            </h2>
          </div>

          {/* Stats Grid */}
          {userStats && (
            <div className="grid grid-cols-3 gap-3 md:gap-4 py-4 md:py-6">
              {userStats.totalSessions !== undefined && (
                <div className="text-center p-4 md:p-5 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 backdrop-blur-sm shadow-xl">
                  <Zap className="w-5 h-5 md:w-6 md:h-6 text-white/90 mx-auto mb-2 md:mb-3" strokeWidth={1.5} />
                  <div className="text-2xl md:text-3xl font-['PP_Editorial_Old'] text-white mb-1">
                    {userStats.totalSessions}
                  </div>
                  <div className="text-[10px] md:text-xs text-white/50 font-light uppercase tracking-wider">
                    Sessions
                  </div>
                </div>
              )}
              
              {userStats.totalMinutes !== undefined && (
                <div className="text-center p-4 md:p-5 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 backdrop-blur-sm shadow-xl">
                  <Target className="w-5 h-5 md:w-6 md:h-6 text-white/90 mx-auto mb-2 md:mb-3" strokeWidth={1.5} />
                  <div className="text-2xl md:text-3xl font-['PP_Editorial_Old'] text-white mb-1">
                    {userStats.totalMinutes}
                  </div>
                  <div className="text-[10px] md:text-xs text-white/50 font-light uppercase tracking-wider">
                    Minutes
                  </div>
                </div>
              )}
              
              {userStats.currentStreak !== undefined && (
                <div className="text-center p-4 md:p-5 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 backdrop-blur-sm shadow-xl">
                  <Award className="w-5 h-5 md:w-6 md:h-6 text-white/90 mx-auto mb-2 md:mb-3" strokeWidth={1.5} />
                  <div className="text-2xl md:text-3xl font-['PP_Editorial_Old'] text-white mb-1">
                    {userStats.currentStreak}
                  </div>
                  <div className="text-[10px] md:text-xs text-white/50 font-light uppercase tracking-wider">
                    Day Streak
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 md:pt-6">
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/20 hover:border-white/60 hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] rounded-full font-light text-sm md:text-base py-5 md:py-6 transition-all shadow-lg"
            >
              <Share2 className="w-4 h-4" strokeWidth={1.5} />
              Share
            </Button>
            <Button
              onClick={handleDone}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/20 hover:border-white/60 hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] rounded-full font-light text-sm md:text-base py-5 md:py-6 transition-all shadow-lg"
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

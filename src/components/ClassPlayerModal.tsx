import { useQuery } from "@tanstack/react-query";
import { Heart, Pause, Play, Share, SkipBack, SkipForward, X } from "lucide-react";

import { OptimizedImage } from "@/components/OptimizedImage";
import { SessionCompletionModal } from "@/components/SessionCompletionModal";
import { ModalContentSkeleton } from "@/components/skeletons/ModalContentSkeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/contexts/AuthContext";
import { useClassPlayer } from "@/hooks/useClassPlayer";
import { useFavourites } from "@/hooks/useFavourites";
import { useShareSession } from "@/hooks/useShareSession";
import { supabase } from "@/integrations/supabase/client";
import { getOptimizedVideoUrl } from "@/lib/mediaOptimization";

interface ClassPlayerModalProps {
  classId: string | null;
  open: boolean;
  onClose: () => void;
  skipSafetyModal?: boolean;
}

export const ClassPlayerModal = ({
  classId,
  open,
  onClose,
  skipSafetyModal = false,
}: ClassPlayerModalProps) => {
  const { user } = useAuth();
  const { isFavourite, toggleFavourite } = useFavourites();
  const { handleShare } = useShareSession();

  const {
    classData,
    classCategories,
    loading,
    isVideoClass,
    isPlaying,
    hasStarted,
    currentTime,
    duration,
    mediaError,
    showControls,
    showSafetyDisclosure,
    showCompletionModal,
    setShowCompletionModal,
    videoRef,
    handleStart,
    handlePlayPause,
    handleSliderChange,
    handleClose,
    resetControlsTimer,
    hideControls,
    formatTime,
  } = useClassPlayer({ classId, open, skipSafetyModal, onClose });

  const { data: userProfile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: userStats } = useQuery({
    queryKey: ["profile-stats", user?.id],
    queryFn: async () => {
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user!.id)
        .eq("completed", true);

      const totalSessions = progressData?.length || 0;
      const sessionIds = progressData?.map((p) => p.class_id) || [];

      if (sessionIds.length > 0) {
        const { data: classesData } = await supabase
          .from("classes")
          .select("duration_minutes")
          .in("id", sessionIds);
        const totalMinutes =
          classesData?.reduce((sum, c) => sum + (c.duration_minutes || 0), 0) || 0;
        return { totalSessions, totalMinutes, currentStreak: 1 };
      }
      return { totalSessions: 0, totalMinutes: 0, currentStreak: 0 };
    },
    enabled: !!user?.id,
  });

  const optimizedVideoUrl = classData?.video_url ? getOptimizedVideoUrl(classData.video_url) : null;

  const handleSkipBack = () => handleSliderChange([Math.max(0, currentTime - 10)]);
  const handleSkipForward = () => handleSliderChange([Math.min(duration, currentTime + 10)]);

  const handleFavourite = () => {
    if (classId) {
      toggleFavourite(classId);
    }
  };

  if (!open) return null;

  const controlsClass = isVideoClass
    ? `transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`
    : "";
  const playBtnClass = isVideoClass
    ? `transition-opacity duration-300 ${showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"}`
    : "";

  return (
    <>
      {/* Safety Disclosure Dialog */}
      <Dialog
        open={showSafetyDisclosure && open}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleClose();
        }}
      >
        <DialogContent className="max-w-2xl rounded-xl border border-white/30 bg-black/75 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="font-editorial text-4xl text-[#E6DBC7]">
              Breathwork Safety
            </DialogTitle>
            <DialogDescription className="text-base font-light text-[#E6DBC7]/70 md:text-lg">
              Please read this important safety information before starting your breathwork
              practice.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-base font-light leading-relaxed text-[#E6DBC7]/90 md:text-lg">
              Never practice while in water, at heights or while operating a vehicle. Before doing
              breathwork, please consult a doctor if any of these apply to you. Remember, you are
              safe and in control of your own experience.
            </p>
            <Button
              onClick={handleStart}
              className="w-full rounded-full bg-[#E6DBC7] py-6 text-base font-light tracking-wide text-background hover:bg-[#E6DBC7]/90"
            >
              I Understand, Begin Class
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Player Modal */}
      <Dialog
        open={!showSafetyDisclosure && open && hasStarted}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleClose();
        }}
      >
        <DialogContent
          className="max-h-[calc(90dvh-3rem)] w-[98%] max-w-6xl overflow-hidden overscroll-contain scroll-smooth rounded-xl border border-white/30 bg-black/75 p-0 backdrop-blur-xl md:h-auto md:w-[95%]"
          hideClose
        >
          <DialogTitle className="sr-only">{classData?.title || "Audio Player"}</DialogTitle>
          {loading ? (
            <ModalContentSkeleton variant="player" />
          ) : (
            <>
              {/* Shared video background (video classes only) */}
              {isVideoClass && (
                <video
                  ref={videoRef}
                  src={optimizedVideoUrl ?? undefined}
                  className="absolute inset-0 z-0 h-full w-full object-cover"
                  playsInline
                  autoPlay
                />
              )}

              {/* Mobile Layout - Vertical with background image/video */}
              <div
                className="relative flex h-[95vh] flex-col md:hidden"
                onMouseMove={() => isVideoClass && resetControlsTimer()}
                onTouchStart={() => isVideoClass && resetControlsTimer()}
                onMouseLeave={() => isVideoClass && isPlaying && hideControls()}
              >
                {/* Background Image (audio only) */}
                {!isVideoClass && classData?.image_url && (
                  <>
                    <OptimizedImage
                      src={classData.image_url}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full object-cover object-center"
                      responsive
                      showSkeleton={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background/90" />
                  </>
                )}
                {isVideoClass && (
                  <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
                )}

                {/* Top bar with favorite/share on left, close on right */}
                <div
                  className={`relative z-10 flex items-start justify-between p-3 ${controlsClass}`}
                >
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavourite();
                      }}
                      className="rounded-lg p-3 transition-all hover:bg-[#E6DBC7]/10"
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          classId && isFavourite(classId)
                            ? "fill-[#E6DBC7] text-[#E6DBC7]"
                            : "text-[#E6DBC7]"
                        }`}
                        strokeWidth={1.5}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(classId, classData?.is_published);
                      }}
                      className="rounded-lg p-3 transition-all hover:bg-[#E6DBC7]/10"
                    >
                      <Share className="h-5 w-5 text-[#E6DBC7]" strokeWidth={1.5} />
                    </button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="rounded-lg p-3 text-[#E6DBC7] hover:bg-[#E6DBC7]/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Title and Info (audio only on mobile) */}
                {!isVideoClass && (
                  <div className="relative z-10 px-6 pt-2">
                    <h2 className="mb-2 font-editorial text-3xl leading-tight text-[#E6DBC7]">
                      {classData?.title}
                    </h2>
                    <p className="text-base font-light text-[#E6DBC7]/70">
                      {classData?.teacher_name || "March Russell"} •{" "}
                      {classData?.duration_minutes || 0} min
                    </p>
                    {classCategories.length > 0 && (
                      <p className="mt-2 text-sm font-light uppercase tracking-[0.15em] text-[#EC9037]">
                        {classCategories.map((c: { name: string }) => c.name).join(" · ")}
                      </p>
                    )}
                  </div>
                )}

                {/* Main Content - Skip + Play/Pause + Skip */}
                <div className="relative z-10 flex flex-1 items-center justify-center py-8">
                  {mediaError ? (
                    <p className="px-6 text-center text-sm font-light text-[#E6DBC7]/70">
                      {mediaError}
                    </p>
                  ) : (
                    <div className="flex items-center gap-8">
                      <button
                        onClick={handleSkipBack}
                        className="flex flex-col items-center gap-1 text-[#E6DBC7] transition-opacity hover:opacity-70"
                      >
                        <SkipBack className="h-8 w-8" strokeWidth={1.5} />
                        <span className="text-sm font-light">10</span>
                      </button>
                      <Button
                        onClick={handlePlayPause}
                        variant="outline"
                        size="lg"
                        className={`h-20 w-20 md:h-28 md:w-28 rounded-full border-2 border-[#E6DBC7] bg-[#E6DBC7]/5 p-0 text-[#E6DBC7] backdrop-blur-xl transition-colors duration-300 hover:bg-[#E6DBC7]/10 ${playBtnClass}`}
                      >
                        {isPlaying ? (
                          <Pause className="h-8 w-8" strokeWidth={1.5} fill="none" />
                        ) : (
                          <Play className="ml-1 h-8 w-8" strokeWidth={1.5} fill="none" />
                        )}
                      </Button>
                      <button
                        onClick={handleSkipForward}
                        className="flex flex-col items-center gap-1 text-[#E6DBC7] transition-opacity hover:opacity-70"
                      >
                        <SkipForward className="h-8 w-8" strokeWidth={1.5} />
                        <span className="text-sm font-light">10</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Progress Bar - Bottom (always visible) */}
                {!mediaError && (
                  <div className="relative z-10 px-4 pb-6">
                    <div className="space-y-2">
                      <Slider
                        value={[currentTime]}
                        max={duration}
                        step={1}
                        onValueChange={handleSliderChange}
                        className="cursor-pointer touch-none"
                      />
                      <div className="flex justify-between text-xs font-light text-[#E6DBC7]/70">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop Layout - Horizontal rectangle */}
              <div
                className="hidden md:flex md:h-[600px] md:flex-col"
                onMouseMove={() => isVideoClass && resetControlsTimer()}
                onMouseLeave={() => isVideoClass && isPlaying && hideControls()}
              >
                {/* Two columns */}
                <div className="flex flex-1 overflow-hidden">
                  {/* Left side - Image (audio) or transparent over shared video */}
                  <div className="relative w-1/2 overflow-hidden">
                    {!isVideoClass && classData?.image_url && (
                      <img
                        src={classData.image_url}
                        alt={classData?.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                    {!isVideoClass && (
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-background/20" />
                    )}
                  </div>

                  {/* Right side - Controls and Info */}
                  <div
                    className={`relative flex w-1/2 flex-col p-8 lg:p-12 ${
                      isVideoClass ? "" : "bg-background/60 backdrop-blur-xl"
                    }`}
                  >
                    {/* Close button - top right */}
                    <div className={`absolute right-6 top-6 ${controlsClass}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClose}
                        className="rounded-lg text-[#E6DBC7] hover:bg-[#E6DBC7]/10"
                      >
                        <X className="h-6 w-6" />
                      </Button>
                    </div>

                    {/* Top section - Title and actions (audio only) */}
                    {!isVideoClass ? (
                      <div className="space-y-6">
                        <div>
                          <h2 className="pr-12 font-editorial text-4xl leading-tight text-[#E6DBC7] lg:text-5xl">
                            {classData?.title}
                          </h2>
                          <p className="mt-4 text-lg font-light text-[#E6DBC7]/70">
                            {classData?.teacher_name || "March Russell"} •{" "}
                            {classData?.duration_minutes || 0} min
                          </p>
                          {classCategories.length > 0 && (
                            <p className="text-base font-light uppercase tracking-[0.15em] text-[#EC9037]">
                              {classCategories.map((c: { name: string }) => c.name).join(" · ")}
                            </p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavourite();
                            }}
                            className="rounded-lg border border-[#E6DBC7]/20 p-2.5 transition-all hover:bg-[#E6DBC7]/10"
                          >
                            <Heart
                              className={`h-5 w-5 ${
                                classId && isFavourite(classId)
                                  ? "fill-[#E6DBC7] text-[#E6DBC7]"
                                  : "text-[#E6DBC7]"
                              }`}
                              strokeWidth={1.5}
                            />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(classId, classData?.is_published);
                            }}
                            className="rounded-lg border border-[#E6DBC7]/20 p-2.5 transition-all hover:bg-[#E6DBC7]/10"
                          >
                            <Share className="h-5 w-5 text-[#E6DBC7]" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Video: action buttons only, no title/info */
                      <div className={`flex items-center justify-end gap-3 pr-14 ${controlsClass}`}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFavourite();
                          }}
                          className="rounded-lg border border-[#E6DBC7]/20 p-2.5 transition-all hover:bg-[#E6DBC7]/10"
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              classId && isFavourite(classId)
                                ? "fill-[#E6DBC7] text-[#E6DBC7]"
                                : "text-[#E6DBC7]"
                            }`}
                            strokeWidth={1.5}
                          />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(classId, classData?.is_published);
                          }}
                          className="rounded-lg border border-[#E6DBC7]/20 p-2.5 transition-all hover:bg-[#E6DBC7]/10"
                        >
                          <Share className="h-5 w-5 text-[#E6DBC7]" strokeWidth={1.5} />
                        </button>
                      </div>
                    )}

                    {/* Middle section - Skip + Play/Pause + Skip */}
                    <div className="flex flex-1 items-center justify-center">
                      {mediaError ? (
                        <p className="text-center text-sm font-light text-[#E6DBC7]/70">
                          {mediaError}
                        </p>
                      ) : (
                        <div className="flex items-center gap-10">
                          <button
                            onClick={handleSkipBack}
                            className="flex flex-col items-center gap-1 text-[#E6DBC7] transition-opacity hover:opacity-70"
                          >
                            <SkipBack className="h-8 w-8" strokeWidth={1.5} />
                            <span className="text-sm font-light">10</span>
                          </button>
                          <Button
                            onClick={handlePlayPause}
                            variant="outline"
                            size="lg"
                            className={`h-32 w-32 rounded-full border-2 border-[#E6DBC7] bg-[#E6DBC7]/5 p-0 text-[#E6DBC7] backdrop-blur-xl transition-colors duration-300 hover:bg-[#E6DBC7]/10 lg:h-40 lg:w-40 ${playBtnClass}`}
                          >
                            {isPlaying ? (
                              <Pause
                                className="h-12 w-12 lg:h-16 lg:w-16"
                                strokeWidth={1.5}
                                fill="none"
                              />
                            ) : (
                              <Play
                                className="ml-1 h-12 w-12 lg:h-16 lg:w-16"
                                strokeWidth={1.5}
                                fill="none"
                              />
                            )}
                          </Button>
                          <button
                            onClick={handleSkipForward}
                            className="flex flex-col items-center gap-1 text-[#E6DBC7] transition-opacity hover:opacity-70"
                          >
                            <SkipForward className="h-8 w-8" strokeWidth={1.5} />
                            <span className="text-sm font-light">10</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Full-width progress bar */}
                {!mediaError && (
                  <div className={`px-12 pb-8 pt-4 ${controlsClass}`}>
                    <div className="space-y-3">
                      <Slider
                        value={[currentTime]}
                        max={duration}
                        step={1}
                        onValueChange={handleSliderChange}
                        className="cursor-pointer"
                      />
                      <div className="flex justify-between text-sm text-[#E6DBC7]/60">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Session Completion Celebration */}
      <SessionCompletionModal
        open={showCompletionModal}
        onClose={() => {
          setShowCompletionModal(false);
          handleClose();
        }}
        userName={
          userProfile?.full_name?.split(" ")[0] ||
          userProfile?.first_name ||
          user?.user_metadata?.full_name?.split(" ")[0] ||
          "there"
        }
        sessionId={classId || undefined}
        sessionTitle={classData?.title}
        userId={user?.id}
        userStats={userStats ?? {}}
      />
    </>
  );
};

import { useQuery } from "@tanstack/react-query";
import { Heart, Pause, Play, Share, X } from "lucide-react";
import { useEffect, useState } from "react";

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
import { useFavourites } from "@/hooks/useFavourites";
import { useMarkSessionComplete } from "@/hooks/useMarkSessionComplete";
import { useMediaPlayer } from "@/hooks/useMediaPlayer";
import { useShareSession } from "@/hooks/useShareSession";
import { supabase } from "@/integrations/supabase/client";
import { analytics } from "@/lib/posthog";
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
  const markSessionCompleteMutation = useMarkSessionComplete();
  const [hasStarted, setHasStarted] = useState(false);
  const [showSafetyDisclosure, setShowSafetyDisclosure] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>({});

  const { data: classQueryData, isLoading: loading } = useQuery({
    queryKey: ["session-detail", classId],
    queryFn: async () => {
      const { data } = await supabase.from("classes").select("*").eq("id", classId!).single();
      if (!data) return null;

      const { data: junctionData } = await supabase
        .from("class_categories")
        .select("categories(*)")
        .eq("class_id", classId!);
      const cats = (junctionData || []).map((row: any) => row.categories).filter(Boolean);

      let sessionCategories = cats;
      if (cats.length === 0 && data.category_id) {
        const { data: fallbackCat } = await supabase
          .from("categories")
          .select("*")
          .eq("id", data.category_id)
          .single();
        if (fallbackCat) sessionCategories = [fallbackCat];
      }

      return { session: data, sessionCategories };
    },
    enabled: !!classId && open,
  });

  const classData = classQueryData?.session ?? null;
  const classCategories = classQueryData?.sessionCategories ?? [];
  const { handleShare } = useShareSession();

  const optimizedVideoUrl = classData?.video_url ? getOptimizedVideoUrl(classData.video_url) : null;

  const { videoRef, currentTime, duration, isPlaying, setIsPlaying, seek, isVideo } =
    useMediaPlayer({
      audioUrl: open && !optimizedVideoUrl ? classData?.audio_url : null,
      videoUrl: open ? optimizedVideoUrl : null,
      onComplete: () => markSessionComplete(),
    });

  // Reset state when the modal opens for a new session
  useEffect(() => {
    if (classId && open) {
      setHasStarted(false);
      setIsPlaying(false);
    }
  }, [classId, open]);

  // Initialise safety disclosure and auto-start when class data loads
  useEffect(() => {
    if (!classData || !open) return;

    const shouldShowSafety = !skipSafetyModal && (classData.show_safety_reminder || false);
    setShowSafetyDisclosure(shouldShowSafety);
    if (!shouldShowSafety) {
      setHasStarted(true);
      setIsPlaying(true);
    }

    if (user?.id) fetchUserStatsAndProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classData?.id, open]);

  // Analytics: fire once when the session starts
  useEffect(() => {
    if (hasStarted && classData && classId) {
      analytics.sessionStarted(classId, classData.title);
    }
  }, [hasStarted]);

  const handleStart = async () => {
    if (user?.id && showSafetyDisclosure) {
      await supabase
        .from("profiles")
        .update({
          has_accepted_safety_disclosure: true,
          has_completed_onboarding: true,
        })
        .eq("id", user.id);
    }

    setShowSafetyDisclosure(false);
    setHasStarted(true);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (value: number[]) => {
    seek(value[0]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClose = () => {
    setIsPlaying(false);
    seek(0);
    setHasStarted(false);
    onClose();
  };

  const fetchUserStatsAndProfile = async () => {
    if (!user?.id) return;

    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileData) {
        setUserProfile(profileData);
      }

      const { data: progressData } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
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

        setUserStats({
          totalSessions,
          totalMinutes,
          currentStreak: 1,
        });
      } else {
        setUserStats({ totalSessions: 0, totalMinutes: 0, currentStreak: 0 });
      }
    } catch (error) {
      console.error("📊 Error fetching user stats:", error);
    }
  };

  const markSessionComplete = () => {
    if (!classId) return;
    markSessionCompleteMutation.mutate(classId, {
      onSuccess: async () => {
        analytics.sessionCompleted(
          classId,
          classData?.title ?? "",
          classData?.duration_minutes ?? 0
        );
        await fetchUserStatsAndProfile();
        setShowCompletionModal(true);
      },
    });
  };

  const handleFavourite = () => {
    if (classId) {
      toggleFavourite(classId);
    }
  };

  if (!open) return null;

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
              {isVideo && (
                <video
                  ref={videoRef}
                  src={optimizedVideoUrl ?? undefined}
                  className="absolute inset-0 z-0 h-full w-full object-cover"
                  playsInline
                />
              )}

              {/* Mobile Layout - Vertical with background image/video */}
              <div className="relative flex h-[95vh] flex-col md:hidden">
                {/* Background Image (audio only) */}
                {!isVideo && classData?.image_url && (
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
                {isVideo && (
                  <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-background/60 via-transparent to-background/80" />
                )}

                {/* Top bar with favorite/share on left, close on right */}
                <div className="relative z-10 flex items-start justify-between p-3">
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

                {/* Title and Info */}
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
                      {classCategories.map((c: any) => c.name).join(" · ")}
                    </p>
                  )}
                </div>

                {/* Main Content - Play/Pause Button in Center */}
                <div className="relative z-10 flex flex-1 items-center justify-center py-8">
                  <Button
                    onClick={handlePlayPause}
                    variant="outline"
                    size="lg"
                    className="h-28 w-28 rounded-full border-2 border-[#E6DBC7] bg-[#E6DBC7]/5 p-0 text-[#E6DBC7] backdrop-blur-xl transition-colors duration-300 hover:bg-[#E6DBC7]/10"
                  >
                    {isPlaying ? (
                      <Pause className="h-10 w-10" strokeWidth={1.5} fill="none" />
                    ) : (
                      <Play className="ml-1 h-10 w-10" strokeWidth={1.5} fill="none" />
                    )}
                  </Button>
                </div>

                {/* Progress Bar - Bottom */}
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
              </div>

              {/* Desktop Layout - Horizontal rectangle */}
              <div className="hidden md:grid md:h-[600px] md:grid-cols-2 md:gap-0">
                {/* Left side - Image (audio) or transparent over shared video */}
                <div className="relative overflow-hidden">
                  {!isVideo && classData?.image_url && (
                    <img
                      src={classData.image_url}
                      alt={classData?.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-background/20" />
                </div>

                {/* Right side - Controls and Info */}
                <div className="relative flex flex-col bg-background/60 p-8 backdrop-blur-xl lg:p-12">
                  {/* Close button - top right */}
                  <div className="absolute right-6 top-6">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClose}
                      className="rounded-lg text-[#E6DBC7] hover:bg-[#E6DBC7]/10"
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>

                  {/* Top section - Title and actions */}
                  <div className="space-y-4">
                    <div>
                      <h2 className="mb-3 pr-12 font-editorial text-4xl leading-tight text-[#E6DBC7] lg:text-5xl">
                        {classData?.title}
                      </h2>
                      <p className="text-lg font-light text-[#E6DBC7]/70">
                        {classData?.teacher_name || "March Russell"} •{" "}
                        {classData?.duration_minutes || 0} min
                      </p>
                      {classCategories.length > 0 && (
                        <p className="mt-3 text-base font-light uppercase tracking-[0.15em] text-[#EC9037]">
                          {classCategories.map((c: any) => c.name).join(" · ")}
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3">
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

                  {/* Middle section - Play button */}
                  <div className="flex flex-1 items-center justify-center py-12">
                    <Button
                      onClick={handlePlayPause}
                      variant="outline"
                      size="lg"
                      className="h-32 w-32 rounded-full border-2 border-[#E6DBC7] bg-[#E6DBC7]/5 p-0 text-[#E6DBC7] backdrop-blur-xl transition-colors duration-300 hover:bg-[#E6DBC7]/10 lg:h-40 lg:w-40"
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
                  </div>

                  {/* Bottom section - Progress bar */}
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
        userStats={userStats}
      />
    </>
  );
};

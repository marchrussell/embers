import { useQuery } from "@tanstack/react-query";
import { Heart, Pause, Play, Share2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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
import { supabase } from "@/integrations/supabase/client";
import { analytics } from "@/lib/posthog";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSafetyDisclosure, setShowSafetyDisclosure] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasShownCompletion = useRef(false);

  const { data: classQueryData, isLoading: loading } = useQuery({
    queryKey: ["class-player", classId],
    queryFn: async () => {
      const { data } = await supabase.from("classes").select("*").eq("id", classId!).single();
      if (!data) return null;

      const { data: junctionData } = await supabase
        .from("class_categories")
        .select("categories(*)")
        .eq("class_id", classId!);
      const cats = (junctionData || []).map((row: any) => row.categories).filter(Boolean);

      let classCategories = cats;
      if (cats.length === 0 && data.category_id) {
        const { data: fallbackCat } = await supabase
          .from("categories")
          .select("*")
          .eq("id", data.category_id)
          .single();
        if (fallbackCat) classCategories = [fallbackCat];
      }

      return { classData: data, classCategories };
    },
    enabled: !!classId && open,
  });

  const classData = classQueryData?.classData ?? null;
  const classCategories = classQueryData?.classCategories ?? [];

  // Reset playback state when modal opens
  useEffect(() => {
    if (classId && open) {
      setDuration(0);
      setHasStarted(false);
      setIsPlaying(false);
      setCurrentTime(0);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
      }
      hasShownCompletion.current = false;
    };
  }, [classId, open]);

  // Initialize safety disclosure and audio when class data loads
  useEffect(() => {
    console.log('[ClassPlayerModal] init effect:', { classDataId: classData?.id, open, skipSafetyModal, show_safety_reminder: classData?.show_safety_reminder });
    if (!classData || !open) return;

    const shouldShowSafety = !skipSafetyModal && (classData.show_safety_reminder || false);
    setShowSafetyDisclosure(shouldShowSafety);

    console.log('[ClassPlayerModal] setting hasStarted=true, shouldShowSafety:', shouldShowSafety);
    if (!shouldShowSafety) {
      setHasStarted(true);
      setIsPlaying(true);
    }

    if (user?.id) fetchUserStatsAndProfile();

    if (classData.audio_url && !audioRef.current) {
      const audio = new Audio();
      audio.preload = "metadata";
      audio.src = classData.audio_url;

      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration);
        if (!classData.show_safety_reminder || skipSafetyModal) {
          audio.play().catch(() => {});
        }
      });
      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime);
        if (
          !hasShownCompletion.current &&
          audio.duration - audio.currentTime <= 5 &&
          audio.currentTime > 0
        ) {
          hasShownCompletion.current = true;
          markSessionComplete();
        }
      });
      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        if (!hasShownCompletion.current) {
          hasShownCompletion.current = true;
          markSessionComplete();
        }
      });
      audioRef.current = audio;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classData?.id, open]);

  const isVideoClass = !!classData?.video_url;

  const getMedia = (): HTMLAudioElement | HTMLVideoElement | null =>
    isVideoClass ? videoRef.current : audioRef.current;

  // Attach video events once the video element is in the DOM and classData is set
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !classData?.video_url) return;

    video.preload = "metadata";

    const onLoadedMetadata = () => {
      setDuration(video.duration);
      if (!classData.show_safety_reminder || skipSafetyModal) {
        video.play().catch(() => {});
      }
    };
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (
        !hasShownCompletion.current &&
        video.duration - video.currentTime <= 5 &&
        video.currentTime > 0
      ) {
        hasShownCompletion.current = true;
        markSessionComplete();
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      if (!hasShownCompletion.current) {
        hasShownCompletion.current = true;
        markSessionComplete();
      }
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classData?.video_url]);

  useEffect(() => {
    const media = isVideoClass ? videoRef.current : audioRef.current;
    if (media) {
      if (isPlaying && hasStarted) {
        media.play().catch(() => {});
      } else {
        media.pause();
      }
    }
  }, [isPlaying, hasStarted, isVideoClass]);

  useEffect(() => {
    if (hasStarted && classData && classId) {
      analytics.sessionStarted(classId, classData.title);
    }
  }, [hasStarted]);

  const handleStart = async () => {
    // Update user's profile to mark they've accepted safety disclosure AND completed onboarding
    // Always set both flags together to maintain consistency
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

    // Start playing immediately for first-time users
    const media = getMedia();
    if (media) {
      media.play().catch(() => {});
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (value: number[]) => {
    const media = getMedia();
    if (media) {
      media.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClose = () => {
    const media = getMedia();
    if (media) {
      media.pause();
      media.currentTime = 0;
    }
    setIsPlaying(false);
    setHasStarted(false);
    setCurrentTime(0);
    onClose();
  };

  const fetchUserStatsAndProfile = async () => {
    if (!user?.id) return;

    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileData) {
        setUserProfile(profileData);
      }

      // Fetch user stats from progress table
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("completed", true);

      const totalSessions = progressData?.length || 0;

      // Calculate total minutes from completed sessions
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
          currentStreak: 1, // Could calculate actual streak based on dates
        });
      } else {
        setUserStats({ totalSessions: 0, totalMinutes: 0, currentStreak: 0 });
      }
    } catch (error) {
      console.error("📊 Error fetching user stats:", error);
    }
  };

  const markSessionComplete = async () => {
    if (!user?.id || !classId) return;

    try {
      // Mark session as completed in user_progress
      const { data: existingProgress } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("class_id", classId)
        .maybeSingle();

      if (existingProgress) {
        const { error } = await supabase
          .from("user_progress")
          .update({
            completed: true,
            completed_at: new Date().toISOString(),
            last_position_seconds: 0,
          })
          .eq("id", existingProgress.id);

        if (error) {
          console.error("Error updating progress:", error);
        }
      } else {
        const { error } = await supabase.from("user_progress").insert({
          user_id: user.id,
          class_id: classId,
          completed: true,
          completed_at: new Date().toISOString(),
          last_position_seconds: 0,
        });

        if (error) {
          console.error("Error inserting progress:", error);
        }
      }

      analytics.sessionCompleted(classId, classData?.title ?? "", classData?.duration_minutes ?? 0);

      // Refresh stats and show completion modal
      await fetchUserStatsAndProfile();
      setShowCompletionModal(true);
    } catch (error) {
      console.error("Error marking session complete:", error);
    }
  };

  const handleFavourite = () => {
    if (classId) {
      toggleFavourite(classId);
    }
  };

  const handleShare = async () => {
    if (!classData?.is_published) {
      toast.error("This session cannot be shared");
      return;
    }

    const shareUrl = `${window.location.origin}/shared-session/${classId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: classData?.title,
          text: `Check out this breathwork session: ${classData?.title}`,
          url: shareUrl,
        });
        toast.success("Shared successfully");
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          await navigator.clipboard.writeText(shareUrl);
          toast.success("Link copied to clipboard");
        }
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
    }
  };

  console.log('[ClassPlayerModal] render:', { open, hasStarted, showSafetyDisclosure, classId, classData: !!classData, loading });

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
          className="relative h-[95vh] w-[98%] max-w-6xl overflow-hidden rounded-xl border border-white/30 bg-black/75 p-0 backdrop-blur-xl md:h-auto md:w-[95%]"
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
                  src={classData?.video_url}
                  className="absolute inset-0 z-0 h-full w-full object-cover"
                  playsInline
                />
              )}

              {/* Mobile Layout - Vertical with background image/video */}
              <div className="relative flex h-[95vh] flex-col md:hidden">
                {/* Background Image (audio only) */}
                {!isVideoClass && classData?.image_url && (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${classData.image_url})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background/90" />
                  </div>
                )}
                {isVideoClass && (
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
                      className="rounded-lg p-2 transition-all hover:bg-[#E6DBC7]/10"
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
                        handleShare();
                      }}
                      className="rounded-lg p-2 transition-all hover:bg-[#E6DBC7]/10"
                    >
                      <Share2 className="h-5 w-5 text-[#E6DBC7]" strokeWidth={1.5} />
                    </button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="rounded-lg p-2 text-[#E6DBC7] hover:bg-[#E6DBC7]/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Title and Info */}
                <div className="relative z-10 px-4 pt-2">
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
                  {!isVideoClass && classData?.image_url && (
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
                          handleShare();
                        }}
                        className="rounded-lg border border-[#E6DBC7]/20 p-2.5 transition-all hover:bg-[#E6DBC7]/10"
                      >
                        <Share2 className="h-5 w-5 text-[#E6DBC7]" strokeWidth={1.5} />
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

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { OptimizedImage } from "@/components/OptimizedImage";
import { SafetyDisclosureModal } from "@/components/SafetyDisclosureModal";
import { ClassPlayerSkeleton } from "@/components/skeletons/ClassPlayerSkeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GlowButton } from "@/components/ui/glow-button";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getOptimizedVideoUrl, preloadVideoMetadata } from "@/lib/mediaOptimization";

const ClassPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasAcceptedSafetyDisclosure, refreshOnboardingStatus } = useAuth();
  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const { data: classData, isLoading: loading } = useQuery({
    queryKey: ["class", id],
    queryFn: async () => {
      const { data } = await supabase.from("classes").select("*").eq("id", id).single();
      return data;
    },
    enabled: !!id,
  });

  const isVideo = !!classData?.video_url;
  const optimizedVideoUrl = classData?.video_url ? getOptimizedVideoUrl(classData.video_url) : null;

  const getMedia = (): HTMLAudioElement | HTMLVideoElement | null =>
    isVideo ? videoRef.current : audioRef.current;

  // Preload video metadata before the user starts
  useEffect(() => {
    if (optimizedVideoUrl) preloadVideoMetadata(optimizedVideoUrl);
  }, [optimizedVideoUrl]);

  // Audio setup — runs when user starts an audio session
  useEffect(() => {
    if (!hasStarted || isVideo || !classData?.audio_url) return;

    const audio = new Audio();
    audio.preload = "metadata";
    audio.src = classData.audio_url;

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
      audio.play().catch(() => {});
    });
    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
    });

    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: audio setup on source change only; re-running on isVideo would re-create listeners unnecessarily
  }, [hasStarted, classData?.audio_url]);

  // Attach video events once the video element is in the DOM
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !classData?.video_url) return;

    video.preload = "metadata";

    const onLoadedMetadata = () => {
      setDuration(video.duration);
      video.play().catch(() => {});
    };
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onEnded = () => setIsPlaying(false);

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: video listener setup on source change only
  }, [classData?.video_url, hasStarted]);

  // Play/pause sync
  useEffect(() => {
    const media = getMedia();
    if (media) {
      if (isPlaying && hasStarted) {
        media.play().catch(() => {});
      } else {
        media.pause();
      }
    }
  }, [isPlaying, hasStarted, isVideo]);

  // Derive modal visibility
  const showGlobalSafetyModal = !hasAcceptedSafetyDisclosure;
  const sessionNeedsSafetyDisclosure = !!classData?.show_safety_reminder;

  const handleGlobalSafetyAccept = async () => {
    await refreshOnboardingStatus();
  };

  const handleStart = () => {
    setHasStarted(true);
    setIsPlaying(true);
    const media = getMedia();
    if (media) media.play().catch(() => {});
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRewind = () => {
    const media = getMedia();
    if (media) {
      media.currentTime = Math.max(0, media.currentTime - 10);
      setCurrentTime(media.currentTime);
    }
  };

  const handleForward = () => {
    const media = getMedia();
    if (media) {
      media.currentTime = Math.min(media.duration || 0, media.currentTime + 10);
      setCurrentTime(media.currentTime);
    }
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

  if (loading) {
    return <ClassPlayerSkeleton />;
  }

  return (
    <>
      {/* Global Safety Disclosure Modal */}
      {user && (
        <SafetyDisclosureModal
          isOpen={showGlobalSafetyModal}
          onAccept={handleGlobalSafetyAccept}
          userId={user.id}
        />
      )}

      {/* Session-specific Safety Reminder */}
      {sessionNeedsSafetyDisclosure && (
        <Dialog
          open={!hasStarted}
          onOpenChange={(open) => {
            if (!open) navigate(-1);
          }}
        >
          <DialogContent className="max-w-2xl rounded-xl border border-white/30 bg-black/30 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>Safety Reminder</DialogTitle>
              <DialogDescription>
                Please read this important safety information before starting this breathwork
                session.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {classData?.safety_note && (
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="whitespace-pre-wrap text-sm">{classData.safety_note}</p>
                </div>
              )}
              <GlowButton onClick={handleStart}>I Understand, Begin Class</GlowButton>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="relative h-dvh overflow-hidden">
        {/* Full-screen foreground image (crisp, not blurred) */}
        {classData?.image_url && (
          <OptimizedImage
            src={classData.image_url}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center"
            responsive
            showSkeleton={false}
            priority={true}
          />
        )}
        {/* Gradient overlay — heavier at bottom for controls legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

        <div className="relative z-10 flex h-full flex-col">
          {/* Header */}
          <div className="p-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-base text-white hover:bg-white/10 md:text-lg"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Button>
          </div>

          {/* Controls pinned to bottom */}
          <div className="mt-auto px-8 pb-10 md:px-16 md:pb-14">
            {!hasStarted && !sessionNeedsSafetyDisclosure ? (
              /* Pre-play info overlay */
              <div className="mx-auto max-w-2xl space-y-6">
                <div className="space-y-3">
                  <h1 className="font-editorial text-4xl text-white md:text-5xl">
                    {classData?.title}
                  </h1>
                  <p className="text-base leading-relaxed text-white/80">{classData?.description}</p>
                  <div className="flex gap-4 text-sm text-white/60">
                    <span>{classData?.duration_minutes || 3} min</span>
                    <span>{classData?.teacher_name || "March Russell"}</span>
                  </div>
                </div>
                <Button
                  onClick={handleStart}
                  size="lg"
                  className="bg-white px-8 py-6 text-lg text-black hover:bg-white/90"
                >
                  <Play className="mr-2 h-5 w-5" strokeWidth={1.5} fill="none" />
                  Begin Class
                </Button>
              </div>
            ) : (
              /* Active player overlay */
              <div className="mx-auto max-w-2xl space-y-6">
                {isVideo && (
                  <video
                    ref={videoRef}
                    src={optimizedVideoUrl ?? undefined}
                    className="absolute inset-0 h-full w-full object-cover"
                    playsInline
                  />
                )}
                <div className="space-y-1">
                  <h2 className="font-editorial text-3xl text-white md:text-4xl">
                    {classData?.title}
                  </h2>
                  <p className="text-sm text-white/60">
                    Guided by {classData?.teacher_name || "March Russell"}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <Slider
                    value={[currentTime]}
                    max={duration || 1}
                    step={1}
                    onValueChange={handleSliderChange}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-white/70">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handleRewind}
                    variant="ghost"
                    size="lg"
                    className="h-12 w-12 rounded-full p-0 text-white hover:bg-white/10"
                  >
                    <SkipBack className="h-6 w-6" />
                  </Button>

                  <Button
                    onClick={handlePlayPause}
                    size="lg"
                    className="h-16 w-16 rounded-full bg-white p-0 text-black hover:bg-white/90"
                  >
                    {isPlaying ? (
                      <Pause className="h-8 w-8" strokeWidth={1.5} fill="none" />
                    ) : (
                      <Play className="h-8 w-8" strokeWidth={1.5} fill="none" />
                    )}
                  </Button>

                  <Button
                    onClick={handleForward}
                    variant="ghost"
                    size="lg"
                    className="h-12 w-12 rounded-full p-0 text-white hover:bg-white/10"
                  >
                    <SkipForward className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ClassPlayer;

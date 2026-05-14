import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { useMarkSessionComplete } from "@/hooks/useMarkSessionComplete";
import { supabase } from "@/integrations/supabase/client";
import { analytics } from "@/lib/posthog";

interface UseClassPlayerParams {
  classId: string | null;
  open: boolean;
  skipSafetyModal: boolean;
  onClose: () => void;
}

export const useClassPlayer = ({
  classId,
  open,
  skipSafetyModal,
  onClose,
}: UseClassPlayerParams) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const markSessionCompleteMutation = useMarkSessionComplete();

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSafetyDisclosure, setShowSafetyDisclosure] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoMounted, setVideoMounted] = useState(false);
  const hasShownCompletion = useRef(false);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const videoCallbackRef = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    setVideoMounted(!!el);
  }, []);

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
  const isVideoClass = !!classData?.video_url;

  const getMedia = (): HTMLAudioElement | HTMLVideoElement | null =>
    isVideoClass ? videoRef.current : audioRef.current;

  const markSessionComplete = () => {
    if (!classId) return;
    markSessionCompleteMutation.mutate(classId, {
      onSuccess: async () => {
        analytics.sessionCompleted(
          classId,
          classData?.title ?? "",
          classData?.duration_minutes ?? 0
        );
        await queryClient.invalidateQueries({ queryKey: ["profile-stats", user?.id] });
        setShowCompletionModal(true);
      },
    });
  };

  // Reset playback state when modal opens
  useEffect(() => {
    if (classId && open) {
      setDuration(0);
      setHasStarted(false);
      setIsPlaying(false);
      setCurrentTime(0);
      setMediaError(null);
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
    if (!classData || !open) return;

    const shouldShowSafety = !skipSafetyModal && (classData.show_safety_reminder || false);
    setShowSafetyDisclosure(shouldShowSafety);
    if (!shouldShowSafety) {
      setHasStarted(true);
      if (!isVideoClass) setIsPlaying(true);
    }

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
      audio.addEventListener("error", () => {
        setIsPlaying(false);
        setMediaError("We couldn't load this session's audio. Please try again later.");
      });
      audioRef.current = audio;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classData?.id, open]);

  // Attach video events once the video element is in the DOM and classData is set
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoMounted || !classData?.video_url) return;

    video.preload = "metadata";

    const onLoadedMetadata = () => setDuration(video.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
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
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);

    // autoPlay may have already fired before this effect ran
    if (!video.paused) setIsPlaying(true);

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoMounted, classData?.video_url]);

  useEffect(() => {
    const media = getMedia();
    if (media && !isPlaying) {
      media.pause();
    }
  }, [isPlaying, hasStarted, isVideoClass]);

  useEffect(() => {
    if (hasStarted && classData && classId) {
      analytics.sessionStarted(classId, classData.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once when session starts; classId/classData are stable by that point
  }, [hasStarted]);

  // Auto-hide controls while playing a video; always show when paused
  useEffect(() => {
    if (!isVideoClass) return;
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    if (isPlaying) {
      controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    } else {
      setShowControls(true);
    }
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, [isPlaying, isVideoClass]);

  const resetControlsTimer = () => {
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    setShowControls(true);
    if (isPlaying && isVideoClass) {
      controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

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

    const media = getMedia();
    if (media) {
      media.play().catch(() => {});
    }
  };

  const handlePlayPause = () => {
    const media = getMedia();
    if (!media) return;
    if (isPlaying) {
      media.pause();
      setIsPlaying(false);
    } else {
      media.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
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

  const hideControls = () => setShowControls(false);

  return {
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
    videoRef: videoCallbackRef,
    handleStart,
    handlePlayPause,
    handleSliderChange,
    handleClose,
    resetControlsTimer,
    hideControls,
    formatTime,
  };
};

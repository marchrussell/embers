import { useCallback, useEffect, useRef, useState } from "react";

interface UseMediaPlayerOptions {
  audioUrl?: string | null;
  videoUrl?: string | null;
  /** Called once when playback nears the end (≤5 s remaining) or on the ended event. */
  onComplete?: () => void;
}

export const useMediaPlayer = ({ audioUrl, videoUrl, onComplete }: UseMediaPlayerOptions) => {
  const isVideo = !!videoUrl;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Refs so event callbacks always see the latest values without re-binding
  const isPlayingRef = useRef(isPlaying);
  const onCompleteRef = useRef(onComplete);
  const hasTriggeredCompletion = useRef(false);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Stable callback ref for the <video> element
  const videoRef = useCallback((el: HTMLVideoElement | null) => setVideoEl(el), []);

  // Audio setup
  useEffect(() => {
    if (isVideo || !audioUrl) return;

    hasTriggeredCompletion.current = false;
    const audio = new Audio(audioUrl);
    audio.preload = "metadata";
    audioRef.current = audio;

    const onLoadedMetadata = () => {
      setDuration(audio.duration);
      // Autoplay if isPlaying was set true before the element was ready
      if (isPlayingRef.current) audio.play().catch(() => {});
    };
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (
        !hasTriggeredCompletion.current &&
        audio.duration - audio.currentTime <= 5 &&
        audio.currentTime > 0
      ) {
        hasTriggeredCompletion.current = true;
        onCompleteRef.current?.();
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      if (!hasTriggeredCompletion.current) {
        hasTriggeredCompletion.current = true;
        onCompleteRef.current?.();
      }
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
  }, [audioUrl, isVideo]);

  // Video event attachment — runs once the <video> element mounts
  useEffect(() => {
    if (!videoEl || !videoUrl) return;

    hasTriggeredCompletion.current = false;
    videoEl.preload = "metadata";

    const onLoadedMetadata = () => {
      setDuration(videoEl.duration);
      if (isPlayingRef.current) videoEl.play().catch(() => {});
    };
    const onTimeUpdate = () => {
      setCurrentTime(videoEl.currentTime);
      if (
        !hasTriggeredCompletion.current &&
        videoEl.duration - videoEl.currentTime <= 5 &&
        videoEl.currentTime > 0
      ) {
        hasTriggeredCompletion.current = true;
        onCompleteRef.current?.();
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      if (!hasTriggeredCompletion.current) {
        hasTriggeredCompletion.current = true;
        onCompleteRef.current?.();
      }
    };

    videoEl.addEventListener("loadedmetadata", onLoadedMetadata);
    videoEl.addEventListener("timeupdate", onTimeUpdate);
    videoEl.addEventListener("ended", onEnded);

    return () => {
      videoEl.removeEventListener("loadedmetadata", onLoadedMetadata);
      videoEl.removeEventListener("timeupdate", onTimeUpdate);
      videoEl.removeEventListener("ended", onEnded);
    };
  }, [videoEl, videoUrl]);

  // Sync play/pause state to the active media element
  useEffect(() => {
    const media = isVideo ? videoEl : audioRef.current;
    if (!media) return;
    if (isPlaying) {
      media.play().catch(() => {});
    } else {
      media.pause();
    }
  }, [isPlaying, isVideo, videoEl]);

  const seek = (seconds: number) => {
    const media = isVideo ? videoEl : audioRef.current;
    if (!media) return;
    const clamped = Math.max(0, Math.min(media.duration || 0, seconds));
    media.currentTime = clamped;
    setCurrentTime(clamped);
  };

  return { videoRef, currentTime, duration, isPlaying, setIsPlaying, seek, isVideo };
};

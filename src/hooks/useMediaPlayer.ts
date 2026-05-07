import { useCallback, useEffect, useRef, useState } from "react";

interface UseMediaPlayerOptions {
  audioUrl?: string | null;
  videoUrl?: string | null;
}

export const useMediaPlayer = ({ audioUrl, videoUrl }: UseMediaPlayerOptions) => {
  const isVideo = !!videoUrl;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Stable callback ref for the <video> element
  const videoRef = useCallback((el: HTMLVideoElement | null) => setVideoEl(el), []);

  // Audio setup
  useEffect(() => {
    if (isVideo || !audioUrl) return;

    const audio = new Audio(audioUrl);
    audio.preload = "metadata";
    audioRef.current = audio;

    const onLoadedMetadata = () => setDuration(audio.duration);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => setIsPlaying(false);

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

    videoEl.preload = "metadata";

    const onLoadedMetadata = () => setDuration(videoEl.duration);
    const onTimeUpdate = () => setCurrentTime(videoEl.currentTime);
    const onEnded = () => setIsPlaying(false);

    videoEl.addEventListener("loadedmetadata", onLoadedMetadata);
    videoEl.addEventListener("timeupdate", onTimeUpdate);
    videoEl.addEventListener("ended", onEnded);

    return () => {
      videoEl.removeEventListener("loadedmetadata", onLoadedMetadata);
      videoEl.removeEventListener("timeupdate", onTimeUpdate);
      videoEl.removeEventListener("ended", onEnded);
    };
  }, [videoEl, videoUrl]);

  // Sync play/pause to the active media element
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

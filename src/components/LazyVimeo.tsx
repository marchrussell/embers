import { useState, useRef, useEffect } from 'react';

interface LazyVimeoProps {
  videoId: string;
  title?: string;
  className?: string;
}

/**
 * LazyVimeo - Defers Vimeo iframe loading until visible
 * Similar to LazyYouTube but for Vimeo embeds
 */
export const LazyVimeo = ({ videoId, title = 'Vimeo video player', className = '' }: LazyVimeoProps) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer to detect when video is in viewport
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px',
        threshold: 0.01,
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const shouldLoadIframe = isIntersecting || isClicked;

  // Vimeo thumbnail URL
  const thumbnailUrl = `https://vumbnail.com/${videoId}.jpg`;

  return (
    <div
      ref={containerRef}
      className={`relative aspect-video overflow-hidden bg-black ${className}`}
    >
      {!shouldLoadIframe ? (
        <button
          onClick={() => setIsClicked(true)}
          className="absolute inset-0 w-full h-full cursor-pointer group"
          aria-label="Load Vimeo video"
        >
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          {/* Vimeo play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-[#00adef] hover:bg-[#00c3ff] rounded-full p-5 group-hover:scale-110 transition-all duration-200">
              <svg
                className="w-8 h-8 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </button>
      ) : (
        <iframe
          className="w-full h-full"
          src={`https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=${isClicked ? 1 : 0}`}
          title={title}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      )}
    </div>
  );
};

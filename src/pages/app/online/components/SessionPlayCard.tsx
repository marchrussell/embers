import { Heart, Lock, MoreHorizontal } from "lucide-react";
import { memo } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFavourites } from "@/hooks/useFavourites";
import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/supabaseImageOptimization";

interface SessionPlayCardProps {
  sessionId?: string;
  title: string;
  description: string;
  /** Formatted string e.g. "Teacher • 15 min • Technique • Intensity" */
  meta: string;
  imageUrl: string | null;
  onClick: () => void;
  /** Stack image above content on mobile (used in StartHere). Defaults to false (always horizontal). */
  mobileStacked?: boolean;
  /** Show lock overlay on image */
  locked?: boolean;
  /** Show ✨ NEW badge on image */
  isNew?: boolean;
}

const SessionPlayCard = memo(
  ({
    sessionId,
    title,
    description,
    meta,
    imageUrl,
    onClick,
    mobileStacked = false,
    locked = false,
    isNew = false,
  }: SessionPlayCardProps) => {
    const { isFavourite, toggleFavourite } = useFavourites();
    return (
      <div
        onClick={onClick}
        className="group cursor-pointer overflow-hidden rounded-xl border border-[#E6DBC7]/20 shadow-glow transition-all hover:border-[#E6DBC7]/30"
      >
        <div
          className={`flex ${mobileStacked ? "h-auto flex-col sm:h-[140px] sm:flex-row md:h-[160px] lg:h-[180px]" : "h-[140px] md:h-[160px] lg:h-[180px]"}`}
        >
          {/* Image */}
          <div
            className={`relative flex-shrink-0 ${mobileStacked ? "h-[140px] w-full sm:h-full sm:w-[140px] md:w-[200px] lg:w-[240px]" : "h-full w-[90px] md:w-[200px] lg:w-[240px]"}`}
          >
            {imageUrl && (
              <img
                src={getOptimizedImageUrl(imageUrl, IMAGE_PRESETS.card)}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            )}
            <div className="absolute inset-0 bg-black/0" />
            {isNew && (
              <div className="absolute left-3 top-3 z-10">
                <span className="text-[10px] font-medium text-amber-400">✨ NEW</span>
              </div>
            )}
            {locked && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                <Lock className="h-6 w-6 text-[#E6DBC7]" strokeWidth={1.5} />
              </div>
            )}
          </div>

          {/* Content */}
          <div
            className={`flex flex-1 ${mobileStacked ? "flex-col items-start sm:flex-row sm:items-center" : "items-center"} justify-between gap-4 ${mobileStacked ? "px-5 py-4 sm:px-6 sm:py-6 md:px-10" : "px-6 py-6 md:px-10"} bg-black/30 backdrop-blur-xl ${mobileStacked ? "border-t sm:border-l sm:border-t-0" : "border-l"} border-white/5`}
          >
            <div className="min-w-0 flex-1 pr-4">
              <h3 className="mb-1.5 font-editorial text-base text-[#E6DBC7] sm:mb-2 sm:text-lg md:text-xl">
                {title}
              </h3>
              <p className="mb-1.5 line-clamp-1 text-xs font-light leading-relaxed text-[#E6DBC7]/60 md:mb-2 md:line-clamp-2 md:text-base">
                {description}
              </p>
              <p className="text-xs font-light text-green-400 md:text-sm">{meta}</p>
            </div>

            {/* Mobile: ellipsis dropdown */}
            <div
              className={`flex-shrink-0 md:hidden ${mobileStacked ? "self-end sm:self-center" : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E6DBC7]/30 bg-[#E6DBC7]/5 transition-all hover:bg-[#E6DBC7]/10">
                    <MoreHorizontal className="h-4 w-4 text-[#E6DBC7]" strokeWidth={1.5} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={onClick}>
                    <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Play
                  </DropdownMenuItem>
                  {sessionId && (
                    <DropdownMenuItem onClick={() => toggleFavourite(sessionId)}>
                      <Heart
                        className={`mr-2 h-4 w-4 ${isFavourite(sessionId) ? "fill-[#E6DBC7]" : ""}`}
                        strokeWidth={1.5}
                      />
                      {isFavourite(sessionId) ? "Unfavourite" : "Favourite"}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Desktop: heart + play buttons */}
            <div
              className={`hidden flex-shrink-0 items-center gap-3 md:flex ${mobileStacked ? "self-end sm:self-center" : ""}`}
            >
              {sessionId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavourite(sessionId);
                  }}
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-[#E6DBC7]/30 bg-[#E6DBC7]/5 transition-all hover:bg-[#E6DBC7]/10"
                >
                  <Heart
                    className={`h-5 w-5 text-[#E6DBC7] ${isFavourite(sessionId) ? "fill-[#E6DBC7]" : ""}`}
                    strokeWidth={1.5}
                  />
                </button>
              )}
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#E6DBC7]/50 bg-[#E6DBC7]/10 transition-all">
                <svg
                  className="ml-0.5 h-5 w-5 text-[#E6DBC7] transition-all"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

SessionPlayCard.displayName = "SessionPlayCard";
export default SessionPlayCard;

import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/supabaseImageOptimization";
import { Lock } from "lucide-react";
import { memo } from "react";

interface SessionPlayCardProps {
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

const SessionPlayCard = memo(({
  title,
  description,
  meta,
  imageUrl,
  onClick,
  mobileStacked = false,
  locked = false,
  isNew = false,
}: SessionPlayCardProps) => {
  const imageStyle = imageUrl
    ? { backgroundImage: `url('${getOptimizedImageUrl(imageUrl, IMAGE_PRESETS.card)}')` }
    : undefined;

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-xl border border-[#E6DBC7]/20 transition-all shadow-[0_8px_30px_rgba(230,219,199,0.1)] hover:border-[#E6DBC7]/30"
    >
      <div className={`flex ${mobileStacked ? 'flex-col sm:flex-row h-auto sm:h-[140px] md:h-[160px] lg:h-[180px]' : 'h-[140px] md:h-[160px] lg:h-[180px]'}`}>
        {/* Image */}
        <div
          className={`relative flex-shrink-0 bg-cover bg-center ${mobileStacked ? 'w-full sm:w-[140px] md:w-[200px] lg:w-[240px] h-[140px] sm:h-full' : 'w-[140px] md:w-[200px] lg:w-[240px] h-full'}`}
          style={imageStyle}
        >
          <div className="absolute inset-0 bg-black/0" />
          {isNew && (
            <div className="absolute top-3 left-3 z-10">
              <span className="text-[10px] text-amber-400 font-medium">✨ NEW</span>
            </div>
          )}
          {locked && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <Lock className="w-6 h-6 text-[#E6DBC7]" strokeWidth={1.5} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`flex-1 flex ${mobileStacked ? 'flex-col sm:flex-row items-start sm:items-center' : 'items-center'} justify-between gap-4 ${mobileStacked ? 'px-5 sm:px-6 md:px-10 py-4 sm:py-6' : 'px-6 md:px-10 py-6'} backdrop-blur-xl bg-black/30 ${mobileStacked ? 'border-t sm:border-t-0 sm:border-l' : 'border-l'} border-white/5`}>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg md:text-xl font-editorial text-[#E6DBC7] mb-1.5 sm:mb-2">
              {title}
            </h3>
            <p className="text-xs sm:text-sm md:text-base text-green-400 font-light mb-2 sm:mb-3 leading-relaxed line-clamp-2">
              {description}
            </p>
            <p className="text-xs md:text-sm text-[#E6DBC7]/40 font-light">{meta}</p>
          </div>

          {/* Play button */}
          <div className={`flex-shrink-0 ${mobileStacked ? 'self-end sm:self-center' : ''}`}>
            <div className="w-11 h-11 md:w-14 md:h-14 rounded-full border border-[#E6DBC7]/50 flex items-center justify-center transition-all bg-[#E6DBC7]/10">
              <svg className="w-5 h-5 text-[#E6DBC7] transition-all ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

SessionPlayCard.displayName = 'SessionPlayCard';
export default SessionPlayCard;

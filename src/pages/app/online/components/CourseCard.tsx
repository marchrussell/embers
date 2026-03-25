import { Lock } from "lucide-react";
import { memo } from "react";

import { OptimizedImage } from "@/components/OptimizedImage";
import { IMAGE_PRESETS } from "@/lib/supabaseImageOptimization";

interface CourseCardProps {
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  onClick: () => void;
  badge?: string;
  locked?: boolean;
  imagePosition?: string;
}

const CourseCard = memo(
  ({
    title,
    subtitle,
    description,
    image,
    onClick,
    badge,
    locked = false,
    imagePosition = "center",
  }: CourseCardProps) => (
    <div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#E6DBC7]/15 bg-black/20 shadow-[0_0_40px_rgba(230,219,199,0.15)] backdrop-blur-sm transition-colors duration-500 hover:border-[#E6DBC7]/30"
    >
      <div className="relative h-48 overflow-hidden">
        <OptimizedImage
          src={image}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: imagePosition }}
          optimizationOptions={IMAGE_PRESETS.card}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        {badge && (
          <div className="absolute left-4 top-4">
            <span className="rounded-full bg-[#D4A574]/90 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white">
              {badge}
            </span>
          </div>
        )}
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Lock className="h-5 w-5 text-[#E6DBC7]" strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="p-6">
        {subtitle && (
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-[#D4A574]">
            {subtitle}
          </p>
        )}
        <h3 className="mb-2 font-editorial text-xl leading-tight text-[#E6DBC7]">{title}</h3>
        <p className="line-clamp-2 text-sm font-light leading-relaxed text-[#E6DBC7]/70">
          {description}
        </p>
      </div>
    </div>
  )
);

CourseCard.displayName = "CourseCard";
export default CourseCard;

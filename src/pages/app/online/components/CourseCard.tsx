import { OptimizedImage } from "@/components/OptimizedImage";
import { IMAGE_PRESETS } from "@/lib/supabaseImageOptimization";
import { Lock } from "lucide-react";
import { memo } from "react";

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

const CourseCard = memo(({
  title,
  subtitle,
  description,
  image,
  onClick,
  badge,
  locked = false,
  imagePosition = 'center',
}: CourseCardProps) => (
  <div
    onClick={onClick}
    className="relative overflow-hidden cursor-pointer group rounded-2xl border border-[#E6DBC7]/15 bg-black/20 backdrop-blur-sm hover:border-[#E6DBC7]/30 transition-colors duration-500 shadow-[0_0_40px_rgba(230,219,199,0.15)]"
  >
    <div className="relative h-48 overflow-hidden">
      <OptimizedImage
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: imagePosition }}
        optimizationOptions={IMAGE_PRESETS.card}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      {badge && (
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-[#D4A574]/90 text-white text-xs font-medium rounded-full uppercase tracking-wider">
            {badge}
          </span>
        </div>
      )}
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Lock className="w-5 h-5 text-[#E6DBC7]" strokeWidth={1.5} />
        </div>
      )}
    </div>
    <div className="p-6">
      {subtitle && (
        <p className="text-xs text-[#D4A574] font-medium tracking-[0.15em] uppercase mb-2">
          {subtitle}
        </p>
      )}
      <h3 className="text-xl font-editorial text-[#E6DBC7] mb-2 leading-tight">
        {title}
      </h3>
      <p className="text-sm text-[#E6DBC7]/70 font-light leading-relaxed line-clamp-2">
        {description}
      </p>
    </div>
  </div>
));

CourseCard.displayName = 'CourseCard';
export default CourseCard;

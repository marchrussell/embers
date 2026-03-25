import { memo } from "react";
import { Link } from "react-router-dom";

import { OptimizedImage } from "@/components/OptimizedImage";
import { Button } from "@/components/ui/button";
import { CLOUD_IMAGES, getCloudImageUrl } from "@/lib/cloudImageUrls";
import { IMAGE_PRESETS } from "@/lib/supabaseImageOptimization";

const startHereButterfly = getCloudImageUrl(CLOUD_IMAGES.startHereButterfly);

interface StartHereCardProps {
  locked?: boolean;
  onLockedClick?: () => void;
}

const StartHereCard = memo(({ locked = false, onLockedClick }: StartHereCardProps) => (
  <Link
    to="/online/start-here"
    onClick={(e) => {
      if (locked) {
        e.preventDefault();
        onLockedClick?.();
      }
    }}
    className="group relative block h-[380px] cursor-pointer overflow-hidden rounded-2xl border border-[#E6DBC7]/15 shadow-glow transition-all hover:border-[#E6DBC7]/25 md:h-[400px]"
  >
    <OptimizedImage
      src={startHereButterfly}
      alt="A Simple Place to Begin"
      className="absolute inset-0 h-full w-full object-cover object-center"
      optimizationOptions={IMAGE_PRESETS.hero}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent md:bg-gradient-to-r md:from-background/40 md:via-transparent md:to-transparent" />

    <div className="absolute inset-0 flex flex-col rounded-2xl md:relative md:h-full md:flex-row">
      <div className="relative hidden overflow-hidden rounded-l-2xl md:block md:w-[45%]">
        <OptimizedImage
          src={startHereButterfly}
          alt="Begin gently"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "center" }}
          optimizationOptions={IMAGE_PRESETS.card}
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex flex-col rounded-2xl border-white/5 px-6 py-6 md:relative md:h-full md:w-[55%] md:justify-center md:rounded-l-none md:rounded-r-2xl md:border-l md:bg-black/10 md:px-10 md:py-8 md:backdrop-blur-2xl">
        <h3 className="mb-3 font-editorial text-2xl font-light leading-tight tracking-tight text-[#E6DBC7] md:text-3xl lg:text-4xl">
          A Simple Place to Begin
        </h3>
        <p className="mb-4 text-xs font-light uppercase tracking-[0.2em] text-[#D4A574] md:mb-5 md:text-sm">
          Your First Two Weeks
        </p>
        <p className="mb-6 max-w-2xl text-sm font-light leading-relaxed text-[#E6DBC7]/80 md:text-base">
          This space is designed to help you arrive gently and find your footing — without pressure
          or expectation.
        </p>
        <Button className="w-fit rounded-full border border-[#E6DBC7]/60 bg-transparent px-12 py-3 text-sm font-light text-[#E6DBC7] transition-all hover:border-[#E6DBC7] hover:bg-white/5 md:text-base">
          Begin gently
        </Button>
      </div>
    </div>
  </Link>
));

StartHereCard.displayName = "StartHereCard";
export default StartHereCard;

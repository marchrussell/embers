import { OptimizedImage } from "@/components/OptimizedImage";
import { Button } from "@/components/ui/button";
import { CLOUD_IMAGES, getCloudImageUrl } from "@/lib/cloudImageUrls";
import { IMAGE_PRESETS } from "@/lib/supabaseImageOptimization";
import { memo } from "react";
import { Link } from "react-router-dom";

const startHereButterfly = getCloudImageUrl(CLOUD_IMAGES.startHereButterfly);

const StartHereCard = memo(() => (
  <Link
    to="/online/start-here"
    className="block relative h-[380px] md:h-[400px] overflow-hidden rounded-2xl border border-[#E6DBC7]/15 shadow-[0_0_40px_rgba(230,219,199,0.15)] cursor-pointer group hover:border-[#E6DBC7]/25 transition-all"
  >
    <OptimizedImage
      src={startHereButterfly}
      alt="A Simple Place to Begin"
      className="absolute inset-0 w-full h-full object-cover object-center"
      optimizationOptions={IMAGE_PRESETS.hero}
    />
    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/40 to-transparent md:from-background/40 md:via-transparent md:to-transparent" />

    <div className="absolute inset-0 md:relative md:h-full flex flex-col md:flex-row rounded-2xl">
      <div className="hidden md:block md:w-[45%] relative rounded-l-2xl overflow-hidden">
        <OptimizedImage
          src={startHereButterfly}
          alt="Begin gently"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center' }}
          optimizationOptions={IMAGE_PRESETS.card}
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 md:relative md:h-full flex flex-col md:justify-center px-6 py-6 md:w-[55%] md:px-10 md:py-8 md:border-l border-white/5 rounded-2xl md:rounded-r-2xl md:rounded-l-none md:backdrop-blur-2xl md:bg-black/10">
        <h3 className="font-editorial text-2xl md:text-3xl lg:text-4xl font-light tracking-tight mb-3 text-[#E6DBC7] leading-tight">
          A Simple Place to Begin
        </h3>
        <p className="text-xs md:text-sm text-[#D4A574] font-light tracking-[0.2em] mb-4 md:mb-5 uppercase">
          Your First Two Weeks
        </p>
        <p className="text-sm md:text-base font-light text-[#E6DBC7]/80 mb-6 leading-relaxed max-w-2xl">
          This space is designed to help you arrive gently and find your footing — without pressure or expectation.
        </p>
        <Button className="bg-transparent text-[#E6DBC7] border border-[#E6DBC7]/60 hover:bg-white/5 hover:border-[#E6DBC7] transition-all font-light px-12 py-3 rounded-full text-sm md:text-base w-fit">
          Begin gently
        </Button>
      </div>
    </div>
  </Link>
));

StartHereCard.displayName = 'StartHereCard';
export default StartHereCard;

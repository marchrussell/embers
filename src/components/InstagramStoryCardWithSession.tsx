import instagramBg from "@/assets/instagram-story-bg.jpg";
import theLandingImage from "@/assets/the-landing-calm.jpg";
import {
  InstagramStoryCardBase,
  InstagramBrandLogos,
  InstagramText,
} from "./InstagramStoryCardBase";

export const InstagramStoryCardWithSession = () => {
  return (
    <InstagramStoryCardBase
      backgroundImage={instagramBg}
      overlay="blur"
      showBorder
    >
      {/* Content */}
      <div className="relative h-full flex flex-col justify-between px-10 py-24">
        {/* Top Section - Brand Identity (Logo + Title) */}
        <div className="flex flex-col items-center space-y-8">
          <InstagramBrandLogos logoSize="md" />

          {/* Title - Grouped with logo */}
          <div className="space-y-2 text-center">
            <InstagramText variant="title">App & 5-Month Course</InstagramText>
            <InstagramText variant="title">Coming Soon</InstagramText>
          </div>
        </div>

        {/* Bottom Section - Session Preview */}
        <div className="w-full max-w-xs mx-auto">
          <div className="relative overflow-hidden rounded-lg aspect-square group cursor-pointer">
            {/* Session Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
              style={{
                backgroundImage: `url(${theLandingImage})`,
                filter: "brightness(0.8)",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

            {/* Session Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-xs text-[#D97757] font-light tracking-widest uppercase mb-1">
                CALM
              </p>
              <p className="text-base font-medium text-white mb-1">The Landing</p>
              <p className="text-xs text-white/70">10 min</p>
            </div>
          </div>
        </div>
      </div>
    </InstagramStoryCardBase>
  );
};

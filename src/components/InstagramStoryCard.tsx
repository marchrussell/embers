import instagramBg from "@/assets/instagram-story-bg.jpg";
import {
  InstagramStoryCardBase,
  InstagramBrandLogos,
  InstagramText,
} from "./InstagramStoryCardBase";

export const InstagramStoryCard = () => {
  return (
    <InstagramStoryCardBase
      backgroundImage={instagramBg}
      overlay="blur"
      showBorder
    >
      {/* Content */}
      <div className="relative h-full flex flex-col justify-end px-10 py-24">
        {/* Brand Identity + Body Text - Grouped together at bottom */}
        <div className="flex flex-col items-center space-y-12">
          {/* Top Section - Brand Identity (Logo + Title) */}
          <div className="flex flex-col items-center space-y-8">
            <InstagramBrandLogos logoSize="md" />

            {/* Title - Grouped with logo */}
            <div className="space-y-2 text-center">
              <InstagramText variant="title">App & 5-Month Course</InstagramText>
              <InstagramText variant="title">Coming Soon</InstagramText>
            </div>
          </div>

          {/* Bottom Section - Narrative */}
          <div className="text-center max-w-xs mx-auto space-y-6">
            <InstagramText variant="body">
              Whether you're looking to calm anxiety, improve sleep, boost energy, or access deeper states of awareness, we've been carefully curating a collection of guided sessions to support your journey with bespoke music for each session.
            </InstagramText>

            <InstagramText variant="signature">Big Love, March x</InstagramText>
          </div>
        </div>
      </div>
    </InstagramStoryCardBase>
  );
};

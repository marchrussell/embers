import mLogo from "@/assets/m-logo.png";
import mushroomBg from "@/assets/instagram-mushroom-closeup.png";
import { InstagramStoryCardBase, INSTAGRAM_FILTERS } from "./InstagramStoryCardBase";

export const InstagramStoryCardMushroom = () => {
  return (
    <InstagramStoryCardBase
      backgroundImage={mushroomBg}
      backgroundPosition="center 35%"
      overlay="subtle"
      showBorder={false}
    >
      {/* Content - Centered M logo only */}
      <div className="relative h-full flex items-center justify-center">
        {/* M Logo - Website golden color with glow */}
        <div className="w-40 h-40 flex items-center justify-center">
          <img
            src={mLogo}
            alt="M Logo"
            className="w-full h-full object-contain"
            style={{ filter: INSTAGRAM_FILTERS.glowStrong }}
          />
        </div>
      </div>
    </InstagramStoryCardBase>
  );
};

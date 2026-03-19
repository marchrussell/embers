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
      <div className="relative flex h-full items-center justify-center">
        {/* M Logo - Website golden color with glow */}
        <div className="flex h-40 w-40 items-center justify-center">
          <img
            src={mLogo}
            alt="M Logo"
            className="h-full w-full object-contain"
            style={{ filter: INSTAGRAM_FILTERS.glowStrong }}
          />
        </div>
      </div>
    </InstagramStoryCardBase>
  );
};

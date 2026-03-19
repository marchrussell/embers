import mLogo from "@/assets/m-logo.png";
import liveSessionBg from "@/assets/instagram-live-session-bg.jpg";
import { InstagramStoryCardBase, INSTAGRAM_FILTERS } from "./InstagramStoryCardBase";

export const InstagramStoryCardLiveSession = () => {
  return (
    <InstagramStoryCardBase backgroundImage={liveSessionBg} overlay="dark" showBorder={false}>
      {/* Content */}
      <div className="relative flex h-full flex-col px-8 py-12">
        {/* Event Details at Top */}
        <div className="mb-auto mt-8 text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-primary md:text-base">
            INSTAGRAM LIVE • SUNDAY 9PM
          </p>
        </div>

        {/* Center Content */}
        <div className="flex flex-1 flex-col items-center justify-center">
          {/* Animated M Logo */}
          <div className="mb-8 flex h-32 w-32 items-center justify-center">
            <img
              src={mLogo}
              alt="M Logo"
              className="h-full w-full animate-breathe object-contain"
              style={{ filter: INSTAGRAM_FILTERS.glow }}
            />
          </div>

          {/* Text Content */}
          <div className="space-y-4 text-center">
            <h2 className="font-editorial text-4xl italic text-white md:text-5xl">Unwind & Rest</h2>
            <p className="text-base text-white md:text-lg">
              A warm, restorative breathwork session
              <br />
              to quieten your racing mind and
              <br />
              guide you into ease.
            </p>
          </div>
        </div>
      </div>
    </InstagramStoryCardBase>
  );
};

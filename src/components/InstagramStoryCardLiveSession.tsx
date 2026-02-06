import mLogo from "@/assets/m-logo.png";
import liveSessionBg from "@/assets/instagram-live-session-bg.jpg";
import { InstagramStoryCardBase, INSTAGRAM_FILTERS } from "./InstagramStoryCardBase";

export const InstagramStoryCardLiveSession = () => {
  return (
    <InstagramStoryCardBase
      backgroundImage={liveSessionBg}
      overlay="dark"
      showBorder={false}
    >
      {/* Content */}
      <div className="relative h-full flex flex-col px-8 py-12">
        {/* Event Details at Top */}
        <div className="text-center mb-auto mt-8">
          <p className="text-sm md:text-base uppercase tracking-wider text-primary font-bold">
            INSTAGRAM LIVE • SUNDAY 9PM
          </p>
        </div>

        {/* Center Content */}
        <div className="flex flex-col items-center justify-center flex-1">
          {/* Animated M Logo */}
          <div className="w-32 h-32 flex items-center justify-center mb-8">
            <img
              src={mLogo}
              alt="M Logo"
              className="w-full h-full object-contain animate-breathe"
              style={{ filter: INSTAGRAM_FILTERS.glow }}
            />
          </div>

          {/* Text Content */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-editorial italic text-white">
              Unwind & Rest
            </h2>
            <p className="text-base md:text-lg text-white">
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

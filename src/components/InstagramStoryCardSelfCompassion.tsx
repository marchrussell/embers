import mLogo from "@/assets/m-logo.png";
import sessionImage from "@/assets/rain-of-self-compassion.jpg";

export const InstagramStoryCardSelfCompassion = () => {
  return (
    <div className="relative mx-auto aspect-[9/16] w-full max-w-md overflow-hidden rounded-2xl bg-black shadow-2xl">
      {/* Content */}
      <div className="relative flex h-full flex-col justify-between px-10 py-20">
        {/* Top Section - M Logo */}
        <div className="flex justify-center pt-8">
          <div className="flex h-28 w-28 items-center justify-center">
            <img
              src={mLogo}
              alt="M Logo"
              className="h-full w-full object-contain"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(100%) drop-shadow(0 0 20px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 40px rgba(255, 255, 255, 0.7)) drop-shadow(0 0 60px rgba(255, 255, 255, 0.5))",
              }}
            />
          </div>
        </div>

        {/* Bottom Section - Session Preview */}
        <div className="mx-auto w-full max-w-xs">
          <div className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg">
            {/* Session Background Image */}
            <img
              src={sessionImage}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            {/* Session Content */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[#D97757]">
                CALM
              </p>
              <p className="mb-2 text-lg font-medium leading-tight text-white">
                The Rain of Self-Compassion
              </p>
              <p className="text-sm text-white/70">20 min</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import mLogo from "@/assets/m-logo.png";
import liveSessionBg from "@/assets/instagram-live-session-bg.jpg";

export const InstagramStoryCardComingSoon = () => {
  return (
    <div className="relative mx-auto aspect-[9/16] w-full max-w-md overflow-hidden rounded-2xl shadow-2xl">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${liveSessionBg})` }}
      />

      {/* Subtle overlay for contrast */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Bottom gradient for text visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />

      {/* Content */}
      <div className="relative flex h-full flex-col px-8 py-12">
        {/* Center Content */}
        <div className="flex flex-1 flex-col items-center justify-center">
          {/* Animated M Logo */}
          <div className="mb-8 flex h-32 w-32 items-center justify-center">
            <img
              src={mLogo}
              alt="M Logo"
              className="h-full w-full animate-breathe object-contain"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(71%) sepia(44%) saturate(1245%) hue-rotate(337deg) brightness(97%) contrast(92%) drop-shadow(0 0 20px hsl(30, 80%, 57%, 0.9)) drop-shadow(0 0 40px hsl(30, 80%, 57%, 0.7))",
              }}
            />
          </div>

          {/* Text Content */}
          <div className="space-y-6 text-center">
            <h2 className="font-editorial text-4xl italic text-white md:text-5xl">Coming Soon</h2>
            <p className="mx-auto max-w-xs text-base leading-relaxed text-white/90 md:text-lg">
              A sanctuary for your nervous system. Breathwork, somatic practices & guided
              meditations to help you calm, energise, reset & restore.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

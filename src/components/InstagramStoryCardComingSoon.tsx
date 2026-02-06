import mLogo from "@/assets/m-logo.png";
import liveSessionBg from "@/assets/instagram-live-session-bg.jpg";

export const InstagramStoryCardComingSoon = () => {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-[9/16] overflow-hidden rounded-2xl shadow-2xl">
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
      <div className="relative h-full flex flex-col px-8 py-12">
        {/* Center Content */}
        <div className="flex flex-col items-center justify-center flex-1">
          {/* Animated M Logo */}
          <div className="w-32 h-32 flex items-center justify-center mb-8">
            <img 
              src={mLogo} 
              alt="M Logo" 
              className="w-full h-full object-contain animate-breathe" 
              style={{
                filter: 'brightness(0) saturate(100%) invert(71%) sepia(44%) saturate(1245%) hue-rotate(337deg) brightness(97%) contrast(92%) drop-shadow(0 0 20px hsl(30, 80%, 57%, 0.9)) drop-shadow(0 0 40px hsl(30, 80%, 57%, 0.7))'
              }} 
            />
          </div>

          {/* Text Content */}
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-editorial italic text-white">Coming Soon</h2>
            <p className="text-base md:text-lg text-white/90 leading-relaxed max-w-xs mx-auto">
              A sanctuary for your nervous system. 
              Breathwork, somatic practices & guided 
              meditations to help you calm, energise, 
              reset & restore.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

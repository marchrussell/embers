import mLogo from "@/assets/m-logo.png";
import sessionImage from "@/assets/morning-awakening.jpg";

export const InstagramStoryCardAwakening = () => {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-[9/16] overflow-hidden rounded-2xl shadow-2xl bg-black">
      {/* Content */}
      <div className="relative h-full flex flex-col justify-between px-10 py-20">
        {/* Top Section - M Logo */}
        <div className="flex justify-center pt-8">
          <div className="w-28 h-28 flex items-center justify-center">
            <img 
              src={mLogo} 
              alt="M Logo" 
              className="w-full h-full object-contain"
              style={{ 
                filter: 'brightness(0) saturate(100%) invert(100%) drop-shadow(0 0 20px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 40px rgba(255, 255, 255, 0.7)) drop-shadow(0 0 60px rgba(255, 255, 255, 0.5))'
              }}
            />
          </div>
        </div>
        
        {/* Bottom Section - Session Preview */}
        <div className="w-full max-w-xs mx-auto">
          <div className="relative overflow-hidden rounded-lg aspect-square group cursor-pointer">
            {/* Session Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
              style={{ 
                backgroundImage: `url(${sessionImage})`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            
            {/* Session Content */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-xs text-[#D97757] font-medium tracking-[0.2em] uppercase mb-2">
                ENERGY
              </p>
              <p className="text-lg font-medium text-white mb-2 leading-tight">Morning Awakening</p>
              <p className="text-sm text-white/70">12 min</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

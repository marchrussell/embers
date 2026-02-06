import { Play, Heart, Pause, Star } from "lucide-react";
import categoryCalm from "@/assets/category-awaken.jpg";
import categoryEnergy from "@/assets/category-energy.jpg";
import categoryReset from "@/assets/category-reset.jpg";
import categorySleep from "@/assets/category-sleep.jpg";
import categoryRelease from "@/assets/category-release.jpg";
import reviewsBg from "@/assets/reviews-bg.jpg";
import programHero from "@/assets/program-hero-flowers.jpg";
import nowPlayingBg from "@/assets/now-playing-bg.jpg";

// Shared phone frame styles
const phoneFrameStyles = "w-[280px] h-[560px] bg-black rounded-[28px] overflow-hidden shadow-[0_0_60px_rgba(230,219,199,0.4)] border border-white/20";

export const PhoneMockups = () => {
  const sessions = [
    { title: "The Landing", duration: "10 min", image: categoryCalm },
    { title: "Box Breathing", duration: "7 min", image: categoryEnergy },
    { title: "Breathe Efficiently", duration: "14 min", image: categoryReset },
    { title: "The Perfect Breath", duration: "10 min", image: categorySleep },
    { title: "Quieten Your Mind", duration: "11 min", image: categoryRelease },
  ];

  return (
    <div className="py-8 w-full max-w-[1800px] mx-auto px-4">
      <div className="flex flex-wrap lg:flex-nowrap items-end justify-center gap-6 lg:gap-10 xl:gap-12">
        
        {/* Phone 1: Category Sessions */}
        <div className="relative">
          <div className={phoneFrameStyles}>
            {/* Hero */}
            <div className="relative h-48 overflow-hidden">
              <img src={categoryCalm} alt="Calm" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute bottom-4 left-6">
                <h3 className="text-white font-editorial text-[26px]">Calm</h3>
                <p className="text-white/60 text-[12px]">9 sessions</p>
              </div>
            </div>
            
            {/* Sessions list */}
            <div className="px-6 py-4 space-y-3">
              {sessions.map((session, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 relative">
                    <img src={session.image} alt={session.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-[14px] font-medium">{session.title}</p>
                    <p className="text-white/40 text-[12px]">{session.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-white/50 text-xs mt-4 tracking-wide">Category</p>
        </div>

        {/* Phone 2: Reviews */}
        <div className="relative">
          <div className={phoneFrameStyles + " relative"}>
            {/* Background */}
            <div className="absolute inset-0">
              <img src={reviewsBg} alt="" className="w-full h-full object-cover blur-[2px] scale-105" />
              <div className="absolute inset-0 bg-black/30" />
            </div>
            
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[6px]" />
            
            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center px-5 py-8">
              {[
                "It's like no other form of therapy I've experienced",
                "The most influential voice in helping me through a deeply personal bereavement",
                "I feel intense levels of relaxation and great for days afterwards"
              ].map((quote, i) => (
                <div key={i} className={`text-center ${i < 2 ? 'mb-12' : ''}`}>
                  <div className="flex justify-center gap-0.5 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 text-white fill-white" />
                    ))}
                  </div>
                  <p className="text-white text-[13px] italic leading-relaxed">"{quote}"</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-white/50 text-xs mt-4 tracking-wide">Reviews</p>
        </div>

        {/* Phone 3: Programs */}
        <div className="relative">
          <div className={phoneFrameStyles}>
            {/* Hero */}
            <div className="relative h-48 overflow-hidden">
              <img src={programHero} alt="Course" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute bottom-4 left-6">
                <h3 className="text-white font-editorial text-[26px]">The Power of Breathwork</h3>
                <p className="text-white/60 text-[12px]">5 Lessons</p>
              </div>
            </div>
            
            {/* Lessons list */}
            <div className="px-6 py-4 space-y-3">
              {[
                { num: 1, title: "Welcome & Introduction", duration: "3 mins" },
                { num: 2, title: "The Science", duration: "8 mins" },
                { num: 3, title: "Your First Practice", duration: "12 mins" },
                { num: 4, title: "Building Habits", duration: "5 mins" },
                { num: 5, title: "Regulation in Real Time", duration: "6 mins" },
                { num: 6, title: "Designing Your Habit", duration: "7 mins" },
              ].map((lesson, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white text-[12px]">
                    {lesson.num}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-[14px]">{lesson.title}</p>
                    <p className="text-white/40 text-[12px]">{lesson.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-white/50 text-xs mt-4 tracking-wide">Programs</p>
        </div>

        {/* Phone 4: Now Playing */}
        <div className="relative">
          <div className={phoneFrameStyles + " relative"}>
            {/* Background */}
            <div className="absolute inset-0">
              <img src={nowPlayingBg} alt="Session" className="w-full h-full object-cover" />
            </div>
            
            {/* Heart */}
            <div className="absolute top-6 right-5">
              <Heart className="w-5 h-5 text-[#D97757] fill-[#D97757]" />
            </div>
            
            {/* Progress */}
            <div className="absolute bottom-20 left-0 right-0 px-6">
              <div className="h-0.5 bg-white/10 rounded-full mb-1.5">
                <div className="h-full w-2/5 bg-[#D97757] rounded-full" />
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 text-[9px]">4:12</span>
                <span className="text-white/40 text-[9px]">10:00</span>
              </div>
            </div>
            
            {/* Controls */}
            <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center">
              <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center">
                <Pause className="w-5 h-5 text-black" />
              </div>
            </div>
          </div>
          <p className="text-center text-white/50 text-xs mt-4 tracking-wide">Now Playing</p>
        </div>
      </div>
    </div>
  );
};

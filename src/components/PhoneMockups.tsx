import { CLOUD_IMAGES, getCloudImageUrl } from "@/lib/cloudImageUrls";
import { Heart, Pause, Play, Star } from "lucide-react";

// Shared phone frame styles
const phoneFrameStyles =
  "w-[280px] h-[560px] bg-black rounded-[28px] overflow-hidden shadow-[0_0_60px_rgba(230,219,199,0.4)] border border-white/20";
const nowPlayingBg = getCloudImageUrl(CLOUD_IMAGES.exploreAudioPlayer, { width: 600, quality: 80 });
const programHero = getCloudImageUrl(CLOUD_IMAGES.breathPresence, { width: 600, quality: 80 });
const categoryCalm = getCloudImageUrl(CLOUD_IMAGES.startHereButterfly, { width: 600, quality: 80 });
const reviewsBg = getCloudImageUrl(CLOUD_IMAGES.exploreTestimonials, { width: 600, quality: 80 });

const session1 = getCloudImageUrl(CLOUD_IMAGES.nsdr, { width: 600, quality: 80 }, "class-images");
const session2 = getCloudImageUrl(CLOUD_IMAGES.findingSteadyGround, { width: 600, quality: 80 }, "class-images");
const session3 = getCloudImageUrl(CLOUD_IMAGES.immediateRelief, { width: 600, quality: 80 }, "class-images");
const session4 = getCloudImageUrl(CLOUD_IMAGES.nervousSystemReset, { width: 600, quality: 80 });
const session5 = getCloudImageUrl(CLOUD_IMAGES.softeningTension, { width: 600, quality: 80 }, "class-images");

const stabaliseLesson1 = getCloudImageUrl(CLOUD_IMAGES.triangleBreathing, { width: 600, quality: 80 }, "class-images");
const stabaliseLesson2 = getCloudImageUrl(CLOUD_IMAGES.findingSteadyGround, { width: 600, quality: 80 }, "class-images");
const stabaliseLesson3 = getCloudImageUrl(CLOUD_IMAGES.nsdr, { width: 600, quality: 80 }, "class-images");
const stabaliseLesson4 = getCloudImageUrl(CLOUD_IMAGES.sleepTransition, { width: 600, quality: 80 }, "class-images");

const sessions = [
  { title: "NSDR: Gentle Reset", duration: "11 min", image: session1 },
  { title: "Finding Steady Ground", duration: "8 min", image: session2 },
  { title: "Physiological Sign for Immediate Relief", duration: "4 min", image: session3 },
  { title: "Gentle Nervous System Reset", duration: "8 min", image: session4 },
  { title: "Softening Tension", duration: "7 min", image: session5 },
];

const stabaliseLessons = [
  {
    num: 1,
    title: "Regulating with Triangle Breathing",
    duration: "3 mins",
    image: stabaliseLesson1,
  },
  { num: 2, title: "Finding Steady Ground", duration: "8 mins", image: stabaliseLesson2 },
  { num: 3, title: "NSDR: Gentle Reset", duration: "12 mins", image: stabaliseLesson3 },
  { num: 4, title: "Sleep Transition", duration: "5 mins", image: stabaliseLesson4 },
];

const openLessons = [{ num: 1, title: "Clear The Way", duration: "6 mins", image: categoryCalm }];

export const PhoneMockups = () => {
  return (
    <div className="mx-auto w-full max-w-[1800px] px-4 py-8">
      <div className="flex flex-wrap items-end justify-center gap-6 lg:flex-nowrap lg:gap-10 xl:gap-12">
        {/* Phone 1: Category Sessions */}
        <div className="relative">
          <div className={phoneFrameStyles}>
            {/* Hero */}
            <div className="relative h-48 overflow-hidden">
              <img src={categoryCalm} alt="Calm" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute bottom-4 left-6">
                <h3 className="font-editorial text-[26px] text-white">Calm & Restore</h3>
                <p className="text-[12px] text-white/60">10 sessions</p>
              </div>
            </div>

            {/* Sessions list */}
            <div className="space-y-3 px-6 py-4">
              {sessions.map((session, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 border-b border-white/5 py-2 last:border-0"
                >
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                    <img
                      src={session.image}
                      alt={session.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play className="h-4 w-4 fill-white text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-white">{session.title}</p>
                    <p className="text-[12px] text-white/40">{session.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-center text-xs tracking-wide text-white/50">Category</p>
        </div>

        {/* Phone 2: Reviews */}
        <div className="relative">
          <div className={phoneFrameStyles + " relative"}>
            {/* Background */}
            <div className="absolute inset-0">
              <img
                src={reviewsBg}
                alt=""
                className="h-full w-full scale-105 object-cover blur-[2px]"
              />
              <div className="absolute inset-0 bg-black/30" />
            </div>

            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[6px]" />

            {/* Content */}
            <div className="relative flex h-full flex-col items-center justify-center px-5 py-8">
              {[
                "It's like no other form of therapy I've experienced",
                "The most influential voice in helping me through a deeply personal bereavement",
                "I feel intense levels of relaxation and great for days afterwards",
              ].map((quote, i) => (
                <div key={i} className={`text-center ${i < 2 ? "mb-12" : ""}`}>
                  <div className="mb-3 flex justify-center gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-white text-white" />
                    ))}
                  </div>
                  <p className="text-[13px] italic leading-relaxed text-white">"{quote}"</p>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-center text-xs tracking-wide text-white/50">Reviews</p>
        </div>

        {/* Phone 3: Programs */}
        <div className="relative">
          <div className={phoneFrameStyles}>
            {/* Hero */}
            <div className="relative h-48 overflow-hidden">
              <img src={programHero} alt="Course" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute bottom-4 left-6">
                <h3 className="font-editorial text-[26px] text-white">Mental Detox</h3>
              </div>
            </div>

            {/* Lessons list */}
            <div className="space-y-3 px-6 py-4">
              <div>
                <p className="text-[12px] text-white/60">15 Days - 11 Lessons</p>
              </div>
              <p className="text-[12px] font-bold text-white/60">Stablise/Regulate/Restore</p>
              {stabaliseLessons.map((lesson, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                    <img
                      src={lesson.image}
                      alt={lesson.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play className="h-4 w-4 fill-white text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] text-white">{lesson.title}</p>
                    <p className="text-[12px] text-white/40">{lesson.duration}</p>
                  </div>
                </div>
              ))}

              <div>
                <p className="text-[12px] font-bold text-white/60">Open</p>
              </div>
              {openLessons.map((lesson, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                    <img
                      src={lesson.image}
                      alt={lesson.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play className="h-4 w-4 fill-white text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] text-white">{lesson.title}</p>
                    <p className="text-[12px] text-white/40">{lesson.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-center text-xs tracking-wide text-white/50">Programs</p>
        </div>

        {/* Phone 4: Now Playing */}
        <div className="relative">
          <div className={phoneFrameStyles + " relative"}>
            {/* Background */}
            <div className="absolute inset-0">
              <img src={nowPlayingBg} alt="Session" className="h-full w-full object-cover" />
            </div>

            {/* Heart */}
            <div className="absolute right-5 top-6">
              <Heart className="h-5 w-5 fill-[#D97757] text-[#D97757]" />
            </div>

            {/* Progress */}
            <div className="absolute bottom-20 left-0 right-0 px-6">
              <div className="mb-1.5 h-0.5 rounded-full bg-white/10">
                <div className="h-full w-2/5 rounded-full bg-[#D97757]" />
              </div>
              <div className="flex justify-between">
                <span className="text-[9px] text-white/40">4:12</span>
                <span className="text-[9px] text-white/40">10:00</span>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
                <Pause className="h-5 w-5 text-black" />
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-xs tracking-wide text-white/50">Now Playing</p>
        </div>
      </div>
    </div>
  );
};

import startHereButterfly from "@/assets/start-here-butterfly.jpg";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/OptimizedImage";
import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/supabaseImageOptimization";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useFeaturedSession } from "./hooks/useFeaturedSession";
import CourseCard from "./components/CourseCard";
import { LiveSessionsData } from "./types";

interface HomeTabProps {
  liveSessionsData: LiveSessionsData;
  hasSubscription: boolean;
  isAdmin: boolean;
  isTestUser: boolean;
  onSubscriptionRequired: () => void;
  onSessionClick: (id: string) => void;
}

const HomeTab = ({
  liveSessionsData,
  hasSubscription,
  isAdmin,
  isTestUser,
  onSubscriptionRequired,
  onSessionClick,
}: HomeTabProps) => {
  const navigate = useNavigate();
  const { featuredSession } = useFeaturedSession();

  const handleLiveCardClick = (path: string) => {
    if (!hasSubscription && !isAdmin && !isTestUser) {
      onSubscriptionRequired();
    } else {
      navigate(path);
    }
  };

  return (
    <div className="space-y-16 pt-8 md:pt-[150px]">
      {/* Start Here — Your First Two Weeks */}
      <section>
        <h2 className="text-2xl md:text-3xl font-medium text-[#E6DBC7] tracking-wide mb-2">
          Start Here — Your First Two Weeks
        </h2>
        <p className="text-base md:text-lg font-light text-[#E6DBC7]/60 mb-10">
          A gentle way to arrive — nothing to keep up with.
        </p>

        <Link
          to="/online/start-here"
          className="block relative h-[380px] md:h-[400px] overflow-hidden rounded-2xl border border-[#E6DBC7]/15 shadow-[0_0_40px_rgba(230,219,199,0.15)] cursor-pointer group hover:border-[#E6DBC7]/25 transition-all"
        >
          <OptimizedImage
            src={startHereButterfly}
            alt="A Simple Place to Begin"
            className="absolute inset-0 w-full h-full object-cover object-center"
            optimizationOptions={IMAGE_PRESETS.hero}
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/40 to-transparent md:from-background/40 md:via-transparent md:to-transparent" />

          <div className="absolute inset-0 md:relative md:h-full flex flex-col md:flex-row rounded-2xl">
            <div className="hidden md:block md:w-[45%] relative rounded-l-2xl overflow-hidden">
              <OptimizedImage
                src={startHereButterfly}
                alt="Begin gently"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: 'center' }}
                optimizationOptions={IMAGE_PRESETS.card}
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0 md:relative md:h-full flex flex-col md:justify-center px-6 py-6 md:w-[55%] md:px-10 md:py-8 md:border-l border-white/5 rounded-2xl md:rounded-r-2xl md:rounded-l-none md:backdrop-blur-2xl md:bg-black/10">
              <h3 className="font-editorial text-2xl md:text-3xl lg:text-4xl font-light tracking-tight mb-3 text-[#E6DBC7] leading-tight">
                A Simple Place to Begin
              </h3>
              <p className="text-xs md:text-sm text-[#D4A574] font-light tracking-[0.2em] mb-4 md:mb-5 uppercase">
                Your First Two Weeks
              </p>
              <p className="text-sm md:text-base font-light text-[#E6DBC7]/80 mb-6 leading-relaxed max-w-2xl">
                This space is designed to help you arrive gently and find your footing — without pressure or expectation.
              </p>
              <Button className="bg-transparent text-[#E6DBC7] border border-[#E6DBC7]/60 hover:bg-white/5 hover:border-[#E6DBC7] transition-all font-light px-12 py-3 rounded-full text-sm md:text-base w-fit">
                Begin gently
              </Button>
            </div>
          </div>
        </Link>
      </section>

      {/* Featured This Week */}
      {featuredSession && (
        <section className="pt-24">
          <h2 className="text-2xl md:text-3xl font-medium text-[#E6DBC7] tracking-wide mb-2">
            A Place to Land This Week
          </h2>
          <p className="text-base md:text-lg font-light text-[#E6DBC7]/60 mb-10">
            One gentle practice — that's enough.
          </p>

          <div
            onClick={() => {
              if (!featuredSession.id) {
                toast.error("Unable to load session");
                return;
              }
              onSessionClick(featuredSession.id);
            }}
            className="group cursor-pointer overflow-hidden rounded-xl border border-[#E6DBC7]/20 transition-all shadow-[0_8px_30px_rgba(230,219,199,0.1)]"
          >
            <div className="flex h-[140px] md:h-[160px] lg:h-[180px]">
              <div
                className="relative w-[140px] md:w-[200px] lg:w-[240px] h-full flex-shrink-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('${getOptimizedImageUrl(featuredSession.image_url, IMAGE_PRESETS.card)}')`,
                }}
              >
                <div className="absolute inset-0 bg-black/0" />
              </div>

              <div className="flex-1 flex items-center justify-between gap-4 px-6 md:px-10 py-6 backdrop-blur-xl bg-black/30 border-l border-white/5">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-editorial text-[#E6DBC7] mb-2">
                    {featuredSession.title}
                  </h3>
                  <p className="text-sm md:text-base text-[#E6DBC7]/60 font-light mb-3 leading-relaxed line-clamp-2">
                    {featuredSession.short_description || featuredSession.description}
                  </p>
                  <p className="text-xs md:text-sm text-[#E6DBC7]/40 font-light">
                    {featuredSession.teacher_name} • {featuredSession.duration_minutes} min
                  </p>
                </div>

                <div className="flex-shrink-0">
                  <div className="w-11 h-11 md:w-14 md:h-14 rounded-full border border-[#E6DBC7]/50 flex items-center justify-center transition-all bg-[#E6DBC7]/10">
                    <svg className="w-5 h-5 text-[#E6DBC7] transition-all ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Live Rhythm */}
      <section className="pt-24">
        <h2 className="text-2xl md:text-3xl font-medium text-[#E6DBC7] tracking-wide mb-2">
          Live Rhythm
        </h2>
        <p className="text-base md:text-lg font-light text-[#E6DBC7]/60 mb-10">
          Nothing to keep up with. Just somewhere to come back to.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <CourseCard
            title={liveSessionsData.weeklyReset.title}
            subtitle={liveSessionsData.weeklyReset.subtitle}
            description={liveSessionsData.weeklyReset.description}
            image={liveSessionsData.weeklyReset.image}
            badge={liveSessionsData.weeklyReset.isLive ? "Live Now" : undefined}
            imagePosition="center 70%"
            onClick={() => handleLiveCardClick('/online/live/weekly-reset')}
          />
          <CourseCard
            title={liveSessionsData.monthlyPresence.title}
            subtitle={liveSessionsData.monthlyPresence.subtitle}
            description={liveSessionsData.monthlyPresence.description}
            image={liveSessionsData.monthlyPresence.image}
            badge={liveSessionsData.monthlyPresence.isLive ? "Live Now" : undefined}
            onClick={() => handleLiveCardClick('/online/live/monthly-presence')}
          />
          <CourseCard
            title={liveSessionsData.guestSession.title}
            subtitle={liveSessionsData.guestSession.subtitle}
            description={liveSessionsData.guestSession.description}
            image={liveSessionsData.guestSession.image}
            badge={liveSessionsData.guestSession.isLive ? "Live Now" : undefined}
            imagePosition="center bottom"
            onClick={() => handleLiveCardClick('/online/live/guest-session')}
          />
        </div>
      </section>
    </div>
  );
};

export default HomeTab;

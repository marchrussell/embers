import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useFeaturedSession } from "./hooks/useFeaturedSession";
import CourseCard from "./components/CourseCard";
import StartHereCard from "./components/StartHereCard";
import SessionPlayCard from "./components/SessionPlayCard";
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
        <StartHereCard />
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
          <SessionPlayCard
            title={featuredSession.title}
            description={featuredSession.short_description || featuredSession.description || ''}
            meta={`${featuredSession.teacher_name} • ${featuredSession.duration_minutes} min`}
            imageUrl={featuredSession.image_url}
            onClick={() => {
              if (!featuredSession.id) {
                toast.error("Unable to load session");
                return;
              }
              onSessionClick(featuredSession.id);
            }}
          />
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

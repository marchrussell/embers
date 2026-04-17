import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import liveSessionCountdownBg from "@/assets/live-session-countdown-bg.png";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import OnlineFooter from "@/components/OnlineFooter";
import OnlineHeader from "@/components/OnlineHeader";
import { Button } from "@/components/ui/button";
import { LiveSessionConfig, useLiveSessionConfigs } from "@/hooks/useLiveSessionConfigs";
import {
  LiveSessionEnrichment,
  useNextLiveSessionDetails,
} from "@/hooks/useNextLiveSessionDetails";
import { supabase } from "@/integrations/supabase/client";
import { CLOUD_IMAGES, experienceImages, getCloudImageUrl } from "@/lib/cloudImageUrls";
import {
  formatGuestSessionDate,
  getNextDateFromConfig,
  parseUTCDateForDisplay,
} from "@/lib/experienceDateUtils";

const guestSessionImg = experienceImages.guestSession;
const monthlyPresenceImg = experienceImages.monthlyBreathOnline;
const weeklyResetImg = experienceImages.weeklyReset;

const marchPortrait = getCloudImageUrl(CLOUD_IMAGES.march);

// Fallback images keyed by session_type slug
const SESSION_TYPE_IMAGES: Record<string, string> = {
  "weekly-reset": weeklyResetImg,
  "monthly-presence": monthlyPresenceImg,
  "guest-session": guestSessionImg,
};

const DEFAULT_WHAT_TO_EXPECT = [
  "A guided, voice-led practice",
  "You can sit, lie down, or simply listen",
  "Camera and microphone are not used",
  "You're welcome to arrive late or leave early",
];

interface SessionDisplay {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  nextDate: string;
  teacher: string;
  teacherTitle?: string;
  teacherImage?: string;
  duration: string;
  time: string;
  whatToExpect?: string[];
}

function buildSessionDisplay(
  config: LiveSessionConfig,
  enrichment: LiveSessionEnrichment | null,
  nextDateObj: Date | null
): SessionDisplay {
  const fallbackImage = SESSION_TYPE_IMAGES[config.session_type] ?? guestSessionImg;

  const computedNextDate = (() => {
    if (enrichment?.session_date) {
      return formatGuestSessionDate(parseUTCDateForDisplay(enrichment.session_date));
    }
    return nextDateObj ? formatGuestSessionDate(nextDateObj) : "";
  })();

  const time = config.time ? `${config.time} ${config.timezone}` : "";
  const duration = config.duration ?? "";

  if (enrichment) {
    return {
      title: enrichment.session_title || config.title,
      subtitle: config.recurrence_label ?? "",
      description: enrichment.short_description || config.subtitle,
      image: enrichment.photo_url || fallbackImage,
      nextDate: computedNextDate,
      teacher: enrichment.name ?? "March",
      teacherTitle: enrichment.title ?? undefined,
      teacherImage: enrichment.photo_url ?? undefined,
      duration,
      time,
      whatToExpect: enrichment.what_to_expect ?? undefined,
    };
  }

  return {
    title: config.title,
    subtitle: config.recurrence_label ?? "",
    description: config.subtitle ?? "",
    image: fallbackImage,
    nextDate: computedNextDate,
    teacher: config.session_type === "guest-session" ? "Guest Teacher" : "March",
    duration,
    time,
  };
}

const LiveSession = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const { data: configs = [], isLoading: configsLoading } = useLiveSessionConfigs();
  const { data: enrichment = null, isLoading: detailsLoading } = useNextLiveSessionDetails(
    sessionId!
  );

  // Poll for a currently-live session of this type so we can link the Join button
  const { data: liveSession } = useQuery({
    queryKey: ["live-session-active", sessionId],
    queryFn: async () => {
      const { data } = await supabase
        .from("live_sessions")
        .select("id, status")
        .eq("session_type", sessionId!)
        .eq("status", "live")
        .order("start_time", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    refetchInterval: 15_000,
    enabled: !!sessionId,
  });

  const config = configs.find((c) => c.session_type === sessionId) ?? null;

  const isLoading = configsLoading || detailsLoading;

  const nextDateObj = config ? getNextDateFromConfig(config) : null;

  const session: SessionDisplay | null = config
    ? buildSessionDisplay(config, enrichment, nextDateObj)
    : null;

    console.log('LiveSession render - session: ', session, 'liveSession: ', liveSession, 'enrichment: ', enrichment, 'config: ', config);

  // Calculate countdown to next session
  useEffect(() => {
    if (!config) return;

    const calculateCountdown = () => {
      let targetDate: Date | null = null;

      if (enrichment?.session_date) {
        targetDate = new Date(enrichment.session_date);
      } else {
        targetDate = getNextDateFromConfig(config);
      }

      if (!targetDate) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const diff = targetDate.getTime() - Date.now();

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [config, enrichment]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-[#E6DBC7]/50">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-[#E6DBC7]">Session not found</p>
      </div>
    );
  }

  const isLive = !!liveSession;
  const teacherImage =
    session.teacherImage || (sessionId === "guest-session" ? session.image : marchPortrait);
  const whatToExpectItems = session.whatToExpect || DEFAULT_WHAT_TO_EXPECT;

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <OnlineHeader />

      {/* Hero Section - matches StartHere layout */}
      <div className="relative z-10 mt-[340px] h-[500px] md:mt-[380px]">
        <img
          src={session.image}
          alt={session.title}
          className="absolute inset-0 h-full w-full object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

        <div className="relative flex h-full items-end justify-center px-6 pb-14 md:px-10 lg:px-12">
          <div className="text-center">
            <p className="mb-3 text-sm font-light uppercase tracking-[0.15em] text-[#D4A574]">
              {session.subtitle}
            </p>
            <h1 className="font-editorial text-5xl text-[#E6DBC7] md:text-6xl">{session.title}</h1>
          </div>
        </div>
      </div>

      {/* Meta info - between title and description */}
      <div className="flex items-center justify-center gap-8 px-6 pb-6 pt-10 text-base text-[#E6DBC7]/60">
        <span className="flex items-center gap-3">
          <Clock className="h-5 w-5" />
          {session.duration}
        </span>
        <span className="flex items-center gap-3">
          <Calendar className="h-5 w-5" />
          {session.nextDate} at {session.time}
        </span>
      </div>

      {/* Description - italic editorial style like category pages */}
      <div className="px-6 pb-16 pt-6 md:px-10 lg:px-12">
        <p className="mx-auto max-w-4xl text-center font-editorial text-xl italic leading-relaxed text-[#E6DBC7]/70 md:text-2xl lg:text-3xl">
          {session.description}
        </p>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-24 md:px-10 lg:px-12">
        <div className="mx-auto max-w-4xl">
          {/* Facilitator and What to expect - connected layout */}
          <div className="mb-36 mt-32 flex flex-col overflow-hidden rounded-2xl md:flex-row">
            {/* Image on the left - height determined by content */}
            <div className="relative flex-shrink-0 overflow-hidden rounded-l-2xl border-b border-l border-t border-[#E6DBC7]/20 md:w-1/2 md:border-r-0">
              <img
                src={teacherImage}
                alt={session.teacher}
                className="h-80 w-full object-cover object-[center_40%] md:absolute md:inset-0 md:h-full"
              />
            </div>

            {/* What to expect box on the right - black background with border on 3 sides */}
            <div className="flex flex-col justify-center border-b border-r border-t border-[#E6DBC7]/20 bg-black p-8 md:w-1/2 md:rounded-r-2xl md:border-l-0 md:p-10">
              <div>
                <h3 className="mb-2 font-editorial text-2xl text-[#E6DBC7] md:text-3xl">
                  What to expect
                </h3>
                <p className="mb-6 text-xs font-light uppercase tracking-[0.15em] text-[#D4A574]">
                  Held live by {session.teacher}
                </p>
                <ul className="space-y-3 text-sm font-light text-[#E6DBC7]/70">
                  {whatToExpectItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-0.5 text-[#E6DBC7]/40">–</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Countdown / Status Box - video container size with 16:9 aspect ratio */}
        <div>
          <div className="relative mx-auto flex aspect-[16/9] max-w-6xl items-center justify-center overflow-hidden rounded-2xl border border-[#E6DBC7]/10">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-[length:100%_100%] bg-center"
              style={{ backgroundImage: `url('${liveSessionCountdownBg}')` }}
            />
            {/* Glassmorphism Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            {isLive ? (
              <div className="relative z-10 p-8 text-center">
                <div className="mb-6 flex items-center justify-center gap-3">
                  <Video className="h-6 w-6 animate-pulse text-red-500" />
                  <span className="font-editorial text-xl text-[#E6DBC7] md:text-2xl">
                    We're Live
                  </span>
                </div>
                <p className="mb-8 font-light text-[#E6DBC7]/70">
                  The session is open now. Join when you're ready.
                </p>
                <Button
                  className="rounded-full bg-[#E6DBC7] px-12 py-6 text-base font-medium text-[#1A1A1A] hover:bg-[#E6DBC7]/90"
                  onClick={() => window.open(`/live/${liveSession!.id}`, "_blank")}
                >
                  Join Live Session
                </Button>
              </div>
            ) : (
              <div className="relative z-10 p-8 text-center">
                <p className="mb-6 font-light text-[#E6DBC7]/40">Next live gathering begins in</p>

                {/* Countdown */}
                <div className="mb-12 flex items-center justify-center gap-4 md:gap-8">
                  <div className="text-center">
                    <div className="mb-1 font-editorial text-4xl text-[#E6DBC7] md:text-5xl lg:text-6xl">
                      {String(countdown.days).padStart(2, "0")}
                    </div>
                    <p className="text-xs font-light uppercase tracking-wider text-[#E6DBC7]/40">
                      Days
                    </p>
                  </div>
                  <span className="text-2xl text-[#E6DBC7]/30 md:text-3xl">:</span>
                  <div className="text-center">
                    <div className="mb-1 font-editorial text-4xl text-[#E6DBC7] md:text-5xl lg:text-6xl">
                      {String(countdown.hours).padStart(2, "0")}
                    </div>
                    <p className="text-xs font-light uppercase tracking-wider text-[#E6DBC7]/40">
                      Hours
                    </p>
                  </div>
                  <span className="text-2xl text-[#E6DBC7]/30 md:text-3xl">:</span>
                  <div className="text-center">
                    <div className="mb-1 font-editorial text-4xl text-[#E6DBC7] md:text-5xl lg:text-6xl">
                      {String(countdown.minutes).padStart(2, "0")}
                    </div>
                    <p className="text-xs font-light uppercase tracking-wider text-[#E6DBC7]/40">
                      Mins
                    </p>
                  </div>
                  <span className="text-2xl text-[#E6DBC7]/30 md:text-3xl">:</span>
                  <div className="text-center">
                    <div className="mb-1 font-editorial text-4xl text-[#E6DBC7] md:text-5xl lg:text-6xl">
                      {String(countdown.seconds).padStart(2, "0")}
                    </div>
                    <p className="text-xs font-light uppercase tracking-wider text-[#E6DBC7]/40">
                      Secs
                    </p>
                  </div>
                </div>

                <p className="font-light text-[#E6DBC7]/40">
                  {session.nextDate} at {session.time}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="block md:hidden">
        <OnlineFooter />
      </div>
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

export default LiveSession;

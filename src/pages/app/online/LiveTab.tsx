import { ChevronLeft, ChevronRight, Play, Video } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import guestSessionBg from "@/assets/guest-session-bg.png";
import heroHandsSession from "@/assets/hero-hands-session.png";
import weeklyResetEvent from "@/assets/weekly-reset-event.jpg";
import { IconButton } from "@/components/ui/icon-button";
import {
  CalendarEvent,
  downloadICalFile,
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
} from "@/lib/calendarUtils";

import LiveProgramCard from "./components/LiveProgramCard";
import { AVAILABILITY_DAYS, useLiveReplays } from "./hooks/useLiveReplays";
import { LiveReplay, LiveSessionsData } from "./types";

interface LiveTabProps {
  liveSessionsData: LiveSessionsData;
  hasSubscription: boolean;
  isAdmin: boolean;
  isTestUser: boolean;
  onSubscriptionRequired: () => void;
}

const formatReplayDate = (replay: LiveReplay): string => {
  const start = new Date(replay.start_time);
  const dateStr = start.toLocaleDateString("en-GB", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  if (replay.end_time) {
    const mins = Math.round((new Date(replay.end_time).getTime() - start.getTime()) / 60000);
    return `${dateStr} • ${mins} mins`;
  }
  return dateStr;
};

const formatAvailability = (sessionType: LiveReplay["session_type"]): string => {
  const days = AVAILABILITY_DAYS[sessionType];
  return days === null ? "Available forever" : `Available ${days} days`;
};

const LiveTab = ({
  liveSessionsData,
  hasSubscription,
  isAdmin,
  isTestUser,
  onSubscriptionRequired,
}: LiveTabProps) => {
  const navigate = useNavigate();
  const [openCalendarId, setOpenCalendarId] = useState<string | null>(null);
  const { data: replays = [] } = useLiveReplays();

  const latestWeeklyReplay = replays.find((r) => r.session_type === "weekly-reset");
  const latestMonthlyReplay = replays.find((r) => r.session_type === "monthly-presence");
  const guestReplays = replays.filter((r) => r.session_type === "guest-session");

  const handleCardClick = (path: string) => {
    if (!hasSubscription && !isAdmin && !isTestUser) {
      onSubscriptionRequired();
    } else {
      navigate(path);
    }
  };

  const getCalendarEvent = (sessionKey: string): CalendarEvent => {
    const session = liveSessionsData[sessionKey as keyof typeof liveSessionsData];
    const now = new Date();

    const timeMatch = session.subtitle.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    let hours = 19,
      minutes = 0;
    if (timeMatch) {
      hours = parseInt(timeMatch[1]);
      minutes = parseInt(timeMatch[2]);
      if (timeMatch[3].toUpperCase() === "PM" && hours !== 12) hours += 12;
      if (timeMatch[3].toUpperCase() === "AM" && hours === 12) hours = 0;
    }

    const startDate = new Date(now);
    startDate.setHours(hours, minutes, 0, 0);
    if (startDate < now) startDate.setDate(startDate.getDate() + 7);

    const duration = sessionKey === "weeklyReset" ? 30 : sessionKey === "monthlyPresence" ? 90 : 60;
    const endDate = new Date(startDate.getTime() + duration * 60000);

    return {
      title: session.title,
      description: `${session.description}\n\nSession with March Russell`,
      location: "Online",
      startDate,
      endDate,
    };
  };

  const handleDownloadICal = (sessionKey: string) => {
    const event = getCalendarEvent(sessionKey);
    downloadICalFile(event, event.title.replace(/\s+/g, "-").toLowerCase());
    setOpenCalendarId(null);
  };

  const handleGoogleCalendar = (sessionKey: string) => {
    window.open(getGoogleCalendarUrl(getCalendarEvent(sessionKey)), "_blank");
    setOpenCalendarId(null);
  };

  const handleOutlookCalendar = (sessionKey: string) => {
    window.open(getOutlookCalendarUrl(getCalendarEvent(sessionKey)), "_blank");
    setOpenCalendarId(null);
  };

  const handleShare = (sessionKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const session = liveSessionsData[sessionKey as keyof typeof liveSessionsData];
    const shareUrl = `${window.location.origin}/online?tab=live`;
    const shareText = `Join March Russell for ${session.title} - ${session.description}`;

    if (navigator.share) {
      navigator.share({ title: session.title, text: shareText, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div className="pb-24 pt-8 md:pt-[150px]">
      <div>
        <h2 className="mb-2 text-2xl font-medium tracking-wide text-[#E6DBC7] md:text-3xl">
          Live Rhythm
        </h2>
        <p className="mb-10 text-base font-light text-[#E6DBC7]/60 md:text-lg">
          Regular moments to pause, regulate, and reconnect — together.
        </p>
      </div>

      <div className="space-y-9 md:space-y-10 lg:space-y-12">
        <LiveProgramCard
          sessionKey="weeklyReset"
          data={liveSessionsData.weeklyReset}
          onClick={() => handleCardClick("/online/live/weekly-reset")}
          onShare={(e) => handleShare("weeklyReset", e)}
          onDownloadICal={(e) => {
            e.stopPropagation();
            handleDownloadICal("weeklyReset");
          }}
          onGoogleCalendar={(e) => {
            e.stopPropagation();
            handleGoogleCalendar("weeklyReset");
          }}
          onOutlookCalendar={(e) => {
            e.stopPropagation();
            handleOutlookCalendar("weeklyReset");
          }}
          isCalendarOpen={openCalendarId === "weeklyReset"}
          onCalendarOpenChange={(open) => setOpenCalendarId(open ? "weeklyReset" : null)}
        />

        <LiveProgramCard
          sessionKey="monthlyPresence"
          data={liveSessionsData.monthlyPresence}
          onClick={() => handleCardClick("/online/live/monthly-presence")}
          onShare={(e) => handleShare("monthlyPresence", e)}
          onDownloadICal={(e) => {
            e.stopPropagation();
            handleDownloadICal("monthlyPresence");
          }}
          onGoogleCalendar={(e) => {
            e.stopPropagation();
            handleGoogleCalendar("monthlyPresence");
          }}
          onOutlookCalendar={(e) => {
            e.stopPropagation();
            handleOutlookCalendar("monthlyPresence");
          }}
          isCalendarOpen={openCalendarId === "monthlyPresence"}
          onCalendarOpenChange={(open) => setOpenCalendarId(open ? "monthlyPresence" : null)}
        />

        <LiveProgramCard
          sessionKey="guestSession"
          data={liveSessionsData.guestSession}
          onClick={() => handleCardClick("/online/live/guest-session")}
          onShare={(e) => handleShare("guestSession", e)}
          onDownloadICal={(e) => {
            e.stopPropagation();
            handleDownloadICal("guestSession");
          }}
          onGoogleCalendar={(e) => {
            e.stopPropagation();
            handleGoogleCalendar("guestSession");
          }}
          onOutlookCalendar={(e) => {
            e.stopPropagation();
            handleOutlookCalendar("guestSession");
          }}
          isCalendarOpen={openCalendarId === "guestSession"}
          onCalendarOpenChange={(open) => setOpenCalendarId(open ? "guestSession" : null)}
          imageObjectPosition="bottom"
        />

        {/* Live Replays Section */}
        <div className="mt-40">
          <div className="my-10">
            <h2 className="mb-2 text-2xl font-medium tracking-wide text-[#E6DBC7] md:text-3xl">
              Live Replays
            </h2>
            <p className="text-base font-light text-[#E6DBC7]/60 md:text-lg">
              Catch up on sessions you may have missed
            </p>
          </div>

          {/* Weekly Reset & Monthly Presence Replays */}
          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            <ReplayBox
              image={weeklyResetEvent}
              alt="Weekly Reset Replay"
              availability={formatAvailability("weekly-reset")}
              category="Weekly Reset"
              date={latestWeeklyReplay ? formatReplayDate(latestWeeklyReplay) : null}
              onClick={
                latestWeeklyReplay
                  ? () => window.open(latestWeeklyReplay.recording_url, "_blank")
                  : undefined
              }
            />
            <ReplayBox
              image={heroHandsSession}
              alt="Monthly Presence Replay"
              availability={formatAvailability("monthly-presence")}
              category="Monthly Breath & Presence"
              date={latestMonthlyReplay ? formatReplayDate(latestMonthlyReplay) : null}
              onClick={
                latestMonthlyReplay
                  ? () => window.open(latestMonthlyReplay.recording_url, "_blank")
                  : undefined
              }
            />
          </div>

          {/* Guest Teacher Replays */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-[0.15em] text-[#D4A574]">
                  Guest Teacher Replays
                </p>
                <p className="text-sm font-light text-[#E6DBC7]/50">Available forever</p>
              </div>
              <div className="flex items-center gap-3">
                <IconButton>
                  <ChevronLeft />
                </IconButton>
                <IconButton>
                  <ChevronRight />
                </IconButton>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {guestReplays.length > 0 ? (
                guestReplays
                  .slice(0, 3)
                  .map((replay) => <GuestReplayCard key={replay.id} replay={replay} />)
              ) : (
                <GuestReplayComingSoon />
              )}

              {/* Fill remaining slots with placeholders */}
              {guestReplays.length > 0 &&
                guestReplays.length < 3 &&
                Array.from({ length: 3 - Math.min(guestReplays.length, 3) }).map((_, i) => (
                  <div
                    key={`placeholder-${i}`}
                    className="group relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#E6DBC7]/15 bg-black/20"
                  >
                    <p className="px-6 text-center text-sm font-light text-[#E6DBC7]/30">
                      More guest sessions coming soon
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ReplayBoxProps {
  image: string;
  alt: string;
  availability: string;
  category: string;
  date: string | null;
  onClick?: () => void;
}

const ReplayBox = ({ image, alt, availability, category, date, onClick }: ReplayBoxProps) => {
  const hasReplay = !!onClick;
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-[#E6DBC7]/15 bg-black/40 transition-colors duration-500 ${hasReplay ? "cursor-pointer hover:border-[#E6DBC7]/30" : "cursor-default opacity-60"}`}
      onClick={hasReplay ? onClick : undefined}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-[#E6DBC7]/10 px-3 py-1.5 backdrop-blur-sm">
          <Video className="h-3.5 w-3.5 text-[#E6DBC7]" />
          <span className="text-xs font-medium text-[#E6DBC7]">{availability}</span>
        </div>
        {hasReplay && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full bg-[#E6DBC7]/20 backdrop-blur-sm ${hasReplay ? "group-hover:bg-[#E6DBC7]/30" : ""} transition-colors duration-300`}
            >
              <Play className="ml-1 h-6 w-6 text-[#E6DBC7]" fill="currentColor" />
            </div>
          </div>
        )}
      </div>
      <div className="p-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-[#D4A574]">
          {category}
        </p>
        <h3 className="mb-1 font-editorial text-lg text-[#E6DBC7]">Latest Session Replay</h3>
        {date ? (
          <p className="text-xs font-light text-[#E6DBC7]/50">{date}</p>
        ) : (
          <p className="text-xs font-light italic text-[#E6DBC7]/30">No replay available yet</p>
        )}
      </div>
    </div>
  );
};

const GuestReplayCard = ({ replay }: { replay: LiveReplay }) => (
  <div
    className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#E6DBC7]/15 bg-black/40 transition-colors duration-500 hover:border-[#E6DBC7]/30"
    onClick={() => window.open(replay.recording_url, "_blank")}
  >
    <div className="relative h-44 overflow-hidden">
      <img
        src={replay.teacher_photo || guestSessionBg}
        alt={replay.title}
        className="absolute inset-0 h-full w-full object-cover object-bottom"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E6DBC7]/20 backdrop-blur-sm">
          <Play className="ml-0.5 h-5 w-5 text-[#E6DBC7]" fill="currentColor" />
        </div>
      </div>
    </div>
    <div className="p-5">
      {replay.teacher_name && (
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.15em] text-[#D4A574]">
          {replay.teacher_name}
        </p>
      )}
      <h3 className="mb-1 font-editorial text-base leading-tight text-[#E6DBC7]">{replay.title}</h3>
      <p className="text-xs font-light text-[#E6DBC7]/50">{formatReplayDate(replay)}</p>
    </div>
  </div>
);

const GuestReplayComingSoon = () => (
  <>
    <div className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#E6DBC7]/15 bg-black/40 transition-colors duration-500 hover:border-[#E6DBC7]/30">
      <div className="relative h-44 overflow-hidden">
        <img
          src={guestSessionBg}
          alt="Guest Session"
          className="absolute inset-0 h-full w-full object-cover object-bottom"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        {/* <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-[#E6DBC7]/20 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-5 h-5 text-[#E6DBC7] ml-0.5" fill="currentColor" />
          </div>
        </div> */}
      </div>
      <div className="p-5">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.15em] text-[#D4A574]">
          Coming Soon
        </p>
        <h3 className="mb-1 font-editorial text-base leading-tight text-[#E6DBC7]">
          Guest Teacher Session
        </h3>
        <p className="text-xs font-light text-[#E6DBC7]/50">First session coming January 2025</p>
      </div>
    </div>

    <div className="group relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#E6DBC7]/15 bg-black/20">
      <p className="px-6 text-center text-sm font-light text-[#E6DBC7]/30">
        More guest sessions coming soon
      </p>
    </div>

    <div className="group relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[#E6DBC7]/15 bg-black/20">
      <p className="px-6 text-center text-sm font-light text-[#E6DBC7]/30">
        More guest sessions coming soon
      </p>
    </div>
  </>
);

export default LiveTab;

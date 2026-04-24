import { ChevronLeft, ChevronRight, Play, Video } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { RecordingModal } from "@/components/RecordingModal";
import { IconButton } from "@/components/ui/icon-button";
import {
  CalendarEvent,
  downloadICalFile,
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
} from "@/lib/calendarUtils";
import { experienceImages } from "@/lib/cloudImageUrls";

import LiveProgramCard from "./components/LiveProgramCard";
import { AVAILABILITY_DAYS, useLiveReplays } from "./hooks/useLiveReplays";
import { LiveReplay, LiveSessionCardData } from "./types";

const guestSessionImg = experienceImages.guestSession;
const monthlyPresenceImg = experienceImages.monthlyBreathOnline;
const weeklyResetImg = experienceImages.weeklyReset;

interface LiveTabProps {
  liveSessionsData: LiveSessionCardData[];
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
  const [activeRecording, setActiveRecording] = useState<{ url: string; title: string } | null>(
    null
  );
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

  const getCalendarEvent = (session: LiveSessionCardData): CalendarEvent => {
    const now = new Date();
    const [hours, minutes] = (session.time ?? "19:00").split(":").map(Number);

    const startDate = new Date(now);
    startDate.setHours(hours, minutes, 0, 0);
    if (startDate < now) startDate.setDate(startDate.getDate() + 7);

    const endDate = new Date(startDate.getTime() + session.durationMinutes * 60000);

    return {
      title: session.title,
      description: `${session.description}\n\nSession with ${session.teacherName}`,
      location: "Online",
      startDate,
      endDate,
    };
  };

  const handleDownloadICal = (session: LiveSessionCardData) => {
    const event = getCalendarEvent(session);
    downloadICalFile(event, event.title.replace(/\s+/g, "-").toLowerCase());
    setOpenCalendarId(null);
  };

  const handleGoogleCalendar = (session: LiveSessionCardData) => {
    window.open(getGoogleCalendarUrl(getCalendarEvent(session)), "_blank");
    setOpenCalendarId(null);
  };

  const handleOutlookCalendar = (session: LiveSessionCardData) => {
    window.open(getOutlookCalendarUrl(getCalendarEvent(session)), "_blank");
    setOpenCalendarId(null);
  };

  const handleShare = (session: LiveSessionCardData, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/online?tab=live`;
    const shareText = `Join ${session.teacherName} for ${session.title} - ${session.description}`;

    if (navigator.share) {
      navigator.share({ title: session.title, text: shareText, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
    }
  };

  console.log('Rendering LiveTab with sessions: ', liveSessionsData);

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
        {liveSessionsData.map((session) => (
          <LiveProgramCard
            key={session.sessionType}
            sessionKey={session.sessionType}
            data={session}
            onClick={() => handleCardClick(`/online/live/${session.sessionType}`)}
            onShare={(e) => handleShare(session, e)}
            onDownloadICal={(e) => {
              e.stopPropagation();
              handleDownloadICal(session);
            }}
            onGoogleCalendar={(e) => {
              e.stopPropagation();
              handleGoogleCalendar(session);
            }}
            onOutlookCalendar={(e) => {
              e.stopPropagation();
              handleOutlookCalendar(session);
            }}
            isCalendarOpen={openCalendarId === session.sessionType}
            onCalendarOpenChange={(open) => setOpenCalendarId(open ? session.sessionType : null)}
          />
        ))}

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
              image={weeklyResetImg}
              alt="Weekly Reset Replay"
              availability={formatAvailability("weekly-reset")}
              category="Weekly Reset"
              date={latestWeeklyReplay ? formatReplayDate(latestWeeklyReplay) : null}
              onClick={
                latestWeeklyReplay
                  ? () =>
                      setActiveRecording({
                        url: latestWeeklyReplay.recording_url,
                        title: "Weekly Reset",
                      })
                  : undefined
              }
            />
            <ReplayBox
              image={monthlyPresenceImg}
              alt="Monthly Presence Replay"
              availability={formatAvailability("monthly-presence")}
              category="Monthly Breath & Presence"
              date={latestMonthlyReplay ? formatReplayDate(latestMonthlyReplay) : null}
              onClick={
                latestMonthlyReplay
                  ? () =>
                      setActiveRecording({
                        url: latestMonthlyReplay.recording_url,
                        title: "Monthly Breath & Presence",
                      })
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
                  .map((replay) => (
                    <GuestReplayCard
                      key={replay.id}
                      replay={replay}
                      onPlay={() =>
                        setActiveRecording({ url: replay.recording_url, title: replay.title })
                      }
                    />
                  ))
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
      <RecordingModal recording={activeRecording} onClose={() => setActiveRecording(null)} />
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

const GuestReplayCard = ({ replay, onPlay }: { replay: LiveReplay; onPlay: () => void }) => (
  <div
    className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#E6DBC7]/15 bg-black/40 transition-colors duration-500 hover:border-[#E6DBC7]/30"
    onClick={onPlay}
  >
    <div className="relative h-44 overflow-hidden">
      <img
        src={replay.teacher_photo || guestSessionImg}
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
    <div className="group relative overflow-hidden rounded-2xl border border-[#E6DBC7]/15 bg-black/40 transition-colors duration-500">
      <div className="relative h-44 overflow-hidden">
        <img
          src={guestSessionImg}
          alt="Guest Session"
          className="absolute inset-0 h-full w-full object-cover object-bottom"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>
      <div className="p-5">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.15em] text-[#D4A574]">
          Coming Soon
        </p>
        <h3 className="mb-1 font-editorial text-base leading-tight text-[#E6DBC7]">
          Guest Teacher Session
        </h3>
        {/* <p className="text-xs font-light text-[#E6DBC7]/50">First session coming January 2025</p> */}
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

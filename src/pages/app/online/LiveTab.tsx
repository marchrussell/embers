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
import { Play, Video, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import LiveProgramCard from "./components/LiveProgramCard";
import { LiveReplay, LiveSessionsData } from "./types";
import { AVAILABILITY_DAYS, useLiveReplays } from "./hooks/useLiveReplays";

interface LiveTabProps {
  liveSessionsData: LiveSessionsData;
  hasSubscription: boolean;
  isAdmin: boolean;
  isTestUser: boolean;
  onSubscriptionRequired: () => void;
}

const formatReplayDate = (replay: LiveReplay): string => {
  const start = new Date(replay.start_time);
  const dateStr = start.toLocaleDateString('en-GB', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  if (replay.end_time) {
    const mins = Math.round(
      (new Date(replay.end_time).getTime() - start.getTime()) / 60000
    );
    return `${dateStr} • ${mins} mins`;
  }
  return dateStr;
};

const formatAvailability = (sessionType: LiveReplay['session_type']): string => {
  const days = AVAILABILITY_DAYS[sessionType];
  return days === null ? 'Available forever' : `Available ${days} days`;
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

  const latestWeeklyReplay = replays.find((r) => r.session_type === 'weekly-reset');
  const latestMonthlyReplay = replays.find((r) => r.session_type === 'monthly-presence');
  const guestReplays = replays.filter((r) => r.session_type === 'guest-session');

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
    let hours = 19, minutes = 0;
    if (timeMatch) {
      hours = parseInt(timeMatch[1]);
      minutes = parseInt(timeMatch[2]);
      if (timeMatch[3].toUpperCase() === 'PM' && hours !== 12) hours += 12;
      if (timeMatch[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
    }

    const startDate = new Date(now);
    startDate.setHours(hours, minutes, 0, 0);
    if (startDate < now) startDate.setDate(startDate.getDate() + 7);

    const duration = sessionKey === 'weeklyReset' ? 30 : sessionKey === 'monthlyPresence' ? 90 : 60;
    const endDate = new Date(startDate.getTime() + duration * 60000);

    return {
      title: session.title,
      description: `${session.description}\n\nSession with March Russell`,
      location: 'Online',
      startDate,
      endDate,
    };
  };

  const handleDownloadICal = (sessionKey: string) => {
    const event = getCalendarEvent(sessionKey);
    downloadICalFile(event, event.title.replace(/\s+/g, '-').toLowerCase());
    setOpenCalendarId(null);
  };

  const handleGoogleCalendar = (sessionKey: string) => {
    window.open(getGoogleCalendarUrl(getCalendarEvent(sessionKey)), '_blank');
    setOpenCalendarId(null);
  };

  const handleOutlookCalendar = (sessionKey: string) => {
    window.open(getOutlookCalendarUrl(getCalendarEvent(sessionKey)), '_blank');
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
    <div className="pt-8 md:pt-[150px] pb-24">
      <div>
        <h2 className="text-2xl md:text-3xl font-medium text-[#E6DBC7] tracking-wide mb-2">Live Rhythm</h2>
        <p className="text-base md:text-lg font-light text-[#E6DBC7]/60 mb-10">
          Regular moments to pause, regulate, and reconnect — together.
        </p>
      </div>

      <div className="space-y-9 md:space-y-10 lg:space-y-12">
        <LiveProgramCard
          sessionKey="weeklyReset"
          data={liveSessionsData.weeklyReset}
          onClick={() => handleCardClick('/online/live/weekly-reset')}
          onShare={(e) => handleShare('weeklyReset', e)}
          onDownloadICal={(e) => { e.stopPropagation(); handleDownloadICal('weeklyReset'); }}
          onGoogleCalendar={(e) => { e.stopPropagation(); handleGoogleCalendar('weeklyReset'); }}
          onOutlookCalendar={(e) => { e.stopPropagation(); handleOutlookCalendar('weeklyReset'); }}
          isCalendarOpen={openCalendarId === 'weeklyReset'}
          onCalendarOpenChange={(open) => setOpenCalendarId(open ? 'weeklyReset' : null)}
        />

        <LiveProgramCard
          sessionKey="monthlyPresence"
          data={liveSessionsData.monthlyPresence}
          onClick={() => handleCardClick('/online/live/monthly-presence')}
          onShare={(e) => handleShare('monthlyPresence', e)}
          onDownloadICal={(e) => { e.stopPropagation(); handleDownloadICal('monthlyPresence'); }}
          onGoogleCalendar={(e) => { e.stopPropagation(); handleGoogleCalendar('monthlyPresence'); }}
          onOutlookCalendar={(e) => { e.stopPropagation(); handleOutlookCalendar('monthlyPresence'); }}
          isCalendarOpen={openCalendarId === 'monthlyPresence'}
          onCalendarOpenChange={(open) => setOpenCalendarId(open ? 'monthlyPresence' : null)}
        />

        <LiveProgramCard
          sessionKey="guestSession"
          data={liveSessionsData.guestSession}
          onClick={() => handleCardClick('/online/live/guest-session')}
          onShare={(e) => handleShare('guestSession', e)}
          onDownloadICal={(e) => { e.stopPropagation(); handleDownloadICal('guestSession'); }}
          onGoogleCalendar={(e) => { e.stopPropagation(); handleGoogleCalendar('guestSession'); }}
          onOutlookCalendar={(e) => { e.stopPropagation(); handleOutlookCalendar('guestSession'); }}
          isCalendarOpen={openCalendarId === 'guestSession'}
          onCalendarOpenChange={(open) => setOpenCalendarId(open ? 'guestSession' : null)}
          imageObjectPosition="bottom"
        />

        {/* Live Replays Section */}
        <div className="mt-40">
          <div className="my-10">
            <h2 className="text-2xl md:text-3xl font-medium text-[#E6DBC7] tracking-wide mb-2">
              Live Replays
            </h2>
            <p className="text-base md:text-lg font-light text-[#E6DBC7]/60">
              Catch up on sessions you may have missed
            </p>
          </div>

          {/* Weekly Reset & Monthly Presence Replays */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <ReplayBox
              image={weeklyResetEvent}
              alt="Weekly Reset Replay"
              availability={formatAvailability('weekly-reset')}
              category="Weekly Reset"
              date={latestWeeklyReplay ? formatReplayDate(latestWeeklyReplay) : null}
              onClick={latestWeeklyReplay ? () => window.open(latestWeeklyReplay.recording_url, '_blank') : undefined}
            />
            <ReplayBox
              image={heroHandsSession}
              alt="Monthly Presence Replay"
              availability={formatAvailability('monthly-presence')}
              category="Monthly Breath & Presence"
              date={latestMonthlyReplay ? formatReplayDate(latestMonthlyReplay) : null}
              onClick={latestMonthlyReplay ? () => window.open(latestMonthlyReplay.recording_url, '_blank') : undefined}
            />
          </div>

          {/* Guest Teacher Replays */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-[#D4A574] font-medium tracking-[0.15em] uppercase mb-1">
                  Guest Teacher Replays
                </p>
                <p className="text-sm text-[#E6DBC7]/50 font-light">Available forever</p>
              </div>
              <div className="flex items-center gap-3">
                <IconButton><ChevronLeft /></IconButton>
                <IconButton><ChevronRight /></IconButton>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {guestReplays.length > 0 ? (
                guestReplays.slice(0, 3).map((replay) => (
                  <GuestReplayCard key={replay.id} replay={replay} />
                ))
              ) : (
                <GuestReplayComingSoon />
              )}

              {/* Fill remaining slots with placeholders */}
              {guestReplays.length > 0 && guestReplays.length < 3 && (
                Array.from({ length: 3 - Math.min(guestReplays.length, 3) }).map((_, i) => (
                  <div
                    key={`placeholder-${i}`}
                    className="group relative overflow-hidden rounded-2xl border border-dashed border-[#E6DBC7]/15 bg-black/20 flex items-center justify-center min-h-[280px]"
                  >
                    <p className="text-sm text-[#E6DBC7]/30 font-light text-center px-6">
                      More guest sessions coming soon
                    </p>
                  </div>
                ))
              )}
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

const ReplayBox = ({ image, alt, availability, category, date, onClick }: ReplayBoxProps) => (
  <div
    className="group relative overflow-hidden rounded-2xl border border-[#E6DBC7]/15 bg-black/40 hover:border-[#E6DBC7]/30 transition-colors duration-500 cursor-pointer"
    onClick={onClick}
  >
    <div className="relative h-48 overflow-hidden">
      <img src={image} alt={alt} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#E6DBC7]/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
        <Video className="w-3.5 h-3.5 text-[#E6DBC7]" />
        <span className="text-xs text-[#E6DBC7] font-medium">{availability}</span>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-[#E6DBC7]/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-[#E6DBC7]/30 transition-colors duration-300">
          <Play className="w-6 h-6 text-[#E6DBC7] ml-1" fill="currentColor" />
        </div>
      </div>
    </div>
    <div className="p-6">
      <p className="text-xs text-[#D4A574] font-medium tracking-[0.15em] uppercase mb-2">{category}</p>
      <h3 className="text-lg font-editorial text-[#E6DBC7] mb-1">Latest Session Replay</h3>
      {date ? (
        <p className="text-xs text-[#E6DBC7]/50 font-light">{date}</p>
      ) : (
        <p className="text-xs text-[#E6DBC7]/30 font-light italic">No replay available yet</p>
      )}
    </div>
  </div>
);

const GuestReplayCard = ({ replay }: { replay: LiveReplay }) => (
  <div
    className="group relative overflow-hidden rounded-2xl border border-[#E6DBC7]/15 bg-black/40 hover:border-[#E6DBC7]/30 transition-colors duration-500 cursor-pointer"
    onClick={() => window.open(replay.recording_url, '_blank')}
  >
    <div className="relative h-44 overflow-hidden">
      <img
        src={replay.teacher_photo || guestSessionBg}
        alt={replay.title}
        className="absolute inset-0 w-full h-full object-cover object-bottom"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-12 h-12 rounded-full bg-[#E6DBC7]/20 backdrop-blur-sm flex items-center justify-center">
          <Play className="w-5 h-5 text-[#E6DBC7] ml-0.5" fill="currentColor" />
        </div>
      </div>
    </div>
    <div className="p-5">
      {replay.teacher_name && (
        <p className="text-[10px] text-[#D4A574] font-medium tracking-[0.15em] uppercase mb-2">
          {replay.teacher_name}
        </p>
      )}
      <h3 className="text-base font-editorial text-[#E6DBC7] mb-1 leading-tight">{replay.title}</h3>
      <p className="text-xs text-[#E6DBC7]/50 font-light">{formatReplayDate(replay)}</p>
    </div>
  </div>
);

const GuestReplayComingSoon = () => (
  <>
    <div className="group relative overflow-hidden rounded-2xl border border-[#E6DBC7]/15 bg-black/40 hover:border-[#E6DBC7]/30 transition-colors duration-500 cursor-pointer">
      <div className="relative h-44 overflow-hidden">
        <img
          src={guestSessionBg}
          alt="Guest Session"
          className="absolute inset-0 w-full h-full object-cover object-bottom"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-[#E6DBC7]/20 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-5 h-5 text-[#E6DBC7] ml-0.5" fill="currentColor" />
          </div>
        </div>
      </div>
      <div className="p-5">
        <p className="text-[10px] text-[#D4A574] font-medium tracking-[0.15em] uppercase mb-2">Coming Soon</p>
        <h3 className="text-base font-editorial text-[#E6DBC7] mb-1 leading-tight">Guest Teacher Session</h3>
        <p className="text-xs text-[#E6DBC7]/50 font-light">First session coming January 2025</p>
      </div>
    </div>

    <div className="group relative overflow-hidden rounded-2xl border border-dashed border-[#E6DBC7]/15 bg-black/20 flex items-center justify-center min-h-[280px]">
      <p className="text-sm text-[#E6DBC7]/30 font-light text-center px-6">
        More guest sessions coming soon
      </p>
    </div>

    <div className="group relative overflow-hidden rounded-2xl border border-dashed border-[#E6DBC7]/15 bg-black/20 flex items-center justify-center min-h-[280px]">
      <p className="text-sm text-[#E6DBC7]/30 font-light text-center px-6">
        More guest sessions coming soon
      </p>
    </div>
  </>
);

export default LiveTab;

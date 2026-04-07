import { ArrowLeft, Calendar, Clock, Share } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { IconButton } from "@/components/ui/icon-button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  CalendarEvent,
  downloadICalFile,
  openGoogleCalendar,
  openOutlookCalendar,
} from "@/lib/calendarUtils";
import { CLOUD_IMAGES, getCloudImageUrl } from "@/lib/cloudImageUrls";

const weeklyResetImage = getCloudImageUrl(CLOUD_IMAGES.weeklyReset);

interface WeeklyResetCardProps {
  /** Variant determines the card layout style */
  variant?: "compact" | "full";
  /** Custom click handler - if provided, overrides default navigation */
  onClick?: () => void;
  /** Custom class name for additional styling */
  className?: string;
}

/**
 * WeeklyResetCard - A reusable card component for the Weekly Reset live session
 * Used in StartHere and Studio pages
 */
export const WeeklyResetCard = ({
  variant = "compact",
  onClick,
  className = "",
}: WeeklyResetCardProps) => {
  const navigate = useNavigate();
  const [openCalendarPopover, setOpenCalendarPopover] = useState(false);

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate("/online?tab=live");
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/online?tab=live`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard");
  };

  const getNextSessionDate = () => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setHours(19, 0, 0, 0);
    if (startDate < now) startDate.setDate(startDate.getDate() + 7);
    return startDate;
  };

  const getCalendarEvent = (): CalendarEvent => {
    const startDate = getNextSessionDate();
    const endDate = new Date(startDate.getTime() + 30 * 60000);

    return {
      title: "Weekly Session on Embers Studio",
      description:
        "A grounding, guided session to help you soften, settle, and reset\n\nSession with March Russell",
      location: "Online",
      startDate,
      endDate,
    };
  };

  const handleDownloadICal = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadICalFile(getCalendarEvent(), "weekly-reset");
    setOpenCalendarPopover(false);
  };

  const handleGoogleCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    openGoogleCalendar(getCalendarEvent());
    setOpenCalendarPopover(false);
  };

  const handleOutlookCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    openOutlookCalendar(getCalendarEvent());
    setOpenCalendarPopover(false);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group cursor-pointer overflow-hidden rounded-xl border border-[#E6DBC7]/20 shadow-[0_8px_30px_rgba(230,219,199,0.1)] transition-all hover:border-[#E6DBC7]/30 ${className}`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image - Top on mobile, Left on tablet+ */}
        <div
          className="relative h-[140px] w-full flex-shrink-0 bg-cover bg-center sm:h-auto sm:w-[140px] sm:self-stretch md:w-[200px] lg:w-[240px]"
          style={{ backgroundImage: `url('${weeklyResetImage}')` }}
        >
          <div className="absolute inset-0 bg-black/0" />
        </div>

        {/* Glassmorphism Content - Bottom on mobile, Right on tablet+ */}
        <div className="flex flex-1 flex-col items-start justify-between gap-4 border-t border-white/5 bg-black/30 px-5 py-6 backdrop-blur-xl sm:flex-row sm:items-center sm:border-l sm:border-t-0 sm:px-6 md:px-10">
          <div className="min-w-0 flex-1">
            <h3 className="mb-2 font-editorial text-lg text-[#E6DBC7] md:text-xl">Weekly Reset</h3>
            <p className="mb-3 text-sm font-light leading-relaxed text-[#E6DBC7]/60 md:text-base">
              A grounding, guided session to help you soften, settle, and reset
            </p>
            <p className="mb-6 flex items-center gap-1 text-xs font-light text-[#D4A574] md:text-sm">
              <Clock className="h-3.5 w-3.5" />
              Every Wednesday, 7pm GMT
            </p>

            {/* Copy and Calendar icons */}
            <div className="flex items-center gap-3">
              <IconButton size="lg" onClick={handleCopyLink}>
                <Share />
              </IconButton>

              <Popover open={openCalendarPopover} onOpenChange={setOpenCalendarPopover}>
                <PopoverTrigger asChild>
                  <IconButton size="lg" onClick={(e) => e.stopPropagation()}>
                    <Calendar />
                  </IconButton>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto rounded-full border border-[#E6DBC7]/15 bg-[#1A1A1A] p-0 shadow-lg"
                  align="start"
                  sideOffset={8}
                >
                  <div className="flex items-center gap-0.5 px-3 py-2">
                    <button
                      onClick={handleDownloadICal}
                      className="rounded-full px-2.5 py-1 text-[12px] font-light tracking-wide text-[#E6DBC7]/80 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      iCal
                    </button>
                    <button
                      onClick={handleGoogleCalendar}
                      className="rounded-full px-2.5 py-1 text-[12px] font-light tracking-wide text-[#E6DBC7]/80 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      Google
                    </button>
                    <button
                      onClick={handleOutlookCalendar}
                      className="rounded-full px-2.5 py-1 text-[12px] font-light tracking-wide text-[#E6DBC7]/80 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      Outlook
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden flex-shrink-0 sm:flex">
            <ArrowLeft className="h-5 w-5 rotate-180 text-[#E6DBC7]/60 transition-all group-hover:text-[#E6DBC7]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyResetCard;

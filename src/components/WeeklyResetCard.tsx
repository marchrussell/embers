import weeklyResetImage from "@/assets/weekly-reset-event.jpg";
import { IconButton } from "@/components/ui/icon-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarEvent,
  downloadICalFile,
  openGoogleCalendar,
  openOutlookCalendar,
} from "@/lib/calendarUtils";
import { ArrowLeft, Calendar, Clock, Share } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
      navigate('/online?tab=live');
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
      title: 'Weekly Reset - Live Session',
      description: 'A grounding, guided session to help you soften, settle, and reset\n\nSession with March Russell',
      location: 'Online',
      startDate,
      endDate,
    };
  };

  const handleDownloadICal = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadICalFile(getCalendarEvent(), 'weekly-reset');
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
      className={`group cursor-pointer overflow-hidden rounded-xl border border-[#E6DBC7]/20 transition-all shadow-[0_8px_30px_rgba(230,219,199,0.1)] ${className}`}
    >
      <div className="flex flex-col sm:flex-row h-auto sm:h-[140px] md:h-[160px] lg:h-[180px]">
        {/* Image - Top on mobile, Left on tablet+ */}
        <div
          className="relative w-full sm:w-[140px] md:w-[200px] lg:w-[240px] h-[200px] sm:h-full flex-shrink-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${weeklyResetImage}')` }}
        >
          <div className="absolute inset-0 bg-black/0" />
        </div>

        {/* Glassmorphism Content - Bottom on mobile, Right on tablet+ */}
        <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 md:px-10 backdrop-blur-xl bg-black/30 border-t sm:border-t-0 sm:border-l border-white/5">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg md:text-xl font-editorial text-[#E6DBC7] mb-2">
              Weekly Reset
            </h3>
            <p className="text-sm md:text-base text-[#E6DBC7]/60 font-light mb-3 leading-relaxed">
              A grounding, guided session to help you soften, settle, and reset
            </p>
            <p className="text-xs md:text-sm text-[#D4A574] font-light flex items-center gap-1 mb-6">
              <Clock className="w-3.5 h-3.5" />
              Every Tuesday, 7pm GMT
            </p>

            {/* Copy and Calendar icons */}
            <div className="flex items-center gap-3">
              <IconButton
                size="lg"
                onClick={handleCopyLink}
              >
                <Share/>
              </IconButton>

              <Popover open={openCalendarPopover} onOpenChange={setOpenCalendarPopover}>
                <PopoverTrigger asChild>
                  <IconButton
                    size="lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Calendar />
                  </IconButton>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 bg-[#1A1A1A] border border-[#E6DBC7]/15 rounded-full shadow-lg"
                  align="start"
                  sideOffset={8}
                >
                  <div className="flex items-center gap-0.5 px-3 py-2">
                    <button
                      onClick={handleDownloadICal}
                      className="text-[#E6DBC7]/80 text-[12px] font-light tracking-wide hover:text-white transition-colors px-2.5 py-1 rounded-full hover:bg-white/5"
                    >
                      iCal
                    </button>
                    <button
                      onClick={handleGoogleCalendar}
                      className="text-[#E6DBC7]/80 text-[12px] font-light tracking-wide hover:text-white transition-colors px-2.5 py-1 rounded-full hover:bg-white/5"
                    >
                      Google
                    </button>
                    <button
                      onClick={handleOutlookCalendar}
                      className="text-[#E6DBC7]/80 text-[12px] font-light tracking-wide hover:text-white transition-colors px-2.5 py-1 rounded-full hover:bg-white/5"
                    >
                      Outlook
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden sm:flex flex-shrink-0">
            <ArrowLeft className="w-5 h-5 text-[#E6DBC7]/60 rotate-180 group-hover:text-[#E6DBC7] transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyResetCard;

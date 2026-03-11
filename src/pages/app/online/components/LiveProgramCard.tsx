import { IconButton } from "@/components/ui/icon-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { GlowButton } from "@/components/ui/glow-button";
import { Calendar, Share, Video } from "lucide-react";
import { memo } from "react";
import { LiveSessionData } from "../types";

interface LiveProgramCardProps {
  sessionKey: string;
  data: LiveSessionData;
  onClick: () => void;
  onShare: (e: React.MouseEvent) => void;
  onDownloadICal: (e: React.MouseEvent) => void;
  onGoogleCalendar: (e: React.MouseEvent) => void;
  onOutlookCalendar: (e: React.MouseEvent) => void;
  isCalendarOpen: boolean;
  onCalendarOpenChange: (open: boolean) => void;
  imageObjectPosition?: string;
}

const LiveProgramCard = memo(({
  data,
  onClick,
  onShare,
  onDownloadICal,
  onGoogleCalendar,
  onOutlookCalendar,
  isCalendarOpen,
  onCalendarOpenChange,
  imageObjectPosition,
}: LiveProgramCardProps) => (
  <div
    onClick={onClick}
    className="group relative flex flex-col lg:flex-row overflow-hidden rounded-2xl border border-white/[0.12] hover:border-white/25 transition-colors duration-500 cursor-pointer shadow-[0_0_60px_rgba(230,219,199,0.4)]"
    style={{
      minHeight: '400px',
      background: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.98) 55%)',
    }}
  >
    {/* Red Live badge */}
    <div className="absolute top-6 right-6 z-10 flex items-center gap-3 bg-red-600/90 px-6 py-2 rounded-full">
      <Video className="w-5 h-5 text-white" />
      <span className="text-xs text-white font-medium uppercase tracking-wider">LIVE</span>
    </div>

    {/* Image */}
    <div className="relative lg:w-[52%] h-[240px] lg:h-auto lg:min-h-full shrink-0 overflow-hidden">
      <img
        src={data.image}
        alt={data.title}
        className="absolute inset-0 w-full h-full object-cover"
        style={imageObjectPosition ? { objectPosition: imageObjectPosition } : undefined}
        loading="lazy"
      />
      <div
        className="absolute inset-0 hidden lg:block"
        style={{ background: 'linear-gradient(to right, transparent 20%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.98) 100%)' }}
      />
      <div
        className="absolute inset-0 lg:hidden"
        style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.98) 100%)' }}
      />
    </div>

    {/* Content */}
    <div className="relative flex-1 flex flex-col justify-center p-6 md:p-8 lg:py-10 lg:px-10 lg:pl-6 bg-black/95 lg:bg-transparent">
      <div>
        <div className="mb-5">
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] font-medium text-[#E6DBC7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E6DBC7]" />
            {data.subtitle}
          </span>
        </div>
        <h2 className="font-editorial text-[clamp(1.5rem,2.4vw,2.1rem)] text-[#E6DBC7] font-light leading-[1.2] mb-3 tracking-[-0.01em]">
          {data.title}
        </h2>
        <p className="font-editorial italic text-[14px] lg:text-[15px] text-[#E6DBC7]/65 mb-4 max-w-[340px] leading-[1.5]">
          {data.description}
        </p>
      </div>

      {/* Utility Icons */}
      <div className="flex items-center gap-4 mt-6">
        <IconButton size="lg" onClick={onShare}>
          <Share />
        </IconButton>

        <Popover open={isCalendarOpen} onOpenChange={onCalendarOpenChange}>
          <PopoverTrigger asChild>
            <IconButton size="lg" onClick={(e) => e.stopPropagation()}>
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
                onClick={onDownloadICal}
                className="text-[#E6DBC7]/80 text-[12px] font-light tracking-wide hover:text-white transition-colors px-2.5 py-1 rounded-full hover:bg-white/5"
              >
                iCal
              </button>
              <button
                onClick={onGoogleCalendar}
                className="text-[#E6DBC7]/80 text-[12px] font-light tracking-wide hover:text-white transition-colors px-2.5 py-1 rounded-full hover:bg-white/5"
              >
                Google
              </button>
              <button
                onClick={onOutlookCalendar}
                className="text-[#E6DBC7]/80 text-[12px] font-light tracking-wide hover:text-white transition-colors px-2.5 py-1 rounded-full hover:bg-white/5"
              >
                Outlook
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-start mt-6 lg:mt-8 lg:ml-auto lg:mr-8">
        <GlowButton size="sm">
          {data.isLive ? 'Join Now' : 'Join Live'}
        </GlowButton>
      </div>
    </div>
  </div>
));

LiveProgramCard.displayName = 'LiveProgramCard';
export default LiveProgramCard;

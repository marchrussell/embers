import { Calendar, Share, Video } from "lucide-react";
import { memo } from "react";

import { GlowButton } from "@/components/ui/glow-button";
import { IconButton } from "@/components/ui/icon-button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

const LiveProgramCard = memo(
  ({
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
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/[0.12] shadow-[0_0_60px_rgba(230,219,199,0.4)] transition-colors duration-500 hover:border-white/25 lg:flex-row"
      style={{
        minHeight: "400px",
        background: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.98) 55%)",
      }}
    >
      {/* Red Live badge */}
      <div className="absolute right-6 top-6 z-10 flex items-center gap-3 rounded-full bg-red-600/90 px-6 py-2">
        <Video className="h-5 w-5 text-white" />
        <span className="text-xs font-medium uppercase tracking-wider text-white">LIVE</span>
      </div>

      {/* Image */}
      <div className="relative h-[240px] shrink-0 overflow-hidden lg:h-auto lg:min-h-full lg:w-[52%]">
        <img
          src={data.image}
          alt={data.title}
          className="absolute inset-0 h-full w-full object-cover"
          style={imageObjectPosition ? { objectPosition: imageObjectPosition } : undefined}
          loading="lazy"
        />
        <div
          className="absolute inset-0 hidden lg:block"
          style={{
            background:
              "linear-gradient(to right, transparent 20%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.98) 100%)",
          }}
        />
        <div
          className="absolute inset-0 lg:hidden"
          style={{
            background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.98) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative flex flex-1 flex-col justify-center bg-black/95 p-6 md:p-8 lg:bg-transparent lg:px-10 lg:py-10 lg:pl-6">
        <div>
          <div className="mb-5">
            <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#E6DBC7]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E6DBC7]" />
              {data.subtitle}
            </span>
          </div>
          <h2 className="mb-3 font-editorial text-[clamp(1.5rem,2.4vw,2.1rem)] font-light leading-[1.2] tracking-[-0.01em] text-[#E6DBC7]">
            {data.title}
          </h2>
          <p className="mb-4 max-w-[340px] font-editorial text-[14px] italic leading-[1.5] text-[#E6DBC7]/65 lg:text-[15px]">
            {data.description}
          </p>
        </div>

        {/* Utility Icons */}
        <div className="mt-6 flex items-center gap-4">
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
              className="w-auto rounded-full border border-[#E6DBC7]/15 bg-[#1A1A1A] p-0 shadow-lg"
              align="start"
              sideOffset={8}
            >
              <div className="flex items-center gap-0.5 px-3 py-2">
                <button
                  onClick={onDownloadICal}
                  className="rounded-full px-2.5 py-1 text-[12px] font-light tracking-wide text-[#E6DBC7]/80 transition-colors hover:bg-white/5 hover:text-white"
                >
                  iCal
                </button>
                <button
                  onClick={onGoogleCalendar}
                  className="rounded-full px-2.5 py-1 text-[12px] font-light tracking-wide text-[#E6DBC7]/80 transition-colors hover:bg-white/5 hover:text-white"
                >
                  Google
                </button>
                <button
                  onClick={onOutlookCalendar}
                  className="rounded-full px-2.5 py-1 text-[12px] font-light tracking-wide text-[#E6DBC7]/80 transition-colors hover:bg-white/5 hover:text-white"
                >
                  Outlook
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="mt-6 flex justify-start lg:ml-auto lg:mr-8 lg:mt-8">
          <GlowButton size="sm">{data.isLive ? "Join Now" : "Join Live"}</GlowButton>
        </div>
      </div>
    </div>
  )
);

LiveProgramCard.displayName = "LiveProgramCard";
export default LiveProgramCard;

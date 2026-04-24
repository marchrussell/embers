import { Calendar, Share, Video } from "lucide-react";
import { memo } from "react";

import { GlowButton } from "@/components/ui/glow-button";
import { IconButton } from "@/components/ui/icon-button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import SplitCard from "@/components/ui/split-card";

import { LiveSessionCardData } from "../types";

interface LiveProgramCardProps {
  sessionKey: string;
  data: LiveSessionCardData;
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
    <SplitCard
      imageSrc={data.image}
      imageAlt={data.title}
      imageObjectPosition={imageObjectPosition}
      breakpoint="md"
      leftPanelClassName="md:w-1/2"
      height="h-[380px] md:h-[400px]"
      mobileLayout="stacked"
      contentClassName="bg-black/95 p-6 md:p-8 lg:bg-transparent lg:px-10 lg:py-10 lg:pl-6"
      onClick={onClick}
      badgeSlot={
        <div className="absolute right-6 top-6 z-10 flex items-center gap-3 rounded-full bg-red-600/90 px-6 py-2">
          <Video className="h-5 w-5 text-white" />
          <span className="text-xs font-medium uppercase tracking-wider text-white">LIVE</span>
        </div>
      }
    >
      <div>
        <div className="mb-5">
          <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#E6DBC7]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E6DBC7]" />
            {data.nextDate
              ? `${data.nextDate}${data.durationMinutes ? ` · ${data.durationMinutes} min` : ""}`
              : data.subtitle}
          </span>
        </div>
        <h2 className="mb-2 font-editorial text-[clamp(1.5rem,2.4vw,2.1rem)] font-light leading-[1.2] tracking-[-0.01em] text-[#E6DBC7]">
          {data.title}
        </h2>
        {data.teacherName && (
          <p className="mb-3 text-[11px] font-light uppercase tracking-[0.12em] text-[#D4A574]/80">
            Held by {data.teacherName}
          </p>
        )}
        <p className="mb-4 max-w-[340px] font-editorial text-[14px] italic leading-[1.5] text-[#E6DBC7]/65 lg:text-[15px]">
          {data.description}
        </p>
      </div>

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
    </SplitCard>
  ),
);

LiveProgramCard.displayName = "LiveProgramCard";
export default LiveProgramCard;

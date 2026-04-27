import { useMemo } from "react";

import { experienceImages } from "@/lib/cloudImageUrls";
import { formatExperienceDate, getNextDateFromConfig } from "@/lib/experienceDateUtils";
import { LiveSessionCardData } from "@/pages/app/online/types";

import { useLiveSessionConfigs } from "./useLiveSessionConfigs";
import { useNextLiveSessionDetailsByType } from "./useNextLiveSessionDetailsByType";

// todo - add control in admin
const SESSION_TYPE_IMAGES: Record<string, string> = {
  "weekly-reset": experienceImages.weeklyReset,
  "monthly-presence": experienceImages.monthlyBreathOnline,
  "guest-session": experienceImages.guestSession,
};

export function useLiveSessionsData(): LiveSessionCardData[] {
  const { data: configs = [] } = useLiveSessionConfigs();
  const { data: sessionDetailsByType = {} } = useNextLiveSessionDetailsByType();

  return useMemo(() => {
    return configs.map((config) => {
      const dbSession = sessionDetailsByType[config.session_type];
      const nextDateObj = dbSession
        ? new Date(dbSession.startTime)
        : getNextDateFromConfig(config);
      const nextDate = nextDateObj ? formatExperienceDate(nextDateObj, config.time ?? "") : null;

      const subtitleParts = [
        config.recurrence_label,
        config.time ? `${config.time} ${config.timezone}` : null,
        config.duration,
      ].filter(Boolean);
      const subtitle = subtitleParts.join(" · ");

      const fallbackImage =
        SESSION_TYPE_IMAGES[config.session_type] ?? experienceImages.guestSession;
      const durationMinutes = config.duration ? parseInt(config.duration) || 60 : 60;
      console.log('Live Session Config:', config);
      console.log('DB session:', dbSession, 'Date object:', nextDateObj, 'Formatted next date:', nextDate);
      console.log('Subtitle parts:', subtitleParts, 'Final subtitle:', subtitle);

      if (config.session_type === "guest-session" && dbSession) {
        console.log('Enriching next Guest Teacher:', dbSession);
        return {
          sessionType: config.session_type,
          title: dbSession.session_title ?? config.title,
          subtitle,
          description:
            config.subtitle ||
            "A unique session featuring a guest teacher with fresh perspectives.",
          image: fallbackImage,
          nextDate,
          isLive: false,
          time: config.time,
          durationMinutes,
          teacherName: dbSession.name,
          teacherTitle: dbSession.title,
          recurrenceLabel: config.recurrence_label ?? undefined,
        };
      }

      return {
        sessionType: config.session_type,
        title: config.title,
        subtitle,
        description: config.subtitle ?? "",
        image: fallbackImage,
        nextDate,
        isLive: false,
        time: config.time,
        durationMinutes,
        recurrenceLabel: config.recurrence_label ?? undefined,
      };
    });
  }, [configs, sessionDetailsByType]);
}

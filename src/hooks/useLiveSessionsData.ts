import { useMemo } from "react";

import { formatExperienceDate, getNextDateFromConfig } from "@/lib/experienceDateUtils";
import { resolveSessionImage } from "@/lib/sessionImageUtils";
import { LiveSessionCardData } from "@/pages/app/online/types";

import { useLiveSessionConfigs } from "./useLiveSessionConfigs";
import { useNextLiveSessionDetailsByType } from "./useNextLiveSessionDetailsByType";

export function useLiveSessionsData(): LiveSessionCardData[] {
  const { data: configs = [] } = useLiveSessionConfigs();
  const { data: sessionDetailsByType = {} } = useNextLiveSessionDetailsByType();

  return useMemo(() => {
    const mapped = configs.map((config) => {
      const dbSession = sessionDetailsByType[config.session_type];
      const nextDateRaw = dbSession ? new Date(dbSession.startTime) : getNextDateFromConfig(config);
      const nextDate = nextDateRaw ? formatExperienceDate(nextDateRaw, config.time ?? "") : null;

      const subtitleParts = [
        config.recurrence_label,
        config.time ? `${config.time} ${config.timezone}` : null,
        config.duration,
      ].filter(Boolean);
      const subtitle = subtitleParts.join(" · ");

      const durationMinutes = config.duration ? parseInt(config.duration) || 60 : 60;

      if (config.session_type === "guest-session" && dbSession) {
        console.log("Enriching next Guest Teacher:", dbSession);
        return {
          sessionType: config.session_type,
          title: dbSession.session_title ?? config.title,
          subtitle,
          description:
            config.subtitle ||
            "A unique session featuring a guest teacher with fresh perspectives.",
          image: resolveSessionImage(config, dbSession.photo_url),
          nextDate,
          nextDateRaw,
          isLive: false as const,
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
        image: resolveSessionImage(config),
        nextDate,
        nextDateRaw,
        isLive: false as const,
        time: config.time,
        durationMinutes,
        recurrenceLabel: config.recurrence_label ?? undefined,
      };
    });

    return mapped.sort((a, b) => {
      if (!a.nextDateRaw && !b.nextDateRaw) return 0;
      if (!a.nextDateRaw) return 1;
      if (!b.nextDateRaw) return -1;
      return a.nextDateRaw.getTime() - b.nextDateRaw.getTime();
    });
  }, [configs, sessionDetailsByType]);
}

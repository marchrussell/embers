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
    const mapped = configs.flatMap((config) => {
      const subtitleParts = [
        config.recurrence_label,
        config.time ? `${config.time} ${config.timezone}` : null,
        config.duration,
      ].filter(Boolean);
      const subtitle = subtitleParts.join(" · ");
      const durationMinutes = config.duration ? parseInt(config.duration) || 60 : 60;

      if (config.session_type === "guest-session") {
        const sessions = sessionDetailsByType[config.session_type] ?? [];
        if (sessions.length > 0) {
          return sessions.map((dbSession) => {
            const nextDateRaw = new Date(dbSession.startTime);
            const nextDate = formatExperienceDate(nextDateRaw, config.time ?? "");
            console.log("Enriching next Guest Teacher:", dbSession);
            return {
              id: dbSession.sessionId,
              sessionType: config.session_type,
              title: dbSession.session_title ?? config.title,
              subtitle,
              description:
                dbSession.short_description ||
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
          });
        }
        // Fallback: no DB sessions — show config-derived card
        const nextDateRaw = getNextDateFromConfig(config);
        const nextDate = nextDateRaw ? formatExperienceDate(nextDateRaw, config.time ?? "") : null;
        return [
          {
            id: config.session_type,
            sessionType: config.session_type,
            title: config.title,
            subtitle,
            description:
              config.subtitle ||
              "A unique session featuring a guest teacher with fresh perspectives.",
            image: resolveSessionImage(config),
            nextDate,
            nextDateRaw,
            isLive: false as const,
            time: config.time,
            durationMinutes,
            recurrenceLabel: config.recurrence_label ?? undefined,
          },
        ];
      }

      const dbSession = (sessionDetailsByType[config.session_type] ?? [])[0] ?? null;
      const nextDateRaw = dbSession ? new Date(dbSession.startTime) : getNextDateFromConfig(config);
      const nextDate = nextDateRaw ? formatExperienceDate(nextDateRaw, config.time ?? "") : null;

      return [
        {
          id: dbSession?.sessionId ?? config.session_type,
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
        },
      ];
    });

    return mapped.sort((a, b) => {
      if (!a.nextDateRaw && !b.nextDateRaw) return 0;
      if (!a.nextDateRaw) return 1;
      if (!b.nextDateRaw) return -1;
      return a.nextDateRaw.getTime() - b.nextDateRaw.getTime();
    });
  }, [configs, sessionDetailsByType]);
}

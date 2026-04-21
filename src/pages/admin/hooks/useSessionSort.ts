import { useState } from "react";

import { LiveSession } from "../types";

export type SessionSortKey = "status" | "start_time" | "recording";
export type SortDir = "asc" | "desc";

const STATUS_ORDER: Record<string, number> = { scheduled: 0, live: 1, ended: 2 };

const recordingRank = (s: LiveSession) => (s.recording_url ? 0 : s.recording_enabled ? 1 : 2);

export const useSessionSort = (sessions: LiveSession[]) => {
  const [sortKey, setSortKey] = useState<SessionSortKey>("status");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: SessionSortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "start_time" ? "desc" : "asc");
    }
  };

  const sorted = [...sessions].sort((a, b) => {
    let diff = 0;

    if (sortKey === "status") {
      diff = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
      if (diff === 0) diff = new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
    } else if (sortKey === "start_time") {
      diff = new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
    } else if (sortKey === "recording") {
      diff = recordingRank(a) - recordingRank(b);
    }

    return sortDir === "asc" ? diff : -diff;
  });

  return { sorted, sortKey, sortDir, handleSort };
};

export interface Course {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  short_description: string | null;
  duration_days: number | null;
  image_url: string | null;
  teacher_name: string | null;
  lesson_count: number | null;
  is_published: boolean;
}

export interface LiveSessionCardData {
  sessionType: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  nextDate: string | null;
  isLive: boolean;
  time: string | null; // HH:MM 24h, e.g. "19:00"
  durationMinutes: number; // e.g. 30, 90 — defaults to 60
  teacherName?: string;
  teacherTitle?: string;
  recurrenceLabel?: string; // e.g. "Every Wednesday"
}

export interface LiveReplay {
  id: string;
  title: string;
  session_type: "weekly-reset" | "monthly-presence" | "guest-session";
  start_time: string;
  end_time: string | null;
  recording_url: string;
  teacher_name?: string;
  teacher_photo?: string;
}

export interface BaseSession {
  id: string;
  title: string;
  duration_minutes: number | null;
  image_url: string | null;
  short_description: string | null;
  teacher_name: string | null;
  intensity: string | null;
  technique: string | null;
}

export interface QuickResetSession extends BaseSession {
  requires_subscription: boolean | null;
}

export interface FeaturedSession extends BaseSession {
  description: string | null;
}

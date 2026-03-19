export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  duration_days: number;
  price_cents: number;
  currency: string;
  image_url: string | null;
}

export interface LiveSessionData {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  nextDate: string;
  isLive: boolean;
  hasReplay?: boolean;
  replayDate?: string;
  teacherName?: string;
  teacherTitle?: string;
}

export interface LiveSessionsData {
  weeklyReset: LiveSessionData;
  monthlyPresence: LiveSessionData;
  guestSession: LiveSessionData;
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

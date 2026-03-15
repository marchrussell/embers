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

export interface QuickResetSession {
  id: string;
  title: string;
  short_description: string | null;
  image_url: string | null;
  teacher_name: string | null;
  duration_minutes: number | null;
  requires_subscription: boolean | null;
  intensity: string;
  technique: string;
}

export interface FeaturedSession {
  id: string;
  title: string;
  description: string | null;
  short_description: string | null;
  image_url: string | null;
  teacher_name: string | null;
  duration_minutes: number | null;
  intensity: string;
  technique: string;
}

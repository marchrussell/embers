export type SessionType = string;

export interface LiveSession {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  status: string;
  session_type: SessionType | null;
  daily_room_name: string | null;
  daily_room_url: string | null;
  guest_token: string | null;
  guest_link_expires_at: string | null;
  recording_enabled: boolean;
  recording_url: string | null;
  attendee_count: number;
  created_at: string;
}

export interface LiveSessionDetails {
  id: string;
  linked_session_id: string;
  session_title: string | null;
  short_description: string | null;
  photo_url: string | null;
  what_to_expect: string[];
  name: string | null;
  title: string | null;
  guest_join_url: string | null;
  is_active: boolean;
}

export interface LiveSessionConfig {
  id: string;
  session_type: SessionType;
  title: string;
  subtitle: string | null;
  recurrence_type: "weekly" | "nthWeekday" | null;
  weekdays: number[] | null;
  weekday: number | null;
  nth: number | null;
  time: string | null;
  timezone: string;
  duration: string | null;
  recurrence_label: string | null;
  cta_label: string | null;
  event_type: string | null;
  format: string | null;
  is_active: boolean;
  image_url: string | null;
}

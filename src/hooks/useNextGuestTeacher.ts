import { useNextLiveSessionDetails } from "./useNextLiveSessionDetails";

export interface GuestTeacher {
  id: string;
  name: string;
  title: string;
  short_description: string | null;
  photo_url: string | null;
  session_date: string;
  session_title: string;
  what_to_expect: string[];
  is_active: boolean;
}

export function useNextGuestTeacher() {
  const { data: details, isLoading: loading, error } = useNextLiveSessionDetails("guest-session");

  const teacher: GuestTeacher | null = details
    ? {
        id: details.id,
        name: details.name ?? "",
        title: details.title ?? "",
        short_description: details.short_description,
        photo_url: details.photo_url,
        session_date: details.session_date,
        session_title: details.session_title ?? "",
        what_to_expect: details.what_to_expect ?? [],
        is_active: details.is_active,
      }
    : null;

  return { teacher, loading, error: error as Error | null };
}

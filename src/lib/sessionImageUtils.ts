import { experienceImages } from "@/lib/cloudImageUrls";

export const SESSION_TYPE_IMAGES: Record<string, string> = {
  "weekly-reset": experienceImages.weeklyReset,
  "monthly-presence": experienceImages.monthlyBreathOnline,
  "guest-session": experienceImages.guestSession,
};

export function resolveSessionImage(
  config: { session_type: string; image_url: string | null },
  photoUrl?: string | null
): string {
  const fallback =
    config.image_url ?? SESSION_TYPE_IMAGES[config.session_type] ?? experienceImages.guestSession;
  return photoUrl || fallback;
}

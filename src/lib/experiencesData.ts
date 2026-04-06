/**
 * Events Data Configuration
 * Central source of truth for all recurring events
 */

import { CLOUD_IMAGES, getCloudImageUrl } from "./cloudImageUrls";
import { EventSchedule, WEEKDAYS } from "./experienceDateUtils";
export type { EventSchedule };

const breathPresenceOnlineImg = getCloudImageUrl(CLOUD_IMAGES.breathPresence);
const breathworkToDubImg = getCloudImageUrl(CLOUD_IMAGES.breathWorkToDub);
export const monthlyBreathOnlineImg = getCloudImageUrl(CLOUD_IMAGES.monthlyBreath);
export const unwindResetImg = getCloudImageUrl(CLOUD_IMAGES.unwindReset);
export const weeklyResetImg = getCloudImageUrl(CLOUD_IMAGES.weeklyReset);
export const guestSessionImg = getCloudImageUrl(CLOUD_IMAGES.unwindReset);

// Venue address
const AUFI_ADDRESS = "AUFI, 20 Eastcastle St, London W1W 8DB";

export const onlineExperiences: EventSchedule[] = [
  {
    id: "guest-session",
    title: "Guest Session",
    subtitle: "A special session with a guest teacher.",
    recurrence: {
      type: "nthDay",
      day: 4, // Thursday
    },
    time: "20:45",
    timezone: "GMT",
    duration: "15 mins",
    recurrenceLabel: "Every Thursday of the month",
    cta: "Join on Instagram",
    ctaLink: "https://www.instagram.com/embers.io",
    image: unwindResetImg,
    eventType: "free",
    format: "Online",
  },
  {
    id: "weekly-reset",
    title: "Weekly Reset",
    subtitle: "A live space to pause, settle your system, and realign mid-week.",
    recurrence: {
      type: "weekly",
      weekdays: [WEEKDAYS.SUNDAY],
    },
    time: "19:00",
    timezone: "GMT",
    duration: "30 mins",
    recurrenceLabel: "Live every Sunday",
    cta: "Enter Space",
    ctaLink: "",
    image: weeklyResetImg,
    eventType: "online-member",
    format: "For Online Members",
  },
  {
    id: "breath-presence-online",
    title: "Monthly Breath & Presence",
    subtitle: "A longer, spacious session to soften tension and reconnect with yourself.",
    recurrence: {
      type: "nthWeekday",
      weekday: WEEKDAYS.SATURDAY,
      nth: 1, // 1st Saturday
    },
    time: "10:00",
    timezone: "GMT",
    duration: "90 mins",
    recurrenceLabel: "First Saturday of the month",
    cta: "Enter Space",
    ctaLink: "",
    image: monthlyBreathOnlineImg,
    eventType: "online-member",
    format: "For Online Members",
  },
];

export const experiencesData: EventSchedule[] = [
  {
    id: "breath-presence-inperson",
    title: "Breath, Presence & Heart Connection",
    subtitle: "An in-person evening to open, reconnect, and come back into yourself — together.",
    recurrence: {
      type: "nthWeekday",
      weekday: WEEKDAYS.WEDNESDAY,
      nth: 3, // 3rd Wednesday
    },
    time: "20:00",
    timezone: "GMT",
    duration: "90 mins",
    recurrenceLabel: "Every 3rd Wednesday",
    cta: "Book",
    ctaLink: "https://calendly.com/march-marchrussell/breath-presence-in-person",
    image: breathPresenceOnlineImg,
    eventType: "paid",
    format: "In-Person",
    location: "Soho",
    venue: AUFI_ADDRESS,
    price: "£20",
  },
  {
    id: "breathwork-to-dub",
    title: "Breathwork to Dub",
    subtitle: "A movement + breath experience to energise the body and awaken your senses.",
    recurrence: {
      type: "nthWeekday",
      weekday: WEEKDAYS.SATURDAY,
      nth: 1, // 1st Saturday
    },
    time: "11:30",
    timezone: "GMT",
    duration: "1 hour",
    recurrenceLabel: "Every 1st Saturday",
    cta: "Book",
    ctaLink: "https://calendly.com/march-marchrussell/breathwork-to-dub",
    image: breathworkToDubImg,
    eventType: "paid",
    format: "In-Person",
    location: "Soho",
    venue: AUFI_ADDRESS,
    price: "£15",
  },
];

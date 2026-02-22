/**
 * Events Data Configuration
 * Central source of truth for all recurring events
 */

import { EventSchedule, WEEKDAYS } from './experienceDateUtils';
export type { EventSchedule };

// Import images
import instagramLiveSessionBg from "@/assets/instagram-live-session-bg.jpg";
import heroHandsSession from "@/assets/hero-hands-session.png";
import heartConnection from "@/assets/heart-connection.jpg";
import breathworkToDub from "@/assets/breathwork-to-dub.png";
import weeklyResetEvent from "@/assets/weekly-reset-event.jpg";

// Venue address
const AUFI_ADDRESS = "AUFI, 20 Eastcastle St, London W1W 8DB";

export const experiencesData: EventSchedule[] = [
  {
    id: 'unwind-rest',
    title: 'Unwind & Rest',
    subtitle: 'Short nightly resets to settle your mind and ease your body.',
    recurrence: {
      type: 'weekly',
      weekdays: [WEEKDAYS.MONDAY],
    },
    time: '20:45',
    timezone: 'GMT',
    duration: '15 mins',
    recurrenceLabel: 'Every Monday',
    cta: 'Join on Instagram',
    ctaLink: 'https://www.instagram.com/marchrussell/',
    image: instagramLiveSessionBg,
    eventType: 'free',
    format: 'Online',
  },
  {
    id: 'weekly-reset',
    title: 'Weekly Reset',
    subtitle: 'A live space to pause, settle your system, and realign mid-week.',
    recurrence: {
      type: 'weekly',
      weekdays: [WEEKDAYS.TUESDAY],
    },
    time: '19:00',
    timezone: 'GMT',
    duration: '30 mins',
    recurrenceLabel: 'Every Tuesday',
    cta: 'Enter Space',
    ctaLink: '',
    image: weeklyResetEvent,
    eventType: 'studio-member',
    format: 'For Studio Members',
  },
  {
    id: 'breath-presence-online',
    title: 'Monthly Breath & Presence',
    subtitle: 'A longer, spacious session to soften tension and reconnect with yourself.',
    recurrence: {
      type: 'nthWeekday',
      weekday: WEEKDAYS.SUNDAY,
      nth: 2, // 2nd Sunday
    },
    time: '19:30',
    timezone: 'GMT',
    duration: '90 mins',
    recurrenceLabel: 'Every 2nd Sunday',
    cta: 'Enter Space',
    ctaLink: '',
    image: heroHandsSession,
    eventType: 'studio-member',
    format: 'For Studio Members',
  },
  {
    id: 'breath-presence-inperson',
    title: 'Breath, Presence & Heart Connection',
    subtitle: 'An in-person evening to open, reconnect, and come back into yourself — together.',
    recurrence: {
      type: 'nthWeekday',
      weekday: WEEKDAYS.WEDNESDAY,
      nth: 3, // 3rd Wednesday
    },
    time: '20:00',
    timezone: 'GMT',
    duration: '90 mins',
    recurrenceLabel: 'Every 3rd Wednesday',
    cta: 'Book',
    ctaLink: 'https://calendly.com/march-marchrussell/breath-presence-in-person',
    image: heartConnection,
    eventType: 'paid',
    format: 'In-Person',
    location: 'Soho',
    venue: AUFI_ADDRESS,
    price: '£25',
  },
  {
    id: 'breathwork-to-dub',
    title: 'Breathwork to Dub',
    subtitle: 'A movement + breath experience to energise the body and awaken your senses.',
    recurrence: {
      type: 'nthWeekday',
      weekday: WEEKDAYS.SATURDAY,
      nth: 1, // 1st Saturday
    },
    time: '11:30',
    timezone: 'GMT',
    duration: '1 hour',
    recurrenceLabel: 'Every 1st Saturday',
    cta: 'Book',
    ctaLink: 'https://calendly.com/march-marchrussell/breathwork-to-dub',
    image: breathworkToDub,
    eventType: 'paid',
    format: 'In-Person',
    location: 'Soho',
    venue: AUFI_ADDRESS,
    price: '£20',
  },
];

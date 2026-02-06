/**
 * 2026 Event Schedule Generator
 * Generates all dates for recurring events in 2026
 */

import { RecurrenceRule, WEEKDAYS } from './eventDateUtils';

export interface ScheduledEventDate {
  date: string; // ISO date string (YYYY-MM-DD)
  displayDate: string; // Human readable
  time: string; // HH:MM
  dayOfWeek: string;
  spotsRemaining?: number;
  isOnline: boolean;
  maxCapacity: number; // Unlimited = 9999, In-person = 15
}

/**
 * Get the nth occurrence of a weekday in a given month
 */
function getNthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): Date {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  
  let dayOfMonth = 1 + ((weekday - firstWeekday + 7) % 7);
  dayOfMonth += (nth - 1) * 7;
  
  return new Date(year, month, dayOfMonth);
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDateToISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format date to human readable: "Sun, 12 Jan 2026"
 */
export function formatDateToReadable(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${dayName}, ${day} ${monthName} ${year}`;
}

/**
 * Format time from 24h to 12h with AM/PM
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Generate all dates for a recurring event in 2026
 */
export function generate2026EventDates(
  recurrence: RecurrenceRule,
  time: string,
  isOnline: boolean
): ScheduledEventDate[] {
  const dates: ScheduledEventDate[] = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const year = 2026;
  const maxCapacity = isOnline ? 9999 : 15; // Unlimited for online, 15 for in-person
  
  if (recurrence.type === 'nthWeekday') {
    // e.g., 2nd Sunday of every month
    const { weekday, nth } = recurrence;
    
    for (let month = 0; month < 12; month++) {
      const date = getNthWeekdayOfMonth(year, month, weekday, nth);
      
      dates.push({
        date: formatDateToISO(date),
        displayDate: formatDateToReadable(date),
        time: time,
        dayOfWeek: days[date.getDay()],
        isOnline,
        maxCapacity,
      });
    }
    
  } else if (recurrence.type === 'weekly') {
    // e.g., every Monday & Tuesday
    const { weekdays } = recurrence;
    
    // Generate all dates for each weekday in 2026
    const startDate = new Date(year, 0, 1); // Jan 1, 2026
    const endDate = new Date(year, 11, 31); // Dec 31, 2026
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (weekdays.includes(d.getDay())) {
        const date = new Date(d);
        dates.push({
          date: formatDateToISO(date),
          displayDate: formatDateToReadable(date),
          time: time,
          dayOfWeek: days[date.getDay()],
          isOnline,
          maxCapacity,
        });
      }
    }
  }
  
  // Sort by date
  dates.sort((a, b) => a.date.localeCompare(b.date));
  
  return dates;
}

/**
 * Get upcoming dates for an event (from today onwards)
 */
export function getUpcomingEventDates(
  recurrence: RecurrenceRule,
  time: string,
  isOnline: boolean,
  limit: number = 12
): ScheduledEventDate[] {
  const allDates = generate2026EventDates(recurrence, time, isOnline);
  const today = new Date().toISOString().split('T')[0];
  
  return allDates
    .filter(d => d.date >= today)
    .slice(0, limit);
}

/**
 * Event type configurations with capacity settings
 */
export const EVENT_CAPACITY_CONFIG: Record<string, { isOnline: boolean; maxCapacity: number }> = {
  'unwind-rest': { isOnline: true, maxCapacity: 9999 }, // IG Live - unlimited
  'breath-presence-online': { isOnline: true, maxCapacity: 9999 }, // Online - unlimited
  'breath-presence-inperson': { isOnline: false, maxCapacity: 15 }, // In-person Soho
  'breathwork-to-dub': { isOnline: false, maxCapacity: 15 }, // In-person Soho
};

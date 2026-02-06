/**
 * Event Date Utility
 * Calculates and formats next occurrence dates for recurring events
 */

export type RecurrenceRule = 
  | { type: 'nthWeekday'; weekday: number; nth: number } // e.g., 2nd Sunday
  | { type: 'weekly'; weekdays: number[] } // e.g., every Monday & Tuesday
  | { type: 'nthDay'; day: number } // e.g., 1st of every month

export interface EventSchedule {
  id: string;
  title: string;
  subtitle: string;
  recurrence: RecurrenceRule;
  time: string; // 24h format "HH:MM"
  timezone: string;
  duration?: string; // e.g., "30 mins", "90 mins", "1 hour"
  recurrenceLabel: string; // Human-readable label (cadence only, no location)
  cta: string;
  ctaLink: string;
  image: string;
  eventType: 'free' | 'paid' | 'studio-member';
  format: 'Online' | 'In-Person' | 'Studio Membership Only' | 'For Studio Members';
  location?: string; // e.g., "Soho"
  venue?: string; // Full address
  price?: string; // e.g., "£20"
}

/**
 * Get the nth occurrence of a weekday in a given month
 * @param year - The year
 * @param month - The month (0-indexed)
 * @param weekday - Day of week (0 = Sunday, 1 = Monday, etc.)
 * @param nth - Which occurrence (1 = first, 2 = second, etc.)
 */
function getNthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): Date {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  
  // Calculate the first occurrence of this weekday in the month
  let dayOfMonth = 1 + ((weekday - firstWeekday + 7) % 7);
  
  // Add weeks to get to the nth occurrence
  dayOfMonth += (nth - 1) * 7;
  
  return new Date(year, month, dayOfMonth);
}

/**
 * Get the next occurrence of a recurring event
 * Events start from February 2025
 */
export function getNextEventDate(recurrence: RecurrenceRule, time: string): Date | null {
  try {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    
    // Minimum start date: February 1, 2025
    const minStartDate = new Date(2025, 1, 1); // February 1, 2025
    const effectiveNow = now > minStartDate ? now : minStartDate;
    
    if (recurrence.type === 'nthWeekday') {
      // e.g., 2nd Sunday of every month
      const { weekday, nth } = recurrence;
      
      // Check this month first
      let candidate = getNthWeekdayOfMonth(effectiveNow.getFullYear(), effectiveNow.getMonth(), weekday, nth);
      candidate.setHours(hours, minutes, 0, 0);
      
      if (candidate > effectiveNow) {
        return candidate;
      }
      
      // Try next month
      let nextMonth = effectiveNow.getMonth() + 1;
      let nextYear = effectiveNow.getFullYear();
      if (nextMonth > 11) {
        nextMonth = 0;
        nextYear++;
      }
      
      candidate = getNthWeekdayOfMonth(nextYear, nextMonth, weekday, nth);
      candidate.setHours(hours, minutes, 0, 0);
      return candidate;
      
    } else if (recurrence.type === 'weekly') {
      // e.g., every Monday & Tuesday
      const { weekdays } = recurrence;
      
      // Find the next occurrence within the next 7 days
      for (let i = 0; i < 7; i++) {
        const candidate = new Date(effectiveNow);
        candidate.setDate(candidate.getDate() + i);
        candidate.setHours(hours, minutes, 0, 0);
        
        if (weekdays.includes(candidate.getDay()) && candidate > effectiveNow) {
          return candidate;
        }
      }
      
      // Fallback: return next week's first matching day
      for (let i = 7; i < 14; i++) {
        const candidate = new Date(effectiveNow);
        candidate.setDate(candidate.getDate() + i);
        candidate.setHours(hours, minutes, 0, 0);
        
        if (weekdays.includes(candidate.getDay())) {
          return candidate;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error calculating next event date:', error);
    return null;
  }
}

/**
 * Format a date in the style: DD • MM • YYYY — HH:MM GMT
 * With medium bullet points
 */
export function formatEventDate(date: Date | null, time: string): string {
  if (!date) {
    return 'Next event date to be announced';
  }
  
  try {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    // Format time from 24h to 12h with AM/PM
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    // Using bullet operator (U+2219) - medium size
    return `${day} ∙ ${month} ∙ ${year} — ${displayHours}:${displayMinutes} ${period} GMT`;
  } catch (error) {
    return 'Next event date to be announced';
  }
}

/**
 * Get the short day name
 */
export function getShortDayName(date: Date | null): string {
  if (!date) return '';
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

/**
 * Format with day name: Sun ∙ 12 ∙ Jan — 7:30 PM GMT
 * With medium bullet points
 */
export function formatEventDateWithDay(date: Date | null, time: string): string {
  if (!date) {
    return 'Next event date to be announced';
  }
  
  try {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate().toString().padStart(2, '0');
    const monthName = months[date.getMonth()];
    
    // Format time from 24h to 12h with AM/PM
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${dayName} ∙ ${day} ∙ ${monthName} — ${displayHours}:${displayMinutes} ${period} GMT`;
  } catch (error) {
    return 'Next event date to be announced';
  }
}

// Weekday constants for clarity
export const WEEKDAYS = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const;

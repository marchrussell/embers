import { toast } from "sonner";

export interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  url?: string;
}

/**
 * Formats a date to iCal format (YYYYMMDDTHHMMSSZ)
 * Always converts to UTC for consistency
 */
const formatICalDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
};

/**
 * Formats a date for Google Calendar URL (same as iCal format)
 */
const formatGoogleDate = (date: Date): string => {
  return formatICalDate(date);
};

/**
 * Escapes special characters for iCal format
 * Per RFC 5545: backslash, semicolon, comma, and newlines must be escaped
 */
const escapeICalText = (text: string): string => {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
};

/**
 * Truncates text to avoid URL length limits (roughly 2000 chars for most browsers)
 * Leaves room for other URL parameters
 */
const truncateForUrl = (text: string, maxLength: number = 500): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Generates a Google Calendar URL for the event
 */
export const getGoogleCalendarUrl = (event: CalendarEvent): string => {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatGoogleDate(event.startDate)}/${formatGoogleDate(event.endDate)}`,
    details: truncateForUrl(event.description),
    location: event.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Generates an Outlook Web calendar URL for the event
 * Uses the correct deeplink format (without /0/)
 * Note: Only works with Outlook Web, not desktop client
 */
export const getOutlookCalendarUrl = (event: CalendarEvent): string => {
  const params = new URLSearchParams({
    subject: event.title,
    body: truncateForUrl(event.description),
    location: event.location,
    startdt: event.startDate.toISOString(),
    enddt: event.endDate.toISOString(),
  });
  return `https://outlook.office.com/calendar/deeplink/compose?${params.toString()}`;
};

/**
 * Generates iCal file content for the event
 */
export const generateICalContent = (event: CalendarEvent, uid: string): string => {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'PRODID:-//March Russell//Studio//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICalDate(new Date())}`,
    `DTSTART:${formatICalDate(event.startDate)}`,
    `DTEND:${formatICalDate(event.endDate)}`,
    `SUMMARY:${escapeICalText(event.title)}`,
    `DESCRIPTION:${escapeICalText(event.description)}`,
    `LOCATION:${escapeICalText(event.location)}`,
  ];

  if (event.url) {
    lines.push(`URL:${event.url}`);
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');

  return lines.join('\r\n');
};

/**
 * Downloads an iCal file for the event
 */
export const downloadICalFile = (event: CalendarEvent, filename: string): void => {
  const uid = `${filename}-${event.startDate.getTime()}@marchrussell.com`;
  const icsContent = generateICalContent(event, uid);

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.success("Calendar file downloaded");
};

/**
 * Opens Google Calendar in a new tab
 */
export const openGoogleCalendar = (event: CalendarEvent): void => {
  window.open(getGoogleCalendarUrl(event), '_blank');
};

/**
 * Opens Outlook Web Calendar in a new tab
 */
export const openOutlookCalendar = (event: CalendarEvent): void => {
  window.open(getOutlookCalendarUrl(event), '_blank');
};

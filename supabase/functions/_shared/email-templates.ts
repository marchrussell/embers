/**
 * Shared email templates for MARCH automated email system
 * Clean, sophisticated HTML emails matching the website design
 */

import { getStorageUrl } from "./supabaseConfig.ts";

/**
 * Escapes HTML entities to prevent XSS attacks in email content.
 * This is critical for newsletter content that comes from admin input.
 */
const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Converts plain text content to safe HTML paragraphs.
 * Escapes HTML entities and converts line breaks to paragraph tags.
 */
const sanitizeNewsletterContent = (content: string): string => {
  // Escape all HTML entities first
  const escaped = escapeHtml(content);
  
  // Convert double line breaks to paragraph breaks
  const paragraphs = escaped
    .split(/\n\n+/)
    .filter(p => p.trim())
    .map(p => `<p class="text">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('\n  ');
  
  return paragraphs;
};

const emailStyles = `
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
      background-color: #f8f7f4;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .heading {
      font-size: 24px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 24px;
      line-height: 1.4;
    }
    .text {
      font-size: 16px;
      line-height: 1.6;
      color: #4a4a4a;
      margin-bottom: 16px;
    }
    .button {
      background-color: #1a1a1a;
      color: #ffffff !important;
      padding: 14px 28px;
      border-radius: 6px;
      text-decoration: none;
      font-size: 16px;
      font-weight: 500;
      display: inline-block;
      margin-top: 16px;
      margin-bottom: 16px;
    }
    .signature {
      margin-top: 32px;
      font-size: 16px;
      color: #4a4a4a;
    }
    .link {
      color: #1a1a1a;
      text-decoration: underline;
    }
  </style>
`;

const wrapEmail = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${emailStyles}
</head>
<body>
  <div class="container">
    ${content}
  </div>
</body>
</html>
`;

const signature = `
  <p class="signature">
    Kind regards,<br/>
    <strong>March</strong>
  </p>
`;

const unsubscribeFooter = (isNewsletter: boolean = false) => {
  // Get the base URL from environment or use a fallback
  const baseUrl = Deno.env.get('VITE_SUPABASE_URL')
    ? `https://${Deno.env.get('VITE_SUPABASE_URL')?.split('//')[1]?.split('/')[0]}`
    : 'https://yoursite.com';
  
  return `
  <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e5e5;">
    <p style="font-size: 12px; color: #999; text-align: center; line-height: 1.6;">
      ${isNewsletter ? 'No longer want to receive these emails?' : 'Want to manage your email preferences?'}<br/>
      <a href="${baseUrl}/newsletter/unsubscribe" style="color: #1a1a1a; text-decoration: underline;">Unsubscribe</a>
    </p>
  </div>
`;
};

const wrapEmailWithFooter = (content: string, includeUnsubscribe: boolean = false, isNewsletter: boolean = false) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${emailStyles}
</head>
<body>
  <div class="container">
    ${content}
    ${includeUnsubscribe ? unsubscribeFooter(isNewsletter) : ''}
  </div>
</body>
</html>
`;

// ===== NEWSLETTER EMAIL =====

export const newsletterEmail = (subject: string, content: string, preheader?: string) => wrapEmailWithFooter(`
  ${preheader ? `<div style="display:none;font-size:1px;color:#fefefe;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${escapeHtml(preheader)}</div>` : ''}
  ${sanitizeNewsletterContent(content)}
`, true, true);

// ===== NEWSLETTER WELCOME EMAIL =====

export const newsletterWelcomeEmail = (firstName: string) => wrapEmailWithFooter(`
  <div style="text-align: center; margin-bottom: 32px;">
    <img 
      src="${getStorageUrl('class-images', 'march-bio-photo.jpg')}" 
      alt="March Russell" 
      style="width: 180px; height: 180px; border-radius: 50%; object-fit: cover; margin: 0 auto; border: 4px solid #f8f7f4;"
    />
  </div>
  
  <h1 style="font-family: 'PP Editorial Old', Georgia, serif; font-size: 32px; font-weight: 400; color: #1a1a1a; margin-bottom: 32px; text-align: center; font-style: italic;">
    A Warm Welcome
  </h1>
  
  <div style="max-width: 480px; margin: 0 auto; font-family: 'PP Editorial Old', Georgia, serif; font-size: 17px; line-height: 1.8; color: #4a4a4a; font-style: italic;">
    <p style="margin-bottom: 20px;">Hi ${firstName},</p>
    
    <p style="margin-bottom: 20px;">Thank you for being here. I'm grateful you've joined this space.</p>
    
    <p style="margin-bottom: 20px;">I'll be in touch with thoughts, updates, and moments of calm that I hope will support you in meaningful ways.</p>
    
    <p style="margin-bottom: 20px;">I'm honoured to be part of your journey.</p>
    
    <p style="margin-bottom: 0; margin-top: 32px;">
      Big Love,<br/>
      <strong style="font-weight: 600;">March</strong>
    </p>
  </div>
`, true, true);

// ===== POST-PAYMENT SETUP EMAILS =====

export const paymentConfirmationEmail = (firstName: string, setupUrl: string) => wrapEmailWithFooter(`
  <h1 class="heading">You're in! Let's get your account set up</h1>
  <p class="text">Hi ${firstName},</p>
  <p class="text">Thanks for subscribing. Your payment went through successfully and your subscription's ready.</p>
  <p class="text">There's just one short step to finish setting things up.</p>
  <a href="${setupUrl}" class="button">Complete Your Account Setup</a>
  <p class="text">Once that's done, you'll be able to access everything included in your subscription.</p>
  <p class="text">If you have any questions, just reply to this email and I'll be happy to help.</p>
  ${signature}
`, false);

export const setupReminderDay1Email = (firstName: string, setupUrl: string) => wrapEmailWithFooter(`
  <h1 class="heading">Finish setting up your account</h1>
  <p class="text">Hi ${firstName},</p>
  <p class="text">Just a quick reminder that your subscription's ready, but your account still needs to be set up.</p>
  <p class="text">It only takes a moment and ensures you can start using everything straight away.</p>
  <a href="${setupUrl}" class="button">Complete My Account Setup</a>
  <p class="text">If you need help, reply to this email and I'll sort it out for you.</p>
  ${signature}
`, false);

export const finalReminderDay3Email = (firstName: string, setupUrl: string) => wrapEmailWithFooter(`
  <h1 class="heading">Don't miss out on your subscription</h1>
  <p class="text">Hi ${firstName},</p>
  <p class="text">I noticed you haven't finished setting up your account yet. No problem if you've been busy, but I'd like to make sure you get full access to your subscription.</p>
  <p class="text">You can complete setup here:</p>
  <a href="${setupUrl}" class="button">Finish My Account Setup</a>
  <p class="text">If you've changed your mind or need help, just let me know.</p>
  ${signature}
`, false);

export const finalNoticeDay7Email = (firstName: string, setupUrl: string) => wrapEmailWithFooter(`
  <h1 class="heading">Your subscription will be cancelled soon</h1>
  <p class="text">Hi ${firstName},</p>
  <p class="text">It's been a little while since you subscribed and your account still hasn't been set up.</p>
  <p class="text">To keep things fair, I'll cancel and refund your subscription if setup isn't completed soon.</p>
  <p class="text">If you'd like to keep your subscription active, please finish your setup below.</p>
  <a href="${setupUrl}" class="button">Complete My Account Setup</a>
  <p class="text">If you no longer wish to continue, there's nothing you need to do.</p>
  ${signature}
`, false);

// ===== WELCOME & ONBOARDING EMAILS =====

export const welcomeEmail = (firstName: string, loginUrl: string, quickTipsUrl: string) => wrapEmailWithFooter(`
  <h1 class="heading">You're all set</h1>
  <p class="text">Hi ${firstName},</p>
  <p class="text">Your account's all set up and your subscription's active.</p>
  <p class="text">You can log in anytime here:</p>
  <a href="${loginUrl}" class="button">Go to My Account</a>
  <p class="text">If you'd like some quick tips for getting started, you can find them here:</p>
  <p class="text"><a href="${quickTipsUrl}" class="link">View Quick Tips</a></p>
  <p class="text">I'm glad to have you here.</p>
  ${signature}
`, false);

export const usageNudgeEmail = (firstName: string, loginUrl: string, perfectBreathUrl: string) => wrapEmailWithFooter(`
  <h1 class="heading">A few ideas to get started</h1>
  <p class="text">Hi ${firstName},</p>
  <p class="text">I hope you've had a chance to explore the app. Here are a few ideas to help you get more out of your subscription:</p>
  <p class="text">• <strong>March Chat</strong> - for accountability and structure</p>
  <p class="text">• <strong>Programs</strong> - for direction and guided learning</p>
  <p class="text">• <strong>The Perfect Breath</strong> - start with a daily 10-minute practice. Coherent breathing is designed to re-balance the nervous system and create a state of coherence within the mind and body. It allows the body to synchronise into a state of flow and optimal efficiency; improving heart rate variability, oxygen delivery, nervous system regulation, brain function, circulation, and so much more.</p>
  <a href="${perfectBreathUrl}" class="button">The Perfect Breath 6:6</a>
  <p class="text">Log in anytime here:</p>
  <p class="text"><a href="${loginUrl}" class="link">Go to My Account</a></p>
  ${signature}
`, false);

export const checkInEmail = (firstName: string) => wrapEmailWithFooter(`
  <h1 class="heading">How's everything going?</h1>
  <p class="text">Hi ${firstName},</p>
  <p class="text">Just checking in to see how things are going so far.</p>
  <p class="text">If you have any feedback, questions, or need help with anything, I'd love to hear from you. You can reply to this email here - it comes straight to me.</p>
  ${signature}
`, false);

// ===== FAILED PAYMENT EMAILS =====

export const paymentFailedEmail = (firstName: string, updatePaymentUrl: string) => wrapEmailWithFooter(`
  <h1 class="heading">There was a problem with your payment</h1>
  <p class="text">Hi ${firstName},</p>
  <p class="text">It looks like your recent payment didn't go through. This sometimes happens if a card has expired or a bank blocks a transaction.</p>
  <p class="text">You can update your payment details here:</p>
  <a href="${updatePaymentUrl}" class="button">Update Payment Method</a>
  <p class="text">Once updated, your subscription will resume automatically.</p>
  ${signature}
`, false);

export const retryReminderEmail = (firstName: string, updatePaymentUrl: string) => wrapEmailWithFooter(`
  <h1 class="heading">Please update your payment details</h1>
  <p class="text">Hi ${firstName},</p>
  <p class="text">Just a quick reminder that your payment hasn't gone through yet. To keep your subscription active, please update your payment details below.</p>
  <a href="${updatePaymentUrl}" class="button">Update Payment Details</a>
  <p class="text">If you're having any issues, reply to this email and I'll help you fix it.</p>
  ${signature}
`, false);

export const paymentFinalNoticeEmail = (firstName: string, updatePaymentUrl: string) => wrapEmailWithFooter(`
  <h1 class="heading">Your subscription will be paused</h1>
  <p class="text">Hi ${firstName},</p>
  <p class="text">Your payment still hasn't gone through, so your subscription will be paused soon.</p>
  <p class="text">You can resolve this quickly by updating your payment details here:</p>
  <a href="${updatePaymentUrl}" class="button">Update Payment Method</a>
  <p class="text">Once that's done, your access will resume automatically.</p>
  ${signature}
`, false);

// ===== CANCELLATION EMAILS =====

export const cancellationConfirmationEmail = (firstName: string, restartUrl: string) => wrapEmailWithFooter(`
  <h1 class="heading">Your subscription has been cancelled</h1>
  <p class="text">Hi ${firstName},</p>
  <p class="text">I've processed your cancellation request and your subscription won't renew at the end of your billing period.</p>
  <p class="text">If you change your mind, you're always welcome back.</p>
  <a href="${restartUrl}" class="button">Restart My Subscription</a>
  ${signature}
`, false);

export const winBackEmail = (firstName: string, restartUrl: string) => wrapEmailWithFooter(`
  <h1 class="heading">I'd love to have you back</h1>
  <p class="text">Hi ${firstName},</p>
  <p class="text">It's been a while since you've been active. I wanted to reach out and see if there's anything I can do to help bring you back.</p>
  <p class="text">If you'd like to restart your subscription, you can do that here:</p>
  <a href="${restartUrl}" class="button">Restart My Subscription</a>
  ${signature}
`, false);

// ===== TRANSACTIONAL EMAILS =====

export const refundConfirmationEmail = (firstName: string, amount: string) => wrapEmailWithFooter(`
  <h1 class="heading">Your refund has been processed</h1>
  <p class="text">Hi ${firstName},</p>
  <p class="text">Your refund of ${amount} has been processed and should appear in your account within 5-10 business days.</p>
  ${signature}
`, false);

export const planChangeEmail = (firstName: string, planName: string, nextPaymentDate: string, manageUrl: string) => wrapEmailWithFooter(`
  <h1 class="heading">Your subscription has been updated</h1>
  <p class="text">Hi ${firstName},</p>
  <p class="text">Your subscription has been changed to ${planName}. Your next payment of ${nextPaymentDate} will be charged on your next billing date.</p>
  <p class="text">You can view your subscription details here:</p>
  <a href="${manageUrl}" class="button">Manage My Subscription</a>
  ${signature}
`, false);

export const supportAcknowledgementEmail = (firstName: string) => wrapEmailWithFooter(`
  <h1 class="heading">Thanks for your message</h1>
  <p class="text">Hi ${firstName},</p>
  <p class="text">I've received your message and I'll get back to you as soon as possible, usually within 24 hours.</p>
  <p class="text">If your query is urgent, feel free to reply to this email and I'll prioritise it.</p>
  ${signature}
`, false);

// ===== EVENT BOOKING EMAILS =====

interface EventDetails {
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  quantity: number;
  totalAmount: number;
}

export const eventBookingConfirmationEmail = (attendeeName: string, details: EventDetails) => wrapEmailWithFooter(`
  <div style="text-align: center; margin-bottom: 32px;">
    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #9F542C 0%, #d4a574 100%); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
      <span style="font-size: 32px;">✓</span>
    </div>
    <h1 style="font-family: 'PP Editorial Old', Georgia, serif; font-size: 28px; font-weight: 400; color: #1a1a1a; margin: 0;">Booking Confirmed</h1>
  </div>
  
  <p class="text">Hi ${attendeeName},</p>
  <p class="text">Thank you for booking your spot. I'm looking forward to practicing with you.</p>
  
  <div style="background: #f8f7f4; border-radius: 12px; padding: 24px; margin: 28px 0;">
    <h2 style="font-family: 'PP Editorial Old', Georgia, serif; font-size: 20px; font-weight: 400; color: #1a1a1a; margin: 0 0 20px 0; font-style: italic;">Event Details</h2>
    
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #666; font-size: 14px; width: 100px;">Event</td>
        <td style="padding: 8px 0; color: #1a1a1a; font-size: 16px; font-weight: 500;">${details.eventTitle}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666; font-size: 14px;">Date</td>
        <td style="padding: 8px 0; color: #1a1a1a; font-size: 16px;">${details.eventDate}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666; font-size: 14px;">Time</td>
        <td style="padding: 8px 0; color: #1a1a1a; font-size: 16px;">${details.eventTime}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666; font-size: 14px;">Location</td>
        <td style="padding: 8px 0; color: #1a1a1a; font-size: 16px;">${details.location}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666; font-size: 14px;">Tickets</td>
        <td style="padding: 8px 0; color: #1a1a1a; font-size: 16px;">${details.quantity}</td>
      </tr>
      ${details.totalAmount > 0 ? `
      <tr>
        <td style="padding: 8px 0; color: #666; font-size: 14px;">Total Paid</td>
        <td style="padding: 8px 0; color: #1a1a1a; font-size: 16px; font-weight: 500;">£${(details.totalAmount / 100).toFixed(2)}</td>
      </tr>
      ` : ''}
    </table>
  </div>
  
  ${details.location !== 'Online' ? `
  <div style="background: #fff8f0; border-left: 4px solid #d4a574; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
    <p style="margin: 0; font-size: 14px; color: #666;">
      <strong style="color: #1a1a1a;">Venue:</strong> ${details.location}<br/>
      <span style="font-size: 13px;">Please arrive 5-10 minutes before the session begins.</span>
    </p>
  </div>
  ` : `
  <div style="background: #f0f8ff; border-left: 4px solid #4a90d9; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
    <p style="margin: 0; font-size: 14px; color: #666;">
      <strong style="color: #1a1a1a;">Online Event:</strong><br/>
      <span style="font-size: 13px;">A Zoom link will be sent to you before the session.</span>
    </p>
  </div>
  `}
  
  <p class="text" style="margin-top: 28px;">A calendar invite is attached to this email. Add it to your calendar so you don't miss it.</p>
  
  <p class="text">See you there.</p>
  
  ${signature}
`, false);

export const eventBookingAdminNotificationEmail = (details: {
  attendeeName: string;
  attendeeEmail: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  quantity: number;
  totalAmount: number;
  paymentId: string;
}) => wrapEmail(`
  <h1 style="font-size: 22px; color: #1a1a1a; margin-bottom: 24px;">New Event Booking</h1>
  
  <table style="width: 100%; border-collapse: collapse; background: #f8f7f4; border-radius: 8px; overflow: hidden;">
    <tr style="border-bottom: 1px solid #e5e5e5;">
      <td style="padding: 12px 16px; color: #666; font-size: 14px; width: 140px;">Attendee</td>
      <td style="padding: 12px 16px; color: #1a1a1a; font-size: 15px;"><strong>${details.attendeeName}</strong></td>
    </tr>
    <tr style="border-bottom: 1px solid #e5e5e5;">
      <td style="padding: 12px 16px; color: #666; font-size: 14px;">Email</td>
      <td style="padding: 12px 16px; color: #1a1a1a; font-size: 15px;"><a href="mailto:${details.attendeeEmail}" style="color: #4a90d9;">${details.attendeeEmail}</a></td>
    </tr>
    <tr style="border-bottom: 1px solid #e5e5e5;">
      <td style="padding: 12px 16px; color: #666; font-size: 14px;">Event</td>
      <td style="padding: 12px 16px; color: #1a1a1a; font-size: 15px;">${details.eventTitle}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e5e5e5;">
      <td style="padding: 12px 16px; color: #666; font-size: 14px;">Date</td>
      <td style="padding: 12px 16px; color: #1a1a1a; font-size: 15px;">${details.eventDate}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e5e5e5;">
      <td style="padding: 12px 16px; color: #666; font-size: 14px;">Time</td>
      <td style="padding: 12px 16px; color: #1a1a1a; font-size: 15px;">${details.eventTime}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e5e5e5;">
      <td style="padding: 12px 16px; color: #666; font-size: 14px;">Tickets</td>
      <td style="padding: 12px 16px; color: #1a1a1a; font-size: 15px;">${details.quantity}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e5e5e5;">
      <td style="padding: 12px 16px; color: #666; font-size: 14px;">Amount</td>
      <td style="padding: 12px 16px; color: #1a1a1a; font-size: 15px; font-weight: 600;">£${(details.totalAmount / 100).toFixed(2)}</td>
    </tr>
    <tr>
      <td style="padding: 12px 16px; color: #666; font-size: 14px;">Payment ID</td>
      <td style="padding: 12px 16px; color: #666; font-size: 13px; font-family: monospace;">${details.paymentId}</td>
    </tr>
  </table>
  
  <p style="margin-top: 24px; font-size: 14px; color: #666;">
    <a href="https://marchrussell.com/admin/event-bookings" style="color: #4a90d9; text-decoration: underline;">View all bookings →</a>
  </p>
`);

// ===== ICAL GENERATION =====

export interface ICalEventDetails {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  organizerName: string;
  organizerEmail: string;
}

export const generateICalContent = (event: ICalEventDetails): string => {
  const formatICalDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };
  
  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@marchrussell.com`;
  const dtstamp = formatICalDate(new Date());
  
  // Escape special characters in text fields
  const escapeText = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;')
      .replace(/\n/g, '\\n');
  };
  
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'PRODID:-//March Russell//Events//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${formatICalDate(event.startDate)}`,
    `DTEND:${formatICalDate(event.endDate)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `LOCATION:${escapeText(event.location)}`,
    `ORGANIZER;CN=${escapeText(event.organizerName)}:mailto:${event.organizerEmail}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Event reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
};

// ===== EVENT REMINDER EMAIL =====

interface EventReminderDetails {
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  quantity: number;
}

export const eventReminderEmail = (attendeeName: string, details: EventReminderDetails) => wrapEmailWithFooter(`
  <div style="text-align: center; margin-bottom: 32px;">
    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #9F542C 0%, #d4a574 100%); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
      <span style="font-size: 32px;">🔔</span>
    </div>
    <h1 style="font-family: 'PP Editorial Old', Georgia, serif; font-size: 28px; font-weight: 400; color: #1a1a1a; margin: 0;">Your Session is Tomorrow</h1>
  </div>
  
  <p class="text">Hi ${attendeeName},</p>
  <p class="text">Just a friendly reminder that you have a session coming up tomorrow. I'm looking forward to practicing with you.</p>
  
  <div style="background: #f8f7f4; border-radius: 12px; padding: 24px; margin: 28px 0;">
    <h2 style="font-family: 'PP Editorial Old', Georgia, serif; font-size: 20px; font-weight: 400; color: #1a1a1a; margin: 0 0 20px 0; font-style: italic;">Event Details</h2>
    
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #666; font-size: 14px; width: 100px;">Event</td>
        <td style="padding: 8px 0; color: #1a1a1a; font-size: 16px; font-weight: 500;">${details.eventTitle}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666; font-size: 14px;">Date</td>
        <td style="padding: 8px 0; color: #1a1a1a; font-size: 16px;">${details.eventDate}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666; font-size: 14px;">Time</td>
        <td style="padding: 8px 0; color: #1a1a1a; font-size: 16px;">${details.eventTime}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666; font-size: 14px;">Location</td>
        <td style="padding: 8px 0; color: #1a1a1a; font-size: 16px;">${details.location}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666; font-size: 14px;">Tickets</td>
        <td style="padding: 8px 0; color: #1a1a1a; font-size: 16px;">${details.quantity}</td>
      </tr>
    </table>
  </div>
  
  ${details.location !== 'Online' ? `
  <div style="background: #fff8f0; border-left: 4px solid #d4a574; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
    <p style="margin: 0; font-size: 14px; color: #666;">
      <strong style="color: #1a1a1a;">Venue:</strong> ${details.location}<br/>
      <span style="font-size: 13px;">Please arrive 5-10 minutes before the session begins.</span>
    </p>
  </div>
  ` : `
  <div style="background: #f0f8ff; border-left: 4px solid #4a90d9; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
    <p style="margin: 0; font-size: 14px; color: #666;">
      <strong style="color: #1a1a1a;">Online Event:</strong><br/>
      <span style="font-size: 13px;">Make sure you have the Zoom link ready. Check your original booking confirmation email if needed.</span>
    </p>
  </div>
  `}
  
  <p class="text" style="margin-top: 28px;">See you tomorrow.</p>
  
  <p class="signature">
    Kind regards,<br/>
    <strong>March</strong>
  </p>
`, false);
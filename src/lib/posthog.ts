import posthog from 'posthog-js';

const POSTHOG_KEY = 'phc_cfW4RQu4iDxm8tCZP6qkZJg25P0YrRAZ5Szj4LuFBp5';
const POSTHOG_HOST = 'https://eu.i.posthog.com';

export const initPostHog = () => {
  if (typeof window !== 'undefined' && POSTHOG_KEY) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
    });
  }
};

export const identifyUser = (userId: string, properties?: Record<string, unknown>) => {
  posthog.identify(userId, properties);
};

export const resetUser = () => {
  posthog.reset();
};

export const trackEvent = (event: string, properties?: Record<string, unknown>) => {
  posthog.capture(event, properties);
};

// Pre-defined events for consistency
export const analytics = {
  sessionStarted: (sessionId: string, title: string) => 
    trackEvent('session_started', { session_id: sessionId, session_title: title }),
  
  sessionCompleted: (sessionId: string, title: string, durationMinutes: number) => 
    trackEvent('session_completed', { session_id: sessionId, session_title: title, duration_minutes: durationMinutes }),
  
  subscriptionStarted: (planType: string) => 
    trackEvent('subscription_started', { plan_type: planType }),
  
  signupCompleted: () => 
    trackEvent('signup_completed'),
  
  onboardingCompleted: () => 
    trackEvent('onboarding_completed'),
  
  eventBooked: (eventId: string, eventTitle: string) => 
    trackEvent('event_booked', { event_id: eventId, event_title: eventTitle }),
  
  courseStarted: (courseId: string, courseTitle: string) => 
    trackEvent('course_started', { course_id: courseId, course_title: courseTitle }),
  
  lessonCompleted: (lessonId: string, lessonTitle: string) => 
    trackEvent('lesson_completed', { lesson_id: lessonId, lesson_title: lessonTitle }),
};

export { posthog };

import { lazy } from 'react';

// Lazy load all modal components to reduce initial bundle size
export const SubscriptionModal = lazy(() => 
  import('@/components/SubscriptionModal').then(module => ({ default: module.SubscriptionModal }))
);

export const TestimonialsModal = lazy(() => 
  import('@/components/TestimonialsModal').then(module => ({ default: module.TestimonialsModal }))
);

export const ContactFormModal = lazy(() => 
  import('@/components/ContactFormModal').then(module => ({ default: module.ContactFormModal }))
);

export const NewsletterModal = lazy(() => 
  import('@/components/NewsletterModal').then(module => ({ default: module.NewsletterModal }))
);

export const ExitIntentPopup = lazy(() =>
  import('@/components/ExitIntentPopup').then(module => ({ default: module.ExitIntentPopup }))
);

export const ClassPlayerModal = lazy(() =>
  import('@/components/ClassPlayerModal').then(module => ({ default: module.ClassPlayerModal }))
);

export const ContactTeamsModal = lazy(() =>
  import('@/components/ContactTeamsModal').then(module => ({ default: module.ContactTeamsModal }))
);

export const RiseArcIntroModal = lazy(() =>
  import('@/components/RiseArcIntroModal')
);

export const VaseBreathModal = lazy(() =>
  import('@/components/VaseBreathModal').then(module => ({ default: module.VaseBreathModal }))
);

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { COURSE_PAYMENT_LINKS, COURSE_SLUG_TO_PRICE } from "@/lib/stripePrices";
import { Check, Loader2, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  duration_days: number;
  price_cents: number;
  currency: string;
  stripe_price_id: string | null;
  image_url: string | null;
}

interface CourseModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
}

const courseContent: Record<string, { 
  subtitle: string;
  description: string;
  whatsInside: string[];
  foundingPrice?: string;
  fullPrice?: string;
}> = {
  'breathwork-anxiety-reset': {
    subtitle: 'A 7-day reset for clarity, steadiness, and emotional ease.',
    description: 'If your system feels wired, tight, or constantly "on," this 7-day programme helps you unwind the patterns beneath anxiety — through simple, effective breathwork sequences that settle your physiology, soften tension, and regulate your baseline.\n\nThis is a short, powerful reset designed to restore clarity and calm from the inside out.',
    whatsInside: [
      '7 guided breathwork sessions',
      'Short calming reset practices',
      'Tools for in-the-moment regulation',
      'A gentle structure to help you unwind daily',
      '12 months access'
    ]
  },
  'anxiety-reset': {
    subtitle: 'A 7-day reset for clarity, steadiness, and emotional ease.',
    description: 'If your system feels wired, tight, or constantly "on," this 7-day programme helps you unwind the patterns beneath anxiety — through simple, effective breathwork sequences that settle your physiology, soften tension, and regulate your baseline.\n\nThis is a short, powerful reset designed to restore clarity and calm from the inside out.',
    whatsInside: [
      '7 guided breathwork sessions',
      'Short calming reset practices',
      'Tools for in-the-moment regulation',
      'A gentle structure to help you unwind daily',
      '12 months access'
    ]
  },
  'sleep-nsdr-pack': {
    subtitle: 'A 14-day evening reset for deep, nourishing rest.',
    description: 'For those who feel wired-but-tired, restless at night, or unable to fully switch off — this 14-day programme helps retrain your body to settle, soften, and let go.\n\nUsing breathwork, NSDR, somatic downshifting, and evening rituals, you\'ll give your system the conditions it needs to genuinely rest.',
    whatsInside: [
      '14 guided evening sessions',
      'Breathwork + NSDR',
      'Tools for settling a wired system',
      'Gentle nightly structure',
      '12 months access'
    ],
    foundingPrice: '£67',
    fullPrice: '(Full price £97 at launch)'
  },
  'emotional-first-aid-kit': {
    subtitle: 'Instant tools for overwhelm — plus a 3-day guided reset.',
    description: 'For moments when you feel overloaded, reactive, shut down, or emotionally stretched — this kit gives you practical tools to regulate in real time.\n\nPlus, a 3-day guided reset to help you rebuild emotional steadiness and reconnect with yourself.',
    whatsInside: [
      'Instant-use regulation tools',
      'Breathing for overwhelm',
      'Tools for shutdown + numbness',
      '3-day guided steadying sequence',
      '12 months access'
    ]
  },
  'emotional-regulation-toolkit': {
    subtitle: 'A 3-day stabilisation toolkit for when life feels "too much."',
    description: 'For moments when you feel overloaded, reactive, shut down, or emotionally stretched — this kit gives you practical tools to regulate in real time.\n\nPlus, a 3-day guided reset to help you rebuild emotional steadiness and reconnect with yourself.',
    whatsInside: [
      'Rapid regulation practices (5–10 minutes each)',
      'Breathwork + somatic grounding for acute stress',
      'Tools to stabilise panic, overwhelm, or dissociation',
      'Techniques you can use anytime, anywhere',
      '12 months access'
    ],
    foundingPrice: '£45',
    fullPrice: '(Full price £57 at launch)'
  },
  'nervous-system-reset': {
    subtitle: 'Restore steadiness, reduce overwhelm, and help your body feel safe again.',
    description: 'A guided 14-day reset designed to calm stress responses, soften emotional reactivity, and support your nervous system back toward balance.\n\nDaily practices combine breathwork, somatic regulation, and nervous-system-informed tools you can use in real life — without forcing calm or bypassing what\'s present.',
    whatsInside: [
      '14 guided daily practices',
      'Breathwork + somatic regulation techniques',
      'Tools for calming stress responses',
      'Practices for emotional steadiness',
      '12 months access'
    ]
  }
};

export const CourseModal = ({ course, isOpen, onClose }: CourseModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  if (!course) return null;

  const content = courseContent[course.slug] || {
    subtitle: '',
    description: course.description || '',
    whatsInside: ['Course content coming soon'],
  };

  const formatPrice = (cents: number, currency: string) => {
    const amount = cents / 100;
    if (currency === 'gbp') return `£${amount}`;
    if (currency === 'usd') return `$${amount}`;
    return `${amount} ${currency.toUpperCase()}`;
  };

  // Get the payment link for this course
  const paymentLink = COURSE_PAYMENT_LINKS[course.slug];
  const priceId = COURSE_SLUG_TO_PRICE[course.slug] || course.stripe_price_id;

  const handlePurchaseClick = async () => {
    if (!user) {
      // Redirect to auth if not logged in
      navigate(`/auth?redirect=/courses&course=${course.slug}`);
      onClose();
      return;
    }
    
    // If we have a direct payment link, open it
    if (paymentLink) {
      window.open(paymentLink, '_blank', 'noopener,noreferrer');
      onClose();
      return;
    }

    // Otherwise use edge function checkout
    if (priceId) {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('create-course-checkout', {
          body: { courseId: course.id, priceId }
        });

        if (error) throw error;
        if (data?.url) {
          window.open(data.url, '_blank', 'noopener,noreferrer');
          onClose();
        }
      } catch (error) {
        console.error('Checkout error:', error);
        toast.error('Unable to start checkout. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        hideClose 
        className="max-h-[90vh] overflow-y-auto p-0 border-0 bg-transparent"
        style={{
          width: 'min(860px, 92vw)',
          maxWidth: 'min(860px, 92vw)',
          background: 'rgba(0, 0, 0, 0.68)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderRadius: '28px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 40px 100px rgba(0, 0, 0, 0.55)',
        }}
      >
        <DialogTitle className="sr-only">Course Details</DialogTitle>
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute z-50 transition-opacity hover:opacity-100"
          style={{
            top: '24px',
            right: '28px',
            opacity: 0.6,
          }}
        >
          <X style={{ width: '24px', height: '24px', color: 'white' }} />
        </button>

        <div className="p-8 md:p-12 space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[#C89B5F] text-sm tracking-[0.15em] uppercase">
              <span>{course.duration_days}-Day Course</span>
              <span>·</span>
              <span>{formatPrice(course.price_cents, course.currency)}</span>
            </div>
            
            <h2 className="font-editorial text-[#E6DBC7] leading-tight" style={{
              fontSize: 'clamp(2rem, 3.5vw, 3rem)'
            }}>
              {course.title}
            </h2>
            
            {content.subtitle && (
              <p className="text-white/80 italic leading-relaxed" style={{
                fontSize: 'clamp(1.1rem, 1.3vw, 1.25rem)'
              }}>
                {content.subtitle}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-4">
            <p className="text-white/90 leading-[1.8] whitespace-pre-line" style={{
              fontSize: 'clamp(1.05rem, 1.2vw, 1.2rem)'
            }}>
              {content.description}
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/20 my-8" />

          {/* What's Inside */}
          <div className="space-y-6">
            <h3 className="font-editorial text-[#E6DBC7]" style={{
              fontSize: 'clamp(1.5rem, 2vw, 1.75rem)'
            }}>
              What's Inside
            </h3>
            <ul className="space-y-4">
              {content.whatsInside.map((item, index) => (
                <li key={index} className="flex items-start gap-4">
                  <Check className="w-5 h-5 text-[#C89B5F] mt-0.5 flex-shrink-0" />
                  <span className="text-white/90 leading-relaxed" style={{
                    fontSize: 'clamp(1.05rem, 1.15vw, 1.15rem)'
                  }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/20 my-8" />

          {/* CTA Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              {content.foundingPrice ? (
                <>
                  <div className="flex items-baseline gap-3">
                    <p className="font-editorial text-[#E6DBC7]" style={{
                      fontSize: 'clamp(1.75rem, 2.5vw, 2.25rem)'
                    }}>
                      {content.foundingPrice}
                    </p>
                    <span className="text-white/40 line-through" style={{ fontSize: '1rem' }}>
                      {formatPrice(course.price_cents, course.currency)}
                    </span>
                  </div>
                  <p className="text-[#C89B5F] text-sm mt-1 uppercase tracking-wider">
                    Founding Release Rate
                  </p>
                  <p className="text-white/50 text-xs mt-1">
                    {content.fullPrice}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-editorial text-[#E6DBC7]" style={{
                    fontSize: 'clamp(1.75rem, 2.5vw, 2.25rem)'
                  }}>
                    {formatPrice(course.price_cents, course.currency)}
                  </p>
                  <p className="text-white/60 text-sm mt-1">
                    One-time payment · 12 months access
                  </p>
                </>
              )}
            </div>
            
            {/* Simple anchor/button - no loading state needed */}
            {user && paymentLink ? (
              <a
                href={paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="inline-flex items-center justify-center bg-transparent border border-[#E6DBC7] text-[#E6DBC7] hover:bg-[#E6DBC7] hover:text-background transition-all px-[22px] rounded-full"
                style={{ height: '48px', fontSize: '0.95rem' }}
              >
                Buy Now →
              </a>
            ) : (
              <button
                onClick={handlePurchaseClick}
                disabled={isLoading}
                className="inline-flex items-center justify-center bg-transparent border border-[#E6DBC7] text-[#E6DBC7] hover:bg-[#E6DBC7] hover:text-background transition-all px-[22px] rounded-full disabled:opacity-50"
                style={{ height: '48px', fontSize: '0.95rem' }}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : user ? 'Buy Now →' : 'Sign In to Purchase →'}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

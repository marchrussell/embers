import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ButtonLoadingSpinner } from "@/components/skeletons/ButtonLoadingSpinner";
import { ArrowRight, Check } from "lucide-react";
import { RISE_ARC_PRICES } from "@/lib/stripePrices";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

type ProgramType = 'self-study' | 'group' | 'one-on-one';

interface ArcProgramModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programType: ProgramType;
  onApply?: () => void;
}

const programContent = {
  'self-study': {
    title: "ARC Self-Study",
    subtitle: "4-Month Guided Journey",
    opener: "A structured, self-paced process to stabilise your nervous system, restore emotional clarity, and rebuild internal safety and connection — at a pace your body can genuinely trust.",
    perfectFor: "People who want structure and depth while moving privately, gently, and steadily through their healing — without live sessions.",
    featuresLabel: "Inside the Experience",
    features: [
      "Full ARC Core Curriculum (Foundation → Autonomy → Presence → Expansion)",
      "12 weeks of structured progression",
      "Functional breathing retraining",
      "Somatic, breathwork & presence practices",
      "Emotional integration tools",
      "ARC Journal for nervous system mapping",
      "6 months access to The Studio",
      "Bonus: Sleep & Burnout Module"
    ],
    tagline: "Self-paced, structured, powerful. Designed to meet you exactly where you are.",
    price: "£445",
    ctaText: "Enroll Now",
    ctaAction: 'checkout' as const
  },
  'group': {
    title: "ARC Group Programme",
    subtitle: "4-Month Live Immersion",
    opener: "A guided live immersion combining nervous system repair, emotional depth, and relational connection — held inside a safe, supportive community.",
    perfectFor: "People who want more than self-paced learning: they want to be supported, seen, regulated, reflected, and guided as they shift long-held patterns.",
    featuresLabel: "Everything in Self-Study, Plus",
    features: [
      "Weekly live ARC coaching sessions",
      "Relational safety & accountability",
      "Facilitated breathwork + somatic processing",
      "Personalised spotlight coaching",
      "Integration support for real-life application"
    ],
    tagline: "Held, seen, supported — without feeling lost in the crowd.",
    price: "£1,100",
    ctaText: "Book a Welcome Call",
    ctaAction: 'calendly' as const
  },
  'one-on-one': {
    title: "ARC 1:1 Programme",
    subtitle: "4-Month High-Touch Program",
    opener: "An intimate, personalised 4-month re-patterning process for profound emotional repair, internal safety, clarity, and lasting transformation.",
    perfectFor: "People ready for precision guidance, real-time support, and a deeply attuned relationship that holds their whole system.",
    featuresLabel: "Everything in Group, Plus",
    features: [
      "Weekly 1:1 ARC sessions",
      "Custom-tailored ARC programming",
      "Mon–Fri WhatsApp support",
      "Personal Nervous System Blueprint",
      "Your Integration Map",
      "Quarterly virtual retreats"
    ],
    tagline: "High-touch. Attuned. Life-changing. Nervous system repair from the inside out.",
    price: "£3,950",
    ctaText: "Apply for Programme",
    ctaAction: 'apply' as const
  }
};

const CALENDLY_URL = "https://calendly.com/march-marchrussell/welcome-call";

export function ArcProgramModal({ open, onOpenChange, programType, onApply }: ArcProgramModalProps) {
  const content = programContent[programType];
  const [loading, setLoading] = useState(false);

  const handleCTA = async () => {
    if (content.ctaAction === 'calendly' && onApply) {
      // Group mentorship also requires application form first
      onOpenChange(false);
      onApply();
    } else if (content.ctaAction === 'apply' && onApply) {
      onOpenChange(false);
      onApply();
    } else if (content.ctaAction === 'checkout') {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: {
            priceId: RISE_ARC_PRICES.SELF_STUDY,
            mode: 'payment'
          }
        });
        
        if (error) throw error;
        if (data?.url) {
          window.open(data.url, '_blank');
        }
      } catch (error) {
        console.error('Checkout error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[680px] w-[90vw] p-0 border-0 bg-transparent overflow-hidden"
        hideClose
      >
        <div className="relative rounded-[24px] overflow-hidden">
          {/* Background with glassmorphism */}
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xl" />
          <div className="absolute inset-0 border border-white/10 rounded-[24px]" />
          
          {/* Content */}
          <div className="relative z-10 p-10 md:p-12">
            {/* Close button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Title */}
            <h2 className="font-editorial text-[clamp(1.8rem,2.4vw,2.2rem)] text-white leading-[1.15] mb-1 pr-8">
              {content.title}
            </h2>
            
            {/* Subtitle */}
            <p className="text-white/50 text-[clamp(0.9rem,1vw,1rem)] mb-6">
              {content.subtitle}
            </p>

            {/* Opener */}
            <p className="text-white/85 text-[clamp(1rem,1.1vw,1.1rem)] leading-[1.65] mb-8 max-w-[580px]">
              {content.opener}
            </p>

            {/* Perfect for */}
            <div className="mb-8 pb-8 border-b border-white/10">
              <h3 className="text-[11px] uppercase tracking-[0.15em] text-accent-warm-primary font-medium mb-3">
                Perfect For
              </h3>
              <p className="text-white/80 text-[clamp(0.95rem,1vw,1.05rem)] leading-[1.55]">
                {content.perfectFor}
              </p>
            </div>

            {/* Features */}
            <div className="mb-8">
              <h3 className="text-[11px] uppercase tracking-[0.15em] text-accent-warm-primary font-medium mb-5">
                {content.featuresLabel}
              </h3>
              <ul className="space-y-3.5">
                {content.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <Check className="w-5 h-5 text-accent-warm-primary mt-0.5 flex-shrink-0 stroke-[2.5]" />
                    <span className="text-white/85 text-[clamp(0.95rem,1vw,1.05rem)] leading-[1.5]">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Tagline */}
            <p className="text-white/50 text-[clamp(0.9rem,0.95vw,1rem)] italic mb-10 leading-[1.6]">
              {content.tagline}
            </p>

            {/* CTA */}
            <div className="flex justify-center pt-6 border-t border-white/10">
              <Button
                onClick={handleCTA}
                disabled={loading}
                className="bg-transparent border border-white/40 text-white hover:bg-white/10
                         rounded-full px-7 py-3 h-auto text-[15px] font-medium tracking-wide
                         transition-colors duration-300 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <ButtonLoadingSpinner /> {content.ctaText}
                  </>
                ) : (
                  content.ctaText
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

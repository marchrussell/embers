import { ButtonLoadingSpinner } from "@/components/skeletons/ButtonLoadingSpinner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { RISE_ARC_PRICES } from "@/lib/stripePrices";
import { Check } from "lucide-react";
import { useState } from "react";

type ProgramType = "self-study" | "group" | "one-on-one";

interface ArcProgramModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programType: ProgramType;
  onApply?: () => void;
}

const programContent = {
  "self-study": {
    title: "ARC Self-Study",
    subtitle: "4-Month Guided Journey",
    opener:
      "A structured, self-paced process to stabilise your nervous system, restore emotional clarity, and rebuild internal safety and connection — at a pace your body can genuinely trust.",
    perfectFor:
      "People who want structure and depth while moving privately, gently, and steadily through their healing — without live sessions.",
    featuresLabel: "Inside the Experience",
    features: [
      "Full ARC Core Curriculum (Foundation → Autonomy → Presence → Expansion)",
      "12 weeks of structured progression",
      "Functional breathing retraining",
      "Somatic, breathwork & presence practices",
      "Emotional integration tools",
      "ARC Journal for nervous system mapping",
      "6 months access to The Studio",
      "Bonus: Sleep & Burnout Module",
    ],
    tagline: "Self-paced, structured, powerful. Designed to meet you exactly where you are.",
    price: "£445",
    ctaText: "Enroll Now",
    ctaAction: "checkout" as const,
  },
  group: {
    title: "ARC Group Programme",
    subtitle: "4-Month Live Immersion",
    opener:
      "A guided live immersion combining nervous system repair, emotional depth, and relational connection — held inside a safe, supportive community.",
    perfectFor:
      "People who want more than self-paced learning: they want to be supported, seen, regulated, reflected, and guided as they shift long-held patterns.",
    featuresLabel: "Everything in Self-Study, Plus",
    features: [
      "Weekly live ARC coaching sessions",
      "Relational safety & accountability",
      "Facilitated breathwork + somatic processing",
      "Personalised spotlight coaching",
      "Integration support for real-life application",
    ],
    tagline: "Held, seen, supported — without feeling lost in the crowd.",
    price: "£1,100",
    ctaText: "Book a Welcome Call",
    ctaAction: "calendly" as const,
  },
  "one-on-one": {
    title: "ARC 1:1 Programme",
    subtitle: "4-Month High-Touch Program",
    opener:
      "An intimate, personalised 4-month re-patterning process for profound emotional repair, internal safety, clarity, and lasting transformation.",
    perfectFor:
      "People ready for precision guidance, real-time support, and a deeply attuned relationship that holds their whole system.",
    featuresLabel: "Everything in Group, Plus",
    features: [
      "Weekly 1:1 ARC sessions",
      "Custom-tailored ARC programming",
      "Mon–Fri WhatsApp support",
      "Personal Nervous System Blueprint",
      "Your Integration Map",
      "Quarterly virtual retreats",
    ],
    tagline: "High-touch. Attuned. Life-changing. Nervous system repair from the inside out.",
    price: "£3,950",
    ctaText: "Apply for Programme",
    ctaAction: "apply" as const,
  },
};

export function ArcProgramModal({
  open,
  onOpenChange,
  programType,
  onApply,
}: ArcProgramModalProps) {
  const content = programContent[programType];
  const [loading, setLoading] = useState(false);

  const handleCTA = async () => {
    if (content.ctaAction === "calendly" && onApply) {
      // Group mentorship also requires application form first
      onOpenChange(false);
      onApply();
    } else if (content.ctaAction === "apply" && onApply) {
      onOpenChange(false);
      onApply();
    } else if (content.ctaAction === "checkout") {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("create-checkout", {
          body: {
            priceId: RISE_ARC_PRICES,
            mode: "payment",
          },
        });

        if (error) throw error;
        if (data?.url) {
          window.open(data.url, "_blank");
        }
      } catch (error) {
        console.error("Checkout error:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[90vw] max-w-[680px] overflow-hidden border-0 bg-transparent p-0"
        hideClose
      >
        <div className="relative overflow-hidden rounded-[24px]">
          {/* Background with glassmorphism */}
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xl" />
          <div className="absolute inset-0 rounded-[24px] border border-white/10" />

          {/* Content */}
          <div className="relative z-10 p-10 md:p-12">
            {/* Close button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-6 top-6 text-white/60 transition-colors hover:text-white"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Title */}
            <h2 className="mb-1 pr-8 font-editorial text-[clamp(1.8rem,2.4vw,2.2rem)] leading-[1.15] text-white">
              {content.title}
            </h2>

            {/* Subtitle */}
            <p className="mb-6 text-[clamp(0.9rem,1vw,1rem)] text-white/50">{content.subtitle}</p>

            {/* Opener */}
            <p className="mb-8 max-w-[580px] text-[clamp(1rem,1.1vw,1.1rem)] leading-[1.65] text-white/85">
              {content.opener}
            </p>

            {/* Perfect for */}
            <div className="mb-8 border-b border-white/10 pb-8">
              <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.15em] text-accent-warm-primary">
                Perfect For
              </h3>
              <p className="text-[clamp(0.95rem,1vw,1.05rem)] leading-[1.55] text-white/80">
                {content.perfectFor}
              </p>
            </div>

            {/* Features */}
            <div className="mb-8">
              <h3 className="mb-5 text-[11px] font-medium uppercase tracking-[0.15em] text-accent-warm-primary">
                {content.featuresLabel}
              </h3>
              <ul className="space-y-3.5">
                {content.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 stroke-[2.5] text-accent-warm-primary" />
                    <span className="text-[clamp(0.95rem,1vw,1.05rem)] leading-[1.5] text-white/85">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tagline */}
            <p className="mb-10 text-[clamp(0.9rem,0.95vw,1rem)] italic leading-[1.6] text-white/50">
              {content.tagline}
            </p>

            {/* CTA */}
            <div className="flex justify-center border-t border-white/10 pt-6">
              <Button
                onClick={handleCTA}
                disabled={loading}
                className="h-auto rounded-full border border-white/40 bg-transparent px-7 py-3 text-[15px] font-medium tracking-wide text-white transition-colors duration-300 hover:bg-white/10 disabled:opacity-50"
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

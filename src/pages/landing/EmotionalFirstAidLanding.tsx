import { COURSE_PAYMENT_LINKS } from "@/lib/stripePrices";
import {
  LandingHero,
  LandingProblemSection,
  LandingBenefitsSection,
  LandingWhatsInsideSection,
  LandingOutcomesSection,
  LandingCtaSection,
} from "@/components/landing";

const EmotionalFirstAidLanding = () => {
  const handleEnroll = () => {
    window.open(COURSE_PAYMENT_LINKS['emotional-first-aid-kit'], '_blank');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <LandingHero
        title="Emotional First Aid Kit"
        subtitle="A 3-day micro-course for instant grounding, regulation, and emotional steadiness."
        price="£57 • Immediate Access"
        tagline="When emotions spike or shut down — this brings you back to yourself."
        ctaText="Access the First Aid Kit"
        onCtaClick={handleEnroll}
      />

      <LandingProblemSection
        headline="Moments of emotional overwhelm can feel like:"
        hideSubheadline
        problems={[
          "Sudden intensity",
          "Feeling flooded",
          "Shutting down or going numb",
          "Losing access to clarity",
          "Feeling disconnected from yourself",
          "A body that's bracing, buzzing, or collapsing",
        ]}
        conclusion={
          <>
            Most people try to "think their way" out of it —<br />
            <span className="text-white/90">but in these moments, the body leads.</span>
            <br /><br />
            <span className="text-white/60">
              To feel steady again,<br />
              your nervous system needs immediate guidance — not advice.
            </span>
          </>
        }
      />

      <LandingBenefitsSection
        headline="Your calm-in-a-crisis protocol."
        description="This course teaches you fast, reliable tools to:"
        benefits={[
          "Ground quickly",
          "Stabilise emotional spikes",
          "Come out of shutdown",
          "Slow racing physiology",
          "Regain clarity and presence",
          "Feel safe in your body again",
        ]}
        conclusion="Use these tools anytime, anywhere."
      />

      <LandingWhatsInsideSection
        items={[
          "Rapid 2–5 minute regulation tools",
          "Somatic resets for overwhelm and shutdown",
          "ARC-informed breathing protocols",
          "Short guided practices you can use discreetly in real life",
          "A 3-day sequence that builds emotional agility",
          "Permanent access",
        ]}
        conclusion="Your personal toolkit for moments when you need support now, not later."
      />

      <LandingOutcomesSection
        headline="After 3 days, you'll feel:"
        outcomes={[
          "More capable in emotional spikes",
          "Less afraid of overwhelm",
          "Able to return to neutral faster",
          "Safer in your own body",
          "More emotionally available and grounded",
        ]}
        conclusion="You regain choice, even in intense moments."
      />

      <LandingCtaSection
        ctaText="Access Emotional First Aid — £57"
        subtext="Instant access • Use anytime • Keep for life"
        onCtaClick={handleEnroll}
      />
    </div>
  );
};

export default EmotionalFirstAidLanding;

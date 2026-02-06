import { COURSE_PAYMENT_LINKS } from "@/lib/stripePrices";
import {
  LandingHero,
  LandingProblemSection,
  LandingBenefitsSection,
  LandingWhatsInsideSection,
  LandingOutcomesSection,
  LandingCtaSection,
} from "@/components/landing";

const AnxietyResetLanding = () => {
  const handleEnroll = () => {
    window.open(COURSE_PAYMENT_LINKS['anxiety-reset'], '_blank');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <LandingHero
        title="Anxiety Reset"
        subtitle="A 7-day guided journey to calm your system, steady your mind, and return to centre."
        price="£47 • Instant Access"
        tagline="Bring your nervous system out of alarm — and into clarity, breath, and grounded presence."
        ctaText="Begin Anxiety Reset"
        onCtaClick={handleEnroll}
      />

      <LandingProblemSection
        headline={
          <>
            When anxiety takes over, it's not just mental —<br />
            <span className="text-white/70">your nervous system is firing in protection mode.</span>
          </>
        }
        subheadline="You might feel:"
        problems={[
          "Spiralling thoughts and emotional overwhelm",
          "Tight chest, shallow breath, difficulty settling",
          "Constant scanning, tension, restlessness",
          "Feeling \"on edge\" even when nothing is wrong",
          "Exhaustion from being wired and tired at the same time",
        ]}
        conclusion={
          <>
            It's not that you're failing to cope.<br />
            <span className="text-white/90">Your body is overprotecting — not overreacting.</span>
          </>
        }
      />

      <LandingBenefitsSection
        headline={
          <>
            When your system learns to settle,<br />your mind follows.
          </>
        }
        description="Anxiety Reset gives you daily 10-minute practices that retrain the way your body responds to stress — so you can:"
        benefits={[
          "Calm spiralling thoughts",
          "Release tension from the breath and body",
          "Break out of fight/flight loops",
          "Feel clearer, steadier, and more in control",
          "Return to a grounded, centred state — anytime",
        ]}
        conclusion={
          <>
            This is not mindset work.<br />
            <span className="text-white/80">It's nervous system repair.</span>
          </>
        }
      />

      <LandingWhatsInsideSection
        headline="Over 7 days, you'll get:"
        items={[
          "Daily breathwork + regulation practices to interrupt spirals and settle your system",
          "Short somatic tools to release anxiety from the body, not just the mind",
          "Guided sessions for real-time calm and clarity",
          "ARC-based emotional anchoring techniques",
          "A reset protocol you can use whenever stress spikes",
          "Lifetime access to revisit anytime you need it",
        ]}
        conclusion="Designed to be practical, accessible, and immediately usable in daily life."
      />

      <LandingOutcomesSection
        headline="After 7 days, you'll feel:"
        outcomes={[
          "Calmer in your body",
          "More spacious in your mind",
          "More present and responsive, not reactive",
          "Less overwhelmed, more anchored",
          "Able to settle anxiety before it escalates",
        ]}
        conclusion={
          <>
            Your system learns what calm feels like —<br />
            <span className="text-white/90">and how to return to it.</span>
          </>
        }
      />

      <LandingCtaSection
        ctaText="Begin Anxiety Reset — £47"
        subtext="Instant access • Self-guided • Keep for life"
        onCtaClick={handleEnroll}
      />
    </div>
  );
};

export default AnxietyResetLanding;

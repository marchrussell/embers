import { COURSE_PAYMENT_LINKS } from "@/lib/stripePrices";
import {
  LandingHero,
  LandingProblemSection,
  LandingBenefitsSection,
  LandingWhatsInsideSection,
  LandingOutcomesSection,
  LandingCtaSection,
} from "@/components/landing";

const SleepResetLanding = () => {
  const handleEnroll = () => {
    window.open(COURSE_PAYMENT_LINKS['sleep-nsdr-pack'], '_blank');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <LandingHero
        title="Sleep & NSDR Pack"
        subtitle="A 14-day protocol for deeper sleep, calmer nights, and waking restored."
        price="£97 • Instant Access"
        tagline="Repattern your nervous system for rest — not alertness."
        ctaText="Begin Sleep Reset"
        onCtaClick={handleEnroll}
      />

      <LandingProblemSection
        headline={
          <>
            When your system is stuck in stress,<br />
            <span className="text-white/70">sleep can't happen naturally.</span>
          </>
        }
        subheadline="You may experience:"
        problems={[
          "Difficulty falling asleep",
          "Waking through the night",
          "Feeling unrefreshed even after 8 hours",
          "A mind that won't slow down",
          "A body that won't let go",
        ]}
        conclusion={
          <>
            This isn't a willpower issue.<br />
            <span className="text-white/90">It's a regulation issue.</span>
            <br /><br />
            <span className="text-white/60">Your system is wired for vigilance — not restoration.</span>
          </>
        }
      />

      <LandingBenefitsSection
        headline="Restore the physiology of deep rest."
        description="This 14-day journey retrains your nervous system to deactivate, drift, and stay asleep — naturally. You'll learn to:"
        benefits={[
          "Downshift your system before bed",
          "Use breathwork to quiet inner tension",
          "Enter deeper parasympathetic states",
          "Regulate midnight spikes",
          "Wake clearer, lighter, and more replenished",
        ]}
        conclusion="This is sleep training for your nervous system, not your thoughts."
      />

      <LandingWhatsInsideSection
        items={[
          "Evening breathwork sessions for pre-sleep downregulation",
          "NSDR (Non-Sleep Deep Rest) practices for profound restoration",
          "Somatic tools to release stress residue from your body",
          "Morning reset sessions to start the day grounded",
          "A 14-day structured sequence that compounds night after night",
          "Lifetime access",
        ]}
        conclusion="Built for real people with busy lives — effective in under 15 minutes a day."
      />

      <LandingOutcomesSection
        headline="Within 14 days, you can expect:"
        outcomes={[
          "Falling asleep faster",
          "Fewer night-time awakenings",
          "More restorative deep rest",
          "Reduced tension + racing thoughts",
          "Waking with more clarity and energy",
        ]}
        conclusion={
          <>
            When the nervous system feels safe,<br />
            <span className="text-white/90">sleep becomes natural again.</span>
          </>
        }
      />

      <LandingCtaSection
        ctaText="Begin Sleep Reset — £97"
        subtext="Instant access • Self-guided • Keep for life"
        onCtaClick={handleEnroll}
      />
    </div>
  );
};

export default SleepResetLanding;

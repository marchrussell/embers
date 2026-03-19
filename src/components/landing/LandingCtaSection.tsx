import { cn } from "@/lib/utils";

interface LandingCtaSectionProps {
  ctaText: string;
  subtext?: string;
  onCtaClick: () => void;
  className?: string;
}

export const LandingCtaSection = ({
  ctaText,
  subtext = "Instant access • Self-guided • Keep for life",
  onCtaClick,
  className,
}: LandingCtaSectionProps) => {
  return (
    <section className={cn("border-t border-white/10 px-6 py-32 md:px-12 lg:px-24", className)}>
      <div className="mx-auto max-w-2xl text-center">
        <button
          onClick={onCtaClick}
          className="mb-8 inline-flex items-center rounded-full border border-white bg-transparent text-white transition-colors hover:bg-white/10"
          style={{
            fontSize: "clamp(1rem, 1.1vw, 1.15rem)",
            fontWeight: 400,
            letterSpacing: "0.02em",
            padding: "1.2rem 3rem",
          }}
        >
          {ctaText}
        </button>

        <p
          className="text-white/50"
          style={{
            fontSize: "clamp(0.85rem, 0.9vw, 0.95rem)",
          }}
        >
          {subtext}
        </p>
      </div>
    </section>
  );
};

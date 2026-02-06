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
    <section className={cn("px-6 md:px-12 lg:px-24 py-32 border-t border-white/10", className)}>
      <div className="max-w-2xl mx-auto text-center">
        <button
          onClick={onCtaClick}
          className="bg-transparent text-white border border-white rounded-full inline-flex items-center hover:bg-white/10 transition-colors mb-8"
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

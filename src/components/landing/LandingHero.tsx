import { cn } from "@/lib/utils";

interface LandingHeroProps {
  title: string;
  subtitle: string;
  price: string;
  tagline: string;
  ctaText: string;
  onCtaClick: () => void;
  className?: string;
}

export const LandingHero = ({
  title,
  subtitle,
  price,
  tagline,
  ctaText,
  onCtaClick,
  className,
}: LandingHeroProps) => {
  return (
    <section className={cn("min-h-[90vh] flex flex-col justify-center px-6 md:px-12 lg:px-24 py-24", className)}>
      <div className="max-w-4xl mx-auto text-center">
        <h1
          className="font-editorial text-white mb-8"
          style={{
            fontSize: "clamp(2.8rem, 5vw, 4.5rem)",
            lineHeight: 1.1,
            fontWeight: 300,
          }}
        >
          {title}
        </h1>

        <p
          className="text-white/90 mb-6 max-w-2xl mx-auto"
          style={{
            fontSize: "clamp(1.1rem, 1.4vw, 1.35rem)",
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </p>

        <p
          className="text-[#EC9037] font-light tracking-[0.15em] uppercase mb-8"
          style={{
            fontSize: "clamp(0.8rem, 0.9vw, 0.95rem)",
          }}
        >
          {price}
        </p>

        <p
          className="text-white/70 mb-10 max-w-xl mx-auto italic"
          style={{
            fontSize: "clamp(0.95rem, 1.1vw, 1.1rem)",
            lineHeight: 1.6,
          }}
        >
          {tagline}
        </p>

        <button
          onClick={onCtaClick}
          className="bg-transparent text-white border border-white rounded-full inline-flex items-center hover:bg-white/10 transition-colors"
          style={{
            fontSize: "clamp(0.95rem, 1vw, 1.05rem)",
            fontWeight: 400,
            letterSpacing: "0.02em",
            padding: "1rem 2.5rem",
          }}
        >
          {ctaText}
        </button>
      </div>
    </section>
  );
};

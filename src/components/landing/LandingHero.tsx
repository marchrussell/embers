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
    <section
      className={cn(
        "flex min-h-[90vh] flex-col justify-center px-6 py-24 md:px-12 lg:px-24",
        className
      )}
    >
      <div className="mx-auto max-w-4xl text-center">
        <h1
          className="mb-8 font-editorial text-white"
          style={{
            fontSize: "clamp(2.8rem, 5vw, 4.5rem)",
            lineHeight: 1.1,
            fontWeight: 300,
          }}
        >
          {title}
        </h1>

        <p
          className="mx-auto mb-6 max-w-2xl text-white/90"
          style={{
            fontSize: "clamp(1.1rem, 1.4vw, 1.35rem)",
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </p>

        <p
          className="mb-8 font-light uppercase tracking-[0.15em] text-[#EC9037]"
          style={{
            fontSize: "clamp(0.8rem, 0.9vw, 0.95rem)",
          }}
        >
          {price}
        </p>

        <p
          className="mx-auto mb-10 max-w-xl italic text-white/70"
          style={{
            fontSize: "clamp(0.95rem, 1.1vw, 1.1rem)",
            lineHeight: 1.6,
          }}
        >
          {tagline}
        </p>

        <button
          onClick={onCtaClick}
          className="inline-flex items-center rounded-full border border-white bg-transparent text-white transition-colors hover:bg-white/10"
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

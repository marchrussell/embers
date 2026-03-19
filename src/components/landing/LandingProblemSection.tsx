import { cn } from "@/lib/utils";

interface LandingProblemSectionProps {
  headline: React.ReactNode;
  subheadline?: string;
  problems: string[];
  conclusion: React.ReactNode;
  className?: string;
  hideSubheadline?: boolean;
}

export const LandingProblemSection = ({
  headline,
  subheadline = "You might feel:",
  problems,
  conclusion,
  className,
  hideSubheadline = false,
}: LandingProblemSectionProps) => {
  return (
    <section className={cn("border-t border-white/10 px-6 py-24 md:px-12 lg:px-24", className)}>
      <div className="mx-auto max-w-3xl">
        <h2
          className="mb-12 text-center font-editorial text-white"
          style={{
            fontSize: "clamp(1.8rem, 2.5vw, 2.4rem)",
            lineHeight: 1.15,
            fontWeight: 400,
          }}
        >
          {headline}
        </h2>

        {!hideSubheadline && subheadline && (
          <p
            className="mb-10 text-center uppercase tracking-[0.12em] text-white/60"
            style={{
              fontSize: "clamp(0.7rem, 0.8vw, 0.85rem)",
            }}
          >
            {subheadline}
          </p>
        )}

        <ul
          className="mx-auto mb-12 max-w-xl space-y-4"
          style={{
            fontSize: "clamp(0.95rem, 1.05vw, 1.1rem)",
            lineHeight: 1.6,
          }}
        >
          {problems.map((problem, index) => (
            <li key={index} className="border-l-2 border-white/20 pl-6 text-white/80">
              {problem}
            </li>
          ))}
        </ul>

        <div
          className="text-center italic text-white/70"
          style={{
            fontSize: "clamp(1rem, 1.1vw, 1.15rem)",
            lineHeight: 1.6,
          }}
        >
          {conclusion}
        </div>
      </div>
    </section>
  );
};

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
    <section className={cn("px-6 md:px-12 lg:px-24 py-24 border-t border-white/10", className)}>
      <div className="max-w-3xl mx-auto">
        <h2
          className="font-editorial text-white text-center mb-12"
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
            className="text-white/60 text-center mb-10 uppercase tracking-[0.12em]"
            style={{
              fontSize: "clamp(0.7rem, 0.8vw, 0.85rem)",
            }}
          >
            {subheadline}
          </p>
        )}

        <ul
          className="space-y-4 mb-12 max-w-xl mx-auto"
          style={{
            fontSize: "clamp(0.95rem, 1.05vw, 1.1rem)",
            lineHeight: 1.6,
          }}
        >
          {problems.map((problem, index) => (
            <li key={index} className="text-white/80 pl-6 border-l-2 border-white/20">
              {problem}
            </li>
          ))}
        </ul>

        <div
          className="text-white/70 text-center italic"
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

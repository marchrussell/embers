import { cn } from "@/lib/utils";

interface LandingOutcomesSectionProps {
  headline: string;
  outcomes: string[];
  conclusion?: React.ReactNode;
  className?: string;
}

export const LandingOutcomesSection = ({
  headline,
  outcomes,
  conclusion,
  className,
}: LandingOutcomesSectionProps) => {
  return (
    <section className={cn("bg-[#0a0a0a] px-6 py-24 md:px-12 lg:px-24", className)}>
      <div className="mx-auto max-w-3xl text-center">
        <h2
          className="mb-12 font-editorial text-white"
          style={{
            fontSize: "clamp(1.6rem, 2.2vw, 2.2rem)",
            lineHeight: 1.15,
            fontWeight: 400,
          }}
        >
          {headline}
        </h2>

        <ul
          className="mx-auto mb-12 max-w-md space-y-3 text-left"
          style={{
            fontSize: "clamp(0.95rem, 1.05vw, 1.1rem)",
            lineHeight: 1.5,
          }}
        >
          {outcomes.map((outcome, index) => (
            <li key={index} className="flex items-start gap-3 text-white/90">
              <span className="text-[#EC9037]">✨</span>
              <span>{outcome}</span>
            </li>
          ))}
        </ul>

        {conclusion && (
          <div
            className="italic text-white/70"
            style={{
              fontSize: "clamp(1rem, 1.1vw, 1.15rem)",
              lineHeight: 1.6,
            }}
          >
            {conclusion}
          </div>
        )}
      </div>
    </section>
  );
};

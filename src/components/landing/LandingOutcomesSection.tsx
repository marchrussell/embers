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
    <section className={cn("px-6 md:px-12 lg:px-24 py-24 bg-[#0a0a0a]", className)}>
      <div className="max-w-3xl mx-auto text-center">
        <h2
          className="font-editorial text-white mb-12"
          style={{
            fontSize: "clamp(1.6rem, 2.2vw, 2.2rem)",
            lineHeight: 1.15,
            fontWeight: 400,
          }}
        >
          {headline}
        </h2>

        <ul
          className="space-y-3 mb-12 max-w-md mx-auto text-left"
          style={{
            fontSize: "clamp(0.95rem, 1.05vw, 1.1rem)",
            lineHeight: 1.5,
          }}
        >
          {outcomes.map((outcome, index) => (
            <li key={index} className="text-white/90 flex items-start gap-3">
              <span className="text-[#EC9037]">✨</span>
              <span>{outcome}</span>
            </li>
          ))}
        </ul>

        {conclusion && (
          <div
            className="text-white/70 italic"
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

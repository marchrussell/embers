import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface LandingBenefitsSectionProps {
  headline: React.ReactNode;
  description?: string;
  benefits: string[];
  conclusion?: React.ReactNode;
  className?: string;
}

export const LandingBenefitsSection = ({
  headline,
  description,
  benefits,
  conclusion,
  className,
}: LandingBenefitsSectionProps) => {
  return (
    <section className={cn("bg-[#0a0a0a] px-6 py-24 md:px-12 lg:px-24", className)}>
      <div className="mx-auto max-w-3xl">
        <h2
          className="mb-8 text-center font-editorial text-white"
          style={{
            fontSize: "clamp(1.8rem, 2.5vw, 2.4rem)",
            lineHeight: 1.15,
            fontWeight: 400,
          }}
        >
          {headline}
        </h2>

        {description && (
          <p
            className="mb-10 text-center text-white/80"
            style={{
              fontSize: "clamp(0.95rem, 1.05vw, 1.1rem)",
              lineHeight: 1.7,
            }}
          >
            {description}
          </p>
        )}

        <ul
          className="mx-auto mb-12 max-w-md space-y-3"
          style={{
            fontSize: "clamp(0.95rem, 1.05vw, 1.1rem)",
            lineHeight: 1.5,
          }}
        >
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-3 text-white/90">
              <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#EC9037]" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        {conclusion && (
          <div
            className="text-center italic text-white/60"
            style={{
              fontSize: "clamp(0.9rem, 1vw, 1rem)",
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

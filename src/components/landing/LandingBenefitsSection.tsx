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
    <section className={cn("px-6 md:px-12 lg:px-24 py-24 bg-[#0a0a0a]", className)}>
      <div className="max-w-3xl mx-auto">
        <h2
          className="font-editorial text-white text-center mb-8"
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
            className="text-white/80 text-center mb-10"
            style={{
              fontSize: "clamp(0.95rem, 1.05vw, 1.1rem)",
              lineHeight: 1.7,
            }}
          >
            {description}
          </p>
        )}

        <ul
          className="space-y-3 mb-12 max-w-md mx-auto"
          style={{
            fontSize: "clamp(0.95rem, 1.05vw, 1.1rem)",
            lineHeight: 1.5,
          }}
        >
          {benefits.map((benefit, index) => (
            <li key={index} className="text-white/90 flex items-start gap-3">
              <Check className="w-5 h-5 text-[#EC9037] mt-0.5 flex-shrink-0" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        {conclusion && (
          <div
            className="text-white/60 text-center italic"
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

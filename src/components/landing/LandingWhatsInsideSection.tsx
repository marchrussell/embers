import { cn } from "@/lib/utils";

interface LandingWhatsInsideSectionProps {
  headline?: string;
  items: string[];
  conclusion?: string;
  className?: string;
}

export const LandingWhatsInsideSection = ({
  headline,
  items,
  conclusion,
  className,
}: LandingWhatsInsideSectionProps) => {
  return (
    <section className={cn("px-6 md:px-12 lg:px-24 py-24 border-t border-white/10", className)}>
      <div className="max-w-3xl mx-auto">
        <p
          className="text-white/50 text-center uppercase tracking-[0.15em] mb-6"
          style={{
            fontSize: "clamp(0.7rem, 0.8vw, 0.85rem)",
          }}
        >
          WHAT'S INSIDE
        </p>

        {headline && (
          <h2
            className="font-editorial text-white text-center mb-12"
            style={{
              fontSize: "clamp(1.6rem, 2.2vw, 2.2rem)",
              lineHeight: 1.15,
              fontWeight: 400,
            }}
          >
            {headline}
          </h2>
        )}

        <ul
          className="space-y-4 max-w-xl mx-auto"
          style={{
            fontSize: "clamp(0.95rem, 1.05vw, 1.1rem)",
            lineHeight: 1.6,
          }}
        >
          {items.map((item, index) => (
            <li key={index} className="text-white/85 flex items-start gap-3">
              <span className="text-[#EC9037]">✔️</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {conclusion && (
          <p
            className="text-white/60 text-center mt-10 italic"
            style={{
              fontSize: "clamp(0.9rem, 1vw, 1rem)",
              lineHeight: 1.6,
            }}
          >
            {conclusion}
          </p>
        )}
      </div>
    </section>
  );
};

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
    <section className={cn("border-t border-white/10 px-6 py-24 md:px-12 lg:px-24", className)}>
      <div className="mx-auto max-w-3xl">
        <p
          className="mb-6 text-center uppercase tracking-[0.15em] text-white/50"
          style={{
            fontSize: "clamp(0.7rem, 0.8vw, 0.85rem)",
          }}
        >
          WHAT'S INSIDE
        </p>

        {headline && (
          <h2
            className="mb-12 text-center font-editorial text-white"
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
          className="mx-auto max-w-xl space-y-4"
          style={{
            fontSize: "clamp(0.95rem, 1.05vw, 1.1rem)",
            lineHeight: 1.6,
          }}
        >
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-3 text-white/85">
              <span className="text-[#EC9037]">✔️</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {conclusion && (
          <p
            className="mt-10 text-center italic text-white/60"
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

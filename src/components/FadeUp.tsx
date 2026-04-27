import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

interface FadeUpProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function FadeUp({ children, delay = 0, className }: FadeUpProps) {
  const [ref, isInView] = useInView();

  return (
    <div
      ref={ref}
      className={cn(
        "fade-up-motion transition-all duration-700 ease-out",
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

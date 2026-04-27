import { cn } from "@/lib/utils";

interface PillProps {
  children: React.ReactNode;
  variant?: "light" | "dark";
  className?: string;
}

export const Pill = ({ children, variant = "light", className }: PillProps) => {
  return (
    <span
      className={cn(
        "rounded-full px-7 py-3 text-[clamp(0.88rem,0.95vw,0.98rem)] font-medium",
        variant === "light"
          ? "border border-white/30 bg-[#E6DBC7] text-[#1A1A1A] transition-colors duration-200 hover:bg-[#d9cdb9]"
          : "border border-white/20 bg-black/40 text-white/90 backdrop-blur-sm transition-colors duration-200 hover:border-white/30 hover:bg-white/10",
        className
      )}
    >
      {children}
    </span>
  );
};

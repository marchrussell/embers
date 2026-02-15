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
        "px-7 py-3 rounded-full text-[clamp(0.88rem,0.95vw,0.98rem)] font-medium",
        variant === "light"
          ? "bg-[#E6DBC7] text-[#1A1A1A] border border-white/30"
          : "bg-black/40 text-white/90 border border-white/20 backdrop-blur-sm",
        className
      )}
    >
      {children}
    </span>
  );
};

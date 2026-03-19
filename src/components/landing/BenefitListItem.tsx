import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type IconType = "check" | "sparkle" | "checkmark" | "bullet";

interface BenefitListItemProps {
  icon?: IconType;
  children: React.ReactNode;
  className?: string;
}

const icons: Record<IconType, React.ReactNode> = {
  check: <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#EC9037]" />,
  sparkle: <span className="flex-shrink-0 text-[#EC9037]">✨</span>,
  checkmark: <span className="flex-shrink-0 text-[#EC9037]">✔️</span>,
  bullet: null,
};

export const BenefitListItem = ({ icon = "check", children, className }: BenefitListItemProps) => {
  if (icon === "bullet") {
    return <li className={cn("ml-5 list-disc text-white/90", className)}>{children}</li>;
  }

  return (
    <li className={cn("flex items-start gap-3 text-white/90", className)}>
      {icons[icon]}
      <span>{children}</span>
    </li>
  );
};

// Border-left variant for problem lists
interface ProblemListItemProps {
  children: React.ReactNode;
  className?: string;
}

export const ProblemListItem = ({ children, className }: ProblemListItemProps) => {
  return (
    <li className={cn("border-l-2 border-white/20 pl-6 text-white/80", className)}>{children}</li>
  );
};

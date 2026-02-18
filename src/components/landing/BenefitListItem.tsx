import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type IconType = "check" | "sparkle" | "checkmark" | "bullet";

interface BenefitListItemProps {
  icon?: IconType;
  children: React.ReactNode;
  className?: string;
}

const icons: Record<IconType, React.ReactNode> = {
  check: <Check className="w-5 h-5 text-[#EC9037] mt-0.5 flex-shrink-0" />,
  sparkle: <span className="text-[#EC9037] flex-shrink-0">✨</span>,
  checkmark: <span className="text-[#EC9037] flex-shrink-0">✔️</span>,
  bullet: null,
};

export const BenefitListItem = ({
  icon = "check",
  children,
  className,
}: BenefitListItemProps) => {
  if (icon === "bullet") {
    return (
      <li className={cn("text-white/90 list-disc ml-5", className)}>
        {children}
      </li>
    );
  }

  return (
    <li className={cn("text-white/90 flex items-start gap-3", className)}>
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
    <li className={cn("text-white/80 pl-6 border-l-2 border-white/20", className)}>
      {children}
    </li>
  );
};

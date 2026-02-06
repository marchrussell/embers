import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  children: React.ReactNode;
  variant?: "h1" | "h2" | "h3";
  className?: string;
  style?: React.CSSProperties;
}

export const SectionHeading = ({ 
  children, 
  variant = "h2", 
  className,
  style
}: SectionHeadingProps) => {
  const baseStyles = "font-editorial text-[#E6DBC7]";
  
  const variantStyles = {
    h1: "text-4xl md:text-5xl lg:text-7xl",
    h2: "text-2xl md:text-3xl lg:text-4xl",
    h3: "text-xl md:text-2xl lg:text-3xl",
  };

  const Component = variant;

  return (
    <Component className={cn(baseStyles, variantStyles[variant], className)} style={style}>
      {children}
    </Component>
  );
};

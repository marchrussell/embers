import { cn } from "@/lib/utils";

interface DisclosureSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const DisclosureSection = ({ title, children, className }: DisclosureSectionProps) => (
  <div className={cn("mb-10 border-b border-white/10 pb-8", className)}>
    <h2 className="mb-4 text-lg font-light uppercase tracking-wider text-white">{title}</h2>
    {children}
  </div>
);

export default DisclosureSection;

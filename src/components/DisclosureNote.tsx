import { AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";

interface DisclosureNoteProps {
  children: React.ReactNode;
  icon?: boolean;
  className?: string;
}

const DisclosureNote = ({ children, icon = false, className }: DisclosureNoteProps) => (
  <div className={cn("w-fit rounded-lg border border-[#5B9C9E]/30 bg-[#5B9C9E]/10 p-4", className)}>
    {icon ? (
      <div className="flex items-center gap-3 px-2">
        <AlertTriangle className="h-6 w-5 flex-shrink-0 text-white" />
        <div className="text-base font-light leading-relaxed text-white/90">{children}</div>
      </div>
    ) : (
      <p className="text-sm font-light text-white/90">{children}</p>
    )}
  </div>
);

export default DisclosureNote;

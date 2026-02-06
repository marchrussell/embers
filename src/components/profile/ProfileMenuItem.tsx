import { ChevronRight } from "lucide-react";

interface ProfileMenuItemProps {
  label: string;
  onClick: () => void;
  showChevron?: boolean;
  disabled?: boolean;
}

export const ProfileMenuItem = ({ 
  label, 
  onClick, 
  showChevron = true, 
  disabled = false 
}: ProfileMenuItemProps) => (
  <div
    onClick={disabled ? undefined : onClick}
    className={`flex items-center justify-between py-4 md:py-5 transition-colors rounded-lg ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#E6DBC7]/5 cursor-pointer px-3 md:px-4 -mx-3 md:-mx-4'
    }`}
  >
    <div className="flex items-center gap-3">
      <span className="text-[#E6DBC7]/90 font-light text-base md:text-lg">{label}</span>
    </div>
    {showChevron && <ChevronRight className="w-5 h-5 text-[#E6DBC7]/40" />}
  </div>
);

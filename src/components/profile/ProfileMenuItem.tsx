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
  disabled = false,
}: ProfileMenuItemProps) => (
  <div
    onClick={disabled ? undefined : onClick}
    className={`flex items-center justify-between rounded-lg py-4 transition-colors md:py-5 ${
      disabled
        ? "cursor-not-allowed opacity-50"
        : "-mx-3 cursor-pointer px-3 hover:bg-[#E6DBC7]/5 md:-mx-4 md:px-4"
    }`}
  >
    <div className="flex items-center gap-3">
      <span className="text-base font-light text-[#E6DBC7]/90 md:text-lg">{label}</span>
    </div>
    {showChevron && <ChevronRight className="h-5 w-5 text-[#E6DBC7]/40" />}
  </div>
);

import { SafetyInformationContent } from "@/components/SafetyInformationContent";
import { PolicyModalShell } from "@/components/PolicyModalShell";

interface SafetyInformationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SafetyInformationModal = ({ open, onOpenChange }: SafetyInformationModalProps) => (
  <PolicyModalShell
    open={open}
    onOpenChange={onOpenChange}
    title="Safety Information"
    subtitle="Please read all of the information below before continuing. By accessing HŌM you confirm that you have read, understood, and accepted these terms."
  >
    <SafetyInformationContent />
  </PolicyModalShell>
);

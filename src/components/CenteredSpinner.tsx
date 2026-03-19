import { Loader2 } from "lucide-react";

interface CenteredSpinnerProps {
  message?: string;
}

export const CenteredSpinner = ({ message }: CenteredSpinnerProps) => {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: "calc(100vh - 80px)" }}>
      <div className="space-y-4 text-center">
        <Loader2 className="mx-auto h-16 w-16 animate-spin text-white/60" />
        {message && <p className="text-xl font-light text-white/80">{message}</p>}
      </div>
    </div>
  );
};

import { AlertTriangle, Wind } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SafetyDisclosureContent } from "@/components/SafetyDisclosureContent";
import { ButtonLoadingSpinner } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { supabase } from "@/integrations/supabase/client";

interface SafetyDisclosureModalProps {
  isOpen: boolean;
  onAccept: () => void;
  userId: string;
}

export const SafetyDisclosureModal = ({ isOpen, onAccept, userId }: SafetyDisclosureModalProps) => {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset loading state if component remounts or user comes back to tab
  useEffect(() => {
    if (isOpen) {
      setLoading(false);
    }
  }, [isOpen]);

  const handleAccept = async () => {
    if (!accepted) {
      toast.error("Please accept the safety disclosure to continue");
      return;
    }

    setLoading(true);

    // Add timeout protection to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
      toast.error("Request timed out. Please try again.");
    }, 15000); // 15 second timeout

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ has_accepted_safety_disclosure: true })
        .eq("id", userId);

      clearTimeout(timeoutId);

      if (error) throw error;

      toast.success("Safety disclosure accepted");
      onAccept();
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Supabase Realtime aborts in-flight fetches during auth state changes (e.g. SIGNED_IN
      // on a second tab). This is transient — retry once before surfacing an error.
      const isAbort =
        error?.name === "AbortError" || error?.message?.toLowerCase().includes("aborted");
      if (isAbort) {
        try {
          // Wait for Supabase Realtime to finish its reconnect cycle before retrying
          await new Promise((resolve) => setTimeout(resolve, 300));
          const { error: retryError } = await supabase
            .from("profiles")
            .update({ has_accepted_safety_disclosure: true })
            .eq("id", userId);
          if (retryError) throw retryError;
          toast.success("Safety disclosure accepted");
          onAccept();
        } catch {
          setLoading(false);
          toast.error("Connection interrupted. Please try again.");
        }
        return;
      }

      setLoading(false);
      toast.error(error.message || "Failed to save acceptance. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        hideClose
        className="max-h-[90vh] w-[92vw] max-w-4xl overflow-y-auto rounded-xl border border-white/30 bg-black/75 p-0 backdrop-blur-xl"
      >
        <DialogTitle className="sr-only">Safety Disclosure</DialogTitle>
        <ModalCloseButton onClose={() => {}} size="md" className="pointer-events-none opacity-0" />
        <div className="px-6 pb-10 pt-12 md:px-10 md:pt-16 lg:px-12">
          {/* Header */}
          <div className="mb-6 flex items-center justify-center">
            <Wind className="h-12 w-12 text-[#E6DBC7]" />
          </div>

          <h1
            className="mb-4 text-center font-editorial tracking-[0.01em] text-[#E6DBC7]"
            style={{
              fontSize: "clamp(1.8rem, 2.2vw, 2.4rem)",
              lineHeight: 1.15,
              fontWeight: 400,
            }}
          >
            Safety First
          </h1>

          <p className="mb-10 text-center text-sm text-[#E6DBC7]/60">
            Please read and accept our safety guidelines before accessing sessions
          </p>

          {/* Warning Banner */}
          <div className="mb-8 rounded-lg border border-red-500/30 bg-red-500/10 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
              <p className="font-light text-[#E6DBC7]/90">
                Important: You must accept this disclosure to access any breathwork sessions or
                programs.
              </p>
            </div>
          </div>

          <div
            className="mx-auto max-w-[46rem] space-y-8"
            style={{
              fontSize: "clamp(0.9rem, 1vw, 1rem)",
              lineHeight: 1.7,
              color: "rgba(230, 219, 199, 0.9)",
            }}
          >
            <SafetyDisclosureContent />

            {/* Checkbox Agreement */}
            <div className="flex items-start gap-4 rounded-lg border border-[#E6DBC7]/10 bg-background/20 p-5">
              <Checkbox
                id="safety-accept"
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked as boolean)}
                className="mt-0.5 h-5 w-5 flex-shrink-0"
              />
              <label
                htmlFor="safety-accept"
                className="cursor-pointer text-sm font-light leading-relaxed text-[#E6DBC7]/80"
              >
                I have read and understood the safety guidelines. I confirm that I take full
                responsibility for my own health and wellbeing while using Embers Studio, and I
                understand that this service does not replace medical, psychological, or therapeutic
                advice.
              </label>
            </div>

            {/* Accept Button */}
            <Button
              onClick={handleAccept}
              disabled={!accepted || loading}
              className="w-full bg-[#E6DBC7] py-6 text-base font-light text-[#1A1F2C] hover:bg-[#E6DBC7]/90"
            >
              {loading ? <ButtonLoadingSpinner /> : "Accept & Continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

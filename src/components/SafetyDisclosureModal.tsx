import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Wind } from "lucide-react";
import { ButtonLoadingSpinner } from "@/components/skeletons";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
      setLoading(false);
      toast.error(error.message || "Failed to save acceptance. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        hideClose 
        className="max-w-4xl w-[92vw] max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-black/75 border border-white/30 p-0 rounded-xl"
      >
        <ModalCloseButton onClose={() => {}} size="md" className="opacity-0 pointer-events-none" />
        <div className="pt-12 md:pt-16 pb-10 px-6 md:px-10 lg:px-12">
          {/* Header with Icon */}
          <div className="flex items-center justify-center mb-6">
            <Wind className="h-12 w-12 text-[#E6DBC7]" />
          </div>
          
          <h1 
            className="font-editorial text-[#E6DBC7] text-center mb-4 tracking-[0.01em]"
            style={{
              fontSize: 'clamp(1.8rem, 2.2vw, 2.4rem)',
              lineHeight: 1.15,
              fontWeight: 400
            }}
          >
            Safety First
          </h1>
          
          <p className="text-[#E6DBC7]/60 text-center text-sm mb-10">
            Please read and accept our safety guidelines before accessing sessions
          </p>

          <div 
            className="max-w-[46rem] mx-auto space-y-8"
            style={{ 
              fontSize: 'clamp(0.9rem, 1vw, 1rem)',
              lineHeight: 1.7,
              color: 'rgba(230, 219, 199, 0.9)'
            }}
          >
            {/* Warning Banner */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-[#E6DBC7]/90 font-light">
                  Important: You must accept this disclosure to access any breathwork sessions or programs.
                </p>
              </div>
            </div>

            {/* Main Content Section */}
            <section className="space-y-6">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">
                Important Safety Information
              </h2>
              
              <p>
                The Studio provides specialist breathwork, meditation, and wellness classes designed to support your wellbeing. All content and tools provided through the App are for informational and educational purposes only and do not constitute or replace medical, psychological, or therapeutic advice.
              </p>
              
              <p>
                Breathwork can have powerful effects on the body and mind, so please practice gently, safely, and within your own window of capacity. It is important and advisable to read and understand the Safety Information before continuing.
              </p>
              
              <p>
                Please consult a medical professional if you have any medical history, conditions, or concerns, and reach out to March at{" "}
                <a 
                  href="mailto:march@marchrussell.com" 
                  className="text-[#E6DBC7] hover:text-[#E6DBC7]/80 underline transition-colors"
                >
                  march@marchrussell.com
                </a>
                {" "}if you have any questions.
              </p>
            </section>

            {/* Confirmation Note */}
            <div className="bg-[#E6DBC7]/5 border border-[#E6DBC7]/20 rounded-lg p-5">
              <p className="text-[#E6DBC7]/90">
                <span className="font-medium text-[#E6DBC7]">By accepting, you confirm</span> that you have read and understood our safety guidelines, and that you take full responsibility for your own health and wellbeing while using this service.
              </p>
            </div>

            {/* Checkbox Agreement */}
            <div className="flex items-start gap-4 p-5 bg-background/20 rounded-lg border border-[#E6DBC7]/10">
              <Checkbox
                id="safety-accept"
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked as boolean)}
                className="h-5 w-5 flex-shrink-0 mt-0.5"
              />
              <label
                htmlFor="safety-accept"
                className="text-sm text-[#E6DBC7]/80 font-light leading-relaxed cursor-pointer"
              >
                I have read and understood the safety guidelines. I confirm that I take full responsibility for my own health and wellbeing while using The Studio, and I understand that this service does not replace medical, psychological, or therapeutic advice.
              </label>
            </div>

            {/* Accept Button */}
            <Button
              onClick={handleAccept}
              disabled={!accepted || loading}
              className="w-full py-6 text-base bg-[#E6DBC7] text-[#1A1F2C] hover:bg-[#E6DBC7]/90 font-light"
            >
              {loading ? <ButtonLoadingSpinner /> : "Accept & Continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

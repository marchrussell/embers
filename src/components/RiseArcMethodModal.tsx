import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { RISE_ARC_PRICES } from "@/lib/stripePrices";
import { ButtonLoadingSpinner } from "@/components/skeletons/ButtonLoadingSpinner";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface RiseArcMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CALENDLY_URL = "https://calendly.com/march-marchrussell/welcome-call";

const RiseArcMethodModal = ({ open, onOpenChange }: RiseArcMethodModalProps) => {
  const [loadingOption, setLoadingOption] = useState<string | null>(null);

  const handleCheckout = async (priceId: string, optionName: string) => {
    if (loadingOption) return;
    
    setLoadingOption(optionName);
    
    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ 
          priceId,
          mode: 'payment'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Checkout failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data?.url) {
        throw new Error("No checkout URL received from server");
      }

      const newWindow = window.open(data.url, '_blank');
      
      if (newWindow) {
        toast.success("Redirecting to checkout...", { duration: 3000 });
        onOpenChange(false);
      } else {
        toast.error("Please allow pop-ups to continue to checkout", { duration: 5000 });
      }
    } catch (error: any) {
      console.error("[RiseArcMethodModal] Checkout failed:", error);
      toast.error(error.message || "Failed to create checkout. Please try again.");
    } finally {
      setLoadingOption(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Darker backdrop overlay */}
      <DialogContent 
        hideClose
        className="max-h-[95vh] overflow-y-auto p-0 border-0 bg-transparent"
        style={{
          width: 'min(960px, 92vw)',
          maxWidth: 'min(960px, 92vw)',
          background: 'rgba(0, 0, 0, 0.82)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 32px 64px rgba(0, 0, 0, 0.5)',
        }}
      >
        <DialogTitle className="sr-only">The Rise ARC Method</DialogTitle>
        
        {/* Soft Close Button */}
        <button 
          onClick={() => onOpenChange(false)}
          className="absolute right-8 top-8 z-50 text-[#E6DBC7]/50 hover:text-[#E6DBC7]/80 transition-colors text-sm tracking-wide"
        >
          Close
        </button>

        <div className="p-10 md:p-12 lg:p-14">
          {/* SECTION 1 — ARC Overview with constrained text width */}
          <div className="text-center mb-14 lg:mb-16">
            <h2 className="font-editorial text-[#E6DBC7] mb-8" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}>
              The Rise ARC Method — Deep Guided Change
            </h2>
            
            {/* Constrained text container */}
            <div className="max-w-[540px] mx-auto space-y-6">
              <p className="text-[#E6DBC7]/85 leading-relaxed" style={{ fontSize: 'clamp(1rem, 1.2vw, 1.15rem)', lineHeight: 1.75 }}>
                ARC is a 3-month guided process designed to rebuild safety, emotional steadiness, and authentic connection — by working at the level of your nervous system and long-held patterns.
              </p>
              
              {/* Mini-list */}
              <div className="pt-2">
                <p className="text-[#E6DBC7]/50 text-sm mb-4 tracking-wide">What we rebuild:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-left max-w-md mx-auto">
                  {[
                    "Emotional safety",
                    "Regulation & resilience",
                    "Autonomy and grounded self-leadership",
                    "Genuine connection with yourself and others"
                  ].map((item, idx) => (
                    <p key={idx} className="text-[#E6DBC7]/75 text-sm flex items-center gap-3">
                      <span className="w-1.5 h-1.5 bg-[#E6DBC7]/50 rounded-full shrink-0" />
                      {item}
                    </p>
                  ))}
                </div>
              </div>
              
              <p className="text-[#E6DBC7]/65 italic pt-2" style={{ fontSize: 'clamp(0.95rem, 1.1vw, 1.05rem)' }}>
                ARC meets you exactly where you are — without overwhelm.
              </p>
            </div>
          </div>

          {/* Divider with more spacing */}
          <div className="h-px bg-white/8 mb-14 lg:mb-16" />

          {/* SECTION 2 — Three Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-14 lg:mb-16">
            
            {/* Column 1 — Self-Study */}
            <div 
              className="rounded-2xl p-7 lg:p-8 flex flex-col"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div className="mb-6">
                <p className="text-[#D97757] text-sm font-medium mb-3">£445 • 3-Month Program</p>
                <h3 className="text-[#E6DBC7] font-semibold text-lg lg:text-xl mb-4">
                  ARC Self-Study (On-Demand)
                </h3>
                <p className="text-[#E6DBC7]/70 text-sm leading-relaxed">
                  For people wanting autonomy, structure, and depth at their own pace.
                </p>
              </div>
              
              <p className="text-[#E6DBC7]/45 text-xs mb-3 tracking-wide">You'll get:</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  "Full ARC curriculum",
                  "Emotional processing tools",
                  "Somatic + breathwork practices",
                  "12 weeks of guided progression",
                  "Integration exercises"
                ].map((item, idx) => (
                  <li key={idx} className="text-[#E6DBC7]/65 text-sm flex items-start gap-3">
                    <span className="w-1 h-1 bg-[#E6DBC7]/40 rounded-full mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handleCheckout(RISE_ARC_PRICES.SELF_STUDY, 'self-study')}
                disabled={loadingOption !== null}
                className="w-full bg-transparent text-[#E6DBC7] border border-[#E6DBC7]/30 px-5 rounded-full text-[0.9rem] font-light tracking-wide hover:bg-[#E6DBC7]/8 hover:border-[#E6DBC7]/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ height: '48px' }}
              >
                {loadingOption === 'self-study' ? (
                  <>
                    <ButtonLoadingSpinner /> Start Self-Study
                  </>
                ) : (
                  <>
                    Start Self-Study <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Column 2 — Group Programme */}
            <div 
              className="rounded-2xl p-7 lg:p-8 flex flex-col"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div className="mb-6">
                <p className="text-[#D97757] text-sm font-medium mb-3">£1,100 • 3-Month Live Program</p>
                <h3 className="text-[#E6DBC7] font-semibold text-lg lg:text-xl mb-4">
                  ARC Group Programme
                </h3>
                <p className="text-[#E6DBC7]/70 text-sm leading-relaxed">
                  A supportive group container for deeper emotional work, coaching, and community.
                </p>
              </div>
              
              <p className="text-[#E6DBC7]/45 text-xs mb-3 tracking-wide">You'll get:</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  "Weekly live sessions",
                  "Group community + accountability",
                  "Monthly breathwork",
                  "Hot-seat coaching",
                  "Deep somatic emotional work",
                  "Access to ARC materials"
                ].map((item, idx) => (
                  <li key={idx} className="text-[#E6DBC7]/65 text-sm flex items-start gap-3">
                    <span className="w-1 h-1 bg-[#E6DBC7]/40 rounded-full mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              
              <a 
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-transparent text-[#E6DBC7] border border-[#E6DBC7]/30 px-5 rounded-full text-[0.9rem] font-light tracking-wide hover:bg-[#E6DBC7]/8 hover:border-[#E6DBC7]/50 transition-all flex items-center justify-center gap-2"
                style={{ height: '48px' }}
              >
                Book a Welcome Call <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Column 3 — 1:1 Programme */}
            <div 
              className="rounded-2xl p-7 lg:p-8 flex flex-col"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div className="mb-6">
                <p className="text-[#D97757] text-sm font-medium mb-3">£3,950 • 3-Month High-Touch Support</p>
                <h3 className="text-[#E6DBC7] font-semibold text-lg lg:text-xl mb-4">
                  ARC 1:1 Programme
                </h3>
                <p className="text-[#E6DBC7]/70 text-sm leading-relaxed">
                  Highly personalised work for profound, lasting change.
                </p>
              </div>
              
              <p className="text-[#E6DBC7]/45 text-xs mb-3 tracking-wide">You'll get:</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  "Weekly 1:1 sessions",
                  "WhatsApp support (Mon–Fri)",
                  "Personal nervous system blueprint",
                  "Monthly check-ins",
                  "Quarterly virtual retreats",
                  'Your "Mastery Map"'
                ].map((item, idx) => (
                  <li key={idx} className="text-[#E6DBC7]/65 text-sm flex items-start gap-3">
                    <span className="w-1 h-1 bg-[#E6DBC7]/40 rounded-full mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              
              <a 
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-transparent text-[#E6DBC7] border border-[#E6DBC7]/30 px-5 rounded-full text-[0.9rem] font-light tracking-wide hover:bg-[#E6DBC7]/8 hover:border-[#E6DBC7]/50 transition-all flex items-center justify-center gap-2"
                style={{ height: '48px' }}
              >
                Book a Welcome Call <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* SECTION 3 — Bottom Line with enhanced CTA */}
          <div className="text-center pt-8 border-t border-white/8">
            <p className="text-[#E6DBC7]/70 mb-8 max-w-[520px] mx-auto leading-relaxed" style={{ fontSize: 'clamp(0.95rem, 1.1vw, 1.05rem)', lineHeight: 1.7 }}>
              If you're unsure which pathway is right, book a short conversation — I'll help you choose what fits your needs, your pace, and your season of life.
            </p>
            <a 
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex bg-[#E6DBC7] text-[#1A1A1A] px-8 rounded-full font-medium tracking-wide transition-all items-center gap-3 hover:shadow-[0_0_24px_rgba(230,219,199,0.35)] hover:scale-[1.02] transition-[transform,box-shadow]"
              style={{ height: '54px', fontSize: '1rem' }}
            >
              Schedule a Free Call <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RiseArcMethodModal;

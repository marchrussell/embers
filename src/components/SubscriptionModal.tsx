import { ButtonLoadingSpinner } from "@/components/skeletons";
import { Dialog, DialogPortal } from "@/components/ui/dialog";
import { GlowButton } from "@/components/ui/glow-button";
import { supabase } from "@/integrations/supabase/client";
import { SUBSCRIPTION_PRICES } from "@/lib/stripePrices";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
}

const PRICES = {
  monthly: {
    unitAmountFormatted: '£25',
  },
  annual: {
    unitAmountFormatted: '£180',
    monthlyEquivalent: '£15',
  },
};

const BENEFITS = [
  'Unlimited access to the full Embers practice library',
  'Breathwork, meditation, and nervous system regulation',
  'Short daily resets and deeper guided sessions',
  'Weekly live sessions and guest workshops',
  '7-day free trial — cancel anytime',
];

export const SubscriptionModal = ({ open, onClose }: SubscriptionModalProps) => {
  const [loadingPlan, setLoadingPlan] = useState<'annual' | 'monthly' | null>(null);

  const monthlyPrice = PRICES.monthly.unitAmountFormatted;
  const annualPrice = PRICES.annual.unitAmountFormatted;
  const annualMonthlyEquivalent = PRICES.annual.monthlyEquivalent;
  const monthlyPriceId = SUBSCRIPTION_PRICES.MONTHLY;
  const annualPriceId = SUBSCRIPTION_PRICES.ANNUAL;

  const handleSubscribeClick = async (priceId: string, e?: React.MouseEvent) => {
    if (loadingPlan) return;

    e?.stopPropagation();
    e?.preventDefault();

    const plan = priceId === annualPriceId ? 'annual' : 'monthly';
    setLoadingPlan(plan);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });

      if (error) throw error;
      if (!data?.url) throw new Error("No checkout URL received from server");

      const newWindow = window.open(data.url, '_blank');
      if (newWindow) {
        toast.success("Redirecting to Stripe checkout...", { duration: 3000 });
        onClose();
      } else {
        toast.error("Please allow pop-ups to continue to checkout", { duration: 5000 });
        setLoadingPlan(null);
      }
    } catch (error: any) {
      console.error("[SubscriptionModal] Checkout failed:", error);
      toast.error(error.message || "Failed to create checkout. Please try again.");
      setLoadingPlan(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogPortal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 transition-opacity duration-300" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-[96%] sm:w-[92%] max-w-[1200px] max-h-[92vh] sm:max-h-[88vh] translate-x-[-50%] translate-y-[-50%] backdrop-blur-xl bg-black/75 border border-white/20 p-0 overflow-hidden overflow-y-auto rounded-[28px] duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
        <div className="sr-only" role="heading" aria-level={2}>Subscribe to MARCH</div>
        <div className="sr-only">Choose your subscription plan and become a member</div>

        <DialogPrimitive.Close className="absolute right-10 top-10 z-10 opacity-70 text-white hover:opacity-100 transition-opacity">
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>

        <div className="flex flex-col lg:flex-row">
          {/* Left side - Branding & Benefits */}
          <div className="lg:w-1/2 p-12 md:p-16 lg:p-20 bg-black/50 flex flex-col justify-center">
            <div className="max-w-lg mx-auto w-full">
              <div className="text-center mb-8 sm:mb-10 space-y-5">
                <p className="text-base sm:text-lg font-light text-white/70 tracking-wide leading-loose italic">
                  Where your nervous system rests.<br />
                  And your senses awaken.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-10 bg-white/25" />
                  <span className="text-[11px] sm:text-xs tracking-[0.3em] text-white/50 uppercase font-light">Join Embers</span>
                  <div className="h-px w-10 bg-white/25" />
                </div>
              </div>

              <div className="space-y-4 sm:space-y-5">
                {BENEFITS.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                    <p className="text-sm sm:text-base font-light text-white/90 leading-relaxed">
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Pricing Plans */}
          <div className="lg:w-1/2 p-12 md:p-16 lg:p-20 bg-black/50 flex flex-col justify-center">
            <div className="max-w-lg mx-auto w-full">
              <div className="space-y-6">
                {/* Annual Plan */}
                <div
                  className="relative p-7 sm:p-9 rounded-lg border-2 border-white backdrop-blur-md bg-white/5 hover:bg-white/10"
                  style={{
                    boxShadow: '0 0 16px rgba(255, 255, 255, 0.3), 0 0 32px rgba(255, 255, 255, 0.15)'
                  }}
                >
                  <div className="absolute -top-3 -right-3">
                    <div className="bg-white px-3 py-1.5 rounded-sm shadow-lg">
                      <span className="text-black text-[10px] sm:text-xs font-medium tracking-wider">
                        BEST VALUE
                      </span>
                    </div>
                  </div>

                  <div className="pr-12">
                    <h3 className="text-xl sm:text-2xl font-editorial text-white mb-3">Annual</h3>
                    <div className="mb-2">
                      <span className="text-xl sm:text-2xl text-white font-light">
                        {annualPrice}
                      </span>
                      {annualMonthlyEquivalent && (
                        <span className="text-sm text-white/60 ml-2">
                          ({annualMonthlyEquivalent}/month)
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/50 font-light mb-6">
                      7-day free trial, then {annualPrice}/year
                    </p>
                  </div>

                  <GlowButton
                    variant="whiteSolid"
                    className="w-full"
                    onClick={(e) => handleSubscribeClick(annualPriceId, e)}
                    disabled={!!loadingPlan}
                  >
                    {loadingPlan === 'annual' ? <ButtonLoadingSpinner size="lg"/> : "Start your 7-day free trial"}
                  </GlowButton>
                </div>

                {/* Monthly Plan */}
                <div
                  className="relative p-7 sm:p-9 rounded-lg border border-white/25 backdrop-blur-md bg-black/20 hover:border-white/40 hover:bg-white/5"
                >
                  <h3 className="text-xl sm:text-2xl font-editorial text-white mb-3">Monthly</h3>
                  <div className="mb-2">
                    <span className="text-xl sm:text-2xl text-white font-light">
                      {monthlyPrice}
                    </span>
                    <span className="text-sm text-white/60 ml-1">/month</span>
                  </div>
                  <p className="text-sm text-white/50 font-light mb-6">
                    7-day free trial, then {monthlyPrice}/month
                  </p>

                  <GlowButton
                    variant="white"
                    className="w-full"
                    onClick={(e) => handleSubscribeClick(monthlyPriceId, e)}
                    disabled={!!loadingPlan}
                  >
                    {loadingPlan === 'monthly' ? <ButtonLoadingSpinner size="lg" /> : "Start your 7-day free trial"}
                  </GlowButton>
                </div>
              </div>

              <div className="mt-10">
                <p className="text-xs sm:text-sm text-white/40 text-center font-light leading-relaxed">
                  You will be automatically charged after your 7-day free trial ends unless you cancel before then. Cancel anytime during the trial at no charge.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};

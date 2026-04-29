import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ButtonLoadingSpinner } from "@/components/skeletons";
import { Dialog, DialogPortal } from "@/components/ui/dialog";
import { GlowButton } from "@/components/ui/glow-button";
import { supabase } from "@/integrations/supabase/client";
import { analytics } from "@/lib/posthog";
import {
  SUBSCRIPTION_BENEFITS,
  SUBSCRIPTION_DISPLAY_PRICES,
  SUBSCRIPTION_PRICES,
} from "@/lib/stripePrices";

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
}

export const SubscriptionModal = ({ open, onClose }: SubscriptionModalProps) => {
  const [loadingPlan, setLoadingPlan] = useState<"annual" | "monthly" | null>(null);

  const monthlyPrice = SUBSCRIPTION_DISPLAY_PRICES.monthly.unitAmountFormatted;
  const annualPrice = SUBSCRIPTION_DISPLAY_PRICES.annual.unitAmountFormatted;
  const annualMonthlyEquivalent = SUBSCRIPTION_DISPLAY_PRICES.annual.monthlyEquivalent;
  const monthlyPriceId = SUBSCRIPTION_PRICES.MONTHLY;
  const annualPriceId = SUBSCRIPTION_PRICES.ANNUAL;

  const handleSubscribeClick = async (priceId: string, e?: React.MouseEvent) => {
    if (loadingPlan) return;

    e?.stopPropagation();
    e?.preventDefault();

    const plan = priceId === annualPriceId ? "annual" : "monthly";
    setLoadingPlan(plan);
    analytics.subscriptionStarted(plan);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });

      if (error) throw error;
      if (!data?.url) throw new Error("No checkout URL received from server");

      const newWindow = window.open(data.url, "_blank");
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
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md transition-opacity duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 max-h-[92vh] w-[96%] max-w-[1200px] translate-x-[-50%] translate-y-[-50%] overflow-hidden overflow-y-auto rounded-[28px] border border-white/20 bg-black/75 p-0 backdrop-blur-xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:max-h-[88vh] sm:w-[92%]">
          <div className="sr-only" role="heading" aria-level={2}>
            Subscribe to Embers
          </div>
          <div className="sr-only">Choose your subscription plan and become a member</div>

          <DialogPrimitive.Close className="absolute right-10 top-10 z-10 text-white opacity-70 transition-opacity hover:opacity-100">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>

          <div className="flex flex-col lg:flex-row">
            {/* Left side - Branding & Benefits */}
            <div className="flex flex-col justify-center bg-black/50 p-12 md:p-16 lg:w-1/2 lg:p-20">
              <div className="mx-auto w-full max-w-lg">
                <div className="mb-8 space-y-5 text-center sm:mb-10">
                  <p className="text-base font-light italic leading-loose tracking-wide text-white/70 sm:text-lg">
                    Where your nervous system rests.
                    <br />
                    And your senses awaken.
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="h-px w-10 bg-white/25" />
                    <span className="font-bold uppercase tracking-[0.3em] text-white/50 sm:text-xs">
                      Join Embers
                    </span>
                    <div className="h-px w-10 bg-white/25" />
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-5">
                  {SUBSCRIPTION_BENEFITS.map((benefit) => (
                    <div key={benefit} className="flex items-start gap-3">
                      <Check
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-white"
                        strokeWidth={1.5}
                      />
                      <p className="text-sm font-light leading-relaxed text-white/90 sm:text-base">
                        {benefit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side - Pricing Plans */}
            <div className="flex flex-col justify-center bg-black/50 p-12 md:p-16 lg:w-1/2 lg:p-20">
              <div className="mx-auto w-full max-w-lg">
                <div className="space-y-6">
                  {/* Annual Plan */}
                  <div
                    className="relative rounded-lg border-2 border-white bg-white/5 p-7 backdrop-blur-md hover:bg-white/10 sm:p-9"
                    style={{
                      boxShadow:
                        "0 0 16px rgba(255, 255, 255, 0.3), 0 0 32px rgba(255, 255, 255, 0.15)",
                    }}
                  >
                    <div className="absolute -right-3 -top-3">
                      <div className="rounded-sm bg-white px-3 py-1.5 shadow-lg">
                        <span className="text-[10px] font-medium tracking-wider text-black sm:text-xs">
                          BEST VALUE
                        </span>
                      </div>
                    </div>

                    <div className="pr-12">
                      <h3 className="mb-3 font-editorial text-xl text-white sm:text-2xl">Annual</h3>
                      <div className="mb-2">
                        <span className="text-xl font-light text-white sm:text-2xl">
                          {annualPrice}
                        </span>
                        {annualMonthlyEquivalent && (
                          <span className="ml-2 text-sm text-white/60">
                            ({annualMonthlyEquivalent}/month)
                          </span>
                        )}
                      </div>
                      <p className="mb-6 text-sm font-light text-white/50">
                        7-day free trial, then {annualPrice}/year
                      </p>
                    </div>

                    <GlowButton
                      variant="whiteSolid"
                      className="w-full"
                      onClick={(e) => handleSubscribeClick(annualPriceId, e)}
                      disabled={!!loadingPlan}
                    >
                      {loadingPlan === "annual" ? (
                        <ButtonLoadingSpinner size="lg" />
                      ) : (
                        "Start your 7-day free trial"
                      )}
                    </GlowButton>
                  </div>

                  {/* Monthly Plan */}
                  <div className="relative rounded-lg border border-white/25 bg-black/20 p-7 backdrop-blur-md hover:border-white/40 hover:bg-white/5 sm:p-9">
                    <h3 className="mb-3 font-editorial text-xl text-white sm:text-2xl">Monthly</h3>
                    <div className="mb-2">
                      <span className="text-xl font-light text-white sm:text-2xl">
                        {monthlyPrice}
                      </span>
                      <span className="ml-1 text-sm text-white/60">/month</span>
                    </div>
                    <p className="mb-6 text-sm font-light text-white/50">
                      7-day free trial, then {monthlyPrice}/month
                    </p>

                    <GlowButton
                      variant="white"
                      className="w-full"
                      onClick={(e) => handleSubscribeClick(monthlyPriceId, e)}
                      disabled={!!loadingPlan}
                    >
                      {loadingPlan === "monthly" ? (
                        <ButtonLoadingSpinner size="lg" />
                      ) : (
                        "Start your 7-day free trial"
                      )}
                    </GlowButton>
                  </div>
                </div>

                <div className="mt-10">
                  <p className="text-center text-xs font-light leading-relaxed text-white/40 sm:text-sm">
                    You will be automatically charged after your 7-day free trial ends unless you
                    cancel before then. Cancel anytime during the trial at no charge.
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

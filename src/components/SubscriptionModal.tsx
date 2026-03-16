import { ButtonLoadingSpinner } from "@/components/skeletons";
import { Dialog, DialogPortal } from "@/components/ui/dialog";
import { GlowButton } from "@/components/ui/glow-button";
import { supabase } from "@/integrations/supabase/client";
import { SUBSCRIPTION_PRICES } from "@/lib/stripePrices";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
}

interface PriceData {
  id: string;
  unitAmount: number;
  unitAmountFormatted: string;
  currency: string;
  interval: string | null;
  intervalCount: number | null;
  type: string;
  productName: string | null;
  monthlyEquivalent: string | null;
}

interface PricesResponse {
  mode: 'test' | 'live';
  category: string;
  prices: {
    monthly: PriceData;
    annual: PriceData;
  };
}

const FALLBACK_PRICES = {
  monthly: {
    unitAmountFormatted: '£25',
    monthlyEquivalent: null,
  },
  annual: {
    unitAmountFormatted: '£180',
    monthlyEquivalent: '£20.75',
  },
};

const BENEFITS = [
  'Unlimited access to exclusive breathwork classes',
  'New content added monthly',
  'Cancel anytime',
  '7 day free trial, cancel anytime',
];

export const SubscriptionModal = ({ open, onClose }: SubscriptionModalProps) => {
  const [loadingPlan, setLoadingPlan] = useState<'annual' | 'monthly' | null>(null);

  const { data: priceData, isLoading: pricesLoading } = useQuery<PricesResponse>({
    queryKey: ['stripe-prices'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-prices', {
        body: { category: 'marchDaily' },
      });
      if (error) throw error;
      return data;
    },
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const prices = priceData?.prices ?? null;
  const stripeMode = priceData?.mode ?? null;

  const monthlyPrice = prices?.monthly?.unitAmountFormatted || FALLBACK_PRICES.monthly.unitAmountFormatted;
  const annualPrice = prices?.annual?.unitAmountFormatted || FALLBACK_PRICES.annual.unitAmountFormatted;
  const annualMonthlyEquivalent = prices?.annual?.monthlyEquivalent || FALLBACK_PRICES.annual.monthlyEquivalent;

  const monthlyPriceId = prices?.monthly?.id || SUBSCRIPTION_PRICES.MONTHLY;
  const annualPriceId = prices?.annual?.id || SUBSCRIPTION_PRICES.ANNUAL;

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
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-[94%] sm:w-[90%] max-w-[1080px] max-h-[92vh] sm:max-h-[88vh] translate-x-[-50%] translate-y-[-50%] backdrop-blur-xl bg-black/75 border border-white/20 p-0 overflow-hidden overflow-y-auto rounded-[28px] duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
        <div className="sr-only" role="heading" aria-level={2}>Subscribe to MARCH</div>
        <div className="sr-only">Choose your subscription plan and become a member</div>

        <DialogPrimitive.Close className="absolute right-10 top-10 z-10 opacity-70 text-white hover:opacity-100 transition-opacity">
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>

        {stripeMode === 'test' && (
          <div className="absolute left-4 top-4 z-10">
            <span className="bg-yellow-500 text-black text-xs font-medium px-2 py-1 rounded">
              TEST MODE
            </span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row">
          {/* Left side - Branding & Benefits */}
          <div className="lg:w-1/2 p-12 md:p-14 lg:p-16 bg-black/50 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="text-center mb-8 sm:mb-10">
                <p className="text-lg sm:text-xl font-light text-white/90 tracking-wide">
                  Become a member today
                </p>
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
          <div className="lg:w-1/2 p-10 sm:p-12 md:p-14 lg:p-16 bg-black/50 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="space-y-5">
                {/* Annual Plan */}
                <div
                  className="relative p-6 sm:p-7 rounded-lg border-2 border-white backdrop-blur-md bg-white/5 hover:bg-white/10"
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
                    <h3 className="text-xl sm:text-2xl font-editorial text-white mb-2">Annual</h3>
                    <div className="mb-1">
                      <span className="text-xl sm:text-2xl text-white font-light">
                        {pricesLoading ? '...' : annualPrice}
                      </span>
                      {annualMonthlyEquivalent && (
                        <span className="text-sm text-white/60 ml-2">
                          ({annualMonthlyEquivalent}/month)
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/50 font-light mb-5">
                      7 day free trial, then {annualPrice}/year
                    </p>
                  </div>

                  <GlowButton
                    variant="whiteSolid"
                    className="w-full"
                    onClick={(e) => handleSubscribeClick(annualPriceId, e)}
                    disabled={!!loadingPlan || pricesLoading}
                  >
                    {loadingPlan === 'annual' ? <ButtonLoadingSpinner /> : "Start 7 Day Free Trial"}
                  </GlowButton>
                </div>

                {/* Monthly Plan */}
                <div
                  className="relative p-6 sm:p-7 rounded-lg border border-white/25 backdrop-blur-md bg-black/20 hover:border-white/40 hover:bg-white/5"
                >
                  <h3 className="text-xl sm:text-2xl font-editorial text-white mb-2">Monthly</h3>
                  <div className="mb-1">
                    <span className="text-xl sm:text-2xl text-white font-light">
                      {pricesLoading ? '...' : monthlyPrice}
                    </span>
                    <span className="text-sm text-white/60 ml-1">/month</span>
                  </div>
                  <p className="text-sm text-white/50 font-light mb-5">
                    7 day free trial, then {monthlyPrice}/month
                  </p>

                  <GlowButton
                    variant="white"
                    className="w-full"
                    onClick={(e) => handleSubscribeClick(monthlyPriceId, e)}
                    disabled={!!loadingPlan || pricesLoading}
                  >
                    {loadingPlan === 'monthly' ? <ButtonLoadingSpinner /> : "Start 7 Day Free Trial"}
                  </GlowButton>
                </div>
              </div>

              <div className="mt-8">
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

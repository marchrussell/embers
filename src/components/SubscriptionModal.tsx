import marchLogoModal from "@/assets/march-logo-modal.png";
import { ButtonLoadingSpinner } from "@/components/skeletons";
import { Dialog, DialogPortal } from "@/components/ui/dialog";
import { GlowButton } from "@/components/ui/glow-button";
import { useAuth } from "@/contexts/AuthContext";
import { MARCH_DAILY_PRICES } from "@/lib/stripePrices";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
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

// Fallback prices in case the API call fails
const FALLBACK_PRICES = {
  monthly: {
    unitAmountFormatted: '£29',
    monthlyEquivalent: null,
  },
  annual: {
    unitAmountFormatted: '£249',
    monthlyEquivalent: '£20.75',
  },
};

export const SubscriptionModal = ({ open, onClose }: SubscriptionModalProps) => {
  const { user } = useAuth();
  const [loadingAnnual, setLoadingAnnual] = useState(false);
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [prices, setPrices] = useState<PricesResponse['prices'] | null>(null);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [stripeMode, setStripeMode] = useState<'test' | 'live' | null>(null);

  console.log('************** stripeMode', stripeMode)

  // Fetch prices from Stripe when modal opens
  useEffect(() => {
    if (open && !prices && !pricesLoading) {
      fetchPrices();
    }
  }, [open]);

  const fetchPrices = async () => {
    setPricesLoading(true);
    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      console.log("[SubscriptionModal] Fetching prices from Stripe...");
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/get-prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ category: 'marchDaily' }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch prices: ${response.status}`);
      }

      const data: PricesResponse = await response.json();
      console.log("[SubscriptionModal] Prices fetched:", data);
      
      setPrices(data.prices);
      setStripeMode(data.mode);
    } catch (error) {
      console.error("[SubscriptionModal] Failed to fetch prices, using fallbacks:", error);
      // Prices will remain null, and we'll use fallbacks in the UI
    } finally {
      setPricesLoading(false);
    }
  };

  // Get display prices (dynamic or fallback)
  const monthlyPrice = prices?.monthly?.unitAmountFormatted || FALLBACK_PRICES.monthly.unitAmountFormatted;
  const annualPrice = prices?.annual?.unitAmountFormatted || FALLBACK_PRICES.annual.unitAmountFormatted;
  const annualMonthlyEquivalent = prices?.annual?.monthlyEquivalent || FALLBACK_PRICES.annual.monthlyEquivalent;

  // Get the correct price ID to use (from the fetched data or static config)
  const monthlyPriceId = prices?.monthly?.id || MARCH_DAILY_PRICES.MONTHLY;
  const annualPriceId = prices?.annual?.id || MARCH_DAILY_PRICES.ANNUAL;

  const handleSubscribeClick = async (priceId: string, e?: React.MouseEvent) => {
    // Prevent double-clicks
    if (loadingAnnual || loadingMonthly) {
      console.log("[SubscriptionModal] Already loading, ignoring click");
      return;
    }
    
    // Prevent event bubbling
    e?.stopPropagation();
    e?.preventDefault();
    
    console.log("[SubscriptionModal] Subscribe clicked", { priceId, timestamp: Date.now() });
    
    // Set loading state based on which plan was clicked
    const isAnnual = priceId === annualPriceId;
    if (isAnnual) {
      setLoadingAnnual(true);
    } else {
      setLoadingMonthly(true);
    }
    
    try {
      console.log("[SubscriptionModal] Calling create-checkout function");
      
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      console.log("[SubscriptionModal] Making request to:", `${SUPABASE_URL}/functions/v1/create-checkout`);
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ 
          priceId,
          couponCode: couponCode.trim() || undefined
        }),
      });

      console.log("[SubscriptionModal] Response received:", { 
        status: response.status,
        statusText: response.statusText,
        ok: response.ok 
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[SubscriptionModal] Error response:", errorData);
        throw new Error(errorData.error || `Checkout failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("[SubscriptionModal] Parsed response:", data);

      if (!data || !data.url) {
        console.error("[SubscriptionModal] Invalid response - no URL:", data);
        throw new Error("No checkout URL received from server");
      }

      const checkoutUrl = data.url;
      console.log("[SubscriptionModal] ✅ Got checkout URL:", checkoutUrl);
      
      // SOLUTION: Open in new tab to bypass iframe sandbox restrictions
      // Lovable preview runs in a sandboxed iframe that blocks top-level navigation
      console.log("[SubscriptionModal] Opening Stripe checkout in new tab...");
      const newWindow = window.open(checkoutUrl, '_blank');
      
      if (newWindow) {
        console.log("[SubscriptionModal] ✅ Successfully opened checkout in new tab");
        toast.success("Redirecting to Stripe checkout...", { duration: 3000 });
        // Close the modal
        onClose();
      } else {
        console.error("[SubscriptionModal] ❌ Pop-up blocked! Please allow pop-ups for this site.");
        toast.error("Please allow pop-ups to continue to checkout", { duration: 5000 });
        setLoadingAnnual(false);
        setLoadingMonthly(false);
      }
      
    } catch (error: any) {
      console.error("[SubscriptionModal] ❌ Checkout failed:", {
        message: error.message,
        stack: error.stack,
        error
      });
      toast.error(error.message || "Failed to create checkout. Please try again.");
      setLoadingAnnual(false);
      setLoadingMonthly(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogPortal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 transition-opacity duration-300" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-[94%] sm:w-[90%] max-w-[1080px] max-h-[92vh] sm:max-h-[88vh] translate-x-[-50%] translate-y-[-50%] backdrop-blur-xl bg-black/75 border border-white/20 p-0 overflow-hidden overflow-y-auto rounded-[28px] duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
        <div className="sr-only" role="heading" aria-level={2}>Subscribe to MARCH</div>
        <div className="sr-only">Choose your subscription plan and become a member</div>
        
        {/* Close button - with more breathing room */}
        <DialogPrimitive.Close className="absolute right-10 top-10 z-10 opacity-70 text-white hover:opacity-100 transition-opacity">
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
        
        {/* Test mode indicator */}
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
                <img 
                  src={marchLogoModal} 
                  alt="MARCH" 
                  className="hidden h-24 md:h-28 mx-auto mb-5 sm:mb-6 object-contain"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
                <p className="text-lg sm:text-xl font-light text-white/90 tracking-wide">
                  Become a member today
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-4 sm:space-y-5">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <p className="text-sm sm:text-base font-light text-white/90 leading-relaxed">
                    Unlimited access to exclusive breathwork classes
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <p className="text-sm sm:text-base font-light text-white/90 leading-relaxed">
                    New content added monthly
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <p className="text-sm sm:text-base font-light text-white/90 leading-relaxed">
                    Cancel anytime
                  </p>
                </div>
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
                  {/* Badge */}
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
                      Billed annually
                    </p>
                  </div>
                  
                  <GlowButton 
                    variant="whiteSolid"
                    className="w-full"
                    onClick={(e) => handleSubscribeClick(annualPriceId, e)}
                    disabled={loadingAnnual || loadingMonthly || pricesLoading}
                  >
                    {loadingAnnual ? <ButtonLoadingSpinner /> : "Subscribe"}
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
                    Billed monthly
                  </p>
                  
                  <GlowButton 
                    variant="white"
                    className="w-full"
                    onClick={(e) => handleSubscribeClick(monthlyPriceId, e)}
                    disabled={loadingAnnual || loadingMonthly || pricesLoading}
                  >
                    {loadingMonthly ? <ButtonLoadingSpinner /> : "Subscribe"}
                  </GlowButton>
                </div>
              </div>

              {/* Billing Disclosure */}
              <div className="mt-8">
                <p className="text-xs sm:text-sm text-white/40 text-center font-light leading-relaxed">
                  You will be charged immediately upon subscribing. Cancel anytime from your account settings.
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

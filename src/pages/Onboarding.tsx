import { Check, Wind } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { SafetyDisclosureContent } from "@/components/SafetyDisclosureContent";
import { ButtonLoadingSpinner } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { GlowButton } from "@/components/ui/glow-button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { analytics } from "@/lib/posthog";
import {
  SUBSCRIPTION_BENEFITS,
  SUBSCRIPTION_DISPLAY_PRICES,
  SUBSCRIPTION_PRICES,
} from "@/lib/stripePrices";

const Onboarding = () => {
  const [safetyAccepted, setSafetyAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<"annual" | "monthly" | null>(null);
  const {
    user,
    hasSubscription,
    loading: authLoading,
    checkSubscription,
    refreshOnboardingStatus,
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Force subscription check on mount to ensure latest status
    checkSubscription();
  }, [user, navigate, checkSubscription]);

  const handleSubscribe = async (priceId: string) => {
    if (loadingPlan) return;
    const plan = priceId === SUBSCRIPTION_PRICES.ANNUAL ? "annual" : "monthly";
    setLoadingPlan(plan);
    analytics.subscriptionStarted(plan);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });

      if (error) throw error;

      if (data?.url) {
        // Open in same window to preserve auth session
        window.location.href = data.url;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create checkout session");
      setLoadingPlan(null);
    }
  };

  const completeOnboarding = async () => {
    if (!safetyAccepted) {
      toast.error("Please accept the safety disclosure to continue");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          has_completed_onboarding: true,
          has_accepted_safety_disclosure: true,
        })
        .eq("id", user?.id);

      if (error) throw error;

      analytics.onboardingCompleted();

      // Force refresh the auth context to pick up the new onboarding status
      await refreshOnboardingStatus();

      toast.success("Welcome to Embers Studio! You're all set.");

      // Check if there's a redirect intent for nervous system program
      const redirectIntent = localStorage.getItem("postOnboardingRedirect");
      if (redirectIntent === "nervous-system-program") {
        localStorage.removeItem("postOnboardingRedirect");
        navigate("/online?scrollTo=nervous-system", { replace: true });
      } else {
        // Navigate without full page reload
        navigate("/online", { replace: true });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <ButtonLoadingSpinner />
      </div>
    );
  }

  // Show subscription page only if explicitly no subscription
  // This page should normally only be reached through direct navigation or if payment flow was incomplete
  if (!hasSubscription) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-[1200px] overflow-hidden rounded-[28px] border border-white/20 bg-black/75 backdrop-blur-xl">
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
                          {SUBSCRIPTION_DISPLAY_PRICES.annual.unitAmountFormatted}
                        </span>
                        <span className="ml-2 text-sm text-white/60">
                          ({SUBSCRIPTION_DISPLAY_PRICES.annual.monthlyEquivalent}/month)
                        </span>
                      </div>
                      <p className="mb-6 text-sm font-light text-white/50">
                        7-day free trial, then{" "}
                        {SUBSCRIPTION_DISPLAY_PRICES.annual.unitAmountFormatted}/year
                      </p>
                    </div>

                    <GlowButton
                      variant="whiteSolid"
                      className="w-full"
                      onClick={() => handleSubscribe(SUBSCRIPTION_PRICES.ANNUAL)}
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
                        {SUBSCRIPTION_DISPLAY_PRICES.monthly.unitAmountFormatted}
                      </span>
                      <span className="ml-1 text-sm text-white/60">/month</span>
                    </div>
                    <p className="mb-6 text-sm font-light text-white/50">
                      7-day free trial, then{" "}
                      {SUBSCRIPTION_DISPLAY_PRICES.monthly.unitAmountFormatted}/month
                    </p>

                    <GlowButton
                      variant="white"
                      className="w-full"
                      onClick={() => handleSubscribe(SUBSCRIPTION_PRICES.MONTHLY)}
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
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-5">
      <Card className="max-h-[95vh] w-full max-w-4xl overflow-y-auto border-[#E6DBC7]/20 bg-background/40 backdrop-blur-xl">
        <CardHeader className="px-5 pt-8 text-center sm:px-6 sm:pt-10 md:pt-12">
          <Wind className="mx-auto mb-4 h-12 w-12 text-[#E6DBC7] sm:mb-5 sm:h-14 sm:w-14 md:mb-6 md:h-16 md:w-16" />
          <CardTitle className="mb-3 font-editorial text-3xl font-light text-[#E6DBC7] sm:text-4xl md:mb-3 md:text-4xl lg:text-5xl">
            Safety First
          </CardTitle>
          <p className="mt-2 text-center text-base font-light text-foreground/60 sm:text-lg">
            Please read and accept our safety guidelines
          </p>
        </CardHeader>
        <CardContent className="px-5 pb-8 sm:px-6 sm:pb-10 md:px-8 md:pb-12">
          <div className="mb-6 max-h-[50vh] overflow-y-auto border-t border-foreground/10 pr-3 pt-6 text-sm font-light leading-relaxed text-foreground/80 sm:mb-8 sm:max-h-[60vh] sm:pr-4 sm:pt-7 sm:text-base md:pt-8">
            <SafetyDisclosureContent />
          </div>

          <div className="mb-6 flex items-start space-x-3 rounded-lg border border-[#E6DBC7]/20 bg-white/5 p-4 sm:mb-8 sm:space-x-4 sm:p-5">
            <Checkbox
              id="safety"
              checked={safetyAccepted}
              onCheckedChange={(checked) => setSafetyAccepted(checked as boolean)}
              className="mt-0.5 h-6 w-6 border-2"
            />
            <label
              htmlFor="safety"
              className="cursor-pointer text-sm font-light leading-relaxed text-foreground/90 sm:text-base md:text-base"
            >
              I have read and accept the safety disclosure
            </label>
          </div>

          <Button
            onClick={completeOnboarding}
            className="w-full rounded-full border-2 border-white bg-white/5 py-6 text-sm font-light text-white backdrop-blur-md transition-all hover:bg-white/10"
            disabled={!safetyAccepted || loading}
          >
            {loading ? <ButtonLoadingSpinner /> : "Continue to Library"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;

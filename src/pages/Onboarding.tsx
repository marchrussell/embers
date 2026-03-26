import { Check, Wind } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { SafetyDisclosureContent } from "@/components/SafetyDisclosureContent";
import { ButtonLoadingSpinner } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { analytics } from "@/lib/posthog";
import { SUBSCRIPTION_PRICES } from "@/lib/stripePrices";

const Onboarding = () => {
  const [safetyAccepted, setSafetyAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
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
  }, [user]);

  const handleSubscribe = async (priceId: string) => {
    setLoading(true);
    const plan = priceId === SUBSCRIPTION_PRICES.ANNUAL ? "annual" : "monthly";
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
    } catch (error: any) {
      toast.error(error.message || "Failed to create checkout session");
    } finally {
      setLoading(false);
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
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-3xl border-[#E6DBC7]/20 bg-background/40 backdrop-blur-xl">
          <CardHeader className="px-4 pt-8 text-center md:pt-12">
            <CardTitle className="mb-3 font-editorial text-4xl font-light text-[#E6DBC7] md:mb-4 md:text-5xl lg:text-6xl">
              MARCH
            </CardTitle>
            <p className="text-xl font-light text-foreground/80 md:text-2xl">
              Become a member today!
            </p>
          </CardHeader>
          <CardContent className="space-y-4 px-4 pb-8 md:px-6 md:pb-12">
            {/* Annual Plan */}
            <div className="relative rounded-xl border border-[#E6DBC7]/40 bg-background/20 p-5 backdrop-blur-sm transition-all hover:border-[#E6DBC7]/60 md:rounded-2xl md:p-6">
              <div className="absolute -top-2.5 right-4 md:-top-3 md:right-6">
                <span className="rounded-full bg-[#E6DBC7] px-3 py-0.5 text-[10px] font-medium tracking-wide text-[#1A1F2C] md:px-4 md:py-1 md:text-xs">
                  BEST VALUE
                </span>
              </div>
              <div className="mb-4">
                <div className="mb-1 text-2xl font-light text-[#E6DBC7] md:text-3xl">Annual</div>
                <div className="text-sm font-light text-foreground/70 md:text-base">
                  £79.99 (£6.67/month)
                </div>
              </div>
              <Button
                onClick={() => handleSubscribe("price_1SNBxPGBlPMRpwZ6q1Xb52iA")}
                className="w-full rounded-full border-2 border-white bg-white/5 py-5 text-sm font-light text-white backdrop-blur-md transition-all hover:bg-white/10 md:py-6 md:text-base"
                size="lg"
                disabled={loading}
              >
                {loading ? <ButtonLoadingSpinner /> : "Try Free & Subscribe"}
              </Button>
            </div>

            {/* Monthly Plan */}
            <div className="rounded-xl border border-[#E6DBC7]/20 bg-background/10 p-5 backdrop-blur-sm transition-all hover:border-[#E6DBC7]/40 md:rounded-2xl md:p-6">
              <div className="mb-4">
                <div className="mb-1 text-2xl font-light text-[#E6DBC7] md:text-3xl">Monthly</div>
                <div className="text-sm font-light text-foreground/70 md:text-base">
                  £9.99/month
                </div>
              </div>
              <Button
                onClick={() => handleSubscribe("price_1SNBx3GBlPMRpwZ6Cic7AcTl")}
                className="w-full rounded-full border-2 border-[#E6DBC7]/40 bg-transparent py-5 text-sm font-light text-[#E6DBC7] transition-all hover:bg-white/5 md:py-6 md:text-base"
                size="lg"
                disabled={loading}
              >
                {loading ? <ButtonLoadingSpinner /> : "Try Free & Subscribe"}
              </Button>
            </div>

            <div className="space-y-3 pt-6">
              <div className="flex items-center gap-3">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#E6DBC7]" />
                <p className="text-xs font-light text-foreground/70 md:text-base">
                  Unlimited access to exclusive breathwork classes.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#E6DBC7]" />
                <p className="text-xs font-light text-foreground/70 md:text-base">
                  Cancel anytime. Your subscription automatically renews until cancelled.
                </p>
              </div>
            </div>

            <p className="pt-4 text-center text-[10px] font-light text-foreground/60 md:pt-6 md:text-xs">
              The Studio is free for anyone who can't afford it.
              <br />
              Please email support@embersstudio.io to receive access.
            </p>

            <div className="pt-4 text-center">
              <a
                href="/privacy-policy"
                className="text-[10px] text-foreground/60 underline hover:text-foreground/80 md:text-xs"
              >
                Privacy Policy
              </a>
              <span className="mx-2 text-foreground/40">•</span>
              <a
                href="/terms-of-service"
                className="text-[10px] text-foreground/60 underline hover:text-foreground/80 md:text-xs"
              >
                Terms of Service
              </a>
            </div>
          </CardContent>
        </Card>
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
          <div className="mb-8 space-y-5 rounded-xl border border-[#E6DBC7]/10 bg-background/30 p-5 backdrop-blur-sm sm:mb-10 sm:space-y-6 sm:p-7 md:mb-10 md:space-y-6 md:p-8">
            <h3 className="mb-4 text-lg font-light text-[#E6DBC7] sm:text-xl md:text-xl">
              Important Safety Information
            </h3>

            <p className="text-sm font-light leading-relaxed text-foreground/80 sm:text-base md:text-base">
              Embers Studio provides specialist breathwork, meditation, and wellness classes
              designed to support your wellbeing. All content and tools provided through the App are
              for informational and educational purposes only and do not constitute or replace
              medical, psychological, or therapeutic advice.
            </p>

            <p className="text-sm font-light leading-relaxed text-foreground/80 sm:text-base md:text-base">
              Breathwork can have powerful effects on the body and mind, so please practice gently,
              safely, and within your own window of capacity. It is important and advisable to read
              and understand the Safety Information below before continuing.
            </p>

            <p className="text-sm font-light leading-relaxed text-foreground/80 sm:text-base md:text-base">
              Please consult a medical professional if you have any medical history, conditions, or
              concerns, and reach out to March at{" "}
              <a
                href="mailto:support@embersstudio.io"
                className="text-[#E6DBC7] underline transition-colors hover:text-[#E6DBC7]/80"
              >
                support@embersstudio.io
              </a>{" "}
              if you have any questions.
            </p>

            <div className="mt-5 rounded-lg border border-[#E6DBC7]/20 bg-[#E6DBC7]/5 p-4 sm:p-5 md:p-5">
              <p className="text-sm font-light leading-relaxed text-foreground/90 sm:text-base md:text-base">
                <span className="font-medium text-[#E6DBC7]">By continuing, you confirm</span> that
                you have read and understood our safety guidelines, and that you take full
                responsibility for your own health and wellbeing while using this service.
              </p>
            </div>
          </div>

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
            className="w-full rounded-full border-2 border-white bg-white/5 py-5 text-sm font-light text-white backdrop-blur-md transition-all hover:bg-white/10 sm:py-6 sm:text-base md:py-6 md:text-base"
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

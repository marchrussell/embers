import { Wind } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { SafetyDisclosureContent } from "@/components/SafetyDisclosureContent";
import { ButtonLoadingSpinner } from "@/components/skeletons";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { analytics } from "@/lib/posthog";

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
  }, [user, navigate, checkSubscription]);

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

  if (!hasSubscription) {
    return <SubscriptionModal open={true} onClose={() => navigate("/")} />;
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

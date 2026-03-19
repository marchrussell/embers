import { ButtonLoadingSpinner } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Check, Wind } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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

          <div className="mb-6 max-h-[50vh] space-y-5 overflow-y-auto border-t border-foreground/10 pr-3 pt-6 sm:mb-8 sm:max-h-[60vh] sm:space-y-7 sm:pt-7 md:mb-8 md:space-y-8 md:pr-4 md:pt-8">
            {/* Title */}
            <div>
              <h1 className="mb-4 font-editorial text-2xl text-[#E6DBC7] sm:mb-4 sm:text-3xl md:text-3xl">
                Full Safety Disclosure
              </h1>
              <p className="mb-4 text-sm font-light italic leading-relaxed text-foreground/80 sm:mb-4 sm:text-base md:text-base">
                Please read all of the information below before continuing to The Studio.
              </p>
            </div>

            {/* Introduction */}
            <div>
              <p className="mb-4 text-sm font-light leading-relaxed text-foreground/80 sm:mb-4 sm:text-base md:text-base">
                You will be guided through simple Breathwork techniques which can have a powerful
                and profound effect on your:
              </p>
              <ul className="mb-5 space-y-2 pl-5 text-sm font-light text-foreground/70 sm:mb-6 sm:space-y-2 sm:pl-6 sm:text-base md:text-base">
                <li className="list-disc">Nervous system</li>
                <li className="list-disc">Respiratory system</li>
                <li className="list-disc">Lymphatic System</li>
                <li className="list-disc">Endocrine system</li>
                <li className="list-disc">Cardiovascular system</li>
              </ul>
              <p className="text-sm font-light leading-relaxed text-foreground/80 sm:text-base md:text-base">
                For your safety, it is important and advisable to consult a medical professional if
                you have any medical history or issues related to the aforementioned bodily systems
                to ensure that the breathwork is safe and appropriate for you.
              </p>
            </div>

            {/* Contraindications */}
            <div className="border-b border-foreground/10 pb-5 sm:pb-6">
              <h2 className="mb-4 text-lg font-semibold uppercase tracking-wide text-[#E6DBC7] sm:mb-4 sm:text-xl md:text-xl">
                Contraindications
              </h2>
              <p className="mb-5 text-sm font-light leading-relaxed text-foreground/80 sm:mb-6 sm:text-base md:text-base">
                The breathing classes and techniques in this App are not suitable for anyone with
                the following conditions. Please do not practice breathwork, Online or In-Person,
                without consulting your doctor if you have experienced or have any of the following
                conditions:
              </p>
              <ul className="mb-5 space-y-2 pl-5 text-sm font-light text-foreground/70 sm:mb-6 sm:space-y-2.5 sm:pl-6 sm:text-base md:text-base">
                <li className="list-disc">Pregnancy</li>
                <li className="list-disc">Epilepsy</li>
                <li className="list-disc">
                  Serious mental illness; severe anxiety or depression, psychotic states/borderline
                  psychotic states
                </li>
                <li className="list-disc">Respiratory conditions or infections</li>
                <li className="list-disc">Seizures (of any kind)</li>
                <li className="list-disc">High Blood Pressure</li>
                <li className="list-disc">Detached retina / cataracts / glaucoma</li>
                <li className="list-disc">Cardiovascular disease</li>
                <li className="list-disc">Angina/heart attack/heart conditions</li>
                <li className="list-disc">Osteoporosis</li>
                <li className="list-disc">Panic attacks</li>
                <li className="list-disc">Family History of aneurysms</li>
                <li className="list-disc">Recent surgery or injury</li>
                <li className="list-disc">Any conditions which you take regular medication for</li>
                <li className="list-disc">Spiritual Emergence</li>
                <li className="list-disc">Vertigo</li>
                <li className="list-disc">Spinal Disorders</li>
              </ul>
              <p className="text-sm font-light italic leading-relaxed text-foreground/80 sm:text-base md:text-base">
                Please note: Rapid breathing can cause lightheadedness and may disrupt the heart. If
                you experience faintness, dizziness, pain or shortness of breath at any time while
                using the app, you should stop immediately and seek immediate medical attention.
              </p>
            </div>

            {/* Breathholds */}
            <div className="border-b border-foreground/10 pb-5 sm:pb-6">
              <h2 className="mb-4 text-lg font-semibold uppercase tracking-wide text-[#E6DBC7] sm:mb-4 sm:text-xl md:text-xl">
                Breathholds
              </h2>
              <p className="mb-5 text-sm font-light leading-relaxed text-foreground/80 sm:mb-6 sm:text-base md:text-base">
                Breath retention exercises (breath holds) are only appropriate for individuals in
                good health. If you have any concerns, it's advisable to consult your doctor before
                participating in these exercises. Please do not practice breath holds if you have
                any of the following;
              </p>
              <ul className="mb-5 space-y-2 pl-5 text-sm font-light text-foreground/70 sm:mb-6 sm:space-y-2.5 sm:pl-6 sm:text-base md:text-base">
                <li className="list-disc">Cancer.</li>
                <li className="list-disc">Uncontrolled hyperthyroidism.</li>
                <li className="list-disc">Schizophrenia.</li>
                <li className="list-disc">Sleep apnea.</li>
                <li className="list-disc">During pregnancy.</li>
                <li className="list-disc">High blood pressure.</li>
                <li className="list-disc">Kidney disease.</li>
                <li className="list-disc">Cardiovascular issues.</li>
                <li className="list-disc">Epilepsy.</li>
                <li className="list-disc">Chest pains or heart problems.</li>
                <li className="list-disc">Near water.</li>
                <li className="list-disc">Panic disorder and anxiety.</li>
                <li className="list-disc">Sickle cell anemia.</li>
                <li className="list-disc">Arterial aneurysm.</li>
                <li className="list-disc">Diabetes.</li>
              </ul>
              <p className="text-sm font-light leading-relaxed text-foreground/80 sm:text-base md:text-base">
                Always consult a healthcare professional before attempting breath holding exercises
                if you have any of these conditions or concerns.
              </p>
            </div>

            {/* Where Not to Practice */}
            <div className="border-b border-foreground/10 pb-5 sm:pb-6">
              <h2 className="mb-4 text-lg font-semibold uppercase tracking-wide text-[#E6DBC7] sm:mb-4 sm:text-xl md:text-xl">
                Where Not to Practice Breathwork
              </h2>
              <p className="mb-4 text-sm font-light leading-relaxed text-foreground/80 sm:mb-4 sm:text-base md:text-base">
                Do not use the Services while driving, in water, while operating machinery or
                performing other tasks that require attention and concentration. You understand that
                you are solely responsible for your use of the Services. We assume no responsibility
                for injuries suffered while practicing the techniques presented in the Services.{" "}
                <span className="italic">
                  It is important to only practice breathwork when you are in a safe place.
                </span>
              </p>
            </div>

            {/* Pregnancy */}
            <div className="border-b border-foreground/10 pb-5 sm:pb-6">
              <h2 className="mb-4 text-lg font-semibold uppercase tracking-wide text-[#E6DBC7] sm:mb-4 sm:text-xl md:text-xl">
                Pregnancy
              </h2>
              <p className="mb-4 text-sm font-light leading-relaxed text-foreground/80 sm:mb-4 sm:text-base md:text-base">
                If you are currently attempting to conceive, are pregnant or in the postpartum
                phase, please take note of the following precautions when practicing breathwork:
              </p>
              <ul className="mb-4 space-y-3 pl-5 text-sm font-light text-foreground/70 sm:mb-4 sm:space-y-4 sm:pl-6 sm:text-base md:text-base">
                <li className="list-disc">
                  Some breathing techniques involve breath retentions (holding your breath) which
                  are not recommended and should not be attempted by you during this practice.
                </li>
                <li className="list-disc">
                  Some breathing techniques involve muscle tension exercises, which involve
                  squeezing and tensing various parts of the body, including in the abdomen region.
                  This is not recommended and should not be attempted by you during this practice.
                </li>
              </ul>
              <p className="mb-4 text-sm font-light leading-relaxed text-foreground/80 sm:mb-4 sm:text-base md:text-base">
                Instead of practicing the aforementioned techniques, allow your breath to flow back
                to its natural rhythm and you can then continue as normal afterwards.
              </p>
              <p className="text-sm font-light italic leading-relaxed text-foreground/80 sm:text-base md:text-base">
                Please note: Breathwork is not a suitable practice for you, if you are in your first
                trimester of pregnancy,
              </p>
            </div>

            {/* Cardiovascular Problems */}
            <div className="border-b border-foreground/10 pb-5 sm:pb-6">
              <h2 className="mb-4 text-lg font-semibold uppercase tracking-wide text-[#E6DBC7] sm:mb-4 sm:text-xl md:text-xl">
                Cardiovascular Problems
              </h2>
              <p className="mb-4 text-sm font-light leading-relaxed text-foreground/80 sm:mb-4 sm:text-base md:text-base">
                If you have cardiovascular problems, please note:
              </p>
              <ul className="mb-4 space-y-3 pl-5 text-sm font-light text-foreground/70 sm:mb-4 sm:space-y-4 sm:pl-6 sm:text-base md:text-base">
                <li className="list-disc">
                  It is recommended to practice breathing exercises while sitting upright
                  comfortably on a chair or with your torso raised by propping your body up at an
                  angle.
                </li>
                <li className="list-disc">
                  Breathe 30% slower than the pace that is set during any breathing exercises. Pay
                  attention to your body and chose the actions that feel appropriate for you.
                </li>
              </ul>
              <p className="text-sm font-light italic leading-relaxed text-foreground/80 sm:text-base md:text-base">
                Please note: Breathwork is not a suitable practice for you if you have severe
                cardiovascular problems,
              </p>
            </div>

            {/* Neurodiverse People */}
            <div className="border-b border-foreground/10 pb-5 sm:pb-6">
              <h2 className="mb-4 text-lg font-semibold uppercase tracking-wide text-[#E6DBC7] sm:mb-4 sm:text-xl md:text-xl">
                Neurodiverse People
              </h2>
              <p className="mb-4 text-sm font-light leading-relaxed text-foreground/80 sm:mb-4 sm:text-base md:text-base">
                If you are neurodiverse or have any psychological conditions like anxiety and
                depression, these breathing exercises can be beneficial. However, it is important to
                proceed at your own pace and seek professional advice if you feel uncertain about
                engaging with breathwork.
              </p>
              <div className="flex items-start gap-3 text-sm font-light text-foreground/70 sm:gap-3 sm:text-base md:text-base">
                <span>
                  There have been rare reports that people with certain mental health conditions
                  such as anxiety and depression having experienced worsening conditions in
                  conjunction with intensive breathing practice. People with existing mental health
                  conditions should speak with their healthcare providers before starting a
                  breathing practice.
                </span>
              </div>
            </div>

            {/* Tips */}
            <div className="border-b border-foreground/10 pb-5 sm:pb-6">
              <h2 className="mb-4 text-lg font-semibold uppercase tracking-wide text-[#E6DBC7] sm:mb-4 sm:text-xl md:text-xl">
                Tips
              </h2>
              <div className="flex items-start gap-3 text-sm font-light text-foreground/70 sm:gap-3 sm:text-base md:text-base">
                <span>It is advisable to practice breathwork on an empty stomach.</span>
              </div>
            </div>

            {/* Legal Disclaimer */}
            <div className="space-y-4 sm:space-y-6">
              <p className="text-sm font-light leading-relaxed text-foreground/80 sm:text-base md:text-base">
                The Studio Ltd. assumes no responsibility for injuries suffered while practicing
                these techniques and The Studio Ltd. shall not be held liable for any damages,
                circumstances, conditions or injuries that may occur, directly or indirectly, from
                engaging in any activities or ideas presented in any Application made by The Studio,
                Ltd.
              </p>
              <p className="text-sm font-light leading-relaxed text-foreground/80 sm:text-base md:text-base">
                By continuing to access and use The Studio App, you agree that you have read and
                understood the above Safety Disclosure and accept all responsibility for your
                physical and mental health and any resultant injury or mishap that may affect your
                well-being or health in any way.
              </p>
              <p className="text-xs font-light leading-relaxed text-foreground/70 sm:text-sm md:text-sm">
                If you have questions or comments, you may email us at{" "}
                <a href="mailto:support@embersstudio.io" className="text-[#E6DBC7] hover:underline">
                  support@embersstudio.io
                </a>
              </p>
            </div>
          </div>

          <div className="mb-6 flex items-start space-x-3 rounded-lg border border-[#E6DBC7]/20 bg-white/5 p-4 sm:mb-8 sm:space-x-4 sm:p-5">
            <Checkbox
              id="safety"
              checked={safetyAccepted}
              onCheckedChange={(checked) => setSafetyAccepted(checked as boolean)}
              className="mt-0.5 h-6 w-6 border-2 sm:h-6 sm:w-6"
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

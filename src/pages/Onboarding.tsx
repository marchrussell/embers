import { ButtonLoadingSpinner } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Check, Wind } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [safetyAccepted, setSafetyAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, hasSubscription, checkSubscription, refreshOnboardingStatus } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const successParam = searchParams.get("success");

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
      
      toast.success("Welcome to The Studio! You're all set.");
      
      // Check if there's a redirect intent for nervous system program
      const redirectIntent = localStorage.getItem('postOnboardingRedirect');
      if (redirectIntent === 'nervous-system-program') {
        localStorage.removeItem('postOnboardingRedirect');
        navigate("/studio?scrollTo=nervous-system", { replace: true });
      } else {
        // Navigate without full page reload
        navigate("/studio", { replace: true });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  // Show subscription page only if explicitly no subscription
  // This page should normally only be reached through direct navigation or if payment flow was incomplete
  if (!hasSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-3xl bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20">
          <CardHeader className="text-center pt-8 md:pt-12 px-4">
            <CardTitle className="font-editorial text-4xl md:text-5xl lg:text-6xl text-[#E6DBC7] font-light mb-3 md:mb-4">MARCH</CardTitle>
            <p className="text-xl md:text-2xl font-light text-foreground/80">Become a member today!</p>
          </CardHeader>
          <CardContent className="space-y-4 pb-8 md:pb-12 px-4 md:px-6">
            {/* Annual Plan */}
            <div className="relative border border-[#E6DBC7]/40 rounded-xl md:rounded-2xl p-5 md:p-6 bg-background/20 backdrop-blur-sm hover:border-[#E6DBC7]/60 transition-all">
              <div className="absolute -top-2.5 md:-top-3 right-4 md:right-6">
                <span className="bg-[#E6DBC7] text-[#1A1F2C] px-3 md:px-4 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium tracking-wide">
                  BEST VALUE
                </span>
              </div>
              <div className="mb-4">
                <div className="text-2xl md:text-3xl font-light text-[#E6DBC7] mb-1">Annual</div>
                <div className="text-sm md:text-base text-foreground/70 font-light">
                  £79.99 (£6.67/month)
                </div>
              </div>
              <Button 
                onClick={() => handleSubscribe("price_1SNBxPGBlPMRpwZ6q1Xb52iA")}
                className="w-full rounded-full py-5 md:py-6 font-light text-sm md:text-base bg-white/5 backdrop-blur-md text-white border-2 border-white hover:bg-white/10 transition-all"
                size="lg"
                disabled={loading}
              >
                {loading ? <ButtonLoadingSpinner /> : "Try Free & Subscribe"}
              </Button>
            </div>

            {/* Monthly Plan */}
            <div className="border border-[#E6DBC7]/20 rounded-xl md:rounded-2xl p-5 md:p-6 bg-background/10 backdrop-blur-sm hover:border-[#E6DBC7]/40 transition-all">
              <div className="mb-4">
                <div className="text-2xl md:text-3xl font-light text-[#E6DBC7] mb-1">Monthly</div>
                <div className="text-sm md:text-base text-foreground/70 font-light">
                  £9.99/month
                </div>
              </div>
              <Button 
                onClick={() => handleSubscribe("price_1SNBx3GBlPMRpwZ6Cic7AcTl")}
                className="w-full rounded-full py-5 md:py-6 font-light text-sm md:text-base bg-transparent border-2 border-[#E6DBC7]/40 text-[#E6DBC7] hover:bg-white/5 transition-all"
                size="lg"
                disabled={loading}
              >
                {loading ? <ButtonLoadingSpinner /> : "Try Free & Subscribe"}
              </Button>
            </div>

            <div className="pt-6 space-y-3">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#E6DBC7] mt-0.5 flex-shrink-0" />
                <p className="text-xs md:text-base font-light text-foreground/70">
                  Unlimited access to exclusive breathwork classes.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#E6DBC7] mt-0.5 flex-shrink-0" />
                <p className="text-xs md:text-base font-light text-foreground/70">
                  Cancel anytime. Your subscription automatically renews until cancelled.
                </p>
              </div>
            </div>

            <p className="text-[10px] md:text-xs text-center text-foreground/60 pt-4 md:pt-6 font-light">
              The Studio is free for anyone who can't afford it.<br />
              Please email march@marchrussell.com to receive access.
            </p>
            
            <div className="text-center pt-4">
              <a href="/privacy-policy" className="text-[10px] md:text-xs text-foreground/60 hover:text-foreground/80 underline">
                Privacy Policy
              </a>
              <span className="text-foreground/40 mx-2">•</span>
              <a href="/terms-of-service" className="text-[10px] md:text-xs text-foreground/60 hover:text-foreground/80 underline">
                Terms of Service
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-5">
      <Card className="w-full max-w-4xl max-h-[95vh] overflow-y-auto bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20">
        <CardHeader className="text-center pt-8 sm:pt-10 md:pt-12 px-5 sm:px-6">
          <Wind className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-[#E6DBC7] mx-auto mb-4 sm:mb-5 md:mb-6" />
          <CardTitle className="font-editorial text-3xl sm:text-4xl md:text-4xl lg:text-5xl text-[#E6DBC7] font-light mb-3 md:mb-3">Safety First</CardTitle>
          <p className="text-base sm:text-lg text-foreground/60 font-light text-center mt-2">Please read and accept our safety guidelines</p>
        </CardHeader>
        <CardContent className="px-5 sm:px-6 md:px-8 pb-8 sm:pb-10 md:pb-12">
          <div className="mb-8 sm:mb-10 md:mb-10 bg-background/30 backdrop-blur-sm border border-[#E6DBC7]/10 rounded-xl p-5 sm:p-7 md:p-8 space-y-5 sm:space-y-6 md:space-y-6">
            <h3 className="text-lg sm:text-xl md:text-xl font-light text-[#E6DBC7] mb-4">Important Safety Information</h3>
            
            <p className="text-foreground/80 font-light leading-relaxed text-sm sm:text-base md:text-base">
              March provides specialist breathwork, meditation, and wellness classes designed to support your wellbeing. All content and tools provided through the App are for informational and educational purposes only and do not constitute or replace medical, psychological, or therapeutic advice.
            </p>
            
            <p className="text-foreground/80 font-light leading-relaxed text-sm sm:text-base md:text-base">
              Breathwork can have powerful effects on the body and mind, so please practice gently, safely, and within your own window of capacity. It is important and advisable to read and understand the Safety Information below before continuing.
            </p>
            
            <p className="text-foreground/80 font-light leading-relaxed text-sm sm:text-base md:text-base">
              Please consult a medical professional if you have any medical history, conditions, or concerns, and reach out to March at{" "}
              <a href="mailto:march@marchrussell.com" className="text-[#E6DBC7] hover:text-[#E6DBC7]/80 underline transition-colors">
                march@marchrussell.com
              </a>
              {" "}if you have any questions.
            </p>
            
            <div className="bg-[#E6DBC7]/5 border border-[#E6DBC7]/20 rounded-lg p-4 sm:p-5 md:p-5 mt-5">
              <p className="text-foreground/90 font-light leading-relaxed text-sm sm:text-base md:text-base">
                <span className="font-medium text-[#E6DBC7]">By continuing, you confirm</span> that you have read and understood our safety guidelines, and that you take full responsibility for your own health and wellbeing while using this service.
              </p>
            </div>
          </div>
          
          <div className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto mb-6 sm:mb-8 md:mb-8 pr-3 md:pr-4 space-y-5 sm:space-y-7 md:space-y-8 border-t border-foreground/10 pt-6 sm:pt-7 md:pt-8">
            {/* Title */}
            <div>
              <h1 className="font-editorial text-2xl sm:text-3xl md:text-3xl text-[#E6DBC7] mb-4 sm:mb-4">Full Safety Disclosure</h1>
              <p className="text-foreground/80 font-light leading-relaxed mb-4 sm:mb-4 text-sm sm:text-base md:text-base italic">
                Please read all of the information below before continuing to The Studio.
              </p>
            </div>

            {/* Introduction */}
            <div>
              <p className="text-foreground/80 font-light leading-relaxed mb-4 sm:mb-4 text-sm sm:text-base md:text-base">
                You will be guided through simple Breathwork techniques which can have a powerful and profound effect on your:
              </p>
              <ul className="space-y-2 sm:space-y-2 text-foreground/70 font-light pl-5 sm:pl-6 text-sm sm:text-base md:text-base mb-5 sm:mb-6">
                <li className="list-disc">Nervous system</li>
                <li className="list-disc">Respiratory system</li>
                <li className="list-disc">Lymphatic System</li>
                <li className="list-disc">Endocrine system</li>
                <li className="list-disc">Cardiovascular system</li>
              </ul>
              <p className="text-foreground/80 font-light leading-relaxed text-sm sm:text-base md:text-base">
                For your safety, it is important and advisable to consult a medical professional if you have any medical history or issues related to the aforementioned bodily systems to ensure that the breathwork is safe and appropriate for you.
              </p>
            </div>

            {/* Contraindications */}
            <div className="pb-5 sm:pb-6 border-b border-foreground/10">
              <h2 className="text-lg sm:text-xl md:text-xl font-semibold text-[#E6DBC7] mb-4 sm:mb-4 uppercase tracking-wide">Contraindications</h2>
              <p className="text-foreground/80 font-light leading-relaxed mb-5 sm:mb-6 text-sm sm:text-base md:text-base">
                The breathing classes and techniques in this App are not suitable for anyone with the following conditions. Please do not practice breathwork, Online or In-Person, without consulting your doctor if you have experienced or have any of the following conditions:
              </p>
              <div className="space-y-2 sm:space-y-2.5 text-foreground/70 font-light text-sm sm:text-base md:text-base mb-5 sm:mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Pregnancy</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Epilepsy</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Serious mental illness; severe anxiety or depression, psychotic states/borderline psychotic states</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Respiratory conditions or infections</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Seizures (of any kind)</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>High Blood Pressure</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Detached retina / cataracts / glaucoma</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Cardiovascular disease</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Angina/heart attack/heart conditions</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Osteoporosis</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Panic attacks</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Family History of aneurysms</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Recent surgery or injury</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Any conditions which you take regular medication for</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Spiritual Emergence</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Vertigo</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Spinal Disorders</span>
                </div>
              </div>
              <p className="text-foreground/80 font-light leading-relaxed text-sm sm:text-base md:text-base italic">
                Please note: Rapid breathing can cause lightheadedness and may disrupt the heart. If you experience faintness, dizziness, pain or shortness of breath at any time while using the app, you should stop immediately and seek immediate medical attention.
              </p>
            </div>

            {/* Breathholds */}
            <div className="pb-5 sm:pb-6 border-b border-foreground/10">
              <h2 className="text-lg sm:text-xl md:text-xl font-semibold text-[#E6DBC7] mb-4 sm:mb-4 uppercase tracking-wide">Breathholds</h2>
              <p className="text-foreground/80 font-light leading-relaxed mb-5 sm:mb-6 text-sm sm:text-base md:text-base">
                Breath retention exercises (breath holds) are only appropriate for individuals in good health. If you have any concerns, it's advisable to consult your doctor before participating in these exercises. Please do not practice breath holds if you have any of the following;
              </p>
              <div className="space-y-2 sm:space-y-2.5 text-foreground/70 font-light text-sm sm:text-base md:text-base mb-5 sm:mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Cancer.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Uncontrolled hyperthyroidism.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Schizophrenia.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Sleep apnea.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>During pregnancy.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>High blood pressure.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Kidney disease.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Cardiovascular issues.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Epilepsy.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Chest pains or heart problems.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Near water.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Panic disorder and anxiety.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Sickle cell anemia.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Arterial aneurysm.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg">•</span>
                  <span>Diabetes.</span>
                </div>
              </div>
              <p className="text-foreground/80 font-light leading-relaxed text-sm sm:text-base md:text-base">
                Always consult a healthcare professional before attempting breath holding exercises if you have any of these conditions or concerns.
              </p>
            </div>

            {/* Where Not to Practice */}
            <div className="pb-5 sm:pb-6 border-b border-foreground/10">
              <h2 className="text-lg sm:text-xl md:text-xl font-semibold text-[#E6DBC7] mb-4 sm:mb-4 uppercase tracking-wide">Where Not to Practice Breathwork</h2>
              <p className="text-foreground/80 font-light leading-relaxed mb-4 sm:mb-4 text-sm sm:text-base md:text-base">
                Do not use the Services while driving, in water, while operating machinery or performing other tasks that require attention and concentration. You understand that you are solely responsible for your use of the Services. We assume no responsibility for injuries suffered while practicing the techniques presented in the Services. <span className="italic">It is important to only practice breathwork when you are in a safe place.</span>
              </p>
            </div>

            {/* Pregnancy */}
            <div className="pb-5 sm:pb-6 border-b border-foreground/10">
              <h2 className="text-lg sm:text-xl md:text-xl font-semibold text-[#E6DBC7] mb-4 sm:mb-4 uppercase tracking-wide">Pregnancy</h2>
              <p className="text-foreground/80 font-light leading-relaxed mb-4 sm:mb-4 text-sm sm:text-base md:text-base">
                If you are currently attempting to conceive, are pregnant or in the postpartum phase, please take note of the following precautions when practicing breathwork:
              </p>
              <div className="space-y-3 sm:space-y-4 text-foreground/70 font-light text-sm sm:text-base md:text-base mb-4 sm:mb-4">
                <div className="flex items-start gap-3 sm:gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg sm:text-lg">•</span>
                  <span>Some breathing techniques involve breath retentions (holding your breath) which are not recommended and should not be attempted by you during this practice.</span>
                </div>
                <div className="flex items-start gap-3 sm:gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg sm:text-lg">•</span>
                  <span>Some breathing techniques involve muscle tension exercises, which involve squeezing and tensing various parts of the body, including in the abdomen region. This is not recommended and should not be attempted by you during this practice.</span>
                </div>
              </div>
              <p className="text-foreground/80 font-light leading-relaxed mb-4 sm:mb-4 text-sm sm:text-base md:text-base">
                Instead of practicing the aforementioned techniques, allow your breath to flow back to its natural rhythm and you can then continue as normal afterwards.
              </p>
              <p className="text-foreground/80 font-light leading-relaxed text-sm sm:text-base md:text-base italic">
                Please note: Breathwork is not a suitable practice for you, if you are in your first trimester of pregnancy,
              </p>
            </div>

            {/* Cardiovascular Problems */}
            <div className="pb-5 sm:pb-6 border-b border-foreground/10">
              <h2 className="text-lg sm:text-xl md:text-xl font-semibold text-[#E6DBC7] mb-4 sm:mb-4 uppercase tracking-wide">Cardiovascular Problems</h2>
              <p className="text-foreground/80 font-light leading-relaxed mb-4 sm:mb-4 text-sm sm:text-base md:text-base">
                If you have cardiovascular problems, please note:
              </p>
              <div className="space-y-3 sm:space-y-4 text-foreground/70 font-light text-sm sm:text-base md:text-base mb-4 sm:mb-4">
                <div className="flex items-start gap-3 sm:gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg sm:text-lg">•</span>
                  <span>It is recommended to practice breathing exercises while sitting upright comfortably on a chair or with your torso raised by propping your body up at an angle.</span>
                </div>
                <div className="flex items-start gap-3 sm:gap-3">
                  <span className="text-[#E6DBC7] mt-1 text-lg sm:text-lg">•</span>
                  <span>Breathe 30% slower than the pace that is set during any breathing exercises. Pay attention to your body and chose the actions that feel appropriate for you.</span>
                </div>
              </div>
              <p className="text-foreground/80 font-light leading-relaxed text-sm sm:text-base md:text-base italic">
                Please note: Breathwork is not a suitable practice for you if you have severe cardiovascular problems,
              </p>
            </div>

            {/* Neurodiverse People */}
            <div className="pb-5 sm:pb-6 border-b border-foreground/10">
              <h2 className="text-lg sm:text-xl md:text-xl font-semibold text-[#E6DBC7] mb-4 sm:mb-4 uppercase tracking-wide">Neurodiverse People</h2>
              <p className="text-foreground/80 font-light leading-relaxed mb-4 sm:mb-4 text-sm sm:text-base md:text-base">
                If you are neurodiverse or have any psychological conditions like anxiety and depression, these breathing exercises can be beneficial. However, it is important to proceed at your own pace and seek professional advice if you feel uncertain about engaging with breathwork.
              </p>
              <div className="flex items-start gap-3 sm:gap-3 text-foreground/70 font-light text-sm sm:text-base md:text-base">
                <span>There have been rare reports that people with certain mental health conditions such as anxiety and depression having experienced worsening conditions in conjunction with intensive breathing practice. People with existing mental health conditions should speak with their healthcare providers before starting a breathing practice.</span>
              </div>
            </div>

            {/* Tips */}
            <div className="pb-5 sm:pb-6 border-b border-foreground/10">
              <h2 className="text-lg sm:text-xl md:text-xl font-semibold text-[#E6DBC7] mb-4 sm:mb-4 uppercase tracking-wide">Tips</h2>
              <div className="flex items-start gap-3 sm:gap-3 text-foreground/70 font-light text-sm sm:text-base md:text-base">
                <span>It is advisable to practice breathwork on an empty stomach.</span>
              </div>
            </div>

            {/* Legal Disclaimer */}
            <div className="space-y-4 sm:space-y-6">
              <p className="text-foreground/80 font-light leading-relaxed text-sm sm:text-base md:text-base">
                The Studio Ltd. assumes no responsibility for injuries suffered while practicing these techniques and The Studio Ltd. shall not be held liable for any damages, circumstances, conditions or injuries that may occur, directly or indirectly, from engaging in any activities or ideas presented in any Application made by The Studio, Ltd.
              </p>
              <p className="text-foreground/80 font-light leading-relaxed text-sm sm:text-base md:text-base">
                By continuing to access and use The Studio App, you agree that you have read and understood the above Safety Disclosure and accept all responsibility for your physical and mental health and any resultant injury or mishap that may affect your well-being or health in any way.
              </p>
              <p className="text-foreground/70 font-light leading-relaxed text-xs sm:text-sm md:text-sm">
                If you have questions or comments, you may email us at <a href="mailto:support@mood-360.com" className="text-[#E6DBC7] hover:underline">support@mood-360.com</a>
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 sm:space-x-4 mb-6 sm:mb-8 p-4 sm:p-5 rounded-lg bg-white/5 border border-[#E6DBC7]/20">
            <Checkbox 
              id="safety" 
              checked={safetyAccepted}
              onCheckedChange={(checked) => setSafetyAccepted(checked as boolean)}
              className="mt-0.5 h-6 w-6 sm:h-6 sm:w-6 border-2"
            />
            <label
              htmlFor="safety"
              className="text-sm sm:text-base md:text-base font-light leading-relaxed text-foreground/90 cursor-pointer"
            >
              I have read and accept the safety disclosure
            </label>
          </div>
          
          <Button 
            onClick={completeOnboarding} 
            className="w-full rounded-full py-5 sm:py-6 md:py-6 font-light text-sm sm:text-base md:text-base bg-white/5 backdrop-blur-md text-white border-2 border-white hover:bg-white/10 transition-all" 
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

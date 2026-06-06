import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AuthSignInModal } from "@/components/AuthSignInModal";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { isDuplicateKeyError } from "@/lib/supabase-utils";

type OnboardingStep =
  | "welcome"
  | "goal"
  | "time"
  | "style"
  | "recommend"
  | "accountability"
  | "complete";

interface Message {
  text: string;
  isFromMarch: boolean;
  options?: { label: string; value: string; action?: () => void }[];
  multiSelect?: boolean;
  showSignInLink?: boolean;
}

interface UserData {
  goals: string[];
  timeAvailability: string;
  planType: string;
  accountabilityEnabled: boolean;
  hasAcceptedDataConsent: boolean;
}

export default function HomOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [messages, setMessages] = useState<Message[]>([]);
  const [userData, setUserData] = useState<UserData>({
    goals: [],
    timeAvailability: "",
    planType: "",
    accountabilityEnabled: false,
    hasAcceptedDataConsent: false,
  });
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const welcomeShown = useRef(false);

  useEffect(() => {
    if (!user) navigate("/auth");
  }, [user, navigate]);

  const { data: onboardingStatus } = useQuery({
    queryKey: ["onboarding", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_onboarding")
        .select("onboarding_completed")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (onboardingStatus === undefined) return;
    if (onboardingStatus?.onboarding_completed) {
      navigate("/online/march-dashboard");
    } else if (!welcomeShown.current) {
      welcomeShown.current = true;
      showWelcomeMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- navigate is stable; showWelcomeMessage runs at most once (welcomeShown ref guard)
  }, [onboardingStatus]);

  const addMessage = (
    text: string,
    isFromMarch: boolean,
    options?: any[],
    multiSelect?: boolean,
    showSignInLink?: boolean
  ) => {
    setMessages((prev) => [...prev, { text, isFromMarch, options, multiSelect, showSignInLink }]);

    if (user) {
      saveMessage(text, isFromMarch);
    }
  };

  const saveMessage = async (text: string, isFromMarch: boolean) => {
    if (!user) return;

    await supabase.from("march_messages").insert({
      user_id: user.id,
      message_text: text,
      is_from_march: isFromMarch,
      step: currentStep,
    });
  };

  const showWelcomeMessage = () => {
    addMessage(
      "Hi there 💛 I'm March — here to help you stay consistent and supported in your wellbeing journey.",
      true
    );

    setTimeout(() => {
      addMessage(
        "Before we start, I want to be clear: I'm not a medical or therapeutic service. I'm here to help you build habits and feel accountable, but if you're struggling with your mental health, professional support is always available.",
        true
      );

      setTimeout(() => {
        addMessage("You don't have to face difficult things alone 💛", true);

        setTimeout(() => {
          addMessage(
            "We'll take just a minute to build a simple plan you can actually stick to. Ready to start?",
            true,
            [
              {
                label: "Yes, let's do it!",
                value: "yes",
                action: () => handleWelcomeResponse("yes"),
              },
              {
                label: "Tell me more first",
                value: "more",
                action: () => handleWelcomeResponse("more"),
              },
            ]
          );
        }, 1500);
      }, 1800);
    }, 1500);
  };

  const handleWelcomeResponse = (response: string) => {
    addMessage(response === "yes" ? "Yes, let's do it!" : "Tell me more first", false);

    if (response === "more") {
      setTimeout(() => {
        addMessage(
          "We'll go through a few quick questions about what you need and how much time you have — then I'll recommend sessions that match perfectly.",
          true
        );
        setTimeout(() => showGoalQuestion(), 1500);
      }, 800);
    } else {
      setTimeout(() => showGoalQuestion(), 800);
    }
  };

  const showGoalQuestion = () => {
    setCurrentStep("goal");
    addMessage(
      "What are you hoping to get support with right now?",
      true,
      [
        { label: "Feeling stuck or unmotivated", value: "stuck" },
        { label: "Wanting more structure", value: "structure" },
        { label: "Needing accountability", value: "accountability" },
        { label: "Managing stress or emotions", value: "stress" },
        { label: "Building a new habit", value: "habit" },
      ],
      true
    );
  };

  const handleGoalSelection = (goal: string) => {
    const newGoals = selectedGoals.includes(goal)
      ? selectedGoals.filter((g) => g !== goal)
      : [...selectedGoals, goal];
    setSelectedGoals(newGoals);
  };

  const confirmGoals = () => {
    if (selectedGoals.length === 0) {
      toast({
        title: "Please select at least one goal",
        variant: "destructive",
      });
      return;
    }

    setUserData((prev) => ({ ...prev, goals: selectedGoals }));

    const goalLabels = selectedGoals.map((g) => {
      const labels: Record<string, string> = {
        stuck: "Feeling stuck or unmotivated",
        structure: "Wanting more structure",
        accountability: "Needing accountability",
        stress: "Managing stress or emotions",
        habit: "Building a new habit",
      };
      return labels[g];
    });

    addMessage(goalLabels.join(", "), false);
    setTimeout(() => showTimeQuestion(), 800);
  };

  const showTimeQuestion = () => {
    setCurrentStep("time");
    addMessage("How much time do you usually have most days for yourself?", true, [
      { label: "5 minutes", value: "5", action: () => handleTimeResponse("5") },
      { label: "10 minutes", value: "10", action: () => handleTimeResponse("10") },
      { label: "15+ minutes", value: "15", action: () => handleTimeResponse("15") },
    ]);
  };

  const handleTimeResponse = (time: string) => {
    setUserData((prev) => ({ ...prev, timeAvailability: time }));
    addMessage(`${time} minutes`, false);

    const responses: Record<string, string> = {
      "5": "Perfect — small moments can make a big difference 💛",
      "10": "Nice! That's a sweet spot for real progress without pressure.",
      "15": "Beautiful — we can explore deeper sessions together.",
    };

    setTimeout(() => {
      addMessage(responses[time], true);
      setTimeout(() => showStyleQuestion(), 1200);
    }, 800);
  };

  const showStyleQuestion = () => {
    setCurrentStep("style");
    addMessage("Would you like me to…", true, [
      {
        label: "Give you one daily suggestion to follow",
        value: "daily",
        action: () => handleStyleResponse("daily"),
      },
      {
        label: "Help you build a short plan for the next few days",
        value: "plan",
        action: () => handleStyleResponse("plan"),
      },
    ]);
  };

  const handleStyleResponse = (style: string) => {
    setUserData((prev) => ({ ...prev, planType: style }));
    const label =
      style === "daily"
        ? "Give you one daily suggestion to follow"
        : "Help you build a short plan for the next few days";
    addMessage(label, false);

    setTimeout(() => fetchAndShowRecommendations(), 1000);
  };

  const fetchAndShowRecommendations = async () => {
    setCurrentStep("recommend");
    setIsLoading(true);

    try {
      const { data: sessions, error } = await supabase
        .from("classes")
        .select("*")
        .eq("is_published", true)
        .limit(2);

      if (error) throw error;

      addMessage(
        "Beautiful 🌿 Based on what you've told me, I think these sessions might feel right for you:",
        true
      );

      setTimeout(() => {
        if (sessions && sessions.length > 0) {
          sessions.forEach((session, index) => {
            setTimeout(() => {
              addMessage(
                `${session.title} — ${session.short_description || "A grounding practice"}`,
                true
              );
            }, index * 600);
          });

          setTimeout(
            () => {
              addMessage("Would you like to start one of these today?", true, [
                {
                  label: `Start ${sessions[0]?.title}`,
                  value: "session1",
                  action: () => handleSessionChoice(sessions[0]?.id),
                },
                {
                  label: sessions[1] ? `Start ${sessions[1]?.title}` : "I'll explore later",
                  value: "session2",
                  action: () =>
                    sessions[1] ? handleSessionChoice(sessions[1]?.id) : handleSessionChoice(null),
                },
                {
                  label: "I'll explore later",
                  value: "later",
                  action: () => handleSessionChoice(null),
                },
              ]);
            },
            sessions.length * 600 + 800
          );
        }
      }, 1000);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast({
        title: "Error loading recommendations",
        description: "Let's continue with the setup",
      });
      setTimeout(() => showAccountabilityQuestion(), 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionChoice = (sessionId: string | null) => {
    if (sessionId) {
      addMessage("Starting session...", false);
      setTimeout(() => {
        showAccountabilityQuestion();
      }, 1000);
    } else {
      addMessage("I'll explore later", false);
      setTimeout(() => {
        addMessage(
          "No worries 💛 I've saved these for you in your dashboard — you can come back anytime.",
          true
        );
        setTimeout(() => showAccountabilityQuestion(), 1200);
      }, 800);
    }
  };

  const showAccountabilityQuestion = () => {
    setCurrentStep("accountability");
    addMessage(
      "Would you like me to help you stay accountable? I can send gentle reminders and check in on how you're feeling.",
      true,
      [
        { label: "Yes, please", value: "yes", action: () => handleAccountabilityResponse(true) },
        { label: "Maybe later", value: "no", action: () => handleAccountabilityResponse(false) },
      ]
    );
  };

  const handleAccountabilityResponse = (enabled: boolean) => {
    setUserData((prev) => ({ ...prev, accountabilityEnabled: enabled }));
    addMessage(enabled ? "Yes, please" : "Maybe later", false);

    const response = enabled
      ? "Got it 💛 I'll check in every few days and celebrate your progress with you."
      : "Totally fine — you can turn reminders on anytime.";

    setTimeout(() => {
      addMessage(response, true);
      setTimeout(() => showDataConsentQuestion(), 1200);
    }, 800);
  };

  const showDataConsentQuestion = () => {
    addMessage(
      "One last thing: To provide personalized support, I'll remember our conversations and learn from your interactions. This helps me give better recommendations over time. You can delete this data anytime from your profile.",
      true
    );

    setTimeout(() => {
      addMessage(
        "You can read more in our Privacy Policy and Terms of Service. Do you consent to this data collection?",
        true,
        [
          { label: "Yes, I consent", value: "yes", action: () => handleConsentResponse(true) },
          {
            label: "View Privacy Policy first",
            value: "privacy",
            action: () => handlePrivacyView(),
          },
          { label: "No, I don't consent", value: "no", action: () => handleConsentResponse(false) },
        ]
      );
    }, 1500);
  };

  const handlePrivacyView = () => {
    addMessage("View Privacy Policy first", false);
    window.open("/privacy-policy", "_blank");

    setTimeout(() => {
      addMessage("Take your time reading it. Ready to decide?", true, [
        { label: "Yes, I consent", value: "yes", action: () => handleConsentResponse(true) },
        { label: "No, I don't consent", value: "no", action: () => handleConsentResponse(false) },
      ]);
    }, 1000);
  };

  const handleConsentResponse = (consented: boolean) => {
    setUserData((prev) => ({ ...prev, hasAcceptedDataConsent: consented }));
    addMessage(consented ? "Yes, I consent" : "No, I don't consent", false);

    if (!consented) {
      setTimeout(() => {
        addMessage(
          "No problem 💛 You can still use March, but I won't be able to remember our conversations or learn your preferences. You can change this anytime in your profile settings.",
          true
        );
        setTimeout(() => completeOnboarding(), 1500);
      }, 800);
    } else {
      setTimeout(() => {
        addMessage("Thank you 💛 This helps me support you better.", true);
        setTimeout(() => completeOnboarding(), 1200);
      }, 800);
    }
  };

  const completeOnboarding = async () => {
    setCurrentStep("complete");

    addMessage(
      "You're all set! I've created your personalised plan — you'll find it on your dashboard.",
      true
    );

    setTimeout(() => {
      addMessage(
        "Each day, I'll suggest a simple session and help you track how you're feeling along the way.",
        true
      );
    }, 1200);

    if (!user) return;

    try {
      const { error: onboardingError } = await supabase.from("user_onboarding").upsert({
        user_id: user.id,
        goals: userData.goals,
        time_availability: userData.timeAvailability,
        plan_type: userData.planType,
        accountability_enabled: userData.accountabilityEnabled,
        onboarding_completed: true,
      });

      if (onboardingError) throw onboardingError;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          has_accepted_march_data_consent: userData.hasAcceptedDataConsent,
          march_data_consent_date: userData.hasAcceptedDataConsent
            ? new Date().toISOString()
            : null,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      setTimeout(() => {
        navigate("/online/march-dashboard");
      }, 3000);
    } catch (error) {
      console.error("Error saving onboarding:", error);

      if (isDuplicateKeyError(error)) {
        addMessage(
          "It looks like you already have an account set up 💛 Sign in to access your dashboard.",
          true,
          undefined,
          undefined,
          true
        );
      } else {
        toast({
          title: "Error saving your preferences",
          description: "Please try again",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-[100dvh] bg-black">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="space-y-6">
          {/* Messages */}
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isFromMarch ? "justify-start" : "justify-end"} duration-500 animate-in fade-in slide-in-from-bottom-2`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                    message.isFromMarch
                      ? "border border-white/10 bg-white/5 text-[#E6DBC7]"
                      : "border border-[#E6DBC7]/20 bg-[#E6DBC7]/15 text-[#E6DBC7]"
                  }`}
                >
                  <p className="whitespace-pre-line text-base leading-relaxed">{message.text}</p>

                  {message.showSignInLink && (
                    <button
                      onClick={() => setShowSignIn(true)}
                      className="mt-3 text-sm font-medium text-[#E6DBC7] underline underline-offset-2 opacity-80 hover:opacity-100"
                    >
                      Sign in →
                    </button>
                  )}

                  {message.options && !message.multiSelect && (
                    <div className="mt-4 space-y-2">
                      {message.options.map((option, optIndex) => (
                        <button
                          key={optIndex}
                          onClick={option.action}
                          className="h-auto w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-left text-sm text-[#E6DBC7] transition-colors hover:bg-white/10"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {message.options && message.multiSelect && (
                    <div className="mt-4 space-y-3">
                      {message.options.map((option, optIndex) => (
                        <button
                          key={optIndex}
                          onClick={() => handleGoalSelection(option.value)}
                          className={`h-auto w-full rounded-xl border px-4 py-3 text-left text-sm text-[#E6DBC7] transition-colors ${
                            selectedGoals.includes(option.value)
                              ? "border-[#E6DBC7]/50 bg-[#E6DBC7]/15"
                              : "border-white/20 bg-white/5 hover:bg-white/10"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                      <button
                        onClick={confirmGoals}
                        disabled={selectedGoals.length === 0}
                        className="mt-4 w-full rounded-xl bg-[#E6DBC7] px-4 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-40"
                      >
                        Continue
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-in fade-in">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-[#E6DBC7]/50" />
                </div>
              </div>
            )}
          </div>

          <div ref={messagesEndRef} />
        </div>
      </div>

      <AuthSignInModal open={showSignIn} onClose={() => setShowSignIn(false)} />
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { ButtonLoadingSpinner } from "@/components/skeletons";
import { PaymentVerificationSkeleton } from "@/components/skeletons/PaymentVerificationSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { analytics } from "@/lib/posthog";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    user,
    signUp,
    hasCompletedOnboarding,
    hasAcceptedSafetyDisclosure,
    loading: authLoading,
  } = useAuth();
  const [loading, setLoading] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId || authLoading) return;
    if (user) {
      if (hasCompletedOnboarding && hasAcceptedSafetyDisclosure) {
        toast.success("Welcome back! Your subscription is active.");
        navigate("/online");
      } else {
        navigate("/onboarding");
      }
    } else {
      toast.error("No payment session found");
      const timer = setTimeout(() => navigate("/"), 2000);
      return () => clearTimeout(timer);
    }
  }, [sessionId, user, authLoading, hasCompletedOnboarding, hasAcceptedSafetyDisclosure, navigate]);

  const {
    data: verificationData,
    isLoading: verifying,
    isError,
  } = useQuery({
    queryKey: ["verify-payment", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("verify-payment-session", {
        body: { sessionId },
      });
      if (error) throw new Error(error.message || "Verification failed");
      if (!data?.verified) throw new Error(data?.error || "Payment could not be verified");
      return data;
    },
    enabled: !!sessionId,
    staleTime: Infinity,
    retry: 1,
  });

  useEffect(() => {
    if (verificationData?.verified) {
      toast.success("Payment successful! Create your account to continue.");
    }
  }, [verificationData]);

  useEffect(() => {
    if (isError) {
      toast.error("Verification issue - please contact support to activate your account", {
        duration: 10000,
      });
    }
  }, [isError]);

  const email = verificationData?.customer_email || "";
  const paymentVerified = !!verificationData?.verified;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fullName = `${firstName} ${surname}`.trim();
      const newUser = await signUp(email, password, fullName);
      analytics.signupCompleted();

      if (newUser && marketingConsent) {
        await supabase.from("profiles").update({ marketing_consent: true }).eq("id", newUser.id);
      }

      toast.success("Account created!");
      navigate("/onboarding");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  if (!sessionId) return null;

  if (verifying) {
    return <PaymentVerificationSkeleton sessionId={sessionId || undefined} />;
  }

  if (isError || !paymentVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1A1A1A]">
        <Card className="w-full max-w-md rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-xl font-light text-[#E6DBC7]">Payment verification failed</p>
            {isError && sessionId && (
              <p className="mt-3 px-4 text-center text-sm font-light text-[#E6DBC7]/60">
                Your payment was successful — please contact support@studiohom.co with session ID:{" "}
                {sessionId.slice(-8)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1A1A1A] backdrop-blur-md md:max-w-lg">
        <div className="px-8 pb-6 pt-10 text-center">
          <h1
            className="mb-3 font-editorial tracking-[0.01em] text-[#E6DBC7]"
            style={{ fontSize: "clamp(1.8rem, 2.2vw, 2.4rem)", lineHeight: 1.15, fontWeight: 400 }}
          >
            You're all set!
          </h1>
          <p className="text-base text-[#E6DBC7]/70" style={{ lineHeight: 1.7 }}>
            Set your password to complete your account
          </p>
        </div>
        <CardContent className="px-10 pb-10 pt-8 md:px-14">
          <form onSubmit={handleSignUp} className="space-y-6 md:space-y-9">
            <div className="space-y-2">
              <Label htmlFor="firstname" className="text-[#E6DBC7]">
                First Name
              </Label>
              <Input
                id="firstname"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="John"
                className="border-white/20 bg-white/5 text-[#E6DBC7] placeholder:text-[#E6DBC7]/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surname" className="text-[#E6DBC7]">
                Surname
              </Label>
              <Input
                id="surname"
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                required
                placeholder="Doe"
                className="border-white/20 bg-white/5 text-[#E6DBC7] placeholder:text-[#E6DBC7]/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#E6DBC7]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                readOnly
                className="cursor-not-allowed border-white/20 bg-white/5 text-[#E6DBC7]/70"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#E6DBC7]">
                Create Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="border-white/20 bg-white/5 text-[#E6DBC7] placeholder:text-[#E6DBC7]/50"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full rounded-full bg-white py-6 text-base font-light text-black hover:bg-white/90"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <ButtonLoadingSpinner size="md" className="text-black" />
                    Setting up your account...
                  </span>
                ) : (
                  "Complete Onboarding"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;

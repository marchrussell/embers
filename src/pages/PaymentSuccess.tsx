import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { PaymentVerificationSkeleton } from "@/components/skeletons/PaymentVerificationSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { analytics } from "@/lib/posthog";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signUp, checkSubscription } = useAuth();
  const [loading, setLoading] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  // Form state
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");

  const sessionId = searchParams.get("session_id");

  // Handle the no-session case: redirect logged-in users or show error
  useEffect(() => {
    if (sessionId) return;

    if (user) {
      const redirect = async () => {
        await checkSubscription();
        const { data: profile } = await supabase
          .from("profiles")
          .select("has_completed_onboarding, has_accepted_safety_disclosure")
          .eq("id", user.id)
          .single();

        if (profile?.has_completed_onboarding && profile?.has_accepted_safety_disclosure) {
          toast.success("Welcome back! Your subscription is active.");
          navigate("/online");
        } else {
          navigate("/onboarding");
        }
      };
      redirect();
    } else {
      toast.error("No payment session found");
      setTimeout(() => navigate("/"), 2000);
    }
  }, [sessionId, user, navigate, checkSubscription]);

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

  if (verifying) {
    return <PaymentVerificationSkeleton sessionId={sessionId || undefined} />;
  }

  if (isError || !paymentVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Card className="w-full max-w-md rounded-[28px] border border-white/20 bg-black/75 backdrop-blur-xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-xl font-light text-white">Payment verification failed</p>
            {isError && sessionId && (
              <p className="mt-3 px-4 text-center text-sm font-light text-white/60">
                Your payment was successful — please contact support@embersstudio.io with session
                ID: {sessionId.slice(-8)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md rounded-[28px] border border-white/20 bg-black/75 backdrop-blur-xl">
        <CardHeader className="px-8 pb-2 pt-10 text-center">
          <CheckCircle2 className="h-18 w-18 mx-auto mb-6 text-white" />
          <CardTitle className="mb-3 text-2xl text-white">You're all set!</CardTitle>
          <CardDescription className="text-white/70">
            Set your password to complete your account
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-10 pt-8">
          <form onSubmit={handleSignUp} className="space-y-7">
            <div className="space-y-2">
              <Label htmlFor="firstname" className="text-white">
                First Name
              </Label>
              <Input
                id="firstname"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="John"
                className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surname" className="text-white">
                Surname
              </Label>
              <Input
                id="surname"
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                required
                placeholder="Doe"
                className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                readOnly
                className="cursor-not-allowed border-white/20 bg-white/5 text-white/70"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
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
                className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
              />
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <Checkbox
                id="marketing"
                checked={marketingConsent}
                onCheckedChange={(checked) => setMarketingConsent(checked as boolean)}
                className="h-5 w-5 border-white"
              />
              <label
                htmlFor="marketing"
                className="cursor-pointer text-sm leading-tight text-white/80"
              >
                I'd like to receive updates, tips, and exclusive offers via email
              </label>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full rounded-full bg-white py-6 text-base font-light text-black hover:bg-white/90"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin-slow rounded-full border-b-2 border-t-2 border-black"></div>
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

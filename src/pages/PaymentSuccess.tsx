import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaymentVerificationSkeleton } from "@/components/skeletons/PaymentVerificationSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signUp, checkSubscription, refreshOnboardingStatus } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");

  const sessionId = searchParams.get("session_id");

  console.log("[PaymentSuccess] Component mounted", { sessionId, hasUser: !!user });

  useEffect(() => {
    console.log("[PaymentSuccess] useEffect triggered", { sessionId, hasUser: !!user });
    
    // CRITICAL: If there's a session_id, always verify payment first, even if logged in
    if (!sessionId) {
      console.error("[PaymentSuccess] No session ID in URL");
      
      // If logged in but no session, check their subscription status
      if (user) {
        const handleLoggedInUser = async () => {
          await checkSubscription();
          const { data: profile } = await supabase
            .from("profiles")
            .select("has_completed_onboarding, has_accepted_safety_disclosure")
            .eq("id", user.id)
            .single();
          
          if (profile?.has_completed_onboarding && profile?.has_accepted_safety_disclosure) {
            toast.success("Welcome back! Your subscription is active.");
            navigate("/studio");
          } else {
            // Redirect to onboarding for safety disclosure
            navigate("/onboarding");
          }
          setVerifying(false);
        };
        handleLoggedInUser();
      } else {
        setError("No payment session found");
        toast.error("No payment session found");
        setTimeout(() => navigate("/"), 2000);
        setVerifying(false);
      }
      return;
    }

    // Verify the payment session with SERVER-SIDE validation (no client auth needed)
    const verifyPayment = async () => {
      console.log("[PaymentSuccess] Starting payment verification for session:", sessionId);

      try {
        console.log("[PaymentSuccess] Calling verify-payment-session edge function...");
        
        // Remove client-side timeout - let edge function handle it
        const { data, error } = await supabase.functions.invoke("verify-payment-session", {
          body: { sessionId },
        });

        console.log("[PaymentSuccess] Response received:", { data, error });

        if (error) {
          console.error("[PaymentSuccess] Edge function error:", error);
          throw new Error(error.message || 'Verification failed');
        }

        if (data?.verified) {
          console.log("[PaymentSuccess] ✅ Payment verified!", { email: data.customer_email });
          setPaymentVerified(true);
          setCustomerEmail(data.customer_email || "");
          setEmail(data.customer_email || "");
          toast.success("Payment successful! Create your account to continue.");
        } else {
          throw new Error(data?.error || "Payment could not be verified");
        }
      } catch (error: any) {
        console.error("[PaymentSuccess] Verification failed:", error);
        
        // Provide helpful error message
        const errorMsg = error.message || "Verification service unavailable";
        setError(`Unable to verify payment. Your payment was successful - please contact support at march@marchrussell.com with your session ID: ${sessionId?.slice(-8)}`);
        
        toast.error("Verification issue - please contact support to activate your account", {
          duration: 10000,
        });
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, user, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fullName = `${firstName} ${surname}`.trim();
      await signUp(email, password, fullName);
      
      // Store marketing consent preference and fetch user
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        if (marketingConsent) {
          await supabase
            .from("profiles")
            .update({ marketing_consent: true })
            .eq("id", userData.user.id);
        }
      }
      
      toast.success("Account created! Redirecting to safety disclosure...");
      // Redirect to onboarding page for safety disclosure
      setTimeout(() => navigate("/onboarding"), 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };


  if (verifying) {
    return <PaymentVerificationSkeleton sessionId={sessionId || undefined} error={error || undefined} />;
  }

  if (!paymentVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Card className="w-full max-w-md bg-black border-white border-2 shadow-[0_0_20px_rgba(255,255,255,0.5)]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-xl font-light text-white">Payment verification failed</p>
            <p className="text-base font-light text-white/70 mt-2">Redirecting...</p>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md bg-black border-white border-2 shadow-[0_0_20px_rgba(255,255,255,0.5)]">
        <CardHeader className="text-center">
          <CheckCircle2 className="h-16 w-16 text-white mx-auto mb-4" />
          <CardTitle className="text-2xl text-white">Payment Successful!</CardTitle>
          <CardDescription className="text-white/70">
            Set your password to complete your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="firstname" className="text-white">First Name</Label>
              <Input
                id="firstname"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="John"
                className="bg-white/10 text-white border-white/20 placeholder:text-white/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surname" className="text-white">Surname</Label>
              <Input
                id="surname"
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                required
                placeholder="Doe"
                className="bg-white/10 text-white border-white/20 placeholder:text-white/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                readOnly
                className="bg-white/5 text-white/70 border-white/20 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Create Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="bg-white/10 text-white border-white/20 placeholder:text-white/50"
              />
            </div>
            
            <div className="flex items-center space-x-3 pt-2">
              <Checkbox 
                id="marketing" 
                checked={marketingConsent}
                onCheckedChange={(checked) => setMarketingConsent(checked as boolean)}
                className="border-white h-5 w-5"
              />
              <label
                htmlFor="marketing"
                className="text-sm text-white/80 leading-tight cursor-pointer"
              >
                I'd like to receive updates, tips, and exclusive offers via email
              </label>
            </div>
            
            <Button 
              type="submit" 
              className="w-full rounded-full py-6 font-light text-base bg-white text-black hover:bg-white/90"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin-slow rounded-full h-4 w-4 border-t-2 border-b-2 border-black"></div>
                  Setting up your account...
                </span>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;

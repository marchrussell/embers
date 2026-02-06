import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, ArrowLeft, ShieldCheck } from "lucide-react";

const ManualActivation = () => {
  const [stripeSessionId, setStripeSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const handleVerify = async () => {
    if (!stripeSessionId) {
      toast.error("Please enter a Stripe session ID");
      return;
    }

    setLoading(true);
    setVerificationResult(null);

    try {
      console.log("[ManualActivation] Verifying session:", stripeSessionId);
      
      const { data, error } = await supabase.functions.invoke("verify-payment-session", {
        body: { sessionId: stripeSessionId },
      });

      if (error) {
        throw new Error(error.message || "Verification failed");
      }

      setVerificationResult(data);
      
      if (data?.verified) {
        toast.success(`Payment verified for ${data.customer_email}!`);
      } else {
        toast.error("Payment not verified");
      }
    } catch (error: any) {
      console.error("[ManualActivation] Error:", error);
      toast.error(error.message || "Failed to verify payment");
      setVerificationResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-8 py-24 max-w-3xl">
        <div className="mb-8">
          <Link to="/admin" className="inline-flex items-center text-[#E6DBC7]/70 hover:text-[#E6DBC7] transition-colors gap-2 text-base md:text-lg">
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-12">
          <h1 className="font-editorial text-5xl md:text-6xl text-[#E6DBC7] mb-3 font-light">Manual Activation</h1>
          <p className="text-base text-foreground/70">Verify and activate accounts when automatic verification fails</p>
        </div>

        <Card className="bg-background/40 backdrop-blur-xl border border-[#E6DBC7]/20 rounded-xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-[#E6DBC7] text-xl flex items-center gap-3 font-normal">
              <div className="w-10 h-10 rounded-xl bg-[#E6DBC7]/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#E6DBC7]" />
              </div>
              Payment Verification
            </CardTitle>
            <CardDescription className="text-foreground/60 mt-2">
              Verify and activate customer accounts when automatic verification fails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="sessionId" className="text-[#E6DBC7] font-normal">Stripe Checkout Session ID</Label>
              <Input
                id="sessionId"
                placeholder="cs_live_..."
                value={stripeSessionId}
                onChange={(e) => setStripeSessionId(e.target.value)}
                className="bg-white/5 border-[#E6DBC7]/20 text-white placeholder:text-white/40 h-12 text-base"
              />
              <p className="text-sm text-foreground/50">
                Get this from the customer's error message or Stripe dashboard
              </p>
            </div>

            <Button onClick={handleVerify} disabled={loading} className="w-full gap-2 h-12">
              <ShieldCheck className="w-5 h-5" />
              {loading ? "Verifying..." : "Verify Payment"}
            </Button>

            {verificationResult && (
              <Alert className={verificationResult.verified 
                ? "border-green-500/50 bg-green-500/10" 
                : "border-red-500/50 bg-red-500/10"
              }>
                {verificationResult.verified ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                )}
                <AlertDescription>
                  {verificationResult.error ? (
                    <div className="text-white">
                      <p className="font-semibold">Error:</p>
                      <p className="text-white/70">{verificationResult.error}</p>
                    </div>
                  ) : verificationResult.verified ? (
                    <div className="space-y-2 text-white">
                      <p className="font-semibold text-green-400">Payment Verified!</p>
                      <p><strong>Email:</strong> {verificationResult.customer_email}</p>
                      <p><strong>Customer ID:</strong> {verificationResult.customer_id}</p>
                      {verificationResult.subscription_id && (
                        <>
                          <p><strong>Subscription ID:</strong> {verificationResult.subscription_id}</p>
                          <p><strong>Status:</strong> {verificationResult.subscription_status}</p>
                        </>
                      )}
                      <p className="text-sm text-white/60 mt-2">
                        The subscription has been saved to the database. The customer can now create their account.
                      </p>
                    </div>
                  ) : (
                    <p className="text-white">Payment not verified or incomplete</p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="mt-8 p-6 bg-[#E6DBC7]/5 rounded-xl border border-[#E6DBC7]/10">
              <h3 className="font-normal mb-4 text-[#E6DBC7]">How to use this tool:</h3>
              <ol className="list-decimal list-inside space-y-3 text-sm text-foreground/70">
                <li>Customer reports verification timeout with session ID</li>
                <li>Enter the session ID above and click "Verify Payment"</li>
                <li>If verified, the subscription is automatically saved</li>
                <li>Inform customer they can now refresh and create their account</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManualActivation;
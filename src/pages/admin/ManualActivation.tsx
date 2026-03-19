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
      <div className="container mx-auto max-w-3xl px-8 py-24">
        <div className="mb-8">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-base text-[#E6DBC7]/70 transition-colors hover:text-[#E6DBC7] md:text-lg"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-12">
          <h1 className="mb-3 font-editorial text-5xl font-light text-[#E6DBC7] md:text-6xl">
            Manual Activation
          </h1>
          <p className="text-base text-foreground/70">
            Verify and activate accounts when automatic verification fails
          </p>
        </div>

        <Card className="rounded-xl border border-[#E6DBC7]/20 bg-background/40 backdrop-blur-xl">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-xl font-normal text-[#E6DBC7]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6DBC7]/10">
                <ShieldCheck className="h-5 w-5 text-[#E6DBC7]" />
              </div>
              Payment Verification
            </CardTitle>
            <CardDescription className="mt-2 text-foreground/60">
              Verify and activate customer accounts when automatic verification fails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="sessionId" className="font-normal text-[#E6DBC7]">
                Stripe Checkout Session ID
              </Label>
              <Input
                id="sessionId"
                placeholder="cs_live_..."
                value={stripeSessionId}
                onChange={(e) => setStripeSessionId(e.target.value)}
                className="h-12 border-[#E6DBC7]/20 bg-white/5 text-base text-white placeholder:text-white/40"
              />
              <p className="text-sm text-foreground/50">
                Get this from the customer's error message or Stripe dashboard
              </p>
            </div>

            <Button onClick={handleVerify} disabled={loading} className="h-12 w-full gap-2">
              <ShieldCheck className="h-5 w-5" />
              {loading ? "Verifying..." : "Verify Payment"}
            </Button>

            {verificationResult && (
              <Alert
                className={
                  verificationResult.verified
                    ? "border-green-500/50 bg-green-500/10"
                    : "border-red-500/50 bg-red-500/10"
                }
              >
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
                      <p>
                        <strong>Email:</strong> {verificationResult.customer_email}
                      </p>
                      <p>
                        <strong>Customer ID:</strong> {verificationResult.customer_id}
                      </p>
                      {verificationResult.subscription_id && (
                        <>
                          <p>
                            <strong>Subscription ID:</strong> {verificationResult.subscription_id}
                          </p>
                          <p>
                            <strong>Status:</strong> {verificationResult.subscription_status}
                          </p>
                        </>
                      )}
                      <p className="mt-2 text-sm text-white/60">
                        The subscription has been saved to the database. The customer can now create
                        their account.
                      </p>
                    </div>
                  ) : (
                    <p className="text-white">Payment not verified or incomplete</p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="mt-8 rounded-xl border border-[#E6DBC7]/10 bg-[#E6DBC7]/5 p-6">
              <h3 className="mb-4 font-normal text-[#E6DBC7]">How to use this tool:</h3>
              <ol className="list-inside list-decimal space-y-3 text-sm text-foreground/70">
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

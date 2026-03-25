import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import marchLogoModal from "@/assets/march-logo-modal.png";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const Signup = () => {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [validatingInvite, setValidatingInvite] = useState(true);
  const [inviteData, setInviteData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const validateInvite = async () => {
      if (!inviteToken) {
        toast.error("Invalid invitation link");
        navigate("/");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("mentorship_invitations")
          .select("*")
          .eq("invite_token", inviteToken)
          .eq("used", false)
          .gt("expires_at", new Date().toISOString())
          .maybeSingle();

        if (error || !data) {
          toast.error("This invitation link is invalid or has expired");
          navigate("/");
          return;
        }

        setInviteData(data);
        setEmail(data.email);
      } catch (error) {
        console.error("Error validating invite:", error);
        toast.error("Error validating invitation");
        navigate("/");
      } finally {
        setValidatingInvite(false);
      }
    };

    validateInvite();
  }, [inviteToken, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteData) return;

    setLoading(true);

    try {
      // Create user account with mentorship program type in metadata
      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            mentorship_program_type: inviteData.program_type, // Trigger will auto-assign role
          },
          emailRedirectTo: `${window.location.origin}/app/library`,
        },
      });

      if (signupError) throw signupError;
      if (!authData.user) throw new Error("Failed to create user");

      // Mark invitation as used
      const { error: inviteError } = await supabase
        .from("mentorship_invitations")
        .update({
          used: true,
          used_at: new Date().toISOString(),
        })
        .eq("invite_token", inviteToken);

      if (inviteError) throw inviteError;

      toast.success("Account created successfully! Redirecting to complete setup...");

      // Redirect to onboarding to complete safety disclosure
      setTimeout(() => {
        navigate("/onboarding");
      }, 1500);
    } catch (error: any) {
      console.error("Signup error:", error);

      if (error.message?.includes("already registered")) {
        toast.error("This email is already registered. Please sign in instead.");
      } else {
        toast.error(error.message || "Failed to create account");
      }
      setLoading(false);
    }
  };

  if (validatingInvite) {
    return (
      <Dialog open={true}>
        <DialogContent className="max-w-md border-[1px] border-white bg-black p-8">
          <DialogTitle className="sr-only">Validating Invitation</DialogTitle>
          <DialogDescription className="sr-only">
            Please wait while we validate your invitation
          </DialogDescription>
          <div className="text-center text-white">
            <p>Validating invitation...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={() => navigate("/")}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto rounded-none border-[1px] border-white bg-black p-0 backdrop-blur-none sm:max-w-lg">
        <DialogTitle className="sr-only">Join MARCH Mentorship</DialogTitle>
        <DialogDescription className="sr-only">
          Create your account to access the mentorship program
        </DialogDescription>

        <style>{`
          [data-state="open"] > div[data-radix-dialog-overlay] {
            background-color: rgba(0, 0, 0, 0.8) !important;
            backdrop-filter: blur(8px) !important;
          }
        `}</style>

        <div className="bg-black p-4 pt-12 sm:p-8 sm:pt-16">
          <div className="mb-6 text-center sm:mb-8">
            <img
              src={marchLogoModal}
              alt="MARCH"
              className="mx-auto mb-4 hidden h-12 object-contain sm:mb-6 sm:h-16"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <p className="text-xs text-white/70 sm:text-sm">
              {inviteData?.program_type === "guided"
                ? "5-Month Guided Mentorship"
                : "5-Month DIY Journey"}
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-light text-white">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="border-white/20 bg-white/10 text-white focus:border-white/40 focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-light text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="cursor-not-allowed border-white/10 bg-white/5 text-white/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-light text-white">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="border-white/20 bg-white/10 text-white focus:border-white/40 focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <p className="mt-1 text-xs text-white/50">Minimum 6 characters</p>
            </div>

            <button
              type="submit"
              className="w-full rounded-full border border-white bg-black px-6 py-2.5 text-xs font-light tracking-wide text-white transition-all hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50 sm:px-8 sm:py-3 sm:text-sm"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
            <p className="-mt-1 text-center text-[10px] italic text-white/60 sm:-mt-2 sm:text-xs">
              After creating your account, please check your email to verify your address
            </p>
          </form>

          <div className="mt-4 space-y-3 text-center sm:mt-6">
            <p className="text-xs font-light text-white/70 sm:text-sm">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/auth")}
                className="text-white underline hover:text-white/80"
              >
                Sign in
              </button>
            </p>
            <p className="text-[10px] font-light text-white/50 sm:text-xs">
              By creating an account, you agree to our{" "}
              <a
                href="/privacy-policy"
                target="_blank"
                className="text-white/70 underline hover:text-white"
              >
                Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="/terms-of-service"
                target="_blank"
                className="text-white/70 underline hover:text-white"
              >
                Terms of Service
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Signup;

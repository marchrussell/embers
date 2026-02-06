import marchLogoModal from "@/assets/march-logo-modal.png";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

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
          used_at: new Date().toISOString() 
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
        <DialogContent className="max-w-md bg-black border-[1px] border-white p-8">
          <DialogTitle className="sr-only">Validating Invitation</DialogTitle>
          <DialogDescription className="sr-only">Please wait while we validate your invitation</DialogDescription>
          <div className="text-center text-white">
            <p>Validating invitation...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={() => navigate("/")}>
      <DialogContent className="max-w-md sm:max-w-lg max-h-[90vh] bg-black border-[1px] border-white p-0 overflow-y-auto rounded-none backdrop-blur-none">
        <DialogTitle className="sr-only">Join MARCH Mentorship</DialogTitle>
        <DialogDescription className="sr-only">Create your account to access the mentorship program</DialogDescription>
        
        <style>{`
          [data-state="open"] > div[data-radix-dialog-overlay] {
            background-color: rgba(0, 0, 0, 0.8) !important;
            backdrop-filter: blur(8px) !important;
          }
        `}</style>
        
        <div className="p-4 sm:p-8 pt-12 sm:pt-16 bg-black">
          <div className="text-center mb-6 sm:mb-8">
            <img 
              src={marchLogoModal} 
              alt="MARCH" 
              className="hidden h-12 sm:h-16 mx-auto mb-4 sm:mb-6 object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <p className="text-xs sm:text-sm text-white/70">
              {inviteData?.program_type === "guided" ? "5-Month Guided Mentorship" : "5-Month DIY Journey"}
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-light text-white">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus:border-white/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-light text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-white/5 border-white/10 text-white/50 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-light text-white">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-white/10 border-white/20 text-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus:border-white/40"
              />
              <p className="text-xs text-white/50 mt-1">Minimum 6 characters</p>
            </div>

            <button 
              type="submit" 
              className="w-full bg-black text-white border border-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-light tracking-wide hover:bg-[#1a1a1a] transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
            <p className="text-[10px] sm:text-xs text-white/60 text-center -mt-1 sm:-mt-2 italic">
              After creating your account, please check your email to verify your address
            </p>
          </form>

          <div className="mt-4 sm:mt-6 text-center space-y-3">
            <p className="text-xs sm:text-sm text-white/70 font-light">
              Already have an account?{" "}
              <button 
                onClick={() => navigate("/auth")}
                className="text-white hover:text-white/80 underline"
              >
                Sign in
              </button>
            </p>
            <p className="text-[10px] sm:text-xs text-white/50 font-light">
              By creating an account, you agree to our{" "}
              <a href="/privacy-policy" target="_blank" className="text-white/70 hover:text-white underline">
                Privacy Policy
              </a>
              {" "}and{" "}
              <a href="/terms-of-service" target="_blank" className="text-white/70 hover:text-white underline">
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
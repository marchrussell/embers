import marchLogoModal from "@/assets/march-logo-modal.png";
import { SubscriptionModal } from "@/components/modals/LazyModals";
import { Dialog, DialogPortal } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn(email, password);
      toast.success("Welcome back!");
      navigate('/online');
    } catch (error: any) {
      console.error("Sign in error:", error);
      const errorMessage = error.message || "Failed to sign in";
      
      if (errorMessage.includes("Invalid login credentials")) {
        toast.error("Invalid email or password");
      } else if (errorMessage.includes("Email not confirmed")) {
        toast.error("Please check your email to confirm your account");
      } else {
        toast.error(errorMessage);
      }
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/password-reset?type=recovery`,
      });

      if (error) throw error;

      toast.success("Password reset email sent! Check your inbox.");
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setResetLoading(false);
    }
  };

  const handleClose = () => {
    navigate("/");
  };

  const handleStartTrial = () => {
    setShowSubscriptionModal(true);
  };

  return (
    <>
      <Suspense fallback={null}>
        <SubscriptionModal
          open={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
        />
      </Suspense>
      <Dialog open={true} onOpenChange={handleClose}>
        <DialogPortal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 transition-opacity duration-300" />
          <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-[92%] max-w-[440px] translate-x-[-50%] translate-y-[-50%] backdrop-blur-xl bg-black/65 border border-white/15 rounded-[24px] overflow-hidden duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <div className="sr-only" role="heading" aria-level={2}>Sign In to MARCH</div>
            <div className="sr-only">Sign in to access your breathwork library</div>
            
            {/* Close button */}
            <ModalCloseButton onClose={handleClose} size="md" position="default" />
            
            <div className="p-8 md:p-10">
              {/* Logo */}
              <div className="text-center mb-8">
                <img 
                  src={marchLogoModal} 
                  alt="MARCH" 
                  className="h-20 mx-auto mb-6 object-contain"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
                <h2 className="font-editorial text-[clamp(1.5rem,2vw,1.75rem)] text-white font-light">
                  {showForgotPassword ? "Reset Password" : "Welcome back"}
                </h2>
              </div>

              {showForgotPassword ? (
                /* Forgot Password Form */
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-[14px] font-light text-white/80">
                      Email Address
                    </Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      placeholder="your@email.com"
                      className="h-12 bg-white border-white/15 text-black placeholder:text-black/40 rounded-xl focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus:border-white/30 text-[15px]"
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full h-12 bg-white text-black rounded-full text-[15px] font-medium tracking-wide hover:bg-white/90 transition-all disabled:opacity-50 mt-2" 
                    disabled={resetLoading}
                  >
                    {resetLoading ? "Sending..." : "Send Reset Link"}
                  </button>

                  <button 
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full text-[14px] text-white/60 hover:text-white transition-colors pt-2"
                  >
                    Back to Sign In
                  </button>
                </form>
              ) : (
                /* Sign In Form */
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="auth-email" className="text-[14px] font-light text-white/80">
                      Email
                    </Label>
                    <Input
                      id="auth-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 bg-white border-white/15 text-black placeholder:text-black/40 rounded-xl focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus:border-white/30 text-[15px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="auth-password" className="text-[14px] font-light text-white/80">
                      Password
                    </Label>
                    <Input
                      id="auth-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-12 bg-white border-white/15 text-black placeholder:text-black/40 rounded-xl focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus:border-white/30 text-[15px]"
                    />
                  </div>

                  {/* Forgot Password Link */}
                  <div className="text-right">
                    <button 
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-[13px] text-white/50 hover:text-white transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full h-12 bg-white text-black rounded-full text-[15px] font-medium tracking-wide hover:bg-white/90 transition-all disabled:opacity-50" 
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </button>
                </form>
              )}

              {!showForgotPassword && (
                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                  <p className="text-[14px] text-white/60 font-light">
                    Don't have an account?{" "}
                    <button 
                      onClick={handleStartTrial}
                      className="text-white hover:text-white/80 underline"
                    >
                      Sign up now
                    </button>
                  </p>
                </div>
              )}
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  );
};

export default Auth;

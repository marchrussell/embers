import marchLogoModal from "@/assets/march-logo-modal.png";
import { Dialog, DialogPortal } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type FooterVariant = "trial" | "courses" | "signup" | "none";

interface AuthSignInModalProps {
  open: boolean;
  onClose: () => void;
  /** Called after successful sign-in. If not provided, modal just closes. */
  onSuccess?: () => void;
  /** Whether to show forgot password link. Defaults to true. */
  showForgotPassword?: boolean;
  /** Footer variant to display. Defaults to "trial". */
  footerVariant?: FooterVariant;
  /** Callback to open subscription modal (used with footerVariant="trial") */
  onOpenSubscription?: () => void;
}

export const AuthSignInModal = ({
  open,
  onClose,
  onSuccess,
  showForgotPassword = true,
  footerVariant = "trial",
  onOpenSubscription,
}: AuthSignInModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPasswordForm, setShowForgotPasswordForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success("Welcome back!");
      onClose();
      onSuccess?.();
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
    } finally {
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
      setShowForgotPasswordForm(false);
      setResetEmail("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setResetLoading(false);
    }
  };

  const handleClose = () => {
    setShowForgotPasswordForm(false);
    setResetEmail("");
    setEmail("");
    setPassword("");
    onClose();
  };

  const handleStartTrial = () => {
    handleClose();
    if (onOpenSubscription) {
      onOpenSubscription();
    } else {
      navigate("/", { state: { openSubscription: true } });
    }
  };

  const handleSignUp = () => {
    handleClose();
    if (onOpenSubscription) {
      onOpenSubscription();
    } else {
      navigate("/", { state: { openSubscription: true } });
    }
  };

  const renderFooter = () => {
    if (showForgotPasswordForm) return null;

    switch (footerVariant) {
      case "signup":
        return (
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-[14px] text-white/60 font-light">
              Don't have an account?{" "}
              <button
                onClick={handleSignUp}
                className="text-white hover:text-white/80 underline"
              >
                Sign up now
              </button>
            </p>
          </div>
        );

      case "courses":
        return (
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-[13px] text-white/45 font-light leading-relaxed">
              This area is for purchased courses only.
              <br />
              To access courses, please purchase one first.
            </p>
          </div>
        );

      case "none":
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogPortal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 transition-opacity duration-300" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-[92%] max-w-[440px] translate-x-[-50%] translate-y-[-50%] backdrop-blur-xl bg-black/65 border border-white/15 rounded-[24px] overflow-hidden duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="sr-only" role="heading" aria-level={2}>
            Sign In to MARCH
          </div>
          <div className="sr-only">Sign in to access your account</div>

          {/* Close button */}
          <ModalCloseButton onClose={handleClose} size="md" position="default" />

          <div className="p-8 md:p-10">
            {/* Logo */}
            <div className="text-center mb-8">
              <img
                src={marchLogoModal}
                alt="MARCH"
                className="h-20 mx-auto mb-6 object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              />
              <h2 className="font-editorial text-[clamp(1.5rem,2vw,1.75rem)] text-white font-light">
                {showForgotPasswordForm ? "Reset Password" : "Welcome back"}
              </h2>
            </div>

            {showForgotPasswordForm ? (
              /* Forgot Password Form */
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="reset-email"
                    className="text-[14px] font-light text-white/80"
                  >
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
                  onClick={() => setShowForgotPasswordForm(false)}
                  className="w-full text-[14px] text-white/60 hover:text-white transition-colors pt-2"
                >
                  Back to Sign In
                </button>
              </form>
            ) : (
              /* Sign In Form */
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="signin-email"
                    className="text-[14px] font-light text-white/80"
                  >
                    Email
                  </Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-white border-white/15 text-black placeholder:text-black/40 rounded-xl focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus:border-white/30 text-[15px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="signin-password"
                    className="text-[14px] font-light text-white/80"
                  >
                    Password
                  </Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-12 bg-white border-white/15 text-black placeholder:text-black/40 rounded-xl focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus:border-white/30 text-[15px]"
                  />
                </div>

                {/* Forgot Password Link */}
                {showForgotPassword && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordForm(true)}
                      className="text-[13px] text-white/50 hover:text-white transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full h-12 bg-white text-black rounded-full text-[15px] font-medium tracking-wide hover:bg-white/90 transition-all disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            )}

            {renderFooter()}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};

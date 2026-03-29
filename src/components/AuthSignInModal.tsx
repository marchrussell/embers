import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Dialog, DialogPortal } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
        redirectTo: `${import.meta.env.VITE_SITE_URL || window.location.origin}/password-reset?type=recovery`,
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
          <div className="mt-8 border-t border-white/10 pt-6 text-center">
            <p className="text-[14px] font-light text-white/60">
              Don't have an account?{" "}
              <button onClick={handleSignUp} className="text-white underline hover:text-white/80">
                Sign up now
              </button>
            </p>
          </div>
        );

      case "courses":
        return (
          <div className="mt-8 border-t border-white/10 pt-6 text-center">
            <p className="text-[13px] font-light leading-relaxed text-white/45">
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
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md transition-opacity duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-[92%] max-w-[440px] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-[24px] border border-white/15 bg-black/65 backdrop-blur-xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="sr-only" role="heading" aria-level={2}>
            Sign In to MARCH
          </div>
          <div className="sr-only">Sign in to access your account</div>

          {/* Close button */}
          <ModalCloseButton onClose={handleClose} size="md" position="default" />

          <div className="p-8 md:p-10">
            {/* Logo */}
            <div className="mb-8 text-center">
              {/* <img
                src={marchLogoModal}
                alt="MARCH"
                className="mx-auto mb-6 h-20 object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              /> */}
              <h2 className="font-editorial text-[clamp(1.5rem,2vw,1.75rem)] font-light text-white">
                {showForgotPasswordForm ? "Reset Password" : "Welcome back"}
              </h2>
            </div>

            {showForgotPasswordForm ? (
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
                    className="h-12 rounded-xl border-white/15 bg-white text-[15px] text-black placeholder:text-black/40 focus:border-white/30 focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 h-12 w-full rounded-full bg-white text-[15px] font-medium tracking-wide text-black transition-all hover:bg-white/90 disabled:opacity-50"
                  disabled={resetLoading}
                >
                  {resetLoading ? "Sending..." : "Send Reset Link"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowForgotPasswordForm(false)}
                  className="w-full pt-2 text-[14px] text-white/60 transition-colors hover:text-white"
                >
                  Back to Sign In
                </button>
              </form>
            ) : (
              /* Sign In Form */
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-[14px] font-light text-white/80">
                    Email
                  </Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-xl border-white/15 bg-white text-[15px] text-black placeholder:text-black/40 focus:border-white/30 focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-[14px] font-light text-white/80">
                    Password
                  </Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-12 rounded-xl border-white/15 bg-white text-[15px] text-black placeholder:text-black/40 focus:border-white/30 focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>

                {/* Forgot Password Link */}
                {showForgotPassword && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordForm(true)}
                      className="text-[13px] text-white/50 transition-colors hover:text-white"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  className="h-12 w-full rounded-full bg-white text-[15px] font-medium tracking-wide text-black transition-all hover:bg-white/90 disabled:opacity-50"
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

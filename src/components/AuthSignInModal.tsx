import { zodResolver } from "@hookform/resolvers/zod";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { ButtonLoadingSpinner } from "@/components/skeletons/ButtonLoadingSpinner";
import { Dialog, DialogPortal } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { usePasswordReset } from "@/hooks/auth/usePasswordReset";
import { useSignIn } from "@/hooks/auth/useSignIn";

interface AuthSignInModalProps {
  open: boolean;
  onClose: () => void;
  /** Called after successful sign-in. If not provided, modal just closes. */
  onSuccess?: () => void;
  /** Whether to show forgot password link. Defaults to true. */
  showForgotPassword?: boolean;
  /** Callback to open subscription modal */
  onOpenSubscription?: () => void;
}

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const resetSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type SignInValues = z.infer<typeof signInSchema>;
type ResetValues = z.infer<typeof resetSchema>;

export const AuthSignInModal = ({
  open,
  onClose,
  onSuccess,
  showForgotPassword = true,
  onOpenSubscription,
}: AuthSignInModalProps) => {
  const [showForgotPasswordForm, setShowForgotPasswordForm] = useState(false);
  const navigate = useNavigate();

  const signIn = useSignIn();
  const passwordReset = usePasswordReset();

  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
  });

  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
  });

  const handleSignIn = signInForm.handleSubmit((data) => {
    signIn.mutate(
      { email: data.email, password: data.password },
      {
        onSuccess: () => {
          onClose();
          onSuccess?.();
        },
      }
    );
  });

  const handleForgotPassword = resetForm.handleSubmit((data) => {
    passwordReset.mutate(data.email, {
      onSuccess: () => {
        setShowForgotPasswordForm(false);
        resetForm.reset();
      },
    });
  });

  const handleClose = () => {
    setShowForgotPasswordForm(false);
    signInForm.reset();
    resetForm.reset();
    onClose();
  };

  const handleSignUp = () => {
    handleClose();
    if (onOpenSubscription) {
      onOpenSubscription();
    } else {
      navigate("/", { state: { openSubscription: true } });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogPortal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-md transition-opacity duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed inset-0 z-[80] h-dvh w-full overflow-y-auto rounded-none border-0 bg-black/85 backdrop-blur-xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 md:inset-auto md:left-[50%] md:top-[50%] md:h-auto md:w-[92%] md:max-w-[440px] md:-translate-x-1/2 md:-translate-y-1/2 md:overflow-hidden md:rounded-[24px] md:border md:border-white/15 md:bg-black/65">
          <div className="sr-only" role="heading" aria-level={2}>
            Sign In to HŌM
          </div>
          <div className="sr-only">Sign in to access your account</div>

          <ModalCloseButton onClose={handleClose} size="md" position="default" />

          <div className="flex min-h-dvh flex-col items-center justify-center p-8 md:min-h-[420px] md:items-stretch md:p-10">
            <div className="w-full max-w-[360px] md:max-w-none">
              <div className="mb-8 text-center">
                <h2 className="font-editorial text-[clamp(1.5rem,2vw,1.75rem)] font-light text-white">
                  {showForgotPasswordForm ? "Reset Password" : "Welcome back"}
                </h2>
              </div>

              {showForgotPasswordForm ? (
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-[14px] font-light text-white/80">
                      Email Address
                    </Label>
                    <Input
                      id="reset-email"
                      type="email"
                      {...resetForm.register("email")}
                      placeholder="your@email.com"
                      className="h-12 rounded-xl border-white/15 bg-white text-[15px] text-black placeholder:text-black/40 focus:border-white/30 focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    {resetForm.formState.errors.email && (
                      <p className="text-[13px] text-red-400">
                        {resetForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="flex h-12 w-full items-center justify-center rounded-full bg-white text-[15px] font-medium tracking-wide text-black transition-all hover:bg-white/90 disabled:opacity-50"
                    disabled={passwordReset.isPending}
                  >
                    {passwordReset.isPending ? (
                      <ButtonLoadingSpinner size="md" className="text-black" />
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-[14px] font-light text-white/80">
                      Email
                    </Label>
                    <Input
                      id="signin-email"
                      type="email"
                      {...signInForm.register("email")}
                      className="h-12 rounded-xl border-white/15 bg-white text-[15px] text-black placeholder:text-black/40 focus:border-white/30 focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    {signInForm.formState.errors.email && (
                      <p className="text-[13px] text-red-400">
                        {signInForm.formState.errors.email.message}
                      </p>
                    )}
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
                      {...signInForm.register("password")}
                      className="h-12 rounded-xl border-white/15 bg-white text-[15px] text-black placeholder:text-black/40 focus:border-white/30 focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    {signInForm.formState.errors.password && (
                      <p className="text-[13px] text-red-400">
                        {signInForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

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
                    className="flex h-12 w-full items-center justify-center rounded-full bg-white text-[15px] font-medium tracking-wide text-black transition-all hover:bg-white/90 disabled:opacity-50"
                    disabled={signIn.isPending}
                  >
                    {signIn.isPending ? (
                      <ButtonLoadingSpinner size="md" className="text-black" />
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>
              )}

              <div className="mt-8 border-t border-white/10 pt-6 text-center">
                {showForgotPasswordForm ? (
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordForm(false)}
                    className="text-[14px] font-light text-white/60 transition-colors hover:text-white"
                  >
                    Back to Sign In
                  </button>
                ) : (
                  <p className="text-[14px] font-light text-white/60">
                    Don't have an account?{" "}
                    <button
                      onClick={handleSignUp}
                      className="text-white underline hover:text-white/80"
                    >
                      Sign up now
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};

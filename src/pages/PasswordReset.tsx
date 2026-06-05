import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { ButtonLoadingSpinner } from "@/components/skeletons/ButtonLoadingSpinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePasswordReset } from "@/hooks/auth/usePasswordReset";
import { useUpdatePassword } from "@/hooks/auth/useUpdatePassword";
import { supabase } from "@/integrations/supabase/client";

const PasswordReset = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isRecoveryMode, setIsRecoveryMode] = useState(searchParams.get("type") === "recovery");
  const isRecoveryModeRef = useRef(isRecoveryMode);

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordReset = usePasswordReset();
  const updatePassword = useUpdatePassword();

  useEffect(() => {
    isRecoveryModeRef.current = isRecoveryMode;
  }, [isRecoveryMode]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecoveryMode(true);
      } else if (event === "SIGNED_OUT" && isRecoveryModeRef.current) {
        toast.error("Reset link has expired. Please request a new one.");
        setIsRecoveryMode(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    passwordReset.mutate(email, {
      onSuccess: () => setEmail(""),
    });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    updatePassword.mutate(newPassword, {
      onSuccess: () => navigate("/auth"),
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-[92%] max-w-[440px] rounded-[24px] border border-white/15 bg-black/65 p-10 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <h2 className="font-editorial text-[clamp(1.5rem,2vw,1.75rem)] font-light text-white">
            {isRecoveryMode ? "Set new password" : "Reset password"}
          </h2>
        </div>

        {isRecoveryMode ? (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-[14px] font-light text-white/80">
                New Password
              </Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Enter new password"
                className="h-12 rounded-xl border-white/15 bg-white text-[15px] text-black placeholder:text-black/40 focus:border-white/30 focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-[14px] font-light text-white/80">
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Confirm new password"
                className="h-12 rounded-xl border-white/15 bg-white text-[15px] text-black placeholder:text-black/40 focus:border-white/30 focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <button
              type="submit"
              disabled={updatePassword.isPending}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-white text-[15px] font-medium tracking-wide text-black transition-all hover:bg-white/90 disabled:opacity-50"
            >
              {updatePassword.isPending ? (
                <ButtonLoadingSpinner size="md" className="text-black" />
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRequestReset} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[14px] font-light text-white/80">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="h-12 rounded-xl border-white/15 bg-white text-[15px] text-black placeholder:text-black/40 focus:border-white/30 focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <button
              type="submit"
              disabled={passwordReset.isPending}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-white text-[15px] font-medium tracking-wide text-black transition-all hover:bg-white/90 disabled:opacity-50"
            >
              {passwordReset.isPending ? (
                <ButtonLoadingSpinner size="md" className="text-black" />
              ) : (
                "Send Reset Link"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="w-full pt-2 text-[14px] text-white/60 transition-colors hover:text-white"
            >
              Back to Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PasswordReset;

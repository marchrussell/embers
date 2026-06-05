import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

/**
 * Handles Supabase auth error hash fragments delivered to the root URL.
 * When a token is expired/invalid, Supabase redirects to the Site URL with
 * #error=access_denied&error_code=otp_expired in the hash rather than to
 * the redirectTo URL. This component intercepts that and sends the user to
 * /password-reset with a clear message.
 */
export const AuthErrorRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("error=")) return;

    const params = new URLSearchParams(hash.substring(1));
    const errorCode = params.get("error_code");

    if (errorCode === "otp_expired") {
      window.history.replaceState(null, "", window.location.pathname);
      navigate("/password-reset", { replace: true });
      toast.error("Reset link has expired. Please request a new one.");
    }
  }, [navigate]);

  return null;
};

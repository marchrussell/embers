import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

export function usePasswordReset() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${import.meta.env.VITE_SITE_URL || window.location.origin}/password-reset?type=recovery`,
      });
      if (error) throw error;
    },
    onSuccess: () => toast.success("Password reset email sent! Check your inbox."),
    onError: (error: Error) => toast.error(error.message || "Failed to send reset email"),
  });
}

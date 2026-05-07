import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";

export function useSignIn() {
  const { signIn } = useAuth();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signIn(email, password),
    onSuccess: () => toast.success("Welcome back!"),
    onError: (error: Error) => {
      const msg = error.message || "Failed to sign in";
      if (msg.includes("Invalid login credentials")) {
        toast.error("Invalid email or password");
      } else if (msg.includes("Email not confirmed")) {
        toast.error("Please check your email to confirm your account");
      } else {
        toast.error(msg);
      }
    },
  });
}

import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

export const useAccountSettings = (userId?: string) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Email state
  const [newEmail, setNewEmail] = useState("");

  // Feedback state
  const [feedback, setFeedback] = useState("");

  // Delete account state
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handlePasswordChange = async (onSuccess?: () => void) => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEmailChange = async (onSuccess?: () => void) => {
    if (!newEmail || !newEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;

      toast.success("Confirmation email sent to your new address");
      setNewEmail("");
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to update email");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFeedbackSubmit = async (onSuccess?: () => void) => {
    if (!feedback.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    if (!userId) {
      toast.error("You must be signed in to submit feedback");
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      const { error } = await supabase
        .from("feedback")
        .insert({
          user_id: userId,
          message: feedback.trim(),
        });

      if (error) throw error;

      toast.success("Thank you! Your feedback has been submitted.");
      setFeedback("");
      onSuccess?.();
    } catch (error: any) {
      console.error("Feedback submission error:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return {
    // State
    isUpdating,
    isSubmittingFeedback,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    newEmail,
    setNewEmail,
    feedback,
    setFeedback,
    deleteConfirmText,
    setDeleteConfirmText,
    // Handlers
    handlePasswordChange,
    handleEmailChange,
    handleFeedbackSubmit,
  };
};

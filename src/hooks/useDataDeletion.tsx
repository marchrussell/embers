import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function useDataDeletion() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteAccount = async () => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to delete your account",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);

    try {
      // Call edge function to handle account deletion
      const { data, error } = await supabase.functions.invoke("delete-user", {
        body: { userId: user.id },
      });

      if (error) throw error;

      toast({
        title: "Account deleted",
        description: "Your account and all associated data have been permanently deleted",
      });

      // Sign out and redirect
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Deletion failed",
        description: "Failed to delete your account. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteMarchData = async () => {
    if (!user) {
      toast({
        title: "Not authenticated",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);

    try {
      // Delete March-specific data only
      await Promise.all([
        supabase.from("march_messages").delete().eq("user_id", user.id),
        supabase.from("user_preferences").delete().eq("user_id", user.id),
        supabase.from("recommendation_history").delete().eq("user_id", user.id),
        supabase
          .from("profiles")
          .update({
            has_accepted_march_data_consent: false,
            march_data_consent_date: null,
          })
          .eq("id", user.id),
      ]);

      toast({
        title: "March data deleted",
        description: "Your conversation history and preferences have been removed",
      });
    } catch (error) {
      console.error("Error deleting March data:", error);
      toast({
        title: "Deletion failed",
        description: "Failed to delete March data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteAccount, deleteMarchData, isDeleting };
}

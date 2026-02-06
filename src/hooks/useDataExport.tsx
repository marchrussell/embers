import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useDataExport() {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  const exportUserData = async () => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "You must be logged in to export data",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      // Fetch all user data from various tables
      const [
        { data: profile },
        { data: onboarding },
        { data: messages },
        { data: moodLogs },
        { data: progress },
        { data: favourites },
        { data: preferences },
        { data: recommendations },
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("user_onboarding").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("march_messages").select("*").eq("user_id", user.id),
        supabase.from("user_mood_logs").select("*").eq("user_id", user.id),
        supabase.from("user_progress").select("*").eq("user_id", user.id),
        supabase.from("user_favourites").select("*").eq("user_id", user.id),
        supabase.from("user_preferences").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("recommendation_history").select("*").eq("user_id", user.id),
      ]);

      // Compile all data
      const exportData = {
        export_date: new Date().toISOString(),
        user_id: user.id,
        profile: profile || {},
        onboarding: onboarding || {},
        march_messages: messages || [],
        mood_logs: moodLogs || [],
        progress: progress || [],
        favourites: favourites || [],
        preferences: preferences || {},
        recommendation_history: recommendations || [],
      };

      // Create downloadable JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `march-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Data exported successfully",
        description: "Your data has been downloaded as a JSON file",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Export failed",
        description: "Failed to export your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return { exportUserData, isExporting };
}

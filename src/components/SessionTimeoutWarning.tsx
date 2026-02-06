import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";

export const SessionTimeoutWarning = () => {
  const { user, session } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!session) return;

    const checkSessionExpiry = () => {
      if (!session.expires_at) return;

      const expiresAt = session.expires_at * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      const fiveMinutes = 5 * 60 * 1000;

      // Show warning 5 minutes before expiry
      if (timeUntilExpiry <= fiveMinutes && timeUntilExpiry > 0) {
        setShowWarning(true);
        setTimeLeft(Math.floor(timeUntilExpiry / 1000 / 60)); // Minutes
      } else {
        setShowWarning(false);
      }
    };

    // Check every minute
    const interval = setInterval(checkSessionExpiry, 60000);
    checkSessionExpiry(); // Check immediately

    return () => clearInterval(interval);
  }, [session]);

  const handleExtendSession = async () => {
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) throw error;
      setShowWarning(false);
    } catch (error) {
      console.error("Failed to refresh session:", error);
    }
  };

  if (!user || !showWarning) return null;

  return (
    <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Session Expiring Soon</AlertDialogTitle>
          <AlertDialogDescription>
            Your session will expire in approximately {timeLeft} minute{timeLeft !== 1 ? 's' : ''}. 
            Would you like to extend your session?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleExtendSession}>
            Extend Session
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

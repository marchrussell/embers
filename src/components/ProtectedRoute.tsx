import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { FullPageSkeleton } from "@/components/skeletons/FullPageSkeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, hasCompletedOnboarding, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect while still loading
    if (loading) return;

    // Not authenticated - redirect to auth page
    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }

    // User authenticated but hasn't completed onboarding
    // Redirect to onboarding page (but not if already there or on payment success to avoid loops)
    // Admins bypass the onboarding requirement
    if (!isAdmin && !hasCompletedOnboarding &&
        !location.pathname.startsWith("/onboarding") &&
        !location.pathname.startsWith("/payment-success")) {
      navigate("/onboarding", { replace: true });
      return;
    }
  }, [user, loading, isAdmin, hasCompletedOnboarding, navigate, location.pathname]);

  // Show skeleton while checking auth status
  if (loading) {
    return <FullPageSkeleton variant="studio" />;
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // Authenticated but incomplete onboarding (and not on onboarding or payment success page)
  // Admins bypass the onboarding requirement
  if (!isAdmin && !hasCompletedOnboarding &&
      !location.pathname.startsWith("/onboarding") &&
      !location.pathname.startsWith("/payment-success")) {
    return null;
  }

  // All checks passed - render the protected content
  return <>{children}</>;
};

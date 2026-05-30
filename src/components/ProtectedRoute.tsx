import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { FullPageSkeleton } from "@/components/skeletons/FullPageSkeleton";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, hasCompletedOnboarding, hasAcceptedSafetyDisclosure, isAdmin } = useAuth();
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

    if (
      location.pathname.startsWith("/onboarding") ||
      location.pathname.startsWith("/payment-success")
    ) {
      return;
    }

    // User authenticated but hasn't completed onboarding — admins bypass
    if (!isAdmin && !hasCompletedOnboarding) {
      navigate("/onboarding", { replace: true });
      return;
    }

    // Completed onboarding but hasn't accepted safety disclosure (e.g. onboarded before
    // safety was added to the onboarding flow) — send them through onboarding once more
    if (!isAdmin && hasCompletedOnboarding && !hasAcceptedSafetyDisclosure) {
      navigate("/onboarding", { replace: true });
      return;
    }
  }, [
    user,
    loading,
    isAdmin,
    hasCompletedOnboarding,
    hasAcceptedSafetyDisclosure,
    navigate,
    location.pathname,
  ]);

  // Show skeleton while checking auth status
  if (loading) {
    return <FullPageSkeleton variant="studio" />;
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // Authenticated but incomplete onboarding — admins bypass
  if (
    !isAdmin &&
    !hasCompletedOnboarding &&
    !location.pathname.startsWith("/onboarding") &&
    !location.pathname.startsWith("/payment-success")
  ) {
    return null;
  }

  // Completed onboarding but safety disclosure not yet accepted — admins bypass
  if (
    !isAdmin &&
    hasCompletedOnboarding &&
    !hasAcceptedSafetyDisclosure &&
    !location.pathname.startsWith("/onboarding")
  ) {
    return null;
  }

  // All checks passed - render the protected content
  return <>{children}</>;
};

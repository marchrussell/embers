import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { FullPageSkeleton } from "@/components/skeletons/FullPageSkeleton";
import { useAuth } from "@/contexts/AuthContext";

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }
    if (!isAdmin) {
      navigate("/", { replace: true });
    }
  }, [user, loading, isAdmin, navigate]);

  if (loading) {
    return <FullPageSkeleton variant="studio" />;
  }

  if (!user || !isAdmin) {
    return null;
  }

  return <>{children}</>;
};

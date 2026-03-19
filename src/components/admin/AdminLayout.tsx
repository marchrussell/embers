import { AdminSkeleton } from "@/components/skeletons/AdminSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";
import { Link, Navigate } from "react-router-dom";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export const AdminLayout = ({ children, title, description, actions }: AdminLayoutProps) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return <AdminSkeleton />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-24 md:px-8">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-base text-[#E6DBC7]/70 transition-colors hover:text-[#E6DBC7] md:text-lg"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="mb-3 font-editorial text-4xl font-light text-[#E6DBC7] md:text-5xl lg:text-6xl">
              {title}
            </h1>
            {description && <p className="text-base text-foreground/70">{description}</p>}
          </div>
          {actions && <div className="flex flex-shrink-0 items-center gap-3">{actions}</div>}
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;

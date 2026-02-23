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
      <div className="container mx-auto px-6 md:px-8 py-24">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link 
            to="/admin" 
            className="inline-flex items-center text-[#E6DBC7]/70 hover:text-[#E6DBC7] transition-colors gap-2 text-base md:text-lg"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-12">
          <div>
            <h1 className="font-editorial text-4xl md:text-5xl lg:text-6xl text-[#E6DBC7] mb-3 font-light">
              {title}
            </h1>
            {description && (
              <p className="text-base text-foreground/70">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;


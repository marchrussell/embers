import { AdminSkeleton } from "@/components/skeletons/AdminSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  BookOpen,
  Calendar,
  Users
} from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

interface AdminSection {
  title: string;
  path: string;
  description: string;
}

interface AdminCategory {
  name: string;
  icon: React.ElementType;
  color: string;
  items: AdminSection[];
}

const AdminDashboard = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return <AdminSkeleton />;
  }

  if (!isAdmin) {
    return null;
  }

  const categories: AdminCategory[] = [
    {
      name: "Content",
      icon: BookOpen,
      color: "#D4915A",
      items: [
        { title: "Classes", path: "/admin/classes", description: "Upload and manage breathwork video classes" },
        { title: "Programs", path: "/admin/programs", description: "Create and organize class programs" },
        { title: "Categories", path: "/admin/categories", description: "Manage class categories and their images" },
      ],
    },
    {
      name: "Users & Applications",
      icon: Users,
      color: "#8B9DC3",
      items: [
        { title: "App Users & Analytics", path: "/admin/users", description: "View users, subscriptions, and key metrics" },
        { title: "Guest Teachers", path: "/admin/guest-teachers", description: "Manage upcoming guest session teachers" },
      ],
    },
    {
      name: "Events",
      icon: Calendar,
      color: "#7BA68C",
      items: [
        { title: "Live Sessions", path: "/admin/live-sessions", description: "Manage live breathwork sessions and Daily.co rooms" },
        { title: "Event Bookings", path: "/admin/event-bookings", description: "View event bookings and attendee lists" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-8 py-24">
        <div className="mb-20">
          <h1 className="font-editorial text-5xl md:text-6xl text-[#E6DBC7] mb-6 font-light">Admin Dashboard</h1>
          <p className="text-base text-foreground/70">Manage your breathwork platform</p>
        </div>
        
        <div className="space-y-12">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <section key={category.name}>
                <div className="flex items-center gap-3 mb-6">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: category.color }} />
                  </div>
                  <h2 className="text-2xl font-light text-[#E6DBC7] tracking-wide">{category.name}</h2>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {category.items.map((section) => (
                    <Link key={section.path} to={section.path}>
                      <Card 
                        className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/10 hover:border-2 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all cursor-pointer h-full group"
                        style={{ 
                          '--hover-border-color': category.color,
                        } as React.CSSProperties}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle 
                            className="text-lg font-normal transition-colors group-hover:text-[var(--hover-border-color)]"
                            style={{ color: '#E6DBC7' }}
                          >
                            {section.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-foreground/60 mb-6 leading-relaxed line-clamp-2">{section.description}</p>
                          <Button 
                            className="bg-white/5 backdrop-blur-md text-white border border-white/30 px-4 py-1.5 rounded-full text-sm font-light tracking-wide hover:bg-white/10 transition-all w-full"
                            style={{
                              '--tw-ring-color': category.color,
                            } as React.CSSProperties}
                          >
                            Manage
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
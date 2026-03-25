import { BookOpen, Calendar, Users } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AdminSkeleton } from "@/components/skeletons/AdminSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

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
    return <AdminSkeleton />;
  }

  const categories: AdminCategory[] = [
    {
      name: "Content",
      icon: BookOpen,
      color: "#D4915A",
      items: [
        {
          title: "Classes",
          path: "/admin/classes",
          description: "Upload and manage breathwork video classes",
        },
        {
          title: "Programs",
          path: "/admin/programs",
          description: "Create and organize class programs",
        },
        {
          title: "Categories",
          path: "/admin/categories",
          description: "Manage class categories and their images",
        },
      ],
    },
    {
      name: "Users & Applications",
      icon: Users,
      color: "#8B9DC3",
      items: [
        {
          title: "App Users & Analytics",
          path: "/admin/users",
          description: "View users, subscriptions, and key metrics",
        },
        {
          title: "Guest Teachers",
          path: "/admin/guest-teachers",
          description: "Manage upcoming guest session teachers",
        },
      ],
    },
    {
      name: "Events",
      icon: Calendar,
      color: "#7BA68C",
      items: [
        {
          title: "Live Sessions",
          path: "/admin/live-sessions",
          description: "Manage live breathwork sessions and Daily.co rooms",
        },
        {
          title: "Event Bookings",
          path: "/admin/event-bookings",
          description: "View event bookings and attendee lists",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-8 py-24">
        <div className="mb-20">
          <h1 className="mb-6 font-editorial text-5xl font-light text-[#E6DBC7] md:text-6xl">
            Admin Dashboard
          </h1>
          <p className="text-base text-foreground/70">Manage your breathwork platform</p>
        </div>

        <div className="space-y-12">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <section key={category.name}>
                <div className="mb-6 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: category.color }} />
                  </div>
                  <h2 className="text-2xl font-light tracking-wide text-[#E6DBC7]">
                    {category.name}
                  </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {category.items.map((section) => (
                    <Link key={section.path} to={section.path}>
                      <Card
                        className="group h-full cursor-pointer border-[#E6DBC7]/10 bg-background/40 backdrop-blur-xl transition-all hover:border-2 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                        style={
                          {
                            "--hover-border-color": category.color,
                          } as React.CSSProperties
                        }
                      >
                        <CardHeader className="pb-2">
                          <CardTitle
                            className="text-lg font-normal transition-colors group-hover:text-[var(--hover-border-color)]"
                            style={{ color: "#E6DBC7" }}
                          >
                            {section.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-foreground/60">
                            {section.description}
                          </p>
                          <Button
                            className="w-full rounded-full border border-white/30 bg-white/5 px-4 py-1.5 text-sm font-light tracking-wide text-white backdrop-blur-md transition-all hover:bg-white/10"
                            style={
                              {
                                "--tw-ring-color": category.color,
                              } as React.CSSProperties
                            }
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

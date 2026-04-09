import { BookOpen, Calendar, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const categories: AdminCategory[] = [
    {
      name: "Library & Course Content",
      icon: BookOpen,
      color: "#D4915A",
      items: [
        {
          title: "Categories",
          path: "/admin/categories",
          description: "Manage class categories and their images",
        },
        {
          title: "Classes",
          path: "/admin/classes",
          description: "Upload and manage breathwork video classes",
        },
        {
          title: "Courses",
          path: "/admin/programs",
          description: "Create and organize classes into multi-day courses",
        },
      ],
    },
    {
      name: "Live Content",
      icon: BookOpen,
      color: "#D4915A",
      items: [
        {
          title: "Live Sessions",
          path: "/admin/live-sessions",
          description:
            "Manage all live session types — Weekly Reset, Monthly Presence, and Guest Sessions",
        },
      ],
    },
    {
      name: "Experiences",
      icon: Calendar,
      color: "#7BA68C",
      items: [
        {
          title: "In-Person Experiences",
          path: "/admin/experiences",
          description: "Create and manage recurring in-person experience configurations",
        },
        {
          title: "Event Bookings",
          path: "/admin/event-bookings",
          description: "View event bookings and attendee lists",
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
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-8 py-24">
        <div className="mb-20 mt-12">
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

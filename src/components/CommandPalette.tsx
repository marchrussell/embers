import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useAuth } from "@/contexts/AuthContext";
import {
  BookOpen,
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  Library,
  Menu,
  Target,
  User,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    console.log("🎯 [CommandPalette] Auth state:", { hasUser: !!user, isAdmin });
  }, [user, isAdmin]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const publicRoutes = [
    { label: "Home", path: "/", icon: Home },
    { label: "The RISE Method", path: "/rise-arc-method", icon: Target },
  ];

  const appRoutes = user
    ? [
        { label: "Studio", path: '/online', icon: Library },
        { label: "Profile", path: "/online/profile", icon: User },
        { label: "Mentorship Dashboard", path: "/online/mentorship", icon: GraduationCap },
        { label: "Mentorship Modules", path: "/online/mentorship/modules", icon: BookOpen },
      ]
    : [];

  const adminRoutes = isAdmin
    ? [
        { label: "Admin Dashboard", path: "/admin", icon: LayoutDashboard },
        { label: "Admin Classes", path: "/admin/classes", icon: Library },
        { label: "Admin Programs", path: "/admin/programs", icon: Menu },
        { label: "Admin Categories", path: "/admin/categories", icon: FileText },
        { label: "Admin Users", path: "/admin/users", icon: Users },
      ]
    : [];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {publicRoutes.map((route) => {
            const Icon = route.icon;
            return (
              <CommandItem
                key={route.path}
                onSelect={() => handleSelect(route.path)}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{route.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        {appRoutes.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="App">
              {appRoutes.map((route) => {
                const Icon = route.icon;
                return (
                  <CommandItem
                    key={route.path}
                    onSelect={() => handleSelect(route.path)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{route.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}

        {adminRoutes.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Admin">
              {adminRoutes.map((route) => {
                const Icon = route.icon;
                return (
                  <CommandItem
                    key={route.path}
                    onSelect={() => handleSelect(route.path)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{route.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
};

// import mLogo from "@/assets/m-logo.png";
// import marchLogo from "@/assets/march-logo.png";
import { useQuery } from "@tanstack/react-query";
import { User } from "lucide-react";
import { memo, Suspense, useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { AuthSignInModal } from "@/components/AuthSignInModal";
import { SubscriptionModal } from "@/components/modals/LazyModals";
import { useAuth } from "@/contexts/AuthContext";
import { useOnlineTab } from "@/hooks/useOnlineTab";
import { supabase } from "@/integrations/supabase/client";

const ONLINE_TABS = [
  { id: "home", label: "Home" },
  { id: "library", label: "Discover" },
  { id: "courses", label: "Courses" },
  { id: "live", label: "Live" },
  { id: "in-person", label: "In Person" },
];

export const NavBar = memo(({ standalone = false }: { standalone?: boolean }) => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  const { activeTab, handleTabChange } = useOnlineTab();

  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const { data: profileData } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user!.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const handleOpenSubscription = useCallback(() => {
    setShowSubscriptionModal(true);
  }, []);

  const [scrolled, setScrolled] = useState(false);
  const [pillsVisible, setPillsVisible] = useState(true);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (y < 10) {
        setPillsVisible(true);
      } else if (y > lastY) {
        setPillsVisible(false);
      } else {
        setPillsVisible(true);
      }
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const firstName = profileData?.full_name?.split(" ")[0] ?? null;
  const displayName = user ? firstName || user.email?.split("@")[0] : null;
  const formattedDisplayName = displayName?.replace(/^./, (char) => char.toUpperCase()) ?? null;

  return (
    <>
      <AuthSignInModal
        open={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onOpenSubscription={handleOpenSubscription}
      />
      <Suspense fallback={null}>
        <SubscriptionModal
          open={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
        />
      </Suspense>

      {/* Logo / HŌM title - fixed at top left, mobile & iPad only */}
      <div className="fixed left-0 top-0 z-[60] pb-2 pl-6 pt-14 md:pb-3 md:pl-12 md:pt-20 lg:hidden">
        {standalone ? (
          <span className="text-2xl font-bold text-[#E6DBC7]">HŌM</span>
        ) : (
          <Link to="/" className="text-5xl font-bold text-[#E6DBC7] hover:opacity-80">
            HŌM
          </Link>
        )}
      </div>

      {/* Mobile pill navigation - fixed below HŌM logo */}
      {!standalone && (
        <div
          className={`fixed left-0 right-0 top-[88px] z-[60] transition-transform duration-300 md:top-[108px] lg:hidden ${pillsVisible ? "translate-y-0" : "-translate-y-[140px]"}`}
        >
          <div className="flex gap-2 px-6 py-2">
            {[
              { id: "library", label: "Discover" },
              { id: "courses", label: "Courses" },
              { id: "live", label: "Live" },
              { id: "in-person", label: "In Person" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 whitespace-nowrap rounded-full py-2 text-sm font-light tracking-wide transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "bg-[#E6DBC7] text-[#1A1A1A]"
                    : "border border-[#E6DBC7]/25 bg-black/30 text-[#E6DBC7]/70 backdrop-blur-sm"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Profile / Sign In button - top right, mobile & iPad only */}
      <div className="fixed right-0 top-0 z-[70] pb-8 pr-6 pt-14 md:pb-10 md:pr-12 md:pt-20 lg:hidden">
        {user ? (
          <Link
            to="/online/profile"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E6DBC7]/30 text-[#E6DBC7] transition-colors hover:border-[#E6DBC7]/50 hover:bg-white/[0.03]"
          >
            <User className="h-5 w-5" />
          </Link>
        ) : (
          <button
            onClick={() => setShowSignInModal(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E6DBC7]/30 text-[#E6DBC7] transition-colors hover:border-[#E6DBC7]/50 hover:bg-white/[0.03]"
          >
            <User className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Full width navigation layout - desktop - hide entirely in standalone mode */}
      {!standalone && (
        <div className="fixed left-0 right-0 top-0 z-50 hidden px-8 pt-10 transition-all duration-500 md:px-20 md:pt-12 lg:block">
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent"
            style={{ height: "140px" }}
          />
          <div className="relative z-10 grid w-full grid-cols-3 items-center">
            {/* Left column - tabs */}
            <div className="flex items-center gap-2 justify-self-start">
              {ONLINE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`whitespace-nowrap rounded-full px-6 py-2.5 text-base font-light tracking-wide transition-colors duration-200 ${
                    activeTab === tab.id
                      ? "bg-[#E6DBC7] text-[#1A1A1A]"
                      : "bg-transparent text-[#E6DBC7]/70 hover:text-[#E6DBC7]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Center column - HŌM logo */}
            <div className="justify-self-center">
              <Link
                to="/"
                className={`text-6xl font-bold text-[#E6DBC7] transition-opacity duration-500 ${scrolled ? "pointer-events-none opacity-0" : "opacity-100 hover:opacity-80"}`}
              >
                HŌM
              </Link>
            </div>

            {/* Right column - Admin + Sign In / Profile */}
            <div className="flex items-center gap-6 justify-self-end">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="relative whitespace-nowrap uppercase transition-colors hover:opacity-80"
                  style={{
                    color: location.pathname.startsWith("/admin") ? "#D4915A" : "#E6DBC7",
                    fontSize: "0.85rem",
                    letterSpacing: "0.12em",
                    fontWeight: 500,
                  }}
                >
                  Admin
                  {location.pathname.startsWith("/admin") && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px]" />
                  )}
                </Link>
              )}
              {user ? (
                <Link
                  to={"/online/profile"}
                  className="flex items-center gap-2.5 rounded-full border border-[#E6DBC7]/30 px-5 py-2.5 text-sm font-light text-[#E6DBC7] transition-colors duration-300 hover:border-[#E6DBC7]/50 hover:bg-white/[0.03]"
                >
                  <User className="h-5 w-5" />
                  <span>{formattedDisplayName}</span>
                </Link>
              ) : (
                <button
                  onClick={() => setShowSignInModal(true)}
                  className="flex items-center gap-2.5 rounded-full border border-[#E6DBC7]/30 px-5 py-2.5 text-sm font-light text-[#E6DBC7] transition-colors duration-300 hover:border-[#E6DBC7]/50 hover:bg-white/[0.03]"
                >
                  <User className="h-5 w-5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
});

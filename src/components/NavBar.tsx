// import mLogo from "@/assets/m-logo.png";
// import marchLogo from "@/assets/march-logo.png";
import { useQuery } from "@tanstack/react-query";
import { Menu, User, X } from "lucide-react";
import { memo, Suspense, useCallback, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { AuthSignInModal } from "@/components/AuthSignInModal";
import { SubscriptionModal } from "@/components/modals/LazyModals";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Sheet import removed - using custom overlay menu instead

export const NavBar = memo(({ standalone = false }: { standalone?: boolean }) => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  const isOnlineRoute = location.pathname.startsWith("/online");
  const isMyCoursesRoute = location.pathname.startsWith("/my-courses");
  const isAppRoute = isOnlineRoute || isMyCoursesRoute;
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleCloseMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const firstName = profileData?.full_name?.split(" ")[0] ?? null;
  const displayName = user ? firstName || user.email?.split("@")[0] || "PROFILE" : null;

  return (
    <>
      <AuthSignInModal
        open={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        //onSuccess={() => navigate(location)}
        onOpenSubscription={handleOpenSubscription}
        footerVariant="signup"
      />
      <Suspense fallback={null}>
        <SubscriptionModal
          open={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
        />
      </Suspense>

      {/* Logo - fixed at top left */}
      <div className="fixed left-0 top-0 z-[60] pb-8 pl-6 pt-14 md:pb-10 md:pl-12 md:pt-20 lg:hidden lg:pt-24">
        {standalone ? (
          <div className="inline-block cursor-default">
            {/* M Logo with glow - placeholder until asset is available */}
            {/* <div className="relative inline-block">
              <div
                className="h-20 w-20 will-change-transform md:h-24 md:w-24"
                style={{
                  WebkitMaskImage: `url(${mLogo})`,
                  maskImage: `url(${mLogo})`,
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                  backgroundColor: "#E6DBC7",
                  animation: "breathe 4s ease-in-out infinite",
                  transform: "translateZ(0)",
                  filter:
                    "drop-shadow(0 0 40px rgba(230, 219, 199, 0.9)) drop-shadow(0 0 90px rgba(230, 219, 199, 0.95))",
                }}
                role="img"
                aria-label="March logo"
              />
            </div> */}
          </div>
        ) : (
          <Link to="/" className="inline-block">
            {/* M Logo with glow - placeholder until asset is available */}
            {/* <div className="relative inline-block">
              <div
                className="h-20 w-20 will-change-transform md:h-24 md:w-24"
                style={{
                  WebkitMaskImage: `url(${mLogo})`,
                  maskImage: `url(${mLogo})`,
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                  backgroundColor: "#E6DBC7",
                  animation: "breathe 4s ease-in-out infinite",
                  transform: "translateZ(0)",
                  filter:
                    "drop-shadow(0 0 40px rgba(230, 219, 199, 0.9)) drop-shadow(0 0 90px rgba(230, 219, 199, 0.95))",
                }}
                role="img"
                aria-label="March logo"
              />
            </div> */}
          </Link>
        )}
      </div>

      {/* Full width navigation layout - desktop - hide entirely in standalone mode */}
      {!standalone && (
        <div className="fixed left-0 right-0 top-0 z-50 hidden px-8 pt-10 md:px-20 md:pt-12 lg:block">
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent"
            style={{ height: "140px" }}
          />
          <div className="relative z-10 flex w-full items-center justify-between">
            {/* M Logo - far left - placeholder until asset is available */}
            {/* <Link to="/" className="flex shrink-0 items-center">
              <img
                src={mLogo}
                alt="M"
                className="h-10 w-auto md:h-12"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(93%) sepia(8%) saturate(558%) hue-rotate(350deg) brightness(94%) contrast(91%) drop-shadow(0 0 12px rgba(230, 219, 199, 0.7))",
                }}
              />
            </Link> */}

            <Link
              to="/"
              className="relative whitespace-nowrap pb-1 uppercase transition-colors hover:opacity-80"
              style={{
                color: location.pathname.startsWith("/") ? "#D4915A" : "#E6DBC7",
                fontSize: "0.85rem",
                letterSpacing: "0.12em",
                fontWeight: 500,
              }}
            >
              Home
            </Link>

            {/* Experiences link */}
            <Link
              to="/experiences"
              className="relative whitespace-nowrap pb-1 uppercase transition-colors hover:opacity-80"
              style={{
                color: location.pathname.startsWith("/experiences") ? "#D4915A" : "#E6DBC7",
                fontSize: "0.85rem",
                letterSpacing: "0.12em",
                fontWeight: 500,
              }}
            >
              Experiences
              {location.pathname.startsWith("/experiences") && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-[2px]"
                  style={{ backgroundColor: "#D4915A" }}
                />
              )}
            </Link>

            {/* MARCH logo - center - placeholder until asset is available */}
            {/* <Link to="/">
              <img
                src={marchLogo}
                alt="March"
                className="h-8 w-auto md:h-10"
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(93%) sepia(8%) saturate(558%) hue-rotate(350deg) brightness(94%) contrast(91%) drop-shadow(0 0 12px rgba(230, 219, 199, 0.7))",
                }}
              />
            </Link> */}

            {/* Online link */}
            <Link
              to="/online"
              className="relative whitespace-nowrap pb-1 uppercase transition-colors hover:opacity-80"
              style={{
                color: location.pathname.startsWith("/online") ? "#D4915A" : "#E6DBC7",
                fontSize: "0.85rem",
                letterSpacing: "0.12em",
                fontWeight: 500,
              }}
            >
              Online
              {location.pathname.startsWith("/online") && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-[2px]"
                  style={{ backgroundColor: "#D4915A" }}
                />
              )}
            </Link>

            {/* Admin link - only visible to admins */}
            {isAdmin && (
              <Link
                to="/admin"
                className="relative whitespace-nowrap pb-1 uppercase transition-colors hover:opacity-80"
                style={{
                  color: location.pathname.startsWith("/admin") ? "#D4915A" : "#E6DBC7",
                  fontSize: "0.85rem",
                  letterSpacing: "0.12em",
                  fontWeight: 500,
                }}
              >
                Admin
                {location.pathname.startsWith("/admin") && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ backgroundColor: "#D4915A" }}
                  />
                )}
              </Link>
            )}

            {/* Sign In / Profile */}
            <div className="flex shrink-0 items-center">
              {user ? (
                <Link
                  to={isMyCoursesRoute ? "/my-courses/profile" : "/online/profile"}
                  className="flex items-center gap-2.5 rounded-full border border-[#E6DBC7]/30 px-5 py-2.5 text-sm font-light text-[#E6DBC7] transition-colors duration-300 hover:border-[#E6DBC7]/50 hover:bg-white/[0.03]"
                >
                  <User className="h-5 w-5" />
                  <span>{displayName.replace(/^./, (char) => char.toUpperCase())}</span>
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
      {/* Mobile & iPad Menu Button with Overlay */}
      {!standalone && (
        <>
          {/* Menu Toggle Button - Fixed position, always visible */}
          <div className="fixed right-0 top-0 z-[70] pb-8 pr-6 pt-14 md:pb-10 md:pr-12 md:pt-20 lg:hidden lg:pt-24">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 transition-opacity duration-300 hover:opacity-80"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <div className="relative h-9 w-9 md:h-12 md:w-12">
                {/* Menu Icon */}
                <Menu
                  className={`absolute inset-0 h-9 w-9 transition-[opacity,transform] duration-300 md:h-12 md:w-12 ${
                    mobileMenuOpen
                      ? "rotate-90 scale-75 opacity-0"
                      : "rotate-0 scale-100 opacity-100"
                  }`}
                  style={{ color: "#E6DBC7" }}
                />
                {/* X Icon */}
                <X
                  className={`absolute inset-0 h-9 w-9 transition-[opacity,transform] duration-300 md:h-12 md:w-12 ${
                    mobileMenuOpen
                      ? "rotate-0 scale-100 opacity-100"
                      : "-rotate-90 scale-75 opacity-0"
                  }`}
                  style={{ color: "#E6DBC7" }}
                />
              </div>
            </button>
          </div>

          {/* Overlay Background */}
          <div
            className={`fixed inset-0 z-[65] bg-black/85 backdrop-blur-md transition-opacity duration-400 lg:hidden ${
              mobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
            onClick={handleCloseMobileMenu}
          />

          {/* Menu Content */}
          <div
            className={`fixed inset-0 z-[66] transition-opacity duration-400 lg:hidden ${
              mobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <div
              className={`mt-44 flex flex-col gap-10 px-10 transition-transform duration-400 md:mt-44 md:gap-12 ${
                mobileMenuOpen ? "translate-y-0" : "-translate-y-8"
              }`}
            >
              <Link
                to="/experiences"
                onClick={handleCloseMobileMenu}
                className="font-editorial text-4xl font-light tracking-wide text-[#E6DBC7] transition-colors hover:text-white md:text-5xl"
              >
                Experiences
              </Link>
              <Link
                to="/online"
                onClick={handleCloseMobileMenu}
                className="font-editorial text-4xl font-light tracking-wide text-[#E6DBC7] transition-colors hover:text-white md:text-5xl"
              >
                Online
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={handleCloseMobileMenu}
                  className="font-editorial text-4xl font-light tracking-wide text-[#E6DBC7] transition-colors hover:text-white md:text-5xl"
                >
                  Admin
                </Link>
              )}

              {isAppRoute && (
                <div className="mt-8 border-t border-[#E6DBC7]/20 pt-10 md:pt-12">
                  {user ? (
                    <Link
                      to={isMyCoursesRoute ? "/my-courses/profile" : "/online/profile"}
                      onClick={handleCloseMobileMenu}
                      className="font-editorial text-3xl font-light tracking-wide text-white/90 transition-colors hover:text-white md:text-4xl"
                    >
                      {displayName}
                    </Link>
                  ) : (
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setShowSignInModal(true);
                      }}
                      className="rounded-full border-2 border-[#E6DBC7] bg-transparent px-10 py-5 text-lg font-light tracking-wide text-[#E6DBC7] transition-all hover:bg-[#E6DBC7]/10 md:py-6 md:text-xl"
                    >
                      Sign In
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
});

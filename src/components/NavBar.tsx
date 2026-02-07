import mLogo from "@/assets/m-logo.png";
import { AuthSignInModal } from "@/components/AuthSignInModal";
import { SubscriptionModal } from "@/components/modals/LazyModals";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Menu, X } from "lucide-react";
import { memo, Suspense, useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// Sheet import removed - using custom overlay menu instead

export const NavBar = memo(({ standalone = false }: { standalone?: boolean }) => {
  const { user, signOut, isAdmin} = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isStudioRoute = location.pathname.startsWith('/studio');
  const isMyCoursesRoute = location.pathname.startsWith('/my-courses');
  const isAppRoute = isStudioRoute || isMyCoursesRoute;
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setFirstName(null);
        return;
      }
      
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      
      if (data?.full_name) {
        const name = data.full_name.split(' ')[0];
        setFirstName(name);
      }
    };

    fetchProfile();
  }, [user]);

  const handleOpenSubscription = useCallback(() => {
    setShowSubscriptionModal(true);
  }, []);

  const handleCloseMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleExploreClick = useCallback(() => {
    setMobileMenuOpen(false);
    setTimeout(() => window.scrollTo(0, 0), 0);
  }, []);

  const displayName = firstName || user?.email?.split('@')[0] || 'PROFILE';

  return (
    <>
      <AuthSignInModal
        open={showSignInModal} 
        onClose={() => setShowSignInModal(false)} 
        onSuccess={() => navigate("/studio")}
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
      <div className="fixed top-0 left-0 z-[60] pt-14 md:pt-20 lg:pt-24 pb-8 md:pb-10 pl-6 md:pl-12 lg:hidden">
        {standalone ? (
          <div className="inline-block cursor-default">
            {/* M Logo with glow */}
            <div className="relative inline-block">
              <div
                className="h-20 md:h-24 w-20 md:w-24 will-change-transform"
                style={{
                  WebkitMaskImage: `url(${mLogo})`,
                  maskImage: `url(${mLogo})`,
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                  backgroundColor: '#E6DBC7',
                  animation: 'breathe 4s ease-in-out infinite',
                  transform: 'translateZ(0)',
                  filter: 'drop-shadow(0 0 40px rgba(230, 219, 199, 0.9)) drop-shadow(0 0 90px rgba(230, 219, 199, 0.95))',
                }}
                role="img"
                aria-label="March logo"
              />
            </div>
          </div>
        ) : (
          <Link to="/" className="inline-block">
            {/* M Logo with glow */}
            <div className="relative inline-block">
                <div
                  className="h-20 md:h-24 w-20 md:w-24 will-change-transform"
                  style={{
                  WebkitMaskImage: `url(${mLogo})`,
                  maskImage: `url(${mLogo})`,
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                  backgroundColor: '#E6DBC7',
                  animation: 'breathe 4s ease-in-out infinite',
                  transform: 'translateZ(0)',
                  filter: 'drop-shadow(0 0 40px rgba(230, 219, 199, 0.9)) drop-shadow(0 0 90px rgba(230, 219, 199, 0.95))',
                }}
                role="img"
                aria-label="March logo"
              />
            </div>
          </Link>
        )}
      </div>

      {/* Full width navigation layout - desktop - hide entirely in standalone mode */}
      {!standalone && (
        <div className="hidden lg:block fixed top-0 left-0 right-0 z-50 pt-10 md:pt-12 px-8 md:px-16">
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent" style={{ height: '140px' }} />
          <div className="relative z-10 flex items-center justify-between w-full">
            {/* M Logo - far left */}
            {/* <Link to="/" className="flex items-center shrink-0">
              <img 
                src={mLogo} 
                alt="M" 
                className="h-10 md:h-12 w-auto"
                style={{
                  filter: 'brightness(0) saturate(100%) invert(93%) sepia(8%) saturate(558%) hue-rotate(350deg) brightness(94%) contrast(91%) drop-shadow(0 0 12px rgba(230, 219, 199, 0.7))'
                }}
              />
            </Link> */}

            {/* Navigation items spread evenly across full width */}
            <div className="flex-1 flex items-center justify-evenly px-12">

              {/* MARCH logo - center */}
              {/* <Link to="/">
                <img 
                  src={marchLogo} 
                  alt="March" 
                  className="h-8 md:h-10 w-auto"
                  style={{
                    filter: 'brightness(0) saturate(100%) invert(93%) sepia(8%) saturate(558%) hue-rotate(350deg) brightness(94%) contrast(91%) drop-shadow(0 0 12px rgba(230, 219, 199, 0.7))'
                  }}
                />
              </Link> */}
              <Link
                to="/studio" 
                className="relative hover:opacity-80 transition-colors uppercase whitespace-nowrap pb-1"
                style={{ 
                  color: location.pathname.startsWith('/studio') ? '#D4915A' : '#E6DBC7', 
                  fontSize: '0.85rem', 
                  letterSpacing: '0.12em', 
                  fontWeight: 500 
                }}
              >
                Studio
                {location.pathname.startsWith('/studio') && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: '#D4915A' }} />
                )}
              </Link>
            </div>

            {/* Right side - Date only */}
            <div className="flex items-center shrink-0 gap-8">
              {/* Dynamic Date */}
              <span
                className="whitespace-nowrap"
                style={{ 
                  color: '#E6DBC7', 
                  fontSize: '0.95rem', 
                  letterSpacing: '0.1em', 
                  fontWeight: 500
                }}
              >
                {(() => {
                  const now = new Date();
                  const day = String(now.getDate()).padStart(2, '0');
                  const month = String(now.getMonth() + 1).padStart(2, '0');
                  const year = now.getFullYear();
                  return `${day} • ${month} • ${year}`;
                })()}
              </span>
            </div>
          </div>
        </div>
      )}
      {/* Mobile & iPad Menu Button with Overlay */}
      {!standalone && (
        <>
          {/* Menu Toggle Button - Fixed position, always visible */}
          <div className="fixed top-0 right-0 z-[70] pt-14 md:pt-20 lg:pt-24 pb-8 md:pb-10 pr-6 md:pr-12 lg:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:opacity-80 transition-opacity duration-300"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <div className="relative w-9 h-9 md:w-12 md:h-12">
                {/* Menu Icon */}
                <Menu 
                  className={`absolute inset-0 w-9 h-9 md:w-12 md:h-12 transition-[opacity,transform] duration-300 ${
                    mobileMenuOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
                  }`} 
                  style={{ color: '#E6DBC7' }} 
                />
                {/* X Icon */}
                <X 
                  className={`absolute inset-0 w-9 h-9 md:w-12 md:h-12 transition-[opacity,transform] duration-300 ${
                    mobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'
                  }`} 
                  style={{ color: '#E6DBC7' }} 
                />
              </div>
            </button>
          </div>

          {/* Overlay Background */}
          <div 
            className={`lg:hidden fixed inset-0 z-[65] bg-black/85 backdrop-blur-md transition-opacity duration-400 ${
              mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            onClick={handleCloseMobileMenu}
          />

          {/* Menu Content */}
          <div 
            className={`lg:hidden fixed inset-0 z-[66] transition-opacity duration-400 ${
              mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className={`flex flex-col gap-10 md:gap-12 mt-44 md:mt-44 px-10 transition-transform duration-400 ${
              mobileMenuOpen ? 'translate-y-0' : '-translate-y-8'
            }`}>
              <Link 
                to="/explore" 
                onClick={handleExploreClick}
                className="text-4xl md:text-5xl font-editorial font-light text-[#E6DBC7] hover:text-white transition-colors tracking-wide"
              >
                Explore
              </Link>
              <Link 
                to="/events" 
                onClick={handleCloseMobileMenu}
                className="text-4xl md:text-5xl font-editorial font-light text-[#E6DBC7] hover:text-white transition-colors tracking-wide"
              >
                Events
              </Link>
              <Link 
                to="/courses" 
                onClick={handleCloseMobileMenu}
                className="text-4xl md:text-5xl font-editorial font-light text-[#E6DBC7] hover:text-white transition-colors tracking-wide"
              >
                Courses
              </Link>
              <Link
                to="/studio" 
                onClick={handleCloseMobileMenu}
                className="text-4xl md:text-5xl font-editorial font-light text-[#E6DBC7] hover:text-white transition-colors tracking-wide"
              >
                Studio
              </Link>
              
              {isAppRoute && (
                <div className="border-t border-[#E6DBC7]/20 pt-10 md:pt-12 mt-8">
                  {user ? (
                    <Link 
                      to={isMyCoursesRoute ? "/my-courses/profile" : "/studio/profile"}
                      onClick={handleCloseMobileMenu}
                      className="text-3xl md:text-4xl font-editorial font-light text-white/90 hover:text-white transition-colors tracking-wide"
                    >
                      {displayName}
                    </Link>
                  ) : (
                    <Button 
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setShowSignInModal(true);
                      }}
                      className="bg-transparent text-[#E6DBC7] border-2 border-[#E6DBC7] hover:bg-[#E6DBC7]/10 transition-all font-light px-10 py-5 md:py-6 rounded-full text-lg md:text-xl tracking-wide"
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

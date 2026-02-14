import { ArrowLeft, Info } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface StudioHeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  showBackButton?: boolean;
  backButtonLabel?: string;
  backButtonPath?: string;
}

const StudioHeader = ({
  activeTab,
  onTabChange,
  showBackButton = false,
  backButtonLabel = "Back to Studio",
  backButtonPath = "/studio",
}: StudioHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from URL if not provided
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    const search = location.search;
    
    // Check URL params first
    const params = new URLSearchParams(search);
    const tabParam = params.get('tab');
    if (tabParam && ['home', 'library', 'foundations', 'programs', 'live'].includes(tabParam)) {
      return tabParam;
    }
    
    // Infer from path
    if (path.includes('/studio/live')) return 'live';
    if (path.includes('/studio/program')) return 'programs';
    if (path.includes('/studio/favourites')) return 'library';
    if (path.includes('/studio/start-here')) return 'home';
    if (path === '/studio') return 'home';
    
    // Category pages are part of library
    const libraryCategories = ['calm', 'energy', 'reset', 'sleep', 'awaken', 'release', 'meditations'];
    if (libraryCategories.some(cat => path.includes(`/studio/${cat}`))) return 'library';
    
    return 'home';
  };

  const currentTab = activeTab || getActiveTabFromPath();

  const handleTabClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      navigate(`/studio?tab=${tab}`);
    }
  };

  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'library', label: 'Library' },
    { id: 'foundations', label: 'Foundations' },
    { id: 'programs', label: 'Courses' },
    { id: 'live', label: 'Live' },
  ];

  return (
    <>
      {/* About Button - Absolute position (scrolls with page) */}
      <div className="absolute top-44 md:top-52 lg:top-68 right-6 md:right-10 lg:right-12 z-50 flex items-center gap-3">
        <Link
          to="/studio/about"
          className="flex items-center justify-center w-12 h-12 md:w-11 md:h-11 rounded-full border border-[#E6DBC7]/30 text-[#E6DBC7] hover:border-[#E6DBC7]/50 hover:bg-white/[0.03] transition-colors duration-300"
        >
          <Info className="w-5 h-5" />
        </Link>
      </div>

      {/* Back Button - aligned with tabs */}
      {showBackButton && (
        <div className="absolute top-20 md:top-[14.25rem] lg:top-48 left-6 md:left-10 lg:left-12 z-50 flex items-center h-10 md:h-11">
          <button
            onClick={() => navigate(backButtonPath)}
            className="text-[#E6DBC7]/80 hover:text-[#E6DBC7] transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base font-light tracking-wide">{backButtonLabel}</span>
          </button>
        </div>
      )}

      {/* Tab Navigation - Desktop only */}
      <div className="hidden md:block absolute md:top-56 lg:top-72 left-6 md:left-10 lg:left-12 z-40">
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`px-6 py-2.5 text-base font-light tracking-wide rounded-full transition-colors duration-200 ${
                currentTab === tab.id
                  ? 'text-[#1A1A1A] bg-[#E6DBC7]'
                  : 'text-[#E6DBC7]/70 hover:text-[#E6DBC7] bg-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Sticky Footer Tabs */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-[9999] border-t border-[#E6DBC7]/10"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center justify-around px-2 py-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 transition-colors duration-200 ${
                currentTab === tab.id
                  ? 'text-[#E6DBC7]'
                  : 'text-[#E6DBC7]/50'
              }`}
            >
              <span className={`text-sm font-light tracking-wide ${
                currentTab === tab.id ? 'font-normal' : ''
              }`}>
                {tab.label}
              </span>
              {currentTab === tab.id && (
                <span className="w-1 h-1 rounded-full bg-[#E6DBC7]" />
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default StudioHeader;

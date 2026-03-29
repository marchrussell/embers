import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

interface OnlineHeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  showBackButton?: boolean;
  backButtonLabel?: string;
  backButtonPath?: string;
}

const OnlineHeader = ({
  activeTab,
  onTabChange,
  showBackButton = false,
  backButtonLabel = "Back",
  backButtonPath = "/online",
}: OnlineHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from URL if not provided
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    const search = location.search;

    // Check URL params first
    const params = new URLSearchParams(search);
    const tabParam = params.get("tab");
    if (tabParam && ["home", "library", "courses", "live"].includes(tabParam)) {
      return tabParam;
    }

    // Infer from path
    if (path.includes("/online/live")) return "live";
    if (path.includes("/online/program")) return "courses";
    if (path.includes("/online/favourites")) return "library";
    if (path.includes("/online/start-here")) return "home";
    if (path === "/online") return "home";

    // Category pages are part of library
    const libraryCategories = [
      "calm",
      "energy",
      "reset",
      "sleep",
      "awaken",
      "release",
      "meditations",
    ];
    if (libraryCategories.some((cat) => path.includes(`/online/${cat}`))) return "library";

    return "home";
  };

  const currentTab = activeTab || getActiveTabFromPath();

  const handleTabClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      navigate(`/online?tab=${tab}`);
    }
  };

  const tabs = [
    { id: "home", label: "Home" },
    { id: "library", label: "Library" },
    { id: "courses", label: "Courses" },
    { id: "live", label: "Live" },
  ];

  return (
    <>
      {/* Back Button - aligned with tabs */}
      {showBackButton && (
        <div className="absolute left-6 top-20 z-50 flex h-10 items-center md:left-10 md:top-[14.25rem] md:h-11 lg:left-12 lg:top-48">
          <button
            onClick={() => navigate(backButtonPath)}
            className="flex items-center gap-2 text-[#E6DBC7]/80 transition-colors hover:text-[#E6DBC7]"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            <span className="text-sm font-light tracking-wide md:text-base">{backButtonLabel}</span>
          </button>
        </div>
      )}

      {/* Tab Navigation - Desktop only */}
      <div className="absolute left-6 z-40 hidden md:left-10 md:top-56 md:block lg:left-12 lg:top-72">
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`rounded-full px-6 py-2.5 text-base font-light tracking-wide transition-colors duration-200 ${
                currentTab === tab.id
                  ? "bg-[#E6DBC7] text-[#1A1A1A]"
                  : "bg-transparent text-[#E6DBC7]/70 hover:text-[#E6DBC7]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Sticky Footer Tabs */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[9999] border-t border-[#E6DBC7]/10 bg-background md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around px-2 py-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-1 flex-col items-center gap-1 py-2 transition-colors duration-200 ${
                currentTab === tab.id ? "text-[#E6DBC7]" : "text-[#E6DBC7]/50"
              }`}
            >
              <span
                className={`text-sm font-light tracking-wide ${
                  currentTab === tab.id ? "font-normal" : ""
                }`}
              >
                {tab.label}
              </span>
              {currentTab === tab.id && <span className="h-1 w-1 rounded-full bg-[#E6DBC7]" />}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default OnlineHeader;

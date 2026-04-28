import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

const VALID_TABS = ["home", "library", "courses", "live"] as const;
export type OnlineTab = (typeof VALID_TABS)[number];

export function useOnlineTab() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = (): OnlineTab => {
    const tabParam = searchParams.get("tab");
    if (tabParam && (VALID_TABS as readonly string[]).includes(tabParam)) {
      return tabParam as OnlineTab;
    }
    const path = location.pathname;
    if (path.includes("/online/live")) return "live";
    if (path.includes("/online/favourites")) return "library";
    if (path.includes("/online/start-here")) return "home";
    return "home";
  };

  const activeTab = getActiveTab();

  const handleTabChange = (tab: string) => {
    navigate(`/online?tab=${tab}`, { replace: true });
  };

  return { activeTab, handleTabChange, VALID_TABS };
}

import guestSessionBg from "@/assets/guest-session-bg.png";
import heroHandsSession from "@/assets/hero-hands-session.png";
import startHereButterfly from "@/assets/start-here-butterfly.jpg";
import weeklyResetEvent from "@/assets/weekly-reset-event.jpg";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { OptimizedImage } from "@/components/OptimizedImage";
import StudioFooter from "@/components/StudioFooter";
import StudioHeader from "@/components/StudioHeader";
import { SubscriptionModal } from "@/components/modals/LazyModals";
import { Button } from "@/components/ui/button";
import { GlowButton } from "@/components/ui/glow-button";
import { IconButton } from "@/components/ui/icon-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { formatGuestSessionDate, getNextThirdThursday, useNextGuestTeacher } from "@/hooks/useNextGuestTeacher";
import { supabase } from "@/integrations/supabase/client";
import {
  CalendarEvent,
  downloadICalFile,
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
} from "@/lib/calendarUtils";
import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/supabaseImageOptimization";
import { ArrowRight, Calendar, ChevronLeft, ChevronRight, Lock, Play, Share, Video } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import SessionDetailModal from "./SessionDetail";

// Course images for Programs tab
import anxietyResetDandelion from "@/assets/anxiety-reset-dandelion.jpg";
import emotionalFirstAid from "@/assets/emotional-first-aid.jpg";
import sleepNsdrMoon from "@/assets/sleep-nsdr-moon.jpg";
import trialProgramImage from "@/assets/trial-program.webp";

// Foundations tab images
import breathingBasicsImage from "@/assets/breathing-basics.jpg";
import theLandingCalm from "@/assets/the-landing-calm.jpg";

// Import the Library component for the Library tab
import Library from "./Library";
interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  duration_days: number;
  price_cents: number;
  currency: string;
  image_url: string | null;
}
const courseImages: Record<string, string> = {
  'breathwork-anxiety-reset': anxietyResetDandelion,
  'anxiety-reset': anxietyResetDandelion,
  'sleep-nsdr-pack': sleepNsdrMoon,
  'emotional-first-aid-kit': emotionalFirstAid,
  'nervous-system-reset': trialProgramImage
};
const Studio = () => {
  const {
    user,
    hasSubscription,
    isAdmin,
    isTestUser,
    loading: authLoading
  } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [subscriptionStartDate, setSubscriptionStartDate] = useState<Date | null>(null);
  const [featuredSession, setFeaturedSession] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openCalendarId, setOpenCalendarId] = useState<string | null>(null);
  const [shouldClearLibraryCategory, setShouldClearLibraryCategory] = useState(false);
  const [foundationsFilter, setFoundationsFilter] = useState<'nervous-system' | 'functional-breathing' | null>(null);
  
  // Fetch next guest teacher from database
  const { teacher: nextGuestTeacher } = useNextGuestTeacher();

  // TEMPORARY: Show Start Here card for all users (for testing)
  const showStartHereCard = true;

  // Set profile from user metadata immediately
  useEffect(() => {
    if (user) {
      const metadataName = user.user_metadata?.full_name;
      if (metadataName) {
        setUserProfile({
          full_name: metadataName
        });
      }
    }
  }, [user]);

  // Fetch subscription start date
  useEffect(() => {
    const fetchSubscriptionDate = async () => {
      if (!user?.id || !hasSubscription) return;
      const {
        data: subscription
      } = await supabase.from('user_subscriptions').select('current_period_start').eq('user_id', user.id).eq('status', 'active').maybeSingle();
      if (subscription?.current_period_start) {
        setSubscriptionStartDate(new Date(subscription.current_period_start));
      }
    };
    fetchSubscriptionDate();
  }, [user?.id, hasSubscription]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch featured session
        const {
          data: featured
        } = await supabase.from('featured_class').select('*').eq('is_active', true).maybeSingle();
        if (featured) {
          setFeaturedSession(featured);
        }

        // Fetch courses for Programs tab
        const {
          data: coursesData
        } = await supabase.from('courses').select('*').eq('is_published', true).order('order_index');
        if (coursesData) {
          setCourses(coursesData);
        }

        // Fetch profile from database
        if (user?.id && !userProfile) {
          const {
            data: profile
          } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
          if (profile?.full_name) {
            setUserProfile(profile);
          }
        }
      } catch (error) {
        console.error('Studio: Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (!authLoading) {
      fetchData();
    }
  }, [user?.id, authLoading]);

  // Handle URL tab parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['home', 'library', 'programs', 'live'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  const handleSessionClick = (sessionId: string) => {
    if (!sessionId) {
      toast.error("Session not found");
      return;
    }
    setSelectedSessionId(sessionId);
  };

  // Compute guest session data from database or fallback
  const guestSessionData = nextGuestTeacher ? {
    title: nextGuestTeacher.session_title,
    subtitle: "3rd Thursday of every month • 7:30 PM GMT • 1 hour",
    description: nextGuestTeacher.short_description || `A unique session featuring ${nextGuestTeacher.name} with fresh perspectives.`,
    image: nextGuestTeacher.photo_url || guestSessionBg,
    nextDate: formatGuestSessionDate(new Date(nextGuestTeacher.session_date)),
    isLive: false,
    hasReplay: false,
    teacherName: nextGuestTeacher.name,
    teacherTitle: nextGuestTeacher.title,
  } : {
    title: "Guest Session",
    subtitle: "3rd Thursday of every month • 7:30 PM GMT • 1 hour",
    description: "A unique session featuring a guest teacher with fresh perspectives.",
    image: guestSessionBg,
    nextDate: formatGuestSessionDate(getNextThirdThursday()),
    isLive: false,
    hasReplay: false,
    teacherName: "Guest Teacher",
    teacherTitle: "",
  };

  // Mock data for live sessions (to be replaced with real data)
  const liveSessionsData = {
    weeklyReset: {
      title: "Weekly Reset",
      subtitle: "Live every Sunday • 7:00 PM GMT • 30 mins",
      description: "A live space to pause, settle your system, and realign mid-week.",
      image: weeklyResetEvent,
      nextDate: "Sunday, December 22",
      isLive: false,
      hasReplay: true,
      replayDate: "December 15, 2024"
    },
    monthlyPresence: {
      title: "Monthly Breath & Presence",
      subtitle: "First Saturday of each month • 10:00 AM GMT • 90 mins",
      description: "A longer, spacious session to soften tension and reconnect with yourself.",
      image: heroHandsSession,
      nextDate: "Saturday, January 4",
      isLive: false,
      hasReplay: true,
      replayDate: "December 7, 2024"
    },
    guestSession: guestSessionData
  };

  // Calendar helper functions for live sessions
  const getCalendarEvent = (sessionKey: string): CalendarEvent => {
    const session = liveSessionsData[sessionKey as keyof typeof liveSessionsData];
    const now = new Date();

    // Parse time from subtitle (e.g., "7:00 PM GMT")
    const timeMatch = session.subtitle.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    let hours = 19, minutes = 0;
    if (timeMatch) {
      hours = parseInt(timeMatch[1]);
      minutes = parseInt(timeMatch[2]);
      if (timeMatch[3].toUpperCase() === 'PM' && hours !== 12) hours += 12;
      if (timeMatch[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
    }

    const startDate = new Date(now);
    startDate.setHours(hours, minutes, 0, 0);
    if (startDate < now) startDate.setDate(startDate.getDate() + 7);

    const duration = sessionKey === 'weeklyReset' ? 30 : sessionKey === 'monthlyPresence' ? 90 : 60;
    const endDate = new Date(startDate.getTime() + duration * 60000);

    return {
      title: session.title,
      description: `${session.description}\n\nSession with March Russell`,
      location: 'Online',
      startDate,
      endDate,
    };
  };

  const handleDownloadICal = (sessionKey: string) => {
    const calendarEvent = getCalendarEvent(sessionKey);
    const filename = calendarEvent.title.replace(/\s+/g, '-').toLowerCase();
    downloadICalFile(calendarEvent, filename);
    setOpenCalendarId(null);
  };

  const handleGoogleCalendar = (sessionKey: string) => {
    const calendarEvent = getCalendarEvent(sessionKey);
    window.open(getGoogleCalendarUrl(calendarEvent), '_blank');
    setOpenCalendarId(null);
  };

  const handleOutlookCalendar = (sessionKey: string) => {
    const calendarEvent = getCalendarEvent(sessionKey);
    window.open(getOutlookCalendarUrl(calendarEvent), '_blank');
    setOpenCalendarId(null);
  };

  const handleShareLiveSession = (sessionKey: string) => {
    const session = liveSessionsData[sessionKey as keyof typeof liveSessionsData];
    const shareUrl = `${window.location.origin}/online?tab=live`;
    const shareText = `Join March Russell for ${session.title} - ${session.description}`;
    
    if (navigator.share) {
      navigator.share({
        title: session.title,
        text: shareText,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
    }
  };

  // Card component for course-style cards
  const CourseCard = ({
    title,
    subtitle,
    description,
    image,
    onClick,
    badge,
    locked = false,
    imagePosition = 'center'
  }: {
    title: string;
    subtitle?: string;
    description: string;
    image: string;
    onClick: () => void;
    badge?: string;
    locked?: boolean;
    imagePosition?: string;
  }) => <div onClick={onClick} className="relative overflow-hidden cursor-pointer group rounded-2xl border border-[#E6DBC7]/15 bg-black/20 backdrop-blur-sm hover:border-[#E6DBC7]/30 transition-colors duration-500 shadow-[0_0_40px_rgba(230,219,199,0.15)]">
      <div className="relative h-48 overflow-hidden">
        <OptimizedImage src={image} alt={title} className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: imagePosition }} optimizationOptions={IMAGE_PRESETS.card} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        {badge && <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-[#D4A574]/90 text-white text-xs font-medium rounded-full uppercase tracking-wider">
              {badge}
            </span>
          </div>}
        {locked && <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Lock className="w-8 h-8 text-[#E6DBC7]" strokeWidth={1.5} />
          </div>}
      </div>
      <div className="p-6">
        {subtitle && <p className="text-xs text-[#D4A574] font-medium tracking-[0.15em] uppercase mb-2">
            {subtitle}
          </p>}
        <h3 className="text-xl font-editorial text-[#E6DBC7] mb-2 leading-tight">
          {title}
        </h3>
        <p className="text-sm text-[#E6DBC7]/70 font-light leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>
    </div>;

  // Horizontal card component for live sessions (matching short courses on explore)
  const LiveSessionCard = ({
    title,
    subtitle,
    description,
    image,
    nextDate,
    isLive,
    onClick
  }: {
    title: string;
    subtitle: string;
    description: string;
    image: string;
    nextDate: string;
    isLive: boolean;
    onClick: () => void;
  }) => <div onClick={onClick} className="group relative flex flex-col md:flex-row overflow-hidden rounded-2xl cursor-pointer bg-black border border-[#E6DBC7]/15 shadow-[0_0_40px_rgba(230,219,199,0.15)] hover:border-[#E6DBC7]/30 transition-colors duration-500" style={{
    minHeight: '200px'
  }}>
      {/* Image */}
      <div className="relative md:w-[40%] h-[180px] md:h-auto shrink-0 overflow-hidden">
        <OptimizedImage src={image} alt={title} className="absolute inset-0 w-full h-full object-cover" optimizationOptions={IMAGE_PRESETS.card} />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40 md:bg-gradient-to-r md:from-transparent md:to-black/60" />
        {isLive && <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs text-white font-medium uppercase tracking-wider">Live Now</span>
          </div>}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
        <p className="text-xs text-[#D4A574] font-medium tracking-[0.15em] uppercase mb-2">
          {subtitle}
        </p>
        <h3 className="text-2xl font-editorial text-[#E6DBC7] mb-2 leading-tight">
          {title}
        </h3>
        <p className="text-sm text-[#E6DBC7]/70 font-light mb-4 leading-relaxed max-w-md">
          {description}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#E6DBC7]/50 font-light flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            {nextDate}
          </p>
          <button className="text-sm text-[#E6DBC7] font-light flex items-center gap-2 hover:text-white transition-colors">
            {isLive ? 'Join Now' : 'Join Live'} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>;

  // Replay card component
  const ReplayCard = ({
    title,
    date,
    image,
    onClick
  }: {
    title: string;
    date: string;
    image: string;
    onClick: () => void;
  }) => <div onClick={onClick} className="group flex items-center gap-4 p-3 bg-[#E6DBC7]/5 rounded-lg cursor-pointer hover:bg-[#E6DBC7]/10 transition-all border border-[#E6DBC7]/10">
      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
        <OptimizedImage src={image} alt={title} className="absolute inset-0 w-full h-full object-cover" optimizationOptions={IMAGE_PRESETS.thumbnail} />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <Video className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-editorial text-[#E6DBC7] mb-0.5 truncate">{title}</h4>
        <p className="text-xs text-[#E6DBC7]/50 font-light">{date}</p>
      </div>
      <Play className="w-5 h-5 text-[#E6DBC7]/60 group-hover:text-[#E6DBC7] transition-colors" />
    </div>;
  // Custom tab change handler that also clears Library category
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // When clicking any tab, clear the Library category selection
    setShouldClearLibraryCategory(true);
  };

  return <div className="min-h-screen bg-background">
      <NavBar />
      <StudioHeader activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Tab Navigation - Content area positioned below fixed header */}
      <div className="pt-44 md:pt-72 lg:pt-88 px-6 md:px-10 lg:px-12 pb-24 md:pb-0">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {/* HOME TAB */}
          <TabsContent value="home" className="mt-0 pb-24 pt-8 md:pt-[150px]">
              <div className="space-y-16 ">
                {/* Start Here — Your First Two Weeks (only for subscribers in first 14 days) */}
                {showStartHereCard && <section>
                    <h2 className="text-2xl md:text-3xl font-medium text-[#E6DBC7] tracking-wide mb-2">
                      Start Here — Your First Two Weeks
                    </h2>
                    <p className="text-base md:text-lg font-light text-[#E6DBC7]/60 mb-10">
                      A gentle way to arrive — nothing to keep up with.
                    </p>
                    
                    {/* Clickable Onboarding Card - Links to dedicated page */}
                    <Link to="/online/start-here" className="block relative h-[380px] md:h-[400px] overflow-hidden rounded-2xl border border-[#E6DBC7]/15 shadow-[0_0_40px_rgba(230,219,199,0.15)] cursor-pointer group hover:border-[#E6DBC7]/25 transition-all">
                      <OptimizedImage src={startHereButterfly} alt="A Simple Place to Begin" className="absolute inset-0 w-full h-full object-cover object-center" optimizationOptions={IMAGE_PRESETS.hero} />
                      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/40 to-transparent md:from-background/40 md:via-transparent md:to-transparent" />
                      
                      <div className="absolute inset-0 md:relative md:h-full flex flex-col md:flex-row rounded-2xl">
                        {/* Desktop: Side image */}
                        <div className="hidden md:block md:w-[45%] relative rounded-l-2xl overflow-hidden">
                          <OptimizedImage src={startHereButterfly} alt="Begin gently" className="absolute inset-0 w-full h-full object-cover" style={{
                      objectPosition: 'center'
                    }} optimizationOptions={IMAGE_PRESETS.card} />
                        </div>
                        
                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 md:relative md:h-full flex flex-col md:justify-center px-6 py-6 md:w-[55%] md:px-10 md:py-8 md:border-l border-white/5 rounded-2xl md:rounded-r-2xl md:rounded-l-none md:backdrop-blur-2xl md:bg-black/10">
                          <h3 className="font-editorial text-2xl md:text-3xl lg:text-4xl font-light tracking-tight mb-3 text-[#E6DBC7] leading-tight">
                            A Simple Place to Begin
                          </h3>
                          <p className="text-xs md:text-sm text-[#D4A574] font-light tracking-[0.2em] mb-4 md:mb-5 uppercase">
                            Your First Two Weeks
                          </p>
                          <p className="text-sm md:text-base font-light text-[#E6DBC7]/80 mb-6 leading-relaxed max-w-2xl">This space is designed to help you arrive gently and find your footing — without pressure or expectation.</p>
                          
                          <Button className="bg-transparent text-[#E6DBC7] border border-[#E6DBC7]/60 hover:bg-white/5 hover:border-[#E6DBC7] transition-all font-light px-12 py-3 rounded-full text-sm md:text-base w-fit">
                            Begin gently
                          </Button>
                        </div>
                      </div>
                    </Link>
                  </section>}

                {/* Featured This Week */}
                {featuredSession && <section className="pt-24">
                    <h2 className="text-2xl md:text-3xl font-medium text-[#E6DBC7] tracking-wide mb-2">A Place to Land This Week</h2>
                    <p className="text-base md:text-lg font-light text-[#E6DBC7]/60 mb-10">
                      One gentle practice — that's enough.
                    </p>
                    
                    {/* Horizontal card with square image and glassmorphism */}
                    <div 
                      onClick={() => {
                        if (!featuredSession.class_id) {
                          toast.error("Unable to load session");
                          return;
                        }
                        handleSessionClick(featuredSession.class_id);
                      }} 
                      className="group cursor-pointer overflow-hidden rounded-xl border border-[#E6DBC7]/20 transition-all shadow-[0_8px_30px_rgba(230,219,199,0.1)]"
                    >
                      <div className="flex h-[140px] md:h-[160px] lg:h-[180px]">
                        {/* Image - Left, fills full height */}
                        <div 
                          className="relative w-[140px] md:w-[200px] lg:w-[240px] h-full flex-shrink-0 bg-cover bg-center"
                          style={{
                            backgroundImage: `url('${getOptimizedImageUrl(featuredSession.image_url, IMAGE_PRESETS.card)}')`
                          }}
                        >
                          <div className="absolute inset-0 bg-black/0" />
                        </div>
                        
                        {/* Glassmorphism Content - Right */}
                        <div className="flex-1 flex items-center justify-between gap-4 px-6 md:px-10 py-6 backdrop-blur-xl bg-black/30 border-l border-white/5">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg md:text-xl font-editorial text-[#E6DBC7] mb-2">
                              {featuredSession.title}
                            </h3>
                            <p className="text-sm md:text-base text-[#E6DBC7]/60 font-light mb-3 leading-relaxed line-clamp-2">
                              {featuredSession.short_description || featuredSession.description}
                            </p>
                            <p className="text-xs md:text-sm text-[#E6DBC7]/40 font-light">
                              {featuredSession.teacher_name} • {featuredSession.duration} min
                            </p>
                          </div>
                        
                          {/* Play Button - always visible */}
                          <div className="flex-shrink-0">
                            <div className="w-11 h-11 md:w-14 md:h-14 rounded-full border border-[#E6DBC7]/50 flex items-center justify-center transition-all bg-[#E6DBC7]/10">
                              <svg className="w-5 h-5 text-[#E6DBC7] transition-all ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>}

                {/* Live Rhythm */}
                <section className="pt-24">
                  <h2 className="text-2xl md:text-3xl font-medium text-[#E6DBC7] tracking-wide mb-2">
                    Live Rhythm
                  </h2>
                  <p className="text-base md:text-lg font-light text-[#E6DBC7]/60 mb-10">
                    Nothing to keep up with. Just somewhere to come back to.
                  </p>
                  <div className="grid md:grid-cols-3 gap-6">
                    <CourseCard title={liveSessionsData.weeklyReset.title} subtitle={liveSessionsData.weeklyReset.subtitle} description={liveSessionsData.weeklyReset.description} image={liveSessionsData.weeklyReset.image} badge={liveSessionsData.weeklyReset.isLive ? "Live Now" : undefined} imagePosition="center 70%" onClick={() => {
                  if (!hasSubscription && !isAdmin && !isTestUser) {
                    setShowSubscriptionModal(true);
                  } else {
                    navigate('/online/live/weekly-reset');
                  }
                }} />
                    <CourseCard title={liveSessionsData.monthlyPresence.title} subtitle={liveSessionsData.monthlyPresence.subtitle} description={liveSessionsData.monthlyPresence.description} image={liveSessionsData.monthlyPresence.image} badge={liveSessionsData.monthlyPresence.isLive ? "Live Now" : undefined} onClick={() => {
                  if (!hasSubscription && !isAdmin && !isTestUser) {
                    setShowSubscriptionModal(true);
                  } else {
                    navigate('/online/live/monthly-presence');
                  }
                }} />
                    <CourseCard title={liveSessionsData.guestSession.title} subtitle={liveSessionsData.guestSession.subtitle} description={liveSessionsData.guestSession.description} image={liveSessionsData.guestSession.image} badge={liveSessionsData.guestSession.isLive ? "Live Now" : undefined} imagePosition="center bottom" onClick={() => {
                  if (!hasSubscription && !isAdmin && !isTestUser) {
                    setShowSubscriptionModal(true);
                  } else {
                    navigate('/online/live/guest-session');
                  }
                }} />
                  </div>
                </section>

              </div>
            </TabsContent>

            {/* LIBRARY TAB - Renders the existing Library component */}
            <TabsContent value="library" className="mt-0 pb-24">
              <Library 
                isEmbedded={true} 
                shouldClearCategory={shouldClearLibraryCategory}
                onClearCategory={() => setShouldClearLibraryCategory(false)}
              />
            </TabsContent>

            {/* FOUNDATIONS TAB */}
            <TabsContent value="foundations" className="mt-0 pb-24 pt-8 md:pt-[150px]">
              <div className="space-y-16">
                {/* Header */}
                <div>
                  <h2 className="text-2xl md:text-3xl font-medium text-[#E6DBC7] tracking-wide mb-4">
                    Foundations
                  </h2>
                  <p className="text-base md:text-lg font-light text-[#E6DBC7]/60 leading-relaxed max-w-3xl">
                    A structured space for learning the core skills that support long-term nervous system health, resilience, and functional breathing patterns — at your own pace.
                  </p>
                  <p className="text-base md:text-lg font-light text-[#E6DBC7]/60 leading-relaxed max-w-3xl mt-4">
                    This space exists to help you build steadiness, capacity, and trust, so the rest of Ripple Effect can meet you more fully. Foundations can be used on its own, or alongside the rest of Ripple Effect. Many people find that the skills built here quietly support everything else.
                  </p>
                </div>

                {/* Sub-filter tabs */}
                {foundationsFilter === null && (
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => setFoundationsFilter('nervous-system')}
                      className="px-6 py-2.5 text-base font-light tracking-wide rounded-full transition-colors duration-200 text-[#E6DBC7]/70 hover:text-[#E6DBC7] bg-transparent border border-[#E6DBC7]/20 hover:border-[#E6DBC7]/40"
                    >
                      Support Your Nervous System
                    </button>
                    <button
                      onClick={() => setFoundationsFilter('functional-breathing')}
                      className="px-6 py-2.5 text-base font-light tracking-wide rounded-full transition-colors duration-200 text-[#E6DBC7]/70 hover:text-[#E6DBC7] bg-transparent border border-[#E6DBC7]/20 hover:border-[#E6DBC7]/40"
                    >
                      Functional Breathing
                    </button>
                  </div>
                )}

                {/* Back button when filter is active */}
                {foundationsFilter !== null && (
                  <button
                    onClick={() => setFoundationsFilter(null)}
                    className="flex items-center gap-2 text-[#E6DBC7]/70 hover:text-[#E6DBC7] transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-base font-light">Back to Foundations</span>
                  </button>
                )}

                {/* Foundation Cards - shown when no filter is active */}
                {foundationsFilter === null && (
                  <div className="space-y-9 md:space-y-10 lg:space-y-12">
                    {/* Card 1: Support Your Nervous System */}
                    <div
                      onClick={() => setFoundationsFilter('nervous-system')}
                      className="group relative flex flex-col lg:flex-row overflow-hidden rounded-2xl border border-white/[0.12] hover:border-white/25 transition-colors duration-500 cursor-pointer shadow-[0_0_60px_rgba(230,219,199,0.4)]"
                      style={{
                        minHeight: '400px',
                        background: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.98) 55%)'
                      }}
                    >
                      <div className="relative lg:w-[52%] h-[240px] lg:h-auto lg:min-h-full shrink-0 overflow-hidden">
                        <img src={theLandingCalm} alt="Support Your Nervous System" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                        <div className="absolute inset-0 hidden lg:block" style={{
                          background: 'linear-gradient(to right, transparent 20%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.98) 100%)'
                        }} />
                        <div className="absolute inset-0 lg:hidden" style={{
                          background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.98) 100%)'
                        }} />
                      </div>
                      <div className="relative flex-1 flex flex-col justify-center p-6 md:p-8 lg:py-10 lg:px-10 lg:pl-6 bg-black/95 lg:bg-transparent">
                        <div>
                          <div className="mb-5">
                            <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] font-medium text-[#E6DBC7]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#E6DBC7]" />
                              Foundation Course
                            </span>
                          </div>
                          <h2 className="font-editorial text-[clamp(1.5rem,2.4vw,2.1rem)] text-[#E6DBC7] font-light leading-[1.2] mb-3 tracking-[-0.01em]">
                            Support Your Nervous System
                          </h2>
                          <p className="font-editorial italic text-[14px] lg:text-[15px] text-[#E6DBC7]/65 mb-4 max-w-[340px] leading-[1.5]">
                            Calm, restore, and build resilience in your nervous system.
                          </p>
                        </div>
                        <div className="flex justify-start mt-8 lg:mt-10 lg:ml-auto lg:mr-8">
                          <GlowButton size="sm">
                            Explore
                          </GlowButton>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Functional Breathing */}
                    <div
                      onClick={() => setFoundationsFilter('functional-breathing')}
                      className="group relative flex flex-col lg:flex-row overflow-hidden rounded-2xl border border-white/[0.12] hover:border-white/25 transition-colors duration-500 cursor-pointer shadow-[0_0_60px_rgba(230,219,199,0.4)]"
                      style={{
                        minHeight: '400px',
                        background: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.98) 55%)'
                      }}
                    >
                      <div className="relative lg:w-[52%] h-[240px] lg:h-auto lg:min-h-full shrink-0 overflow-hidden">
                        <img src={breathingBasicsImage} alt="Functional Breathing" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                        <div className="absolute inset-0 hidden lg:block" style={{
                          background: 'linear-gradient(to right, transparent 20%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.98) 100%)'
                        }} />
                        <div className="absolute inset-0 lg:hidden" style={{
                          background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.98) 100%)'
                        }} />
                      </div>
                      <div className="relative flex-1 flex flex-col justify-center p-6 md:p-8 lg:py-10 lg:px-10 lg:pl-6 bg-black/95 lg:bg-transparent">
                        <div>
                          <div className="mb-5">
                            <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] font-medium text-[#E6DBC7]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#E6DBC7]" />
                              Foundation Course
                            </span>
                          </div>
                          <h2 className="font-editorial text-[clamp(1.5rem,2.4vw,2.1rem)] text-[#E6DBC7] font-light leading-[1.2] mb-3 tracking-[-0.01em]">
                            Functional Breathing
                          </h2>
                          <p className="font-editorial italic text-[14px] lg:text-[15px] text-[#E6DBC7]/65 mb-4 max-w-[340px] leading-[1.5]">
                            Build functional breathing foundations that support steadiness and resilience.
                          </p>
                        </div>
                        <div className="flex justify-start mt-8 lg:mt-10 lg:ml-auto lg:mr-8">
                          <GlowButton size="sm">
                            Explore
                          </GlowButton>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Filtered Content Views */}
                {foundationsFilter === 'nervous-system' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-editorial text-[#E6DBC7] mb-4">
                        Support Your Nervous System
                      </h3>
                      <p className="text-base md:text-lg font-light text-[#E6DBC7]/60 leading-relaxed max-w-2xl">
                        Calm, restore, and build resilience in your nervous system.
                      </p>
                    </div>
                    {/* Placeholder for future content */}
                    <div className="py-16 text-center border border-dashed border-[#E6DBC7]/20 rounded-2xl">
                      <p className="text-[#E6DBC7]/50 text-lg font-light">Content coming soon</p>
                    </div>
                  </div>
                )}

                {foundationsFilter === 'functional-breathing' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-editorial text-[#E6DBC7] mb-4">
                        Functional Breathing
                      </h3>
                      <p className="text-base md:text-lg font-light text-[#E6DBC7]/60 leading-relaxed max-w-2xl">
                        Build functional breathing foundations that support steadiness and resilience.
                      </p>
                    </div>
                    {/* Placeholder for future content */}
                    <div className="py-16 text-center border border-dashed border-[#E6DBC7]/20 rounded-2xl">
                      <p className="text-[#E6DBC7]/50 text-lg font-light">Content coming soon</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* PROGRAMS TAB */}
            <TabsContent value="programs" className="mt-0 pb-64 pt-8 md:pt-[150px]">
              <div>
                <h2 className="text-2xl md:text-3xl font-medium text-[#E6DBC7] tracking-wide mb-2">Guided Courses</h2>
                <p className="text-base md:text-lg font-light text-[#E6DBC7]/60 mb-10">Structured pathways for lasting change and integration.</p>
              </div>
              <div className="space-y-9 md:space-y-10 lg:space-y-12">
                {/* Show loading skeleton while fetching */}
                {isLoading && (
                  <div className="space-y-8">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="relative flex flex-col lg:flex-row overflow-hidden rounded-2xl border border-white/[0.08] animate-pulse" style={{ minHeight: '400px' }}>
                        <div className="lg:w-[52%] h-[240px] lg:h-auto bg-muted/20" />
                        <div className="flex-1 p-8 space-y-4 bg-black/50">
                          <div className="h-4 w-32 bg-muted/30 rounded" />
                          <div className="h-8 w-3/4 bg-muted/30 rounded" />
                          <div className="h-16 w-full bg-muted/20 rounded" />
                          <div className="h-10 w-32 bg-muted/30 rounded-full mt-8" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Show empty state only when done loading and no courses */}
                {!isLoading && courses.length === 0 && (
                  <div className="text-center py-24">
                    <p className="text-[#E6DBC7]/60 text-xl">Programs coming soon</p>
                  </div>
                )}
                
                {/* All courses */}
                {courses.map((course, index) => <div key={course.id} onClick={() => navigate(`/online/program/${course.slug}`)} className="group relative flex flex-col lg:flex-row overflow-hidden rounded-2xl border border-white/[0.12] hover:border-white/25 transition-colors duration-500 cursor-pointer shadow-[0_0_60px_rgba(230,219,199,0.4)]" style={{
              minHeight: '400px',
              background: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.98) 55%)'
            }}>
                    <div className="relative lg:w-[52%] h-[240px] lg:h-auto lg:min-h-full shrink-0 overflow-hidden">
                      <img src={courseImages[course.slug] || course.image_url || ''} alt={course.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 hidden lg:block" style={{
                  background: 'linear-gradient(to right, transparent 20%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.98) 100%)'
                }} />
                      <div className="absolute inset-0 lg:hidden" style={{
                  background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.98) 100%)'
                }} />
                    </div>
                    <div className="relative flex-1 flex flex-col justify-center p-6 md:p-8 lg:py-10 lg:px-10 lg:pl-6 bg-black/95 lg:bg-transparent">
                      <div>
                        <div className="mb-5">
                          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] font-medium text-[#E6DBC7]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E6DBC7]" />
                            {course.slug === 'nervous-system-reset' ? '14-Day Flagship Reset' : `${course.duration_days}-Day Course`}
                          </span>
                        </div>
                        <h2 className="font-editorial text-[clamp(1.5rem,2.4vw,2.1rem)] text-[#E6DBC7] font-light leading-[1.2] mb-3 tracking-[-0.01em]">
                          {course.title}
                        </h2>
                        <p className="font-editorial italic text-[14px] lg:text-[15px] text-[#E6DBC7]/65 mb-4 max-w-[340px] leading-[1.5]">
                          {course.short_description || course.description}
                        </p>
                      </div>
                      <div className="flex justify-start mt-8 lg:mt-10 lg:ml-auto lg:mr-8">
                        <GlowButton size="sm">
                          Start Course
                        </GlowButton>
                      </div>
                    </div>
                  </div>)}
              </div>
            </TabsContent>

            {/* LIVE TAB */}
            <TabsContent value="live" className="mt-0 pb-24 pt-8 md:pt-[150px]">
              <div>
                <h2 className="text-2xl md:text-3xl font-medium text-[#E6DBC7] tracking-wide mb-2">Live Rhythm</h2>
                <p className="text-base md:text-lg font-light text-[#E6DBC7]/60 mb-10">Regular moments to pause, regulate, and reconnect — together.</p>
              </div>
              <div className="space-y-9 md:space-y-10 lg:space-y-12">
                {/* Weekly Reset - Program Style Card */}
                <div 
                  onClick={() => {
                    if (!hasSubscription && !isAdmin && !isTestUser) {
                      setShowSubscriptionModal(true);
                    } else {
                      navigate('/online/live/weekly-reset');
                    }
                  }}
                  className="group relative flex flex-col lg:flex-row overflow-hidden rounded-2xl border border-white/[0.12] hover:border-white/25 transition-colors duration-500 cursor-pointer shadow-[0_0_60px_rgba(230,219,199,0.4)]" 
                  style={{
                    minHeight: '400px',
                    background: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.98) 55%)'
                  }}
                >
                  {/* Red Live/Video Badge - Top Right of Card */}
                  <div className="absolute top-6 right-6 z-10 flex items-center gap-3 bg-red-600/90 px-6 py-2 rounded-full">
                    <Video className="w-5 h-5 text-white" />
                    <span className="text-xs text-white font-medium uppercase tracking-wider">LIVE</span>
                  </div>
                  
                  <div className="relative lg:w-[52%] h-[240px] lg:h-auto lg:min-h-full shrink-0 overflow-hidden">
                    <img src={liveSessionsData.weeklyReset.image} alt={liveSessionsData.weeklyReset.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 hidden lg:block" style={{
                      background: 'linear-gradient(to right, transparent 20%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.98) 100%)'
                    }} />
                    <div className="absolute inset-0 lg:hidden" style={{
                      background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.98) 100%)'
                    }} />
                  </div>
                  <div className="relative flex-1 flex flex-col justify-center p-6 md:p-8 lg:py-10 lg:px-10 lg:pl-6 bg-black/95 lg:bg-transparent">
                    <div>
                      <div className="mb-5">
                        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] font-medium text-[#E6DBC7]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E6DBC7]" />
                          {liveSessionsData.weeklyReset.subtitle}
                        </span>
                      </div>
                      <h2 className="font-editorial text-[clamp(1.5rem,2.4vw,2.1rem)] text-[#E6DBC7] font-light leading-[1.2] mb-3 tracking-[-0.01em]">
                        {liveSessionsData.weeklyReset.title}
                      </h2>
                      <p className="font-editorial italic text-[14px] lg:text-[15px] text-[#E6DBC7]/65 mb-4 max-w-[340px] leading-[1.5]">
                        {liveSessionsData.weeklyReset.description}
                      </p>
                    </div>
                    
                    {/* Utility Icons */}
                    <div className="flex items-center gap-4 mt-6">
                      <IconButton 
                        size="lg"
                        onClick={(e) => { e.stopPropagation(); handleShareLiveSession('weeklyReset'); }}
                      >
                        <Share />
                      </IconButton>
                      
                      <Popover open={openCalendarId === 'weeklyReset'} onOpenChange={(open) => setOpenCalendarId(open ? 'weeklyReset' : null)}>
                        <PopoverTrigger asChild>
                          <IconButton 
                            size="lg"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Calendar />
                          </IconButton>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-auto p-0 bg-[#1A1A1A] border border-[#E6DBC7]/15 rounded-full shadow-lg"
                          align="start"
                          sideOffset={8}
                        >
                          <div className="flex items-center gap-0.5 px-3 py-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDownloadICal('weeklyReset'); }}
                              className="text-[#E6DBC7]/80 text-[12px] font-light tracking-wide hover:text-white transition-colors px-2.5 py-1 rounded-full hover:bg-white/5"
                            >
                              iCal
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleGoogleCalendar('weeklyReset'); }}
                              className="text-[#E6DBC7]/80 text-[12px] font-light tracking-wide hover:text-white transition-colors px-2.5 py-1 rounded-full hover:bg-white/5"
                            >
                              Google
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleOutlookCalendar('weeklyReset'); }}
                              className="text-[#E6DBC7]/80 text-[12px] font-light tracking-wide hover:text-white transition-colors px-2.5 py-1 rounded-full hover:bg-white/5"
                            >
                              Outlook
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="flex justify-start mt-6 lg:mt-8 lg:ml-auto lg:mr-8">
                      <GlowButton size="sm">
                        {liveSessionsData.weeklyReset.isLive ? 'Join Now' : 'Join Live'}
                      </GlowButton>
                    </div>
                  </div>
                </div>

                {/* Monthly Presence - Program Style Card */}
                <div 
                  onClick={() => {
                    if (!hasSubscription && !isAdmin && !isTestUser) {
                      setShowSubscriptionModal(true);
                    } else {
                      navigate('/online/live/monthly-presence');
                    }
                  }}
                  className="group relative flex flex-col lg:flex-row overflow-hidden rounded-2xl border border-white/[0.12] hover:border-white/25 transition-colors duration-500 cursor-pointer shadow-[0_0_60px_rgba(230,219,199,0.4)]" 
                  style={{
                    minHeight: '400px',
                    background: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.98) 55%)'
                  }}
                >
                  {/* Red Live/Video Badge - Top Right of Card */}
                  <div className="absolute top-6 right-6 z-10 flex items-center gap-3 bg-red-600/90 px-6 py-2 rounded-full">
                    <Video className="w-5 h-5 text-white" />
                    <span className="text-xs text-white font-medium uppercase tracking-wider">LIVE</span>
                  </div>
                  
                  <div className="relative lg:w-[52%] h-[240px] lg:h-auto lg:min-h-full shrink-0 overflow-hidden">
                    <img src={liveSessionsData.monthlyPresence.image} alt={liveSessionsData.monthlyPresence.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 hidden lg:block" style={{
                      background: 'linear-gradient(to right, transparent 20%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.98) 100%)'
                    }} />
                    <div className="absolute inset-0 lg:hidden" style={{
                      background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.98) 100%)'
                    }} />
                  </div>
                  <div className="relative flex-1 flex flex-col justify-center p-6 md:p-8 lg:py-10 lg:px-10 lg:pl-6 bg-black/95 lg:bg-transparent">
                    <div>
                      <div className="mb-5">
                        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] font-medium text-[#E6DBC7]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E6DBC7]" />
                          {liveSessionsData.monthlyPresence.subtitle}
                        </span>
                      </div>
                      <h2 className="font-editorial text-[clamp(1.5rem,2.4vw,2.1rem)] text-[#E6DBC7] font-light leading-[1.2] mb-3 tracking-[-0.01em]">
                        {liveSessionsData.monthlyPresence.title}
                      </h2>
                      <p className="font-editorial italic text-[14px] lg:text-[15px] text-[#E6DBC7]/65 mb-4 max-w-[340px] leading-[1.5]">
                        {liveSessionsData.monthlyPresence.description}
                      </p>
                    </div>
                    
                    {/* Utility Icons */}
                    <div className="flex items-center gap-4 mt-6">
                      <IconButton 
                        size="lg"
                        onClick={(e) => { e.stopPropagation(); handleShareLiveSession('monthlyPresence'); }}
                      >
                        <Share />
                      </IconButton>
                      
                      <Popover open={openCalendarId === 'monthlyPresence'} onOpenChange={(open) => setOpenCalendarId(open ? 'monthlyPresence' : null)}>
                        <PopoverTrigger asChild>
                          <IconButton 
                            size="lg"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Calendar />
                          </IconButton>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-auto p-0 bg-[#1A1A1A] border border-[#E6DBC7]/15 rounded-full shadow-lg"
                          align="start"
                          sideOffset={8}
                        >
                          <div className="flex items-center gap-0.5 px-3 py-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDownloadICal('monthlyPresence'); }}
                              className="text-[#E6DBC7]/80 text-[12px] font-light tracking-wide hover:text-white transition-colors px-2.5 py-1 rounded-full hover:bg-white/5"
                            >
                              iCal
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleGoogleCalendar('monthlyPresence'); }}
                              className="text-[#E6DBC7]/80 text-[12px] font-light tracking-wide hover:text-white transition-colors px-2.5 py-1 rounded-full hover:bg-white/5"
                            >
                              Google
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleOutlookCalendar('monthlyPresence'); }}
                              className="text-[#E6DBC7]/80 text-[12px] font-light tracking-wide hover:text-white transition-colors px-2.5 py-1 rounded-full hover:bg-white/5"
                            >
                              Outlook
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="flex justify-start mt-6 lg:mt-8 lg:ml-auto lg:mr-8">
                      <GlowButton size="sm">
                        {liveSessionsData.monthlyPresence.isLive ? 'Join Now' : 'Join Live'}
                      </GlowButton>
                    </div>
                  </div>
                </div>

                {/* Guest Session - Program Style Card */}
                <div 
                  onClick={() => {
                    if (!hasSubscription && !isAdmin && !isTestUser) {
                      setShowSubscriptionModal(true);
                    } else {
                      navigate('/online/live/guest-session');
                    }
                  }}
                  className="group relative flex flex-col lg:flex-row overflow-hidden rounded-2xl border border-white/[0.12] hover:border-white/25 transition-colors duration-500 cursor-pointer shadow-[0_0_60px_rgba(230,219,199,0.4)]" 
                  style={{
                    minHeight: '400px',
                    background: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.98) 55%)'
                  }}
                >
                  {/* Red Live/Video Badge - Top Right of Card */}
                  <div className="absolute top-6 right-6 z-10 flex items-center gap-3 bg-red-600/90 px-6 py-2 rounded-full">
                    <Video className="w-5 h-5 text-white" />
                    <span className="text-xs text-white font-medium uppercase tracking-wider">LIVE</span>
                  </div>
                  
                  <div className="relative lg:w-[52%] h-[240px] lg:h-auto lg:min-h-full shrink-0 overflow-hidden">
                    <img src={liveSessionsData.guestSession.image} alt={liveSessionsData.guestSession.title} className="absolute inset-0 w-full h-full object-cover object-bottom" loading="lazy" />
                    <div className="absolute inset-0 hidden lg:block" style={{
                      background: 'linear-gradient(to right, transparent 20%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.98) 100%)'
                    }} />
                    <div className="absolute inset-0 lg:hidden" style={{
                      background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.98) 100%)'
                    }} />
                  </div>
                  <div className="relative flex-1 flex flex-col justify-center p-6 md:p-8 lg:py-10 lg:px-10 lg:pl-6 bg-black/95 lg:bg-transparent">
                    <div>
                      <div className="mb-5">
                        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] font-medium text-[#E6DBC7]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E6DBC7]" />
                          {liveSessionsData.guestSession.subtitle}
                        </span>
                      </div>
                      <h2 className="font-editorial text-[clamp(1.5rem,2.4vw,2.1rem)] text-[#E6DBC7] font-light leading-[1.2] mb-3 tracking-[-0.01em]">
                        {liveSessionsData.guestSession.title}
                      </h2>
                      <p className="font-editorial italic text-[14px] lg:text-[15px] text-[#E6DBC7]/65 mb-4 max-w-[340px] leading-[1.5]">
                        {liveSessionsData.guestSession.description}
                      </p>
                    </div>
                    
                    {/* Utility Icons */}
                    <div className="flex items-center gap-4 mt-6">
                      <IconButton 
                        size="lg"
                        onClick={(e) => { e.stopPropagation(); handleShareLiveSession('guestSession'); }}
                      >
                        <Share />
                      </IconButton>
                      
                      <Popover open={openCalendarId === 'guestSession'} onOpenChange={(open) => setOpenCalendarId(open ? 'guestSession' : null)}>
                        <PopoverTrigger asChild>
                          <IconButton 
                            size="lg"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Calendar />
                          </IconButton>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-auto p-0 bg-[#1A1A1A] border border-[#E6DBC7]/15 rounded-full shadow-lg"
                          align="start"
                          sideOffset={8}
                        >
                          <div className="flex items-center gap-0.5 px-3 py-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDownloadICal('guestSession'); }}
                              className="text-[#E6DBC7]/80 text-[12px] font-light tracking-wide hover:text-white transition-colors px-2.5 py-1 rounded-full hover:bg-white/5"
                            >
                              iCal
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleGoogleCalendar('guestSession'); }}
                              className="text-[#E6DBC7]/80 text-[12px] font-light tracking-wide hover:text-white transition-colors px-2.5 py-1 rounded-full hover:bg-white/5"
                            >
                              Google
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleOutlookCalendar('guestSession'); }}
                              className="text-[#E6DBC7]/80 text-[12px] font-light tracking-wide hover:text-white transition-colors px-2.5 py-1 rounded-full hover:bg-white/5"
                            >
                              Outlook
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="flex justify-start mt-6 lg:mt-8 lg:ml-auto lg:mr-8">
                      <GlowButton size="sm">
                        {liveSessionsData.guestSession.isLive ? 'Join Now' : 'Join Live'}
                      </GlowButton>
                    </div>
                  </div>
                </div>

                {/* Live Replays Section */}
                <div className="mt-40">
                  <div className="my-10">
                    <h2 className="text-2xl md:text-3xl font-medium text-[#E6DBC7] tracking-wide mb-2">
                      Live Replays
                    </h2>
                    <p className="text-base md:text-lg font-light text-[#E6DBC7]/60">
                      Catch up on sessions you may have missed
                    </p>
                  </div>

                  {/* Weekly Reset & Monthly Replays - Two boxes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {/* Weekly Reset Replay */}
                    <div className="group relative overflow-hidden rounded-2xl border border-[#E6DBC7]/15 bg-black/40 hover:border-[#E6DBC7]/30 transition-colors duration-500 cursor-pointer">
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={weeklyResetEvent} 
                          alt="Weekly Reset Replay" 
                          className="absolute inset-0 w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#E6DBC7]/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <Video className="w-3.5 h-3.5 text-[#E6DBC7]" />
                          <span className="text-xs text-[#E6DBC7] font-medium">Available 7 days</span>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-[#E6DBC7]/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-[#E6DBC7]/30 transition-colors duration-300">
                            <Play className="w-6 h-6 text-[#E6DBC7] ml-1" fill="currentColor" />
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <p className="text-xs text-[#D4A574] font-medium tracking-[0.15em] uppercase mb-2">
                          Weekly Reset
                        </p>
                        <h3 className="text-lg font-editorial text-[#E6DBC7] mb-1">
                          Latest Session Replay
                        </h3>
                        <p className="text-xs text-[#E6DBC7]/50 font-light">
                          December 17, 2024 • 30 mins
                        </p>
                      </div>
                    </div>

                    {/* Monthly Presence Replay */}
                    <div className="group relative overflow-hidden rounded-2xl border border-[#E6DBC7]/15 bg-black/40 hover:border-[#E6DBC7]/30 transition-colors duration-500 cursor-pointer">
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={heroHandsSession} 
                          alt="Monthly Presence Replay" 
                          className="absolute inset-0 w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#E6DBC7]/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <Video className="w-3.5 h-3.5 text-[#E6DBC7]" />
                          <span className="text-xs text-[#E6DBC7] font-medium">Available 30 days</span>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-[#E6DBC7]/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-[#E6DBC7]/30 transition-colors duration-300">
                            <Play className="w-6 h-6 text-[#E6DBC7] ml-1" fill="currentColor" />
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <p className="text-xs text-[#D4A574] font-medium tracking-[0.15em] uppercase mb-2">
                          Monthly Breath & Presence
                        </p>
                        <h3 className="text-lg font-editorial text-[#E6DBC7] mb-1">
                          Latest Session Replay
                        </h3>
                        <p className="text-xs text-[#E6DBC7]/50 font-light">
                          December 8, 2024 • 90 mins
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Guest Teacher Replays - Carousel style */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-xs text-[#D4A574] font-medium tracking-[0.15em] uppercase mb-1">
                          Guest Teacher Replays
                        </p>
                        <p className="text-sm text-[#E6DBC7]/50 font-light">
                          Available forever
                        </p>
                      </div>
                      {/* Navigation arrows - shown when more than 3 items */}
                      <div className="flex items-center gap-3">
                        <IconButton>
                          <ChevronLeft />
                        </IconButton>
                        <IconButton>
                          <ChevronRight />
                        </IconButton>
                      </div>
                    </div>

                    {/* Guest session cards in carousel style */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Guest Session Card 1 */}
                      <div className="group relative overflow-hidden rounded-2xl border border-[#E6DBC7]/15 bg-black/40 hover:border-[#E6DBC7]/30 transition-colors duration-500 cursor-pointer">
                        <div className="relative h-44 overflow-hidden">
                          <img 
                            src={guestSessionBg} 
                            alt="Guest Session" 
                            className="absolute inset-0 w-full h-full object-cover object-bottom"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-12 h-12 rounded-full bg-[#E6DBC7]/20 backdrop-blur-sm flex items-center justify-center">
                              <Play className="w-5 h-5 text-[#E6DBC7] ml-0.5" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                        <div className="p-5">
                          <p className="text-[10px] text-[#D4A574] font-medium tracking-[0.15em] uppercase mb-2">
                            Coming Soon
                          </p>
                          <h3 className="text-base font-editorial text-[#E6DBC7] mb-1 leading-tight">
                            Guest Teacher Session
                          </h3>
                          <p className="text-xs text-[#E6DBC7]/50 font-light">
                            First session coming January 2025
                          </p>
                        </div>
                      </div>

                      {/* Placeholder for future guest sessions */}
                      <div className="group relative overflow-hidden rounded-2xl border border-dashed border-[#E6DBC7]/15 bg-black/20 flex items-center justify-center min-h-[280px]">
                        <p className="text-sm text-[#E6DBC7]/30 font-light text-center px-6">
                          More guest sessions coming soon
                        </p>
                      </div>

                      <div className="group relative overflow-hidden rounded-2xl border border-dashed border-[#E6DBC7]/15 bg-black/20 flex items-center justify-center min-h-[280px]">
                        <p className="text-sm text-[#E6DBC7]/30 font-light text-center px-6">
                          More guest sessions coming soon
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Studio Footer - shown on mobile with bottom padding for sticky tabs */}
          <div className="block md:hidden">
            <StudioFooter />
          </div> 
        </div>

      {/* Main Footer - hidden on mobile where sticky tabs are shown */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Modals */}
      <Suspense fallback={null}>
        <SubscriptionModal open={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} />
      </Suspense>

      <SessionDetailModal sessionId={selectedSessionId} open={!!selectedSessionId} onClose={() => setSelectedSessionId(null)} />
    </div>;
};
export default Studio;
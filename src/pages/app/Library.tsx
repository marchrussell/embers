// Library page - Categories: CALM, ENERGY, TRANSFORM, SLEEP, RESILIENCE & CAPACITY
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/contexts/AuthContext";
import { useFavourites } from "@/hooks/useFavourites";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Heart, Lock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import SessionDetailModal from "./SessionDetail";
// Import only critical images needed for UI elements and fallbacks
import energyCategoryImage from "@/assets/energy-ocean-sunset.jpg";
import { ArcCardsModal } from "@/components/ArcCardsModal";
import { FeedbackSection } from "@/components/FeedbackSection";
import { OptimizedImage } from "@/components/OptimizedImage";
import { CategoryCardSkeleton } from "@/components/skeletons/CategoryCardSkeleton";
import { FeaturedHeroSkeleton } from "@/components/skeletons/FeaturedHeroSkeleton";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { IconButton } from "@/components/ui/icon-button";
import { programImages } from "@/lib/sharedAssets";
import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/supabaseImageOptimization";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

interface LibraryProps {
  isEmbedded?: boolean;
  onClearCategory?: () => void;
  shouldClearCategory?: boolean;
}

const Library = ({ isEmbedded = false, onClearCategory, shouldClearCategory = false }: LibraryProps) => {
  const { user, hasSubscription, isAdmin, isTestUser, loading: authLoading } = useAuth();
  const { favouriteIds } = useFavourites();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [featuredSession, setFeaturedSession] = useState<any>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [favouriteSessions, setFavouriteSessions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [classesByCategory, setClassesByCategory] = useState<Record<string, any[]>>({});
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showArcCardsModal, setShowArcCardsModal] = useState(false);
  const nervousSystemProgramRef = useRef<HTMLDivElement>(null);
  const favouritesScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll state for favourites
  const checkFavouritesScroll = () => {
    if (favouritesScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = favouritesScrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollFavourites = (direction: 'left' | 'right') => {
    if (favouritesScrollRef.current) {
      const scrollAmount = 280; // Width of card + gap
      favouritesScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Update scroll state when favourites change
  useEffect(() => {
    checkFavouritesScroll();
  }, [favouriteSessions]);

  // Fetch full session data when favouriteIds change (from useFavourites hook)
  useEffect(() => {
    const fetchFavouriteSessions = async () => {
      if (favouriteIds.length === 0) {
        setFavouriteSessions([]);
        return;
      }

      const { data: sessionsData } = await supabase
        .from('classes')
        .select('*')
        .in('id', favouriteIds)
        .eq('is_published', true);

      if (sessionsData) {
        setFavouriteSessions(sessionsData.map(s => ({
          id: s.id,
          title: s.title,
          duration: s.duration_minutes,
          teacher: s.teacher_name,
          image: s.image_url,
          locked: s.requires_subscription && !hasSubscription && !isAdmin && !isTestUser
        })));
      }
    };

    fetchFavouriteSessions();
  }, [favouriteIds, hasSubscription, isAdmin, isTestUser]);

  // Allow unauthenticated users to browse - they'll be prompted when accessing locked content

  // Scroll to top when page loads or category/program changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Clear selected category when shouldClearCategory changes to true
  useEffect(() => {
    if (shouldClearCategory) {
      setSelectedCategory(null);
      setSelectedProgram(null);
      onClearCategory?.();
    }
  }, [shouldClearCategory, onClearCategory]);

  // Check for scroll intent from URL params
  useEffect(() => {
    const scrollTo = searchParams.get('scrollTo');
    if (scrollTo === 'nervous-system' && nervousSystemProgramRef.current) {
      // Wait a bit for content to load
      setTimeout(() => {
        nervousSystemProgramRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [searchParams, isLoadingData]);

  // Check for session param from homepage - open session modal immediately
  useEffect(() => {
    const sessionId = searchParams.get('session');
    if (sessionId) {
      setSelectedSessionId(sessionId);
      // Clear the URL param without navigating
      navigate('/studio', { replace: true });
    }
  }, [searchParams, navigate]);

  // Scroll to top when category is selected
  useEffect(() => {
    if (selectedCategory) {
      window.scrollTo(0, 0);
    }
  }, [selectedCategory]);

  // Set profile from user metadata immediately
  useEffect(() => {
    if (user) {
      // Try to get name from user metadata first (instant)
      const metadataName = user.user_metadata?.full_name;
      if (metadataName) {
        setUserProfile({ full_name: metadataName });
      }
    }
  }, [user]);

  // Fetch featured session, programs, database profile, favourites, categories, and classes
  // NOTE: We fetch data IMMEDIATELY - don't wait for auth to complete
  // The locked state of sessions will update when auth completes (via dependency array)
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        
        // Fetch featured session (non-blocking)
        void supabase
          .from('featured_class')
          .select('*')
          .eq('is_active', true)
          .maybeSingle()
          .then(({ data: featured, error: featuredError }) => {
            if (isMounted && !featuredError && featured) {
              setFeaturedSession(featured);
            }
          });

        // Fetch programs (non-blocking)
        void supabase
          .from('programs')
          .select('*, requires_subscription')
          .eq('is_published', true)
          .then(({ data: programsData }) => {
            if (isMounted && programsData) setPrograms(programsData);
          });

        // Fetch categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (!isMounted) return;

        if (categoriesData) {
          setCategories(categoriesData);
          
          // Fetch classes for each category
          const { data: classesData } = await supabase
            .from('classes')
            .select('*, requires_subscription, created_at')
            .eq('is_published', true)
            .order('order_index');

          if (!isMounted) return;

          if (classesData) {
            // Group classes by category
            const grouped = classesData.reduce((acc: Record<string, any[]>, classItem) => {
              if (classItem.category_id) {
                if (!acc[classItem.category_id]) {
                  acc[classItem.category_id] = [];
                }
                acc[classItem.category_id].push({
                  id: classItem.id,
                  title: classItem.title,
                  description: classItem.description || classItem.short_description,
                  duration: classItem.duration_minutes,
                  teacher: classItem.teacher_name,
                  image: classItem.image_url,
                  locked: classItem.requires_subscription && !hasSubscription && !isAdmin && !isTestUser,
                  created_at: classItem.created_at
                });
              }
              return acc;
            }, {});
            
            setClassesByCategory(grouped);
          }
        }


        // Fetch profile from database (fallback if metadata doesn't have it)
        if (user?.id && !userProfile) {
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', user.id)
              .maybeSingle();
            
            if (isMounted && !error && profile?.full_name) {
              setUserProfile(profile);
            }
          } catch (err) {
            // Silent failure - will use metadata name
          }
        }
      } catch (error) {
        console.error('Library: Error fetching data:', error);
      } finally {
        if (isMounted) {
          setIsLoadingData(false);
        }
      }
    };

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [user?.id, userProfile, hasSubscription, isAdmin, isTestUser]); // Re-fetch when user, subscription, admin, or test user status changes
  
  // Handle URL category parameter
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && categories.length > 0) {
      const matchingCategory = categories.find(cat => cat.name === categoryParam);
      if (matchingCategory) {
        // Build the category with sessions like we do in categoriesWithSessions
        let displayName = matchingCategory.name;
        let displayDescription = matchingCategory.description;
        
        if (matchingCategory.name === 'CALM') {
          displayDescription = "Find Your Center. Organize your nervous system and restore a sense of peace.";
        } else if (matchingCategory.name === 'ENERGY') {
          displayDescription = "Activate your body's natural currents and feel life move through you.";
        } else if (matchingCategory.name === 'SLEEP') {
          displayDescription = "Train your nervous system to downregulate naturally. Start here when you're tired but wired and need real restoration.";
        } else if (matchingCategory.name === 'TRANSFORM') {
          displayDescription = "Transform your state. Reset your nervous system in minutes. Short practices effective for stress relief and overwhelm.";
        } else if (matchingCategory.name === 'RESILIENCE & CAPACITY') {
          displayDescription = "Build lasting resilience and expand your capacity. Guided practices to deepen your practice and strengthen your inner resources.";
        }
        
        const categoryWithSessions = {
          id: matchingCategory.id,
          name: displayName,
          description: displayDescription,
          image: matchingCategory.image_url || programImages.breathingBasics,
          sessions: classesByCategory[matchingCategory.id] || []
        };
        
        setSelectedCategory(categoryWithSessions);
      }
    }
  }, [searchParams, categories, classesByCategory]);

  const handleShare = (session: any) => {
    const shareUrl = `${window.location.origin}/shared-session/${session.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard!");
  };

  // Build categories array with fetched classes and sort in desired order
  const categoryOrder = ['CALM', 'ENERGY', 'TRANSFORM', 'SLEEP', 'RESILIENCE & CAPACITY'];
  const sortedCategories = [...categories].sort((a, b) => {
    const indexA = categoryOrder.indexOf(a.name);
    const indexB = categoryOrder.indexOf(b.name);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });
  
  const categoriesWithSessions = sortedCategories.map((cat) => {
    // Map category names and descriptions
    let displayName = cat.name;
    let displayDescription = cat.description;
    
    // Update descriptions based on category name
    if (cat.name === 'CALM') {
      displayDescription = "Find Your Center. Organize your nervous system and restore a sense of peace.";
    } else if (cat.name === 'ENERGY') {
      displayDescription = "Activate your body's natural currents and feel life move through you.";
    } else if (cat.name === 'SLEEP') {
      displayDescription = "Train your nervous system to downregulate naturally. Start here when you're tired but wired and need real restoration.";
    } else if (cat.name === 'TRANSFORM') {
      displayDescription = "Transform your state. Reset your nervous system in minutes. Short practices effective for stress relief and overwhelm.";
    } else if (cat.name === 'RESILIENCE & CAPACITY') {
      displayDescription = "Build lasting resilience and expand your capacity. Guided practices to deepen your practice and strengthen your inner resources.";
    }
    
    // Override image for ENERGY category with local asset
    let categoryImage = cat.image_url || programImages.breathingBasics;
    if (cat.name === 'ENERGY') {
      categoryImage = energyCategoryImage;
    }
    
    return {
      id: cat.id,
      name: displayName,
      description: displayDescription,
      image: categoryImage,
      sessions: classesByCategory[cat.id] || []
    };
  });

  const handleSessionClick = (sessionId: string) => {
    console.log('🎯 handleSessionClick called with ID:', sessionId, 'Type:', typeof sessionId);
    
    if (!sessionId) {
      console.error('❌ Session ID is falsy:', sessionId);
      toast.error("Session not found");
      return;
    }
    
    console.log('✅ Setting selected session ID to:', sessionId);
    setSelectedSessionId(sessionId);
  };

  // Program data with mock sessions
  const programsData = [
    {
      id: 'breathing-basics',
      title: 'Breathing Basics: Master Your Foundation',
      description: 'Build a strong foundation in breathing techniques and discover the power of conscious breath.',
      image: programImages.breathingBasics,
      classCount: 5,
      locked: false,
      sessions: [
        { id: '1', title: 'Introduction to Breathwork', teacher: 'March Russell', duration: 10, image: programImages.breathingBasics, locked: false },
        { id: '2', title: 'Diaphragmatic Breathing', teacher: 'March Russell', duration: 12, image: programImages.breathingBasics, locked: false },
        { id: '3', title: 'Box Breathing Technique', teacher: 'March Russell', duration: 15, image: programImages.breathingBasics, locked: false },
        { id: '4', title: 'Alternate Nostril Breathing', teacher: 'March Russell', duration: 10, image: programImages.breathingBasics, locked: false },
        { id: '5', title: 'Coherent Breathing Practice', teacher: 'March Russell', duration: 18, image: programImages.breathingBasics, locked: false },
      ]
    },
    {
      id: 'nervous-system',
      title: 'Change Starts With Your Nervous System',
      description: 'Transform your relationship with stress through breathwork and nervous system regulation.',
      image: programImages.trial,
      classCount: 7,
      locked: true,
      sessions: [
        { id: '1', title: 'Understanding Your Nervous System', teacher: 'March Russell', duration: 12, image: programImages.trial, locked: true },
        { id: '2', title: 'Vagal Tone Activation', teacher: 'March Russell', duration: 15, image: programImages.trial, locked: true },
        { id: '3', title: 'Stress Response Reset', teacher: 'March Russell', duration: 10, image: programImages.trial, locked: true },
        { id: '4', title: 'Nervous System Regulation', teacher: 'March Russell', duration: 20, image: programImages.trial, locked: true },
        { id: '5', title: 'Building Resilience', teacher: 'March Russell', duration: 18, image: programImages.trial, locked: true },
        { id: '6', title: 'Integration Practice', teacher: 'March Russell', duration: 15, image: programImages.trial, locked: true },
        { id: '7', title: 'Daily Regulation Routine', teacher: 'March Russell', duration: 12, image: programImages.trial, locked: true },
      ]
    },
    {
      id: 'finding-aliveness',
      title: 'Finding Your Aliveness',
      description: 'Access breakthrough states and reconnect with your vitality through expansive breathwork practices.',
      image: programImages.findingAliveness,
      classCount: 3,
      locked: true,
      sessions: [
        { id: '1', title: 'Awakening Vitality', teacher: 'March Russell', duration: 20, image: programImages.findingAliveness, locked: true },
        { id: '2', title: 'Expansive Breathwork', teacher: 'March Russell', duration: 25, image: programImages.findingAliveness, locked: true },
        { id: '3', title: 'Living Fully Alive', teacher: 'March Russell', duration: 30, image: programImages.findingAliveness, locked: true },
      ]
    }
  ];

  const handleProgramClick = (programId: string) => {
    const program = programsData.find(p => p.id === programId);
    if (program) {
      if (program.locked && !hasSubscription && !isAdmin && !isTestUser) {
        setShowSubscriptionModal(true);
      } else {
        setSelectedProgram(program);
        window.scrollTo(0, 0);
      }
    }
  };

  // Show loading screen while auth or data is loading
  // Respect isEmbedded prop - skip NavBar when embedded in Studio
  if (authLoading || isLoadingData) {
    if (isEmbedded) {
      // Embedded loading state - no NavBar, just skeleton content
      return (
        <div className="px-6 pb-24">
          <div className="mb-20 pt-8">
            <div className="h-8 w-40 bg-muted animate-pulse mb-2 rounded" />
            <div className="h-5 w-80 bg-muted/50 animate-pulse mb-10 rounded" />
            <div className="grid grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <CategoryCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    // Standalone loading state - with NavBar
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="px-6 pt-80 md:pt-96 lg:pt-80 pb-24">
          <div className="container mx-auto max-w-6xl space-y-20">
            <FeaturedHeroSkeleton />
            <div>
              <div className="h-6 w-32 bg-muted animate-pulse mb-8 rounded" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => <CategoryCardSkeleton key={i} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine which view to render
  let viewContent;

  if (selectedCategory) {
    // Category View
    viewContent = (
      <div className="min-h-screen bg-background pb-24">
        {/* Category Hero Header - matches StartHere/Favourites layout exactly */}
        {/* Use negative margins to break out of parent padding when embedded */}
        <div className={`relative h-[420px] z-10 ${isEmbedded ? '-mx-6 md:-mx-10 lg:-mx-12 mt-[150px]' : 'mt-[340px] md:mt-[380px]'}`}>
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
            style={{ 
              backgroundImage: `url('${getOptimizedImageUrl(selectedCategory.image, IMAGE_PRESETS.hero)}')`
            }}
          />
          <div className={`absolute inset-0 ${
            selectedCategory.name === 'AWAKEN' || selectedCategory.name === 'RELEASE'
              ? 'bg-black/40' 
              : selectedCategory.name === 'ENERGY'
              ? 'bg-black/25'
              : 'bg-black/30'
          }`} />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
          
          <div className="relative h-full flex items-end px-6 md:px-10 lg:px-12 pb-14">
            <div className="w-full">
              <p className="text-[#D4A574] text-sm tracking-[0.15em] uppercase font-light mb-3">
                {selectedCategory.sessions.length} Sessions
              </p>
              <h1 className="text-5xl md:text-6xl font-editorial text-[#E6DBC7]">
                {selectedCategory.name}
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content - matches StartHere layout */}
        <div className={`pt-16 ${isEmbedded ? '' : 'px-6 md:px-12 lg:px-20'}`}>
          
          {/* Subtitle - matches StartHere */}
          <p className="text-xl md:text-2xl text-[#E6DBC7]/80 font-editorial italic leading-relaxed mb-20">
            {selectedCategory.description}
          </p>

          {/* Session List - matching Home page featured card design */}
          <div className="grid gap-4 md:gap-5">
            {selectedCategory.sessions
              .sort((a: any, b: any) => {
                // Sort free classes (locked: false) to the top
                if (a.locked === b.locked) return 0;
                return a.locked ? 1 : -1;
              })
              .map((session: any) => {
              return (
              <div
                key={session.id}
                onClick={() => {
                  if (session.locked && !hasSubscription) {
                    setShowSubscriptionModal(true);
                  } else {
                    handleSessionClick(session.id);
                  }
                }}
                className="group cursor-pointer overflow-hidden rounded-xl border border-[#E6DBC7]/20 transition-all shadow-[0_8px_30px_rgba(230,219,199,0.1)] hover:border-[#E6DBC7]/30"
              >
                <div className="flex h-[140px] md:h-[160px] lg:h-[180px]">
                  {/* Image - Left, fills full height */}
                  <div 
                    className="relative w-[140px] md:w-[200px] lg:w-[240px] h-full flex-shrink-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${getOptimizedImageUrl(session.image, IMAGE_PRESETS.card)}')` }}
                  >
                    <div className="absolute inset-0 bg-black/0" />
                    
                    {/* NEW Badge - show if created within last 7 days */}
                    {session.created_at && (() => {
                      const createdDate = new Date(session.created_at);
                      const daysSinceCreation = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
                      return daysSinceCreation <= 7 && (
                        <div className="absolute top-3 left-3 z-10">
                          <span className="text-[10px] text-amber-400 font-medium">✨ NEW</span>
                        </div>
                      );
                    })()}
                    {session.locked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                        <Lock className="w-6 h-6 text-[#E6DBC7]" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  
                  {/* Glassmorphism Content - Right */}
                  <div className="flex-1 flex items-center justify-between gap-4 px-6 md:px-10 py-6 backdrop-blur-xl bg-black/30 border-l border-white/5">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-editorial text-[#E6DBC7] mb-2">
                        {session.title}
                      </h3>
                      <p className="text-sm md:text-base text-[#E6DBC7]/60 font-light mb-3 leading-relaxed line-clamp-2">
                        {session.description || `A ${session.duration} minute practice to help you ${selectedCategory.name.toLowerCase()}.`}
                      </p>
                      <p className="text-xs md:text-sm text-[#E6DBC7]/40 font-light">
                        {session.teacher} • {session.duration} min
                      </p>
                    </div>
                  
                    {/* Action Buttons */}
                    <div className="flex items-center">
                      {/* Play Button */}
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
              </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  } else if (selectedProgram) {
    // Program View
    viewContent = (
      <div className="min-h-screen bg-background pb-24">
          {/* Spacer for navbar and header */}
          <div className="h-[284px] bg-background" />
          
          {/* Program Hero Header */}
        <div className="relative h-[280px] z-10">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
            style={{ 
              backgroundImage: `url('${getOptimizedImageUrl(selectedProgram.image, IMAGE_PRESETS.hero)}')`
            }}
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
          
          <div className="relative h-full flex items-end px-6 pb-8">
            <div className="w-full">
              <h1 className="text-5xl md:text-6xl font-editorial text-[#E6DBC7] mb-4">
                {selectedProgram.title}
              </h1>
              <p className="text-base md:text-lg text-[#E6DBC7]/80 font-light mb-3 leading-relaxed max-w-2xl">
                {selectedProgram.description}
              </p>
              <p className="text-sm md:text-base text-[#EC9037] font-light tracking-[0.15em] uppercase">
                {selectedProgram.classCount} Classes
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pt-12">
          {/* Session List */}
          <div className="grid gap-4">
            {selectedProgram.sessions.map((session: any) => {
              return (
              <div
                key={session.id}
                onClick={() => {
                  if (session.locked && !hasSubscription) {
                    setShowSubscriptionModal(true);
                  } else {
                    handleSessionClick(session.id);
                  }
                }}
                className="relative overflow-hidden cursor-pointer group rounded-lg transition-all hover:shadow-[0_8px_30px_rgba(230,219,199,0.15)]"
              >
                <div className="flex items-center gap-4 p-4 bg-transparent hover:bg-[#E6DBC7]/5 transition-all border border-[#E6DBC7]/10 hover:border-[#E6DBC7]/20 rounded-lg">
                  {/* Thumbnail */}
                  <div 
                    className="relative w-20 h-20 bg-cover bg-center flex-shrink-0 rounded overflow-hidden"
                    style={{ backgroundImage: `url('${getOptimizedImageUrl(session.image, IMAGE_PRESETS.thumbnail)}')` }}
                  >
                    <div className="absolute inset-0 bg-black/15" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent group-hover:from-background/20 transition-all" />
                    {session.locked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                        <Lock className="w-5 h-5 text-[#E6DBC7]" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-editorial text-[#E6DBC7] mb-1 truncate">
                      {session.title}
                    </h3>
                    <p className="text-sm text-[#E6DBC7]/60 font-light">
                      {session.teacher} • {session.duration} min • Technique
                    </p>
                  </div>
                
                  {/* Play Button */}
                  {!session.locked && (
                    <div className="flex items-center gap-2 pr-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSessionClick(session.id);
                        }}
                        className="p-2 rounded-full hover:bg-[#E6DBC7]/5 transition-all"
                      >
                        <svg className="w-5 h-5 text-[#E6DBC7] transition-all" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  } else {
    // Main Library View
    viewContent = (
      <div className="min-h-screen bg-background pb-24">
        {/* Sign In / Profile Button - positioned below navbar */}
        {!isEmbedded && (
          <div className="fixed top-36 md:top-40 lg:top-36 right-8 md:right-12 lg:right-16 z-50">
            {user ? (
              <Link
                to="/studio/profile"
                className="block px-6 py-2 rounded-full border border-white/60 text-white/90 text-sm font-light tracking-wider uppercase hover:bg-white/10 hover:border-white transition-all cursor-pointer"
              >
                {userProfile?.full_name?.split(' ')[0] || 'Profile'}
              </Link>
            ) : (
              <Link
                to="/auth"
                className="block px-6 py-2 rounded-full border border-white/60 text-white/90 text-sm font-light tracking-wider uppercase hover:bg-white/10 hover:border-white transition-all cursor-pointer"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
        <div className={isEmbedded ? "pt-8 md:pt-[150px]" : "px-6 pt-80 md:pt-96 lg:pt-80"}>
            {/* Show skeleton loaders while auth or data is loading */}
            {(authLoading || isLoadingData) ? (
              <>

                {/* Categories skeleton */}
                <div>
                  <h2 className="text-2xl md:text-3xl font-medium text-[#E6DBC7] tracking-wide mb-2">Browse by Category</h2>
                  <p className="text-base md:text-lg font-light text-[#E6DBC7]/60 mb-10">Move at your own pace — return anytime.</p>
                  <div className="grid grid-cols-2 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <CategoryCardSkeleton key={i} />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>

            {/* Categories Grid */}
            <div>
              <h2 className="text-2xl md:text-3xl font-medium text-[#E6DBC7] tracking-wide mb-2">Browse by Category</h2>
              <p className="text-base md:text-lg font-light text-[#E6DBC7]/60 mb-10">Move at your own pace — return anytime.</p>
              <div className="grid grid-cols-2 gap-6">
                {categoriesWithSessions.filter(category => category && category.image && category.name !== 'MEDITATIONS').map((category) => (
                  <div
                    key={category.id}
                    onClick={() => setSelectedCategory(category)}
                    className="relative overflow-hidden cursor-pointer group rounded-lg transition-all h-56"
                  >
                    {/* Background Image */}
                    <OptimizedImage
                      src={category.image}
                      alt={category.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      optimizationOptions={IMAGE_PRESETS.categoryCard}
                      loading="lazy"
                    />
                    <div className={`absolute inset-0 ${
                      category.name === 'AWAKEN' || category.name === 'ENERGY' || category.name === 'RELEASE'
                        ? 'bg-black/30' 
                        : 'bg-black/15'
                    }`} />
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                    
                    {/* Content */}
                    <div className="relative h-full flex flex-col justify-end p-6">
                      <h3 className="text-4xl font-editorial text-[#E6DBC7] mb-3">
                        {category.name}
                      </h3>
                      <p className="text-base md:text-lg font-light text-[#E6DBC7]/70">{category.sessions.length} sessions</p>
                    </div>
                  </div>
                ))}
              </div>
              
              
              {/* Favourites Section - Only shown for authenticated users */}
              {user && (
                <div className="mt-24 md:mt-32 mb-48">
                  {/* Header with arrows */}
                  <div className="flex items-center justify-between mb-10">
                    <Link to="/studio/favourites" className="group inline-flex items-center gap-3">
                      <h2 className="text-2xl md:text-3xl font-bold text-[#E6DBC7]">
                        Favourites
                      </h2>
                      <Heart className="w-6 h-6 text-white fill-white transition-colors" strokeWidth={1.5} />
                    </Link>

                    {/* Scroll Arrows */}
                    {favouriteSessions.length > 4 && (
                      <div className="hidden md:flex items-center gap-2">
                        <IconButton
                          size="sm"
                          onClick={() => scrollFavourites('left')}
                          disabled={!canScrollLeft}
                          className={!canScrollLeft ? 'border-[#E6DBC7]/15 text-[#E6DBC7]/20 shadow-none hover:shadow-none' : ''}
                        >
                          <ChevronLeft strokeWidth={1.5} />
                        </IconButton>
                        <IconButton
                          size="sm"
                          onClick={() => scrollFavourites('right')}
                          disabled={!canScrollRight}
                          className={!canScrollRight ? 'border-[#E6DBC7]/15 text-[#E6DBC7]/20 shadow-none hover:shadow-none' : ''}
                        >
                          <ChevronRight strokeWidth={1.5} />
                        </IconButton>
                      </div>
                    )}
                  </div>

                  {/* Sessions or Empty State */}
                  {favouriteSessions.length > 0 ? (
                    <div
                      ref={favouritesScrollRef}
                      onScroll={checkFavouritesScroll}
                      className="flex gap-10 overflow-x-auto pb-4 scrollbar-hide"
                    >
                      {favouriteSessions.map((session) => (
                        <div
                          key={session.id}
                          onClick={() => {
                            if (session.locked && !hasSubscription) {
                              setShowSubscriptionModal(true);
                            } else {
                              handleSessionClick(session.id);
                            }
                          }}
                          className="flex-shrink-0 w-52 cursor-pointer group"
                        >
                          {/* Session Image */}
                          <div className="relative w-52 h-52 mb-4 overflow-hidden rounded-lg">
                            <div
                              className="relative w-full h-full bg-cover bg-center transition-opacity duration-500"
                              style={{
                                backgroundImage: `url('${getOptimizedImageUrl(session.image, IMAGE_PRESETS.thumbnail)}')`,
                                filter: 'brightness(0.98) contrast(0.95) saturate(0.95)'
                              }}
                            >
                              {session.locked && (
                                <div className="absolute top-2 right-2">
                                  <Lock className="w-5 h-5 text-white/80" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Session Info */}
                          <div className="flex-1">
                            <h3 className="font-normal text-white text-base mb-1 line-clamp-2">
                              {session.title}
                            </h3>
                            <p className="text-sm text-white/60 font-light">
                              {session.teacher}
                            </p>
                            <p className="text-sm text-white/40 font-light">
                              {session.duration} min
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-white/50 text-base font-light">
                        Sessions you love will appear here. Tap the heart on any practice to save it.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Old horizontal scrolling code removed */}
            {categoriesWithSessions.map((category) => (
              <div key={category.id} className="hidden">
                {/* Horizontal Scrolling Session Cards */}
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {category.sessions.slice(0, 5).map((session: any) => {
                    return (
                    <div
                      key={session.id}
                      onClick={() => {
                        if (session.locked && !hasSubscription) {
                          setShowSubscriptionModal(true);
                        } else {
                          handleSessionClick(session.id);
                        }
                      }}
                      className="flex-shrink-0 w-40 cursor-pointer group"
                    >
                      {/* Session Image */}
                      <div className="relative w-40 h-40 mb-3 overflow-hidden">
                        <div 
                          className="relative w-full h-full bg-cover bg-center transition-opacity duration-500"
                          style={{ 
                            backgroundImage: `url('${getOptimizedImageUrl(session.image, IMAGE_PRESETS.thumbnail)}')`,
                            filter: 'brightness(0.98) contrast(0.95) saturate(0.95)',
                            transition: 'filter 0.5s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.filter = 'brightness(1.03) contrast(0.92) saturate(1.05) hue-rotate(-5deg)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.filter = 'brightness(0.98) contrast(0.95) saturate(0.95)';
                          }}
                        >
                          <div className="absolute inset-0 bg-[#d4a574] opacity-0 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-[0.08] pointer-events-none" />
                          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")' }} />
                        </div>
                      </div>

                      {/* Session Info */}
                      <div className="flex-1">
                        <h3 className="font-normal text-white text-base mb-1 line-clamp-2">
                          {session.title}
                        </h3>
                        <p className="text-sm text-white/60 font-light flex items-center gap-1.5">
                          {session.duration} min <span className="text-xl leading-none">•</span> {session.teacher}
                        </p>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            ))}


            {/* Feedback Section */}
            <div className="mt-1">
              <FeedbackSection />
            </div>
            
            {/* ARC Mentorship CTA */}
            <div className="mt-24 mb-16 text-center max-w-2xl mx-auto px-6">
              <p className="text-white/90 text-lg md:text-xl font-light leading-relaxed mb-2">
                Looking for deeper, guided support?
              </p>
              <p className="text-white/70 text-base md:text-lg font-light leading-relaxed mb-6">
                For those wanting a more personalised, relational process, ARC mentorship is available by application.
              </p>
              <button 
                onClick={() => setShowArcCardsModal(true)}
                className="inline-flex items-center gap-3 text-white/90 text-base font-light hover:text-white transition-colors"
              >
                <span>Learn about ARC</span>
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
              </>
            )}
          </div>
      </div>
    );
  }

  // Return the complete component with modal always present
  // When embedded in Studio tabs, skip NavBar and modals (Studio handles those)
  if (isEmbedded) {
    return (
      <>
        {viewContent}
        
        <SessionDetailModal
          sessionId={selectedSessionId}
          open={!!selectedSessionId}
          onClose={() => {
            console.log('🔴 MODAL CLOSING (embedded)');
            setSelectedSessionId(null);
          }}
          onShowSubscription={() => setShowSubscriptionModal(true)}
          isFeaturedClass={featuredSession?.class_id === selectedSessionId}
        />
        
        <SubscriptionModal
          open={showSubscriptionModal} 
          onClose={() => setShowSubscriptionModal(false)} 
        />
        
        <ArcCardsModal 
          open={showArcCardsModal} 
          onOpenChange={setShowArcCardsModal} 
        />
      </>
    );
  }

  return (
    <>
      <NavBar />
      <SubscriptionModal
        open={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
      />
      
      {viewContent}
      
      <SessionDetailModal
        sessionId={selectedSessionId}
        open={!!selectedSessionId}
        onClose={() => {
          console.log('🔴 MODAL CLOSING');
          setSelectedSessionId(null);
        }}
        onShowSubscription={() => setShowSubscriptionModal(true)}
        isFeaturedClass={featuredSession?.class_id === selectedSessionId}
      />
      
      <ArcCardsModal 
        open={showArcCardsModal} 
        onOpenChange={setShowArcCardsModal} 
      />
    </>
  );
};

export default Library;

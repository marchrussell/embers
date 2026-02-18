import { ContactFormModal } from "@/components/ContactFormModal";
import { ContactTeamsModal } from "@/components/ContactTeamsModal";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { TermsMicrocopy } from "@/components/TermsMicrocopy";
import { GlowButton } from "@/components/ui/glow-button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Flame, HandHeart, Leaf } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import anxietyResetDandelion from "@/assets/anxiety-reset-dandelion.jpg";
import arc1to1MentorshipBg from "@/assets/arc-1-1-mentorship-bg.jpg";
import arcGroupMentorshipBg from "@/assets/arc-group-mentorship-bg.jpg";
import arcSelfStudyBg from "@/assets/arc-self-study-bg.jpg";
import categoryAwakenImage from "@/assets/category-awaken.jpg";
import categoryEnergyImage from "@/assets/category-energy.jpg";
import categoryMeditationsImage from "@/assets/category-meditations.jpg";
import categoryReleaseImage from "@/assets/category-release.jpg";
import categoryResetImage from "@/assets/category-reset.jpg";
import categorySleepImage from "@/assets/category-sleep.jpg";
import communityHeroKef from "@/assets/community-hero-kef.jpg";
import emotionalFirstAid from "@/assets/emotional-first-aid.jpg";
import mLogo from "@/assets/m-logo.png";
import marchExplorePhoto from "@/assets/march-explore-photo.jpg";
import marchGlowingCircle from "@/assets/march-glowing-circle.png";
import marchSpeakingOutdoor from "@/assets/march-speaking-outdoor.png";
import sleepNsdrMoon from "@/assets/sleep-nsdr-moon.jpg";
import teamsSessionGroup from "@/assets/teams-session-group.png";
import teamsSessionWide from "@/assets/teams-session-wide.png";
import teamsTestimonial1 from "@/assets/testimonials/teams-testimonial-1.png";
import teamsTestimonial2 from "@/assets/testimonials/teams-testimonial-2.png";
import teamsTestimonial3 from "@/assets/testimonials/teams-testimonial-3.png";
import teamsTestimonial4 from "@/assets/testimonials/teams-testimonial-4.png";
import teamsTestimonial5 from "@/assets/testimonials/teams-testimonial-5.png";
import teamsTestimonial6 from "@/assets/testimonials/teams-testimonial-6.png";
import welcomeBgTexture from "@/assets/ways-to-work-bg.png";
import { ArcProgramModal } from "@/components/ArcProgramModal";
import { CourseModal } from "@/components/CourseModal";
import { OptimizedImage } from "@/components/OptimizedImage";
import { PhoneMockups } from "@/components/PhoneMockups";
import { RiseArcApplicationForm } from "@/components/RiseArcApplicationForm";
import RiseArcMethodModal from "@/components/RiseArcMethodModal";
import { ExploreSkeleton } from "@/components/skeletons/ExploreSkeleton";
import { formatEventDate, getNextEventDate } from "@/lib/experienceDateUtils";
import { eventsData } from "@/lib/experiencesData";
const useScrollAnimation = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);
  return {
    ref,
    isVisible
  };
};
interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  duration_days: number;
  price_cents: number;
  currency: string;
  stripe_price_id: string | null;
  image_url: string | null;
}
const Courses = () => {
  const {
    toast
  } = useToast();
  const isMobile = useIsMobile();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showTeamsModal, setShowTeamsModal] = useState(false);
  const [showArcModal, setShowArcModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showArcProgramModal, setShowArcProgramModal] = useState(false);
  const [arcProgramType, setArcProgramType] = useState<'self-study' | 'group' | 'one-on-one'>('self-study');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [classesByCategory, setClassesByCategory] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // Parallel data fetching for faster load
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        // Fetch categories, classes, and courses in parallel
        const [categoriesResult, classesResult, coursesResult] = await Promise.all([supabase.from('categories').select('*').order('name'), supabase.from('classes').select('*, created_at').eq('is_published', true).order('order_index'), supabase.from('courses').select('*').eq('is_published', true).order('order_index')]);
        if (!isMounted) return;
        if (coursesResult.data) {
          setCourses(coursesResult.data);
        }
        if (categoriesResult.data) {
          setCategories(categoriesResult.data);
          if (classesResult.data) {
            // Group classes by category
            const grouped = classesResult.data.reduce((acc: Record<string, any[]>, classItem) => {
              if (classItem.category_id) {
                if (!acc[classItem.category_id]) {
                  acc[classItem.category_id] = [];
                }
                acc[classItem.category_id].push(classItem);
              }
              return acc;
            }, {});
            setClassesByCategory(grouped);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchData();

    // Safety timeout - force loading to false after 5 seconds to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 5000);
    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
    };
  }, []);

  // Build categories with session counts and display info
  const categoryOrder = ['CALM', 'ENERGY', 'RESET', 'SLEEP', 'EXPAND', 'HEAL', 'MEDITATIONS'];
  const sortedCategories = [...categories].sort((a, b) => {
    const indexA = categoryOrder.indexOf(a.name);
    const indexB = categoryOrder.indexOf(b.name);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  // Helper to open course modal
  const openCourseModal = (slug: string) => {
    const course = courses.find(c => c.slug === slug);
    if (course) {
      setSelectedCourse(course);
      setShowCourseModal(true);
    }
  };

  // Map category names to local images
  const categoryImageMap: Record<string, string> = {
    'CALM': categoryMeditationsImage,
    'ENERGY': categoryEnergyImage,
    'RESET': categoryResetImage,
    'SLEEP': categorySleepImage,
    'EXPAND': categoryAwakenImage,
    'HEAL': categoryReleaseImage,
    'MEDITATIONS': categoryMeditationsImage
  };
  const categoriesWithInfo = sortedCategories.map(cat => {
    let displayName = cat.name;
    let displayDescription = cat.description;

    // Map display names
    if (cat.name === 'EXPAND') displayName = 'AWAKEN';
    if (cat.name === 'HEAL') displayName = 'RELEASE';

    // Updated descriptions per new copy
    if (cat.name === 'CALM') {
      displayDescription = "Short sessions to slow your system, soften tension, regulate overwhelm, and return to centre.";
    } else if (cat.name === 'ENERGY') {
      displayDescription = "Breathwork and movement practices to lift your mood, boost focus, and restore vitality when you need it.";
    } else if (cat.name === 'RESET') {
      displayDescription = "Weekly reset sessions to clear stress, anchor your baseline, and create a consistent feeling of inner steadiness.";
    } else if (cat.name === 'SLEEP') {
      displayDescription = "Wind-down practices to release the day from your body, quiet your mind, and support deep, restorative rest.";
    } else if (cat.name === 'EXPAND') {
      displayDescription = "Daily practices for clarity, presence, and feeling more alive and connected in your life.";
    } else if (cat.name === 'HEAL') {
      displayDescription = "Tools to soften emotional load, let go of accumulated stress, and create more internal space.";
    } else if (cat.name === 'MEDITATIONS') {
      displayDescription = "Guided presence practices for grounding, awareness, and a calmer relationship with your thoughts.";
    }
    const sessionCount = classesByCategory[cat.id]?.length || 0;

    // Use local image or fallback to database image
    const categoryImage = categoryImageMap[cat.name] || cat.image_url || categoryMeditationsImage;
    return {
      id: cat.id,
      name: displayName,
      originalName: cat.name,
      description: displayDescription,
      image: categoryImage,
      sessionCount
    };
  });
  return <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <SubscriptionModal open={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} />
      
      <ContactFormModal open={showContactModal} onOpenChange={setShowContactModal} />
      
      <ContactTeamsModal open={showTeamsModal} onOpenChange={setShowTeamsModal} />
      
      <RiseArcMethodModal open={showArcModal} onOpenChange={setShowArcModal} />
      
      <RiseArcApplicationForm open={showApplicationForm} onOpenChange={setShowApplicationForm} />
      
      {selectedCourse && <CourseModal isOpen={showCourseModal} onClose={() => setShowCourseModal(false)} course={selectedCourse} />}
      
      {loading ? <ExploreSkeleton /> : <main className="flex-1">
        {/* Hero Section - Full Width Cinematic */}
        <section className="relative overflow-hidden min-h-[100dvh] flex items-end">
          {/* Background - Full width image */}
          <OptimizedImage src={welcomeBgTexture} alt="Background" className="absolute inset-0 w-full h-full object-cover" style={{
          objectPosition: 'center 40%',
          filter: 'saturate(0.8) contrast(1.08) sepia(0.12) brightness(0.95)'
        }} optimizationOptions={{
          width: 1920,
          quality: 85
        }} />
          
          {/* Film grain overlay */}
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }} />
          
          {/* Warm amber color cast for film look */}
          <div className="absolute inset-0 bg-amber-950/15 mix-blend-multiply pointer-events-none" />
          
          {/* Cool shadow in corners for depth - softened */}
          <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.12) 0%, transparent 35%, transparent 65%, rgba(0,0,0,0.15) 100%)'
        }} />
          
          
          {/* Portrait photo on right side - visible on tablet and up */}
          <div className="absolute right-0 top-0 bottom-0 w-[45%] md:w-1/2 hidden md:block z-[5]">
            <OptimizedImage src={marchExplorePhoto} alt="March" className="h-full w-full object-cover" style={{
            objectPosition: 'center 20%',
            filter: 'saturate(0.85) contrast(1.05) sepia(0.08)',
            maskImage: 'linear-gradient(to right, transparent 0%, black 25%)'
          }} optimizationOptions={{
            width: 960,
            quality: 85
          }} />
          </div>
          
          {/* Text content positioned at bottom - matching homepage hero */}
          <div className="absolute bottom-8 sm:bottom-10 md:bottom-12 left-5 sm:left-8 md:left-16 right-5 sm:right-6 md:right-8 z-10 md:pr-[40%] lg:pr-[45%]">
            <p className="font-editorial text-white leading-[1.15] drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]" style={{
            textShadow: '0 2px 12px rgba(0,0,0,0.5)',
            fontSize: 'clamp(2.4rem, 4vw, 3.5rem)',
            fontWeight: 300
          }}>
              Explore Your Path to Feeling Better, Living Deeper, and Coming Home to Yourself
            </p>
            <p className="font-unica text-white/90 mt-5 md:mt-6 ml-[0.1em] drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]" style={{
            fontSize: 'clamp(1.1rem, 1.3vw, 1.3rem)',
            letterSpacing: '0.02em',
            fontWeight: 450,
            lineHeight: 1.6
          }}>
              Your body wasn't meant to live in survival mode. Explore practices that help you soften, regulate, reconnect — and feel more alive in your own life again.
            </p>
          </div>
          
          {/* Removed bottom fade gradient for better text readability */}
        </section>
        
        {/* The Studio Section */}
        <section className="pt-16 md:pt-28 lg:pt-44 pb-0 bg-background relative overflow-hidden">
          
          {/* Subtle White/Grey Glowing Animation Background - Desktop only for performance */}
          {!isMobile && (
            <div className="absolute inset-0 pointer-events-none z-[1]">
              {/* Large floating orbs */}
              <div className="absolute top-[10%] left-[8%] w-[500px] h-[500px] rounded-full opacity-[0.08]" style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, transparent 60%)',
              filter: 'blur(80px)',
              animation: 'studioOrb1 18s ease-in-out infinite'
            }} />
              <div className="absolute top-[30%] right-[10%] w-[450px] h-[450px] rounded-full opacity-[0.06]" style={{
              background: 'radial-gradient(circle, rgba(220,220,220,0.6) 0%, transparent 60%)',
              filter: 'blur(70px)',
              animation: 'studioOrb2 22s ease-in-out infinite'
            }} />
              <div className="absolute bottom-[15%] left-[20%] w-[400px] h-[400px] rounded-full opacity-[0.07]" style={{
              background: 'radial-gradient(circle, rgba(200,200,200,0.5) 0%, transparent 60%)',
              filter: 'blur(65px)',
              animation: 'studioOrb3 16s ease-in-out infinite'
            }} />
              <div className="absolute top-[55%] right-[25%] w-[350px] h-[350px] rounded-full opacity-[0.05]" style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 60%)',
              filter: 'blur(55px)',
              animation: 'studioOrb1 20s ease-in-out infinite reverse'
            }} />
              <div className="absolute top-[20%] left-[50%] w-[300px] h-[300px] rounded-full opacity-[0.04]" style={{
              background: 'radial-gradient(circle, rgba(240,240,240,0.6) 0%, transparent 60%)',
              filter: 'blur(50px)',
              animation: 'studioOrb2 14s ease-in-out infinite 2s'
            }} />
            </div>
          )}
          
          {/* Animation keyframes */}
          <style>{`
            @keyframes studioOrb1 {
              0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.08; }
              33% { transform: translate(40px, -30px) scale(1.08); opacity: 0.1; }
              66% { transform: translate(-30px, 20px) scale(0.95); opacity: 0.06; }
            }
            @keyframes studioOrb2 {
              0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.06; }
              50% { transform: translate(-35px, 40px) scale(1.12); opacity: 0.09; }
            }
            @keyframes studioOrb3 {
              0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.07; }
              25% { transform: translate(20px, -35px) scale(1.05); opacity: 0.09; }
              75% { transform: translate(-40px, 15px) scale(0.96); opacity: 0.05; }
            }
            @keyframes cardGlowPulse {
              0%, 100% { opacity: 0.15; transform: scale(1); }
              50% { opacity: 0.25; transform: scale(1.03); }
            }
          `}</style>
          
          <div className="mx-auto px-5 md:px-12 lg:px-20 w-full relative z-10">
            {/* Header - Centered */}
            <div className="mb-12 md:mb-20 lg:mb-28 text-center max-w-[52rem] mx-auto">
              <h2 className="font-editorial text-white mb-4 md:mb-3 leading-[1.15]" style={{
              fontSize: 'clamp(2.2rem, 4vw, 4.5rem)',
              fontWeight: 300
            }}>
                The Studio
              </h2>
              <p className="font-editorial italic text-white/85 mb-8 md:mb-12 leading-[1.65] max-w-[44rem] mx-auto px-2 md:px-0" style={{
              fontSize: 'clamp(1.05rem, 1.5vw, 1.4rem)'
            }}>
                A monthly membership for short daily resets, guided practices, courses and live weekly sessions that help you stay grounded, clear, and connected.
              </p>
              
              {/* Clean bullet point list - left-aligned on mobile, centered on larger */}
              <div className="flex flex-col items-start md:items-center gap-3 md:gap-5 mb-10 md:mb-20 px-1 md:px-0">
                {[
                  "Daily practices to steady your mind and body",
                  "Courses for emotional clarity, autonomy & deeper resilience",
                  "Weekly live sessions + monthly workshops to keep you grounded & connected"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start md:items-center gap-3 md:gap-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/80 mt-2 md:mt-0 flex-shrink-0" />
                    <span className="text-white/80 text-left md:text-center" style={{ fontSize: 'clamp(0.95rem, 1vw, 1rem)' }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
              
            {!loading && <>
              {/* Phone Mockups Section */}
              <div>
                {/* Micro-heading above mockups - centered */}
                <p className="text-center text-white/50 uppercase tracking-[0.12em] font-medium mb-10 md:mb-12" style={{
                  fontSize: 'clamp(0.7rem, 0.8vw, 0.8rem)'
                }}>
                  A look inside your new practice home
                </p>
                
                {/* Phone Mockups - centered */}
                <PhoneMockups />

                {/* Closing Line - moved here under mockups */}
                <p className="text-center text-white/75 mt-12 md:mt-16 max-w-[800px] mx-auto leading-[1.7] italic" style={{
                  fontSize: 'clamp(0.95rem, 1.1vw, 1.1rem)'
                }}>Your nervous system becomes your anchor — not your obstacle.</p>
              </div>
              
              {/* Step Inside The Studio CTA */}
              <div className="text-center mt-14 md:mt-24 lg:mt-40 px-4 md:px-0">
                <Link to="/studio">
                  <GlowButton variant="white" size="lg" className="px-8 md:px-14 py-4 md:py-6 min-h-[48px]" style={{
                  fontSize: 'clamp(0.95rem, 1.1vw, 1.1rem)'
                }}>
                    Step Inside The Studio
                  </GlowButton>
                </Link>
                
                {/* Mini CTA - linked to button */}
                <p className="text-white/70 font-light mt-5 md:mt-6 max-w-lg mx-auto" style={{
                fontSize: 'clamp(0.9rem, 1.05vw, 1.05rem)',
                lineHeight: 1.65
              }}>
                  If you're ready for a steadier mind, a grounded body, and a more connected way of living — this is where your practice deepens.
                </p>
              </div>
            </>}
          </div>
        </section>

        {/* Divider Line */}
        <div className="py-10 md:py-24 lg:py-44 bg-black px-5 md:px-10 lg:px-12">
          <div className="h-[1px] w-full max-w-[1600px] mx-auto bg-[#E6DBC7]" />
        </div>

        {/* Short Courses Section */}
        <section className="pb-12 md:pb-20 lg:pb-32 relative overflow-hidden bg-black">
          <div className="mx-auto px-5 md:px-8 lg:px-10 max-w-[1600px] relative z-10">
            <div className="mb-10 md:mb-16 lg:mb-20 text-center">
              <h2 className="font-editorial text-white mb-4 md:mb-6 leading-[1.15]" style={{
              fontSize: 'clamp(2.2rem, 4vw, 4.5rem)',
              fontWeight: 300
            }}>
                Short Courses
              </h2>
              <p className="font-editorial italic text-white/85 max-w-[52rem] mx-auto leading-[1.65] px-2 md:px-0" style={{
              fontSize: 'clamp(1.05rem, 1.5vw, 1.4rem)'
            }}>Short guided journeys to shift how you feel, soften what's overwhelming, and rebuild steadiness from within.</p>
            </div>

            {/* SHORT COURSE CARDS - Carousel on mobile, Grid on tablet+ */}
            <div className="max-w-[1200px] mx-auto">
              {/* Mobile Carousel */}
              <div className="md:hidden">
                <div 
                  className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 mx-5 px-5 scrollbar-hide"
                  style={{ 
                    scrollbarWidth: 'none', 
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  {/* Anxiety Reset */}
                  <div 
                    onClick={() => openCourseModal('breathwork-anxiety-reset')}
                    className="group relative flex-shrink-0 w-[280px] snap-start flex flex-col overflow-hidden rounded-xl border border-white/[0.12] bg-black/40 cursor-pointer shadow-lg"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={anxietyResetDandelion} alt="The Anxiety Reset" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85) 100%)' }} />
                      <span className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-full text-[9px] uppercase tracking-[0.12em] font-medium bg-[#E6DBC7] text-black">7-Day Course</span>
                    </div>
                    <div className="flex flex-col flex-1 p-3">
                      <h3 className="font-editorial text-[1.05rem] text-white font-light leading-[1.25] mb-2">The Anxiety Reset</h3>
                      <p className="text-[12px] text-white/50 mb-3 font-medium tracking-wide">£47</p>
                      <div className="mt-auto pt-2">
                        <span className="text-[12px] text-white/70 font-medium tracking-wide">Enroll Now →</span>
                      </div>
                    </div>
                  </div>

                  {/* Sleep & NSDR Pack */}
                  <div 
                    onClick={() => openCourseModal('sleep-nsdr-pack')}
                    className="group relative flex-shrink-0 w-[280px] snap-start flex flex-col overflow-hidden rounded-xl border border-white/[0.12] bg-black/40 cursor-pointer shadow-lg"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={sleepNsdrMoon} alt="Sleep & NSDR Pack" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85) 100%)' }} />
                      <span className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-full text-[9px] uppercase tracking-[0.12em] font-medium bg-[#E6DBC7] text-black">14-Day Course</span>
                    </div>
                    <div className="flex flex-col flex-1 p-3">
                      <h3 className="font-editorial text-[1.05rem] text-white font-light leading-[1.25] mb-2">Sleep & NSDR Pack</h3>
                      <p className="text-[12px] text-white/50 mb-1 font-medium tracking-wide"><span style={{ color: '#C89B5F' }}>Founding Rate:</span> £67</p>
                      <p className="text-[10px] text-white/35 mb-3 tracking-wide">(Full price £97)</p>
                      <div className="mt-auto pt-2">
                        <span className="text-[12px] text-white/70 font-medium tracking-wide">Reserve Founding Rate →</span>
                      </div>
                    </div>
                  </div>

                  {/* Emotional Regulation Toolkit */}
                  <div 
                    onClick={() => openCourseModal('emotional-first-aid-kit')}
                    className="group relative flex-shrink-0 w-[280px] snap-start flex flex-col overflow-hidden rounded-xl border border-white/[0.12] bg-black/40 cursor-pointer shadow-lg"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={emotionalFirstAid} alt="Emotional Regulation Toolkit" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85) 100%)' }} />
                      <span className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-full text-[9px] uppercase tracking-[0.12em] font-medium bg-[#E6DBC7] text-black">3-Day Course</span>
                    </div>
                    <div className="flex flex-col flex-1 p-3">
                      <h3 className="font-editorial text-[1.05rem] text-white font-light leading-[1.25] mb-2">Emotional Regulation Toolkit</h3>
                      <p className="text-[12px] text-white/50 mb-1 font-medium tracking-wide"><span style={{ color: '#C89B5F' }}>Founding Rate:</span> £45</p>
                      <p className="text-[10px] text-white/35 mb-3 tracking-wide">(Full price £57)</p>
                      <div className="mt-auto pt-2">
                        <span className="text-[12px] text-white/70 font-medium tracking-wide">Reserve Founding Rate →</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Carousel hint */}
                <p className="text-white/40 text-xs text-center mt-1 tracking-wide">
                  Swipe to see more
                </p>
              </div>

              {/* Tablet/Desktop Grid */}
              <div className="hidden md:grid md:grid-cols-3 gap-4 lg:gap-5">
                {/* Anxiety Reset */}
                <div 
                  onClick={() => openCourseModal('breathwork-anxiety-reset')}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.12] hover:border-white/25 transition-colors duration-500 bg-black/40 cursor-pointer shadow-[0_0_60px_rgba(230,219,199,0.4)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={anxietyResetDandelion} alt="The Anxiety Reset" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85) 100%)' }} />
                    <span className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-full text-[9px] uppercase tracking-[0.12em] font-medium bg-[#E6DBC7] text-black">7-Day Course</span>
                  </div>
                  <div className="flex flex-col flex-1 p-4 lg:p-5">
                    <h3 className="font-editorial text-[clamp(1.05rem,1.3vw,1.2rem)] text-white font-light leading-[1.25] mb-2 tracking-[-0.01em]">The Anxiety Reset</h3>
                    <p className="text-[11px] text-white/50 mb-3 font-medium tracking-wide">£47</p>
                    <div className="mt-auto pt-2">
                      <span className="text-[11px] text-white/70 font-medium tracking-wide group-hover:text-white transition-colors">Enroll Now →</span>
                    </div>
                  </div>
                </div>

                {/* Sleep & NSDR Pack */}
                <div 
                  onClick={() => openCourseModal('sleep-nsdr-pack')}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.12] hover:border-white/25 transition-colors duration-500 bg-black/40 cursor-pointer shadow-[0_0_60px_rgba(230,219,199,0.4)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={sleepNsdrMoon} alt="Sleep & NSDR Pack" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85) 100%)' }} />
                    <span className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-full text-[9px] uppercase tracking-[0.12em] font-medium bg-[#E6DBC7] text-black">14-Day Course</span>
                  </div>
                  <div className="flex flex-col flex-1 p-4 lg:p-5">
                    <h3 className="font-editorial text-[clamp(1.05rem,1.3vw,1.2rem)] text-white font-light leading-[1.25] mb-2 tracking-[-0.01em]">Sleep & NSDR Pack</h3>
                    <p className="text-[11px] text-white/50 mb-1 font-medium tracking-wide"><span style={{ color: '#C89B5F' }}>Founding Rate:</span> £67</p>
                    <p className="text-[9px] text-white/35 mb-3 tracking-wide">(Full price £97)</p>
                    <div className="mt-auto pt-2">
                      <span className="text-[11px] text-white/70 font-medium tracking-wide group-hover:text-white transition-colors">Reserve Founding Rate →</span>
                    </div>
                  </div>
                </div>

                {/* Emotional Regulation Toolkit */}
                <div 
                  onClick={() => openCourseModal('emotional-first-aid-kit')}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.12] hover:border-white/25 transition-colors duration-500 bg-black/40 cursor-pointer shadow-[0_0_60px_rgba(230,219,199,0.4)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={emotionalFirstAid} alt="Emotional Regulation Toolkit" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85) 100%)' }} />
                    <span className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-full text-[9px] uppercase tracking-[0.12em] font-medium bg-[#E6DBC7] text-black">3-Day Course</span>
                  </div>
                  <div className="flex flex-col flex-1 p-4 lg:p-5">
                    <h3 className="font-editorial text-[clamp(1.05rem,1.3vw,1.2rem)] text-white font-light leading-[1.25] mb-2 tracking-[-0.01em]">Emotional Regulation Toolkit</h3>
                    <p className="text-[11px] text-white/50 mb-1 font-medium tracking-wide"><span style={{ color: '#C89B5F' }}>Founding Rate:</span> £45</p>
                    <p className="text-[9px] text-white/35 mb-3 tracking-wide">(Full price £57)</p>
                    <div className="mt-auto pt-2">
                      <span className="text-[11px] text-white/70 font-medium tracking-wide group-hover:text-white transition-colors">Reserve Founding Rate →</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-white/60 italic mt-12 md:mt-24" style={{
              fontSize: 'clamp(0.9rem, 0.95vw, 0.98rem)',
              lineHeight: 1.6
            }}>
              All courses are self-guided with instant access once they open.
            </p>
            
            {/* View All Courses CTA */}
            <div className="text-center mt-8 md:mt-12 mb-16 md:mb-28 lg:mb-52">
              <Link 
                to="/courses" 
                className="inline-flex items-center gap-3 text-white/80 hover:text-white transition-colors duration-300"
                style={{
                  fontSize: 'clamp(0.95rem, 1.1vw, 1.1rem)',
                  letterSpacing: '0.02em'
                }}
              >
                View All Courses
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </section>

        {/* Full Bleed Hero Image Above Rise ARC */}
        <section className="relative w-full h-[45vh] md:h-[55vh] lg:h-[70vh] overflow-hidden">
          <img src={communityHeroKef} alt="March meditation session" className="w-full h-full object-cover" style={{
          objectPosition: 'center 35%'
        }} loading="lazy" />
          {/* Text overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-10 px-5 md:px-8">
            <div className="text-center mt-6 md:mt-12">
              <span className="font-unica uppercase tracking-[0.15em] md:tracking-[0.2em] text-[#E6DBC7]" style={{
              fontSize: 'clamp(0.7rem, 0.9vw, 0.9rem)',
              fontWeight: 500
            }}>FOR INDIVIDUALS</span>
              <h2 className="font-editorial text-white mt-3 md:mt-4" style={{
              fontSize: 'clamp(2rem, 4vw, 4.5rem)',
              fontWeight: 300,
              lineHeight: 1.15,
              textShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}>Rise ARC Method Mentorship</h2>
              <p className="font-editorial italic text-white/90 mt-2 md:mt-3" style={{
              fontSize: 'clamp(1rem, 1.5vw, 1.4rem)',
              textShadow: '0 2px 12px rgba(0,0,0,0.5)'
            }}>
                Deep Guided Change
              </p>
            </div>
          </div>
          {/* Subtle bottom fade into next section */}
          <div className="absolute bottom-0 left-0 right-0 h-24 md:h-32 bg-gradient-to-t from-black to-transparent" />
        </section>

        {/* Rise ARC Method Section */}
        <section className="pt-10 md:pt-16 lg:pt-20 pb-14 md:pb-24 lg:pb-32 relative overflow-hidden bg-black">
          
          <div className="mx-auto px-5 md:px-6 lg:px-8 relative z-10">
            <div className="max-w-[96%] lg:max-w-[92%] mx-auto text-center">
                
                {/* Editorial intro text */}
                <p className="font-editorial text-white/90 leading-[1.55] mb-6 md:mb-10 mx-auto px-2 md:px-0" style={{
              fontSize: 'clamp(1.25rem, 2vw, 2rem)',
              maxWidth: '1000px'
            }}>A 4-month guided process for those ready to go deeper — to rebuild stability, autonomy, emotional presence, and connection.</p>
                
                {/* Clean bullet point list - left-aligned on mobile, centered on larger */}
                <div className="flex flex-col items-start md:items-center gap-3 md:gap-5 mb-12 md:mb-20 lg:mb-28 max-w-[800px] mx-auto px-1 md:px-0">
                  {[
                    "Daily practices for calm, clarity, energy & deeper sleep",
                    "Courses for deeper emotional processing, autonomy and resilience",
                    "Weekly live resets + monthly workshops",
                    "A range of carefully selected teachers and practices"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start md:items-center gap-3 md:gap-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/85 mt-2 md:mt-0 flex-shrink-0" />
                      <span className="text-white/85 font-unica text-left md:text-center" style={{ fontSize: 'clamp(0.9rem, 0.95vw, 0.95rem)' }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Card wrapper with animated sunset background and blurred edges */}
                <div className="relative rounded-[24px] overflow-visible" style={{
              maskImage: 'radial-gradient(ellipse 98% 95% at center, black 70%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 98% 95% at center, black 70%, transparent 100%)'
            }}>
                  {/* Animated warm sunset gradient behind card */}
                  <div className="absolute inset-0 z-0 rounded-[24px]" style={{
                background: `
                      radial-gradient(ellipse 100% 80% at 20% 20%, rgba(255, 140, 50, 0.5) 0%, transparent 50%),
                      radial-gradient(ellipse 90% 70% at 80% 40%, rgba(230, 100, 40, 0.45) 0%, transparent 45%),
                      radial-gradient(ellipse 80% 60% at 50% 80%, rgba(200, 80, 30, 0.5) 0%, transparent 50%),
                      radial-gradient(ellipse 70% 50% at 30% 60%, rgba(180, 90, 20, 0.4) 0%, transparent 40%),
                      linear-gradient(135deg, rgba(140, 60, 20, 0.6) 0%, rgba(100, 40, 15, 0.7) 100%)
                    `,
                animation: 'warmGlow 30s ease-in-out infinite'
              }} />
                  {/* Secondary warm layer for depth */}
                  <div className="absolute inset-0 z-0 rounded-[24px]" style={{
                background: `
                      radial-gradient(ellipse 60% 50% at 70% 30%, rgba(255, 170, 70, 0.3) 0%, transparent 40%),
                      radial-gradient(ellipse 50% 40% at 20% 70%, rgba(220, 120, 40, 0.35) 0%, transparent 35%)
                    `,
                animation: 'warmGlow 25s ease-in-out infinite reverse'
              }} />
                  {/* Grain texture */}
                  <svg className="absolute inset-0 w-full h-full opacity-[0.06] mix-blend-soft-light pointer-events-none z-[1]">
                    <filter id="cardNoise">
                      <feTurbulence type="fractalNoise" baseFrequency="3" numOctaves="4" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#cardNoise)" />
                  </svg>
                  
                  {/* Glassmorphism card with glowing border */}
                  
                </div>
                
                {/* ARC Overview Content - Below the card */}
                <div className="mt-10 md:mt-12 lg:mt-14 text-center">
                  
                  
                  {/* Constrained text container */}
                  {/* Foundation Pills Section */}
                  <div className="max-w-[1200px] mx-auto mt-4 lg:mt-6 mb-10 md:mb-16 lg:mb-20 px-2 md:px-4">
                    
                    {/* Micro-subheading */}
                    <p className="text-white/50 text-xs uppercase tracking-[0.15em] mb-6 md:mb-10 lg:mb-12 font-medium font-unica">
                      WHAT ARC REBUILDS
                    </p>
                    
                    {/* Pills - Stack vertically on mobile, wrap on larger */}
                    <div className="flex flex-col items-center gap-2 md:gap-4">
                      {/* Row 1 */}
                      <div className="flex flex-col md:flex-row flex-wrap justify-center items-center gap-2 md:gap-4">
                        {["NERVOUS SYSTEM STABILITY", "EMOTIONAL REGULATION", "RESTORATIVE SLEEP"].map((item, idx) => (
                          <span key={idx} className="px-4 py-2 md:px-6 md:py-3 border border-white/40 rounded-full font-unica text-white font-medium tracking-[0.06em] md:tracking-[0.08em] text-center whitespace-nowrap" style={{ fontSize: 'clamp(0.7rem, 0.8vw, 0.8rem)' }}>
                            {item}
                          </span>
                        ))}
                      </div>
                      {/* Row 2 */}
                      <div className="flex flex-col md:flex-row flex-wrap justify-center items-center gap-2 md:gap-4">
                        {["AUTONOMY & RESPONSE CHOICE", "EMOTIONAL PROCESSING & INTEGRATION", "REAL CONNECTION & PRESENCE"].map((item, idx) => (
                          <span key={idx} className="px-4 py-2 md:px-6 md:py-3 border border-white/40 rounded-full font-unica text-white font-medium tracking-[0.06em] md:tracking-[0.08em] text-center whitespace-nowrap" style={{ fontSize: 'clamp(0.7rem, 0.8vw, 0.8rem)' }}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Stacked Program Cards - Redesigned */}
                  <div className="relative">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-5 mb-10 lg:mb-16 w-full max-w-[1200px] mx-auto px-2 md:px-4 relative z-10">
                    
                    {/* Card 1 — Self-Study */}
                    <div className="relative rounded-sm overflow-hidden text-left flex flex-col h-full transition-colors duration-300 shadow-lg md:shadow-[0_0_60px_rgba(230,219,199,0.4)] border border-white/[0.12]">
                      {/* Background image with blur */}
                      <div className="absolute inset-0 z-0">
                        <img src={arcSelfStudyBg} alt="" className="w-full h-full object-cover" style={{ filter: isMobile ? 'blur(2px) brightness(0.6)' : 'blur(3px) brightness(0.6)', transform: 'scale(1.05)' }} />
                      </div>
                      {/* Glassmorphism overlay */}
                      <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.5) 100%)' }} />
                      {/* Content */}
                      <div className="relative z-10 p-5 md:p-8 lg:p-10 flex flex-col h-full">
                      {/* Header */}
                      <div className="mb-6">
                      <span className="inline-flex items-center gap-3 text-white/70 text-xs uppercase tracking-[0.15em] mb-4" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                          <Leaf className="w-5 h-5 text-white" />
                          Self-Paced
                        </span>
                        <h4 className="text-white font-editorial text-2xl lg:text-3xl mb-2" style={{
                        fontWeight: 300,
                        textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                      }}>
                          ARC Self-Study
                        </h4>
                      </div>

                      {/* Description */}
                      <p className="text-white/90 text-sm leading-relaxed mb-6" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>A structured, private 4-month journey to stabilise your nervous system, improve sleep and energy, reduce anxiety, and build real internal steadiness — at your own pace.</p>

                      {/* Perfect for */}
                      <div className="mb-8">
                        <p className="text-white/50 text-xs uppercase tracking-[0.12em] mb-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>Perfect for</p>
                        <p className="text-white/80 text-sm leading-relaxed" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                          People who want depth, privacy, and structured support without live sessions.
                        </p>
                      </div>

                      {/* Bottom section - pushed to bottom */}
                      <div className="mt-auto">
                        {/* CTA */}
                        <button onClick={() => {
                        setArcProgramType('self-study');
                        setShowArcProgramModal(true);
                      }} className="w-full bg-white/20 backdrop-blur-sm text-white border border-white/40 px-5 py-3 md:py-4 min-h-[44px] rounded-none text-sm font-normal tracking-wide hover:bg-white/30 hover:border-white/60 transition-all flex items-center justify-center">
                          Explore Self-Study
                        </button>
                      </div>
                      </div>
                    </div>

                    {/* Card 2 — Group Mentorship */}
                    <div className="relative rounded-sm overflow-hidden text-left flex flex-col h-full transition-colors duration-300 shadow-lg md:shadow-[0_0_60px_rgba(230,219,199,0.4)] border border-white/[0.12]">
                      {/* Background image with blur */}
                      <div className="absolute inset-0 z-0">
                        <img src={arcGroupMentorshipBg} alt="" className="w-full h-full object-cover" style={{ filter: isMobile ? 'blur(2px) brightness(0.6)' : 'blur(3px) brightness(0.6)', transform: 'scale(1.05)' }} />
                      </div>
                      {/* Glassmorphism overlay */}
                      <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.5) 100%)' }} />
                      {/* Content */}
                      <div className="relative z-10 p-5 md:p-8 lg:p-10 flex flex-col h-full">
                      {/* Header */}
                      <div className="mb-6">
                      <span className="inline-flex items-center gap-3 text-white/70 text-xs uppercase tracking-[0.15em] mb-4" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                          <Flame className="w-5 h-5 text-white" />
                          Live Group
                        </span>
                        <h4 className="text-white font-editorial text-2xl lg:text-3xl mb-2" style={{
                        fontWeight: 300,
                        textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                      }}>
                          ARC Group Mentorship
                        </h4>
                      </div>

                      {/* Description */}
                      <p className="text-white/90 text-sm leading-relaxed mb-6" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>A guided live experience blending nervous system repair, emotional processing and relational connection — inside a supportive community.</p>

                      {/* Perfect for */}
                      <div className="mb-8">
                        <p className="text-white/50 text-xs uppercase tracking-[0.12em] mb-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>Perfect for</p>
                        <p className="text-white/80 text-sm leading-relaxed" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                          People who want accountability, guidance, and to feel more regulated, connected, and steady day-to-day.
                        </p>
                      </div>

                      {/* Bottom section - pushed to bottom */}
                      <div className="mt-auto">
                        {/* CTA */}
                        <button onClick={() => {
                        setArcProgramType('group');
                        setShowArcProgramModal(true);
                      }} className="w-full bg-white/20 backdrop-blur-sm text-white border border-white/40 px-5 py-3 md:py-4 min-h-[44px] rounded-none text-sm font-normal tracking-wide hover:bg-white/30 hover:border-white/60 transition-all flex items-center justify-center">
                          Explore Group Mentorship
                        </button>
                      </div>
                      </div>
                    </div>

                    {/* Card 3 — 1:1 Mentorship */}
                    <div className="relative rounded-sm overflow-hidden text-left flex flex-col h-full transition-colors duration-300 shadow-lg md:shadow-[0_0_60px_rgba(230,219,199,0.4)] border border-white/[0.12]">
                      {/* Background image with blur */}
                      <div className="absolute inset-0 z-0">
                        <img src={arc1to1MentorshipBg} alt="" className="w-full h-full object-cover" style={{ filter: isMobile ? 'blur(2px) brightness(0.6)' : 'blur(3px) brightness(0.6)', transform: 'scale(1.05)' }} />
                      </div>
                      {/* Glassmorphism overlay */}
                      <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.5) 100%)' }} />
                      {/* Content */}
                      <div className="relative z-10 p-5 md:p-8 lg:p-10 flex flex-col h-full">
                      {/* Header */}
                      <div className="mb-6">
                      <span className="inline-flex items-center gap-3 text-white/70 text-xs uppercase tracking-[0.15em] mb-4" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                          <HandHeart className="w-5 h-5 text-white" />
                          High-Touch
                        </span>
                        <h4 className="text-white font-editorial text-2xl lg:text-3xl mb-2" style={{
                        fontWeight: 300,
                        textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                      }}>
                          ARC 1:1 Mentorship
                        </h4>
                      </div>

                      {/* Description */}
                      <p className="text-white/90 text-sm leading-relaxed mb-6" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>A personalised, high-touch 4-month immersion for emotional clarity, patterns that won't shift alone, and deep nervous-system repatterning.</p>

                      {/* Perfect for */}
                      <div className="mb-8">
                        <p className="text-white/50 text-xs uppercase tracking-[0.12em] mb-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>Perfect for</p>
                        <p className="text-white/80 text-sm leading-relaxed" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                          People ready for precise guidance, real-time regulation support, and lasting internal change.
                        </p>
                      </div>

                      {/* Bottom section - pushed to bottom */}
                      <div className="mt-auto">
                        {/* CTA */}
                        <button onClick={() => {
                        setArcProgramType('one-on-one');
                        setShowArcProgramModal(true);
                      }} className="w-full bg-white/20 backdrop-blur-sm text-white border border-white/40 px-5 py-3 md:py-4 min-h-[44px] rounded-none text-sm font-normal tracking-wide hover:bg-white/30 hover:border-white/60 transition-all flex items-center justify-center">
                          Explore 1:1 Mentorship
                        </button>
                      </div>
                      </div>
                    </div>
                  </div>
                  </div>

                  {/* Bottom CTA */}
                  <div className="text-center pt-4 md:pt-20 lg:pt-32 max-w-[1200px] mx-auto px-4 md:px-0">
                    <p className="text-[#E6DBC7]/70 mb-6 md:mb-8 max-w-[520px] mx-auto leading-relaxed" style={{
                  fontSize: 'clamp(0.9rem, 1.1vw, 1.05rem)',
                  lineHeight: 1.65
                }}>
                      If you're unsure which pathway is right, book a short conversation — I'll help you choose what fits your needs, your pace, and your season of life.
                    </p>
                    <a href="https://calendly.com/march-marchrussell/welcome-call" target="_blank" rel="noopener noreferrer" className="inline-flex bg-transparent text-[#E6DBC7] border border-[#E6DBC7]/40 px-8 md:px-12 rounded-full font-normal tracking-wide transition-all items-center justify-center hover:bg-[#E6DBC7]/10 hover:border-[#E6DBC7]/60 hover:scale-[1.02] min-h-[48px] shadow-[0_0_15px_rgba(230,219,199,0.1)] hover:shadow-[0_0_20px_rgba(230,219,199,0.2)]" style={{
                  height: '48px',
                  fontSize: 'clamp(0.95rem, 1vw, 1rem)'
                }}>
                      Schedule a Free Call
                    </a>
                  </div>
                </div>
            </div>
          </div>
        </section>

        {/* Divider Line */}
        <div className="py-10 md:py-24 lg:py-44 bg-black px-5 md:px-10 lg:px-12">
          <div className="h-[1px] w-full max-w-[1600px] mx-auto bg-[#E6DBC7]" />
        </div>

        {/* ========== NERVOUS SYSTEM TRAINING FOR TEAMS ========== */}
        
        {/* HERO */}
        <section id="corporate-programs" className="pb-16 md:pb-28 lg:pb-36 scroll-mt-20 relative overflow-hidden bg-black">
          <div className="mx-auto px-5 md:px-8 lg:px-12 max-w-[1000px] relative z-10 text-center">
            <p className="text-white/60 uppercase tracking-[0.12em] md:tracking-[0.15em] mb-4 md:mb-6" style={{
            fontSize: 'clamp(0.7rem, 0.8vw, 0.8rem)'
          }}>
              FOR ORGANIZATIONS
            </p>
            <h2 className="font-editorial text-white mb-4 md:mb-6 leading-[1.15]" style={{
            fontSize: 'clamp(2rem, 3.5vw, 3.8rem)',
            fontWeight: 300
          }}>
              Nervous System Training for Teams
            </h2>
            <p className="font-editorial italic text-white/90 max-w-2xl mx-auto mb-6 md:mb-8 px-2 md:px-0" style={{
            fontSize: 'clamp(1.05rem, 1.5vw, 1.4rem)'
          }}>
              Science-based tools that help teams stay calmer, clearer and more resilient under pressure — without burnout.
            </p>
            <div className="flex flex-col items-center gap-2 md:gap-4 mt-6 md:mt-10 mb-8 md:mb-10">
              {["Emotional Regulation", "Resilience & Connection"].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                  <span className="text-white/85 font-unica" style={{ fontSize: 'clamp(0.9rem, 0.95vw, 0.95rem)' }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowTeamsModal(true)} className="bg-transparent text-white border border-white/50 px-8 md:px-12 py-4 md:py-5 min-h-[48px] rounded-full font-medium tracking-wide hover:bg-white/10 hover:border-white/70 transition-all inline-flex items-center justify-center" style={{
            fontSize: 'clamp(0.95rem, 1.1vw, 1.1rem)'
          }}>
              Book a Discovery Conversation
            </button>
          </div>
        </section>

        {/* TEAM SESSION IMAGES */}
        <section className="pb-6 md:pb-10 relative overflow-hidden bg-black">
          <div className="mx-auto px-6 lg:px-8 max-w-[1600px] relative z-10">
            {/* Horizontal scroll on mobile, grid on tablet+ */}
            <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 px-4 md:px-0 -mx-0 md:mx-0 scrollbar-hide">
              <div className="flex-shrink-0 w-[280px] md:w-auto rounded-xl overflow-hidden aspect-[4/3] snap-start">
                <img src={teamsSessionGroup} alt="Group breathwork session with teams" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-[280px] md:w-auto rounded-xl overflow-hidden aspect-[4/3] snap-start">
                <img src={marchSpeakingOutdoor} alt="March leading a corporate session" className="w-full h-full object-cover" style={{
                objectPosition: 'center 25%'
              }} />
              </div>
              <div className="flex-shrink-0 w-[280px] md:w-auto rounded-xl overflow-hidden aspect-[4/3] snap-start">
                <img src={teamsSessionWide} alt="Wide view of team wellness session" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </section>


        {/* THREE OFFERINGS */}
        <section className="py-10 md:py-14 lg:py-18 relative overflow-hidden bg-black">
          <div className="mx-auto px-5 md:px-10 lg:px-12 max-w-[1600px] relative z-10">
            <p className="text-white/60 uppercase tracking-[0.12em] md:tracking-[0.15em] text-center mb-8 md:mb-12 max-w-[1200px] mx-auto" style={{
            fontSize: 'clamp(0.7rem, 0.8vw, 0.8rem)'
          }}>
              THREE WAYS TO WORK TOGETHER
            </p>
            
            {/* Mobile Carousel */}
            <div className="md:hidden">
              {(() => {
                const MobileOfferingCard = ({ number, title, description, items, onButtonClick }: {
                  number: string;
                  title: string;
                  description: string;
                  items: string[];
                  onButtonClick: () => void;
                }) => (
                  <div className="flex-shrink-0 w-[300px] snap-start rounded-md p-5 flex flex-col bg-transparent border border-white/30">
                    <p className="text-white/60 text-xs uppercase tracking-[0.15em] mb-4 font-medium">{number}</p>
                    <h4 className="text-white font-editorial mb-6 text-[1.4rem] font-light leading-[1.2]">{title}</h4>
                    <p className="text-white/70 mb-6 leading-[1.65] text-[0.9rem]">{description}</p>
                    <ul className="text-white/60 space-y-4 mb-6 flex-grow text-[0.85rem]">
                      {items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-white/40 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <button onClick={onButtonClick} className="w-full bg-transparent text-white border border-white/40 px-4 py-3 min-h-[44px] rounded-md text-[0.9rem] font-normal tracking-wide">
                      Book a Conversation
                    </button>
                  </div>
                );

                return (
                  <div
                    className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 mx-5 px-5 scrollbar-hide"
                    style={{
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                      WebkitOverflowScrolling: 'touch'
                    }}
                  >
                    <MobileOfferingCard
                      number="01"
                      title="Custom Workshops"
                      description="Targeted, in-the-moment nervous system support for teams under real work pressure."
                      items={[
                        "Best for: team offsites, leadership days",
                        "30-min or 60-min formats",
                        "Online or in person"
                      ]}
                      onButtonClick={() => setShowTeamsModal(true)}
                    />
                    <MobileOfferingCard
                      number="02"
                      title="Monthly Support"
                      description="Consistent nervous system support that builds regulation and steadiness over time."
                      items={[
                        "1 × 45-min session per month",
                        "Up to 30 people",
                        "Min 3-month engagement",
                        "Includes studio membership"
                      ]}
                      onButtonClick={() => setShowTeamsModal(true)}
                    />
                    <MobileOfferingCard
                      number="03"
                      title="ARC Foundations (8 Weeks)"
                      description="A structured programme for teams ready for deeper, sustainable change."
                      items={[
                        "8 weekly 60-min sessions",
                        "Up to 15 per cohort",
                        "Online or in person"
                      ]}
                      onButtonClick={() => setShowTeamsModal(true)}
                    />
                  </div>
                );
              })()}
              {/* Carousel hint */}
              <p className="text-white/40 text-xs text-center mt-1 tracking-wide">
                Swipe to see more
              </p>
            </div>

            {/* Tablet/Desktop Grid */}
            <div className="hidden md:grid md:grid-cols-3 gap-4 lg:gap-5 w-full">
              {/* Card 1 — Custom Workshops */}
              <div className="group relative rounded-none p-10 lg:p-12 flex flex-col min-h-[400px] transition-colors duration-500 bg-transparent border border-white/30 hover:border-white/50">
                <p className="text-white/60 text-xs uppercase tracking-[0.15em] mb-4 font-medium relative z-10">01</p>
                <h4 className="text-white font-editorial mb-5 relative z-10" style={{ fontSize: 'clamp(1.6rem, 2vw, 2rem)', fontWeight: 300, lineHeight: 1.2 }}>Custom Workshops</h4>
                <p className="text-white/70 mb-6 leading-[1.75] relative z-10" style={{ fontSize: 'clamp(0.95rem, 1.05vw, 1.05rem)' }}>Targeted, in-the-moment nervous system support for teams under real work pressure.</p>
                <ul className="text-white/60 space-y-2 mb-8 flex-grow relative z-10" style={{ fontSize: 'clamp(0.85rem, 0.95vw, 0.95rem)' }}>
                  <li className="flex items-start gap-2"><span className="text-white/40 mt-1">•</span><span>Best for: team offsites, leadership days, moments of high stress or change</span></li>
                  <li className="flex items-start gap-2"><span className="text-white/40 mt-1">•</span><span>Formats: 30-minute ARC Reset or 60-minute ARC Workshop</span></li>
                  <li className="flex items-start gap-2"><span className="text-white/40 mt-1">•</span><span>Online or in person</span></li>
                </ul>
                <button onClick={() => setShowTeamsModal(true)} className="w-full bg-transparent text-white border border-white/40 px-5 py-4 min-h-[44px] rounded-none font-normal tracking-wide hover:bg-white/10 hover:border-white/60 transition-all flex items-center justify-center gap-2 relative z-10" style={{ fontSize: 'clamp(0.9rem, 1vw, 1rem)' }}>Book a Discovery Conversation</button>
              </div>

              {/* Card 2 — Monthly Support */}
              <div className="group relative rounded-none p-10 lg:p-12 flex flex-col min-h-[400px] transition-colors duration-500 bg-transparent border border-white/30 hover:border-white/50">
                <p className="text-white/60 text-xs uppercase tracking-[0.15em] mb-4 font-medium relative z-10">02</p>
                <h4 className="text-white font-editorial mb-5 relative z-10" style={{ fontSize: 'clamp(1.6rem, 2vw, 2rem)', fontWeight: 300, lineHeight: 1.2 }}>Monthly Support</h4>
                <p className="text-white/70 mb-6 leading-[1.75] relative z-10" style={{ fontSize: 'clamp(0.95rem, 1.05vw, 1.05rem)' }}>Consistent nervous system support that builds regulation, presence, and steadiness over time.</p>
                <ul className="text-white/60 space-y-2 mb-8 flex-grow relative z-10" style={{ fontSize: 'clamp(0.85rem, 0.95vw, 0.95rem)' }}>
                  <li className="flex items-start gap-2"><span className="text-white/40 mt-1">•</span><span>1 × 45-minute live session per month</span></li>
                  <li className="flex items-start gap-2"><span className="text-white/40 mt-1">•</span><span>Up to 30 people</span></li>
                  <li className="flex items-start gap-2"><span className="text-white/40 mt-1">•</span><span>Minimum 3-month engagement</span></li>
                  <li className="flex items-start gap-2"><span className="text-white/40 mt-1">•</span><span>Includes studio membership for participants</span></li>
                  <li className="flex items-start gap-2"><span className="text-white/40 mt-1">•</span><span>Online or in person</span></li>
                </ul>
                <button onClick={() => setShowTeamsModal(true)} className="w-full bg-transparent text-white border border-white/40 px-5 py-4 min-h-[44px] rounded-none font-normal tracking-wide hover:bg-white/10 hover:border-white/60 transition-all flex items-center justify-center gap-2 relative z-10" style={{ fontSize: 'clamp(0.9rem, 1vw, 1rem)' }}>Book a Discovery Conversation</button>
              </div>

              {/* Card 3 — ARC Foundations (8 Weeks) */}
              <div className="group relative rounded-none p-10 lg:p-12 flex flex-col min-h-[400px] transition-colors duration-500 bg-transparent border border-white/30 hover:border-white/50">
                <p className="text-white/60 text-xs uppercase tracking-[0.15em] mb-4 font-medium relative z-10">03</p>
                <h4 className="text-white font-editorial mb-5 relative z-10" style={{ fontSize: 'clamp(1.6rem, 2vw, 2rem)', fontWeight: 300, lineHeight: 1.2 }}>ARC Foundations (8 Weeks)</h4>
                <p className="text-white/70 mb-6 leading-[1.75] relative z-10" style={{ fontSize: 'clamp(0.95rem, 1.05vw, 1.05rem)' }}>A structured nervous system programme for teams ready for deeper, sustainable change.</p>
                <ul className="text-white/60 space-y-2 mb-8 flex-grow relative z-10" style={{ fontSize: 'clamp(0.85rem, 0.95vw, 0.95rem)' }}>
                  <li className="flex items-start gap-2"><span className="text-white/40 mt-1">•</span><span>8 weekly 60-minute sessions</span></li>
                  <li className="flex items-start gap-2"><span className="text-white/40 mt-1">•</span><span>Up to 15 participants per cohort</span></li>
                  <li className="flex items-start gap-2"><span className="text-white/40 mt-1">•</span><span>Larger teams run multiple cohorts</span></li>
                  <li className="flex items-start gap-2"><span className="text-white/40 mt-1">•</span><span>Online or in person</span></li>
                </ul>
                <button onClick={() => setShowTeamsModal(true)} className="w-full bg-transparent text-white border border-white/40 px-5 py-4 min-h-[44px] rounded-none font-normal tracking-wide hover:bg-white/10 hover:border-white/60 transition-all flex items-center justify-center gap-2 relative z-10" style={{ fontSize: 'clamp(0.9rem, 1vw, 1rem)' }}>Book a Discovery Conversation</button>
              </div>
            </div>
            
            {/* Micro-copy below cards */}
            <p className="text-white/50 text-center mt-6 md:mt-10 max-w-xl mx-auto px-4 md:px-0" style={{
              fontSize: 'clamp(0.85rem, 0.95vw, 0.95rem)',
              lineHeight: 1.7
            }}>
              A short, no-obligation conversation to understand what's most appropriate for your team.
            </p>
          </div>
        </section>

        {/* VALUE / OUTCOMES + TESTIMONIAL - Combined Split Section */}
        <section className="py-12 md:py-20 lg:py-32 relative overflow-hidden">
          <div className="mx-auto px-5 md:px-6 lg:px-8 max-w-[1600px] relative z-10">
            
            {/* What Teams Say - Testimonials */}
            <div>
              <p className="text-white/60 uppercase tracking-[0.12em] md:tracking-[0.15em] mb-6 md:mb-10 text-center" style={{
              fontSize: 'clamp(0.7rem, 0.8vw, 0.8rem)'
            }}>
                WHAT TEAMS SAY
              </p>
              
            {/* Video + Written Testimonials Side by Side */}
              <div className="flex flex-col lg:flex-row lg:items-stretch gap-6 lg:gap-10">
                {/* Video Testimonial - Full width on mobile */}
                <div className="w-full lg:w-[420px] shrink-0 flex rounded-xl lg:rounded-2xl overflow-hidden shadow-md aspect-video lg:aspect-auto">
                  <video
                    controls
                    poster="/videos/shay-obrien-poster.jpg"
                    className="w-full h-full object-cover"
                    preload="metadata"
                  >
                    <source src="/videos/shay-obrien-testimonial.mp4" type="video/mp4" />
                  </video>
                </div>
                
                {/* Testimonial Screenshots - Carousel on mobile, Grid on tablet+ */}
                <div className="flex-1">
                  {/* Mobile Carousel */}
                  <div className="md:hidden">
                    <div
                      className="flex items-start gap-3 overflow-x-auto snap-x snap-mandatory pb-2 mx-5 px-5 scrollbar-hide"
                      style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch'
                      }}
                    >
                      {[teamsTestimonial1, teamsTestimonial2, teamsTestimonial3, teamsTestimonial4, teamsTestimonial5, teamsTestimonial6].map((testimonialImg, idx) => (
                        <div
                          key={idx}
                          className="p-2 flex-shrink-0 w-[280px] snap-start overflow-hidden rounded-lg shadow-md bg-white"
                        >
                          <img
                            src={testimonialImg}
                            alt={`Team testimonial ${idx + 1}`}
                            className="w-full h-auto object-contain"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                    {/* Carousel hint text */}
                    <p className="text-white/40 text-xs text-center mt-3 tracking-wide">
                      Swipe to see more
                    </p>
                  </div>

                  {/* Tablet/Desktop Grid */}
                  <div className="hidden md:grid grid-cols-2 gap-4 md:gap-6 lg:gap-8 items-stretch">
                    {[teamsTestimonial1, teamsTestimonial2, teamsTestimonial3, teamsTestimonial4, teamsTestimonial5, teamsTestimonial6].map((testimonialImg, idx) => (
                      <div key={idx} className="overflow-hidden rounded-xl shadow-md bg-white">
                        <img src={testimonialImg} alt={`Team testimonial ${idx + 1}`} className="w-full h-auto object-contain" loading="lazy" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Divider Line - Between Corporate & Events */}
        <div className="pt-10 md:py-24 lg:py-44 bg-background px-5 md:px-10 lg:px-12">
          <div className="h-[1px] w-full max-w-[1600px] mx-auto bg-[#E6DBC7]" />
        </div>

        {/* ========== EVENTS & COMMUNITY ========== */}
        <section className="pb-16 md:pb-28 lg:pb-48 relative overflow-hidden bg-background">
          <div className="mx-auto px-6 md:px-10 lg:px-12 max-w-[1400px] relative z-10">
            {/* Section Header - Centered */}
            <div className="mb-10 md:mb-14 text-center">
              <h2 className="font-editorial text-white mb-3 leading-[1.15]" style={{
                fontSize: 'clamp(2rem, 3.5vw, 3.5rem)',
                fontWeight: 300
              }}>
                Events
              </h2>
              <p className="text-white/65 max-w-lg mx-auto leading-[1.6] px-2 md:px-0" style={{
                fontSize: 'clamp(0.95rem, 1.1vw, 1.1rem)'
              }}>
                Live sessions, workshops, and gatherings — online and in-person
              </p>
            </div>

            {/* Vertical Event Cards - 3 events (excluding in-person Breath, Presence) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
              {eventsData
                .filter(event => event.id !== 'breath-presence-inperson' && event.id !== 'breathwork-to-dub')
                .map((event) => {
                const nextDate = getNextEventDate(event.recurrence, event.time);
                const formattedDate = formatEventDate(nextDate, event.time);
                const isOnline = event.format === 'Online' || event.format === 'Studio Membership Only';
                const isFreeEvent = event.eventType === 'free';
                
                return (
                  <Link 
                    key={event.id}
                    to="/events"
                    className="group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.12] hover:border-white/25 transition-colors duration-500 bg-black/40 shadow-lg md:shadow-[0_0_60px_rgba(230,219,199,0.25)]"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img 
                        src={event.image}
                        alt={event.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0" style={{
                        background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.9) 100%)'
                      }} />
                      
                      {/* Format Badge - Overlay on image */}
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-[0.12em] font-medium bg-black/60 backdrop-blur-sm"
                        style={{ color: isOnline ? '#4ade80' : '#D4A574' }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isOnline ? '#4ade80' : '#D4A574' }} />
                        {isOnline ? 'Online' : 'In-Person'}
                      </span>
                      
                      {/* Content overlaid on image bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        {/* Title */}
                        <h3 className="font-editorial text-[clamp(1.1rem,1.4vw,1.3rem)] text-white font-light leading-[1.25] mb-2 tracking-[-0.01em]">
                          {event.title}
                        </h3>
                        
                        {/* Subtitle */}
                        <p className="text-[12px] text-white/70 leading-[1.5] mb-3 line-clamp-2">
                          {event.subtitle}
                        </p>
                        
                        {/* Date & Recurrence */}
                        <p className="text-[11px] text-white/50 font-medium tracking-wide">
                          {event.recurrenceLabel} · {formattedDate}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* View All Events CTA */}
            <div className="text-center mt-12">
              <Link 
                to="/events" 
                className="inline-flex items-center gap-2 text-white/80 text-[13px] tracking-wide font-light hover:text-white transition-colors duration-300 min-h-[44px]"
              >
                View All Events & IG Lives
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="min-h-[280px] md:min-h-[380px] flex items-center justify-center relative py-12 md:py-0" style={{
        backgroundColor: '#000000'
      }}>
        {/* M Logo with textured background image */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-[240px] h-[240px] md:w-[340px] md:h-[340px]"
              style={{
                WebkitMaskImage: `url(${mLogo})`,
                maskImage: `url(${mLogo})`,
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
                backgroundImage: `url(${marchGlowingCircle})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: 'translateZ(0)',
                filter: 'drop-shadow(0 0 15px rgba(180, 130, 80, 0.6))',
              }}
              role="img"
              aria-label="March logo"
            />
          </div>
          
          <div className="container mx-auto px-5 md:px-8 max-w-2xl text-center py-10 md:py-20 relative z-10">
            <h2 className="font-editorial text-white mb-4 md:mb-6 leading-[1.15]" style={{
            fontSize: 'clamp(1.8rem, 3vw, 2.8rem)'
          }}>
              Not Sure Where to Start?
            </h2>
            <p className="text-white/70 mb-8 md:mb-12 leading-[1.65]" style={{
            fontSize: 'clamp(0.95rem, 1.15vw, 1.15rem)'
          }}>
              Begin with whatever feels most relevant to where you are today. Every offering helps you move from tension → space, protection → presence, surviving → living.
            </p>
            
            {/* Book Discovery Call CTA */}
            
          </div>
        </section>
      </main>}
      
      <div className="bg-black">
        <TermsMicrocopy />
        <Footer />
      </div>
      
      <CourseModal course={selectedCourse} isOpen={showCourseModal} onClose={() => setShowCourseModal(false)} />
      <ArcProgramModal open={showArcProgramModal} onOpenChange={setShowArcProgramModal} programType={arcProgramType} onApply={() => setShowApplicationForm(true)} />
    </div>;
};
export default Courses;
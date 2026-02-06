import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Play, Lock, ArrowLeft, User } from "lucide-react";
import { toast } from "sonner";
import SessionDetailModal from "./SessionDetail";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { OptimizedImage } from "@/components/OptimizedImage";
import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/supabaseImageOptimization";
import StudioFooter from "@/components/StudioFooter";
import { Footer } from "@/components/Footer";
import StudioHeader from "@/components/StudioHeader";

// Course images
import anxietyResetDandelion from "@/assets/anxiety-reset-dandelion.jpg";
import emotionalFirstAid from "@/assets/emotional-first-aid.jpg";
import sleepNsdrMoon from "@/assets/sleep-nsdr-moon.jpg";
import trialProgramImage from "@/assets/trial-program.webp";

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

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  order_index: number;
  media_url: string;
  content_type: string;
}

const courseImages: Record<string, string> = {
  'breathwork-anxiety-reset': anxietyResetDandelion,
  'anxiety-reset': anxietyResetDandelion,
  'sleep-nsdr-pack': sleepNsdrMoon,
  'emotional-first-aid-kit': emotionalFirstAid,
  'nervous-system-reset': trialProgramImage,
};

const StudioProgram = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, hasSubscription, isAdmin, isTestUser } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Set profile from user metadata
  useEffect(() => {
    if (user) {
      const metadataName = user.user_metadata?.full_name;
      if (metadataName) {
        setUserProfile({ full_name: metadataName });
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!slug) return;

      try {
        setLoading(true);

        // Fetch course
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        if (courseError) throw courseError;
        if (courseData) {
          setCourse(courseData);

          // Fetch lessons for this course
          const { data: lessonsData, error: lessonsError } = await supabase
            .from('course_lessons')
            .select('*')
            .eq('course_id', courseData.id)
            .eq('is_published', true)
            .order('order_index');

          if (lessonsError) throw lessonsError;
          if (lessonsData) {
            setLessons(lessonsData);
          }
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        toast.error('Unable to load program');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [slug]);

  const handleLessonClick = (lessonId: string) => {
    // For now, show subscription modal if not subscribed
    if (!hasSubscription && !isAdmin && !isTestUser) {
      setShowSubscriptionModal(true);
    } else {
      // Navigate to class player or open modal
      setSelectedSessionId(lessonId);
    }
  };

  const courseImage = course ? (courseImages[course.slug] || course.image_url) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="pt-44 px-6 flex items-center justify-center">
          <div className="animate-pulse text-[#E6DBC7]/60">Loading program...</div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="pt-44 px-6 text-center">
          <p className="text-[#E6DBC7]/60 text-xl">Program not found</p>
          <button
            onClick={() => navigate('/studio?tab=programs')}
            className="mt-4 text-[#EC9037] hover:text-[#EC9037]/80 transition-colors"
          >
            Back to Programs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <StudioHeader />

      {/* Program Hero Header - matches StartHere layout exactly */}
      <div className="relative h-[420px] z-10 mt-[340px] md:mt-[380px]">
        {courseImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
            style={{ backgroundImage: `url('${courseImage}')` }}
          />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        
        <div className="relative h-full flex items-end px-6 md:px-10 lg:px-12 pb-14">
          <div className="w-full max-w-3xl">
            <p className="text-[#D4A574] text-sm tracking-[0.15em] uppercase font-light mb-3">
              {lessons.length} Classes
            </p>
            <h1 className="text-5xl md:text-6xl font-editorial text-[#E6DBC7]">
              {course.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Description - italic editorial style like category pages */}
      {(course.short_description || course.description) && (
        <div className="px-6 md:px-10 lg:px-12 pt-12 pb-8">
          <p className="text-xl md:text-2xl lg:text-3xl font-editorial italic text-[#E6DBC7]/70 leading-relaxed max-w-4xl">
            {course.short_description || course.description}
          </p>
        </div>
      )}

      {/* Main Content - matches StartHere layout */}
      <div className="px-6 md:px-10 lg:px-12 pt-16 pb-24">
        <div className="grid gap-4">
          {lessons.map((lesson) => {
            const isLocked = !hasSubscription && !isAdmin && !isTestUser;
            
            return (
              <div
                key={lesson.id}
                onClick={() => handleLessonClick(lesson.id)}
                className="relative overflow-hidden cursor-pointer group rounded-xl border border-[#E6DBC7]/10 hover:border-[#E6DBC7]/20 transition-all hover:shadow-[0_8px_30px_rgba(230,219,199,0.08)]"
              >
                <div className="flex items-stretch bg-[#1a1a1a]/60 hover:bg-[#1a1a1a]/80 transition-all rounded-xl overflow-hidden">
                  {/* Square Thumbnail - matching category card proportions */}
                  <div 
                    className="relative w-[180px] md:w-[220px] aspect-square flex-shrink-0 bg-cover bg-center"
                    style={{ backgroundImage: courseImage ? `url('${courseImage}')` : undefined }}
                  >
                    <div className="absolute inset-0 bg-black/10" />
                    {isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                        <Lock className="w-8 h-8 text-[#E6DBC7]" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  
                  {/* Info - centered vertically */}
                  <div className="flex-1 flex flex-col justify-center px-6 md:px-8 py-6 min-w-0">
                    <h3 className="text-xl md:text-2xl font-editorial text-[#E6DBC7] mb-2">
                      {lesson.title}
                    </h3>
                    {lesson.description && (
                      <p className="text-sm md:text-base text-[#E6DBC7]/70 font-light mb-2 line-clamp-2">
                        {lesson.description}
                      </p>
                    )}
                    <p className="text-sm text-[#E6DBC7]/50 font-light">
                      March Russell • {lesson.duration_minutes || 10} min
                    </p>
                  </div>
                
                  {/* Circular Play Button - right side */}
                  <div className="flex items-center pr-6 md:pr-8">
                    {isLocked ? (
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-[#E6DBC7]/20 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-[#E6DBC7]/40" strokeWidth={1.5} />
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLessonClick(lesson.id);
                        }}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-[#E6DBC7]/30 hover:border-[#E6DBC7]/50 flex items-center justify-center transition-all hover:bg-[#E6DBC7]/5"
                      >
                        <Play className="w-5 h-5 md:w-6 md:h-6 text-[#E6DBC7] ml-0.5" fill="currentColor" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {lessons.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#E6DBC7]/60">Classes coming soon</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 md:px-10 lg:px-12">
        <StudioFooter />
      </div>

      <Footer />

      {/* Modals */}
      <SubscriptionModal 
        open={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)}
      />
      
      <SessionDetailModal 
        sessionId={selectedSessionId}
        open={!!selectedSessionId}
        onClose={() => setSelectedSessionId(null)}
      />
    </div>
  );
};

export default StudioProgram;

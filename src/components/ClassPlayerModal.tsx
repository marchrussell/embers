import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFavourites } from "@/hooks/useFavourites";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, X, Heart, Share2 } from "lucide-react";
import { SessionCompletionModal } from "@/components/SessionCompletionModal";
import { ModalContentSkeleton } from "@/components/skeletons/ModalContentSkeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ClassPlayerModalProps {
  classId: string | null;
  open: boolean;
  onClose: () => void;
  skipSafetyModal?: boolean;
}

export const ClassPlayerModal = ({ classId, open, onClose, skipSafetyModal = false }: ClassPlayerModalProps) => {
  const { user } = useAuth();
  const { isFavourite, toggleFavourite } = useFavourites();
  const [classData, setClassData] = useState<any>(null);
  const [classCategories, setClassCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSafetyDisclosure, setShowSafetyDisclosure] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownCompletion = useRef(false);

  useEffect(() => {
    if (classId && open) {
      setLoading(true);
      setHasStarted(false);
      setIsPlaying(false);
      setCurrentTime(0);

      const fetchClass = async () => {
        // Fetch the class data first
        const { data } = await supabase
          .from("classes")
          .select("*")
          .eq("id", classId)
          .single();

        if (data) {
          setClassData(data);
          
          // Only show safety disclosure if:
          // 1. This specific class has show_safety_reminder enabled AND
          // 2. We haven't already shown the safety modal (skipSafetyModal is false)
          const shouldShowSafety = !skipSafetyModal && (data.show_safety_reminder || false);
          setShowSafetyDisclosure(shouldShowSafety);
          
          // If no safety reminder needed, automatically start the session
          if (!shouldShowSafety) {
            setHasStarted(true);
            setIsPlaying(true);
          }
          
          // Fetch all categories via junction table
          const { data: junctionData } = await supabase
            .from("class_categories")
            .select("categories(*)")
            .eq("class_id", classId);
          const cats = (junctionData || []).map((row: any) => row.categories).filter(Boolean);
          if (cats.length > 0) {
            setClassCategories(cats);
          } else if (data.category_id) {
            // Fallback to legacy category_id
            const { data: fallbackCat } = await supabase
              .from("categories")
              .select("*")
              .eq("id", data.category_id)
              .single();
            if (fallbackCat) setClassCategories([fallbackCat]);
          }
          
          // Create audio element with lazy loading
          if (data.audio_url && !audioRef.current) {
            const audio = new Audio();
            // Optimize loading: only load metadata initially
            audio.preload = 'metadata';
            audio.src = data.audio_url;
            
            audio.addEventListener('loadedmetadata', () => {
              setDuration(audio.duration);
              
              // Auto-play if no safety reminder needed OR if we're skipping the safety modal
              if (!data.show_safety_reminder || skipSafetyModal) {
                audio.play().catch(() => {
                  // Silent failure - user will manually play
                });
              }
            });
            audio.addEventListener('timeupdate', () => {
              setCurrentTime(audio.currentTime);
              
              // Check if session is complete (within 5 seconds of end)
              if (!hasShownCompletion.current && audio.duration - audio.currentTime <= 5 && audio.currentTime > 0) {
                hasShownCompletion.current = true;
                markSessionComplete();
              }
            });
            audio.addEventListener('ended', () => {
              setIsPlaying(false);
              if (!hasShownCompletion.current) {
                hasShownCompletion.current = true;
                markSessionComplete();
              }
            });
            audioRef.current = audio;
          }
          
          // Fetch user profile and stats
          if (user?.id) {
            fetchUserStatsAndProfile();
          }
        }
        setLoading(false);
      };

      fetchClass();
    }
    
    return () => {
      // Clean up audio when modal closes
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      // Reset completion flag when modal closes
      hasShownCompletion.current = false;
    };
  }, [classId, open]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && hasStarted) {
        audioRef.current.play().catch(() => {
          // Silent failure
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, hasStarted]);

  const handleStart = async () => {
    // Update user's profile to mark they've accepted safety disclosure AND completed onboarding
    // Always set both flags together to maintain consistency
    if (user?.id && showSafetyDisclosure) {
      await supabase
        .from('profiles')
        .update({ 
          has_accepted_safety_disclosure: true,
          has_completed_onboarding: true 
        })
        .eq('id', user.id);
    }
    
    
    setShowSafetyDisclosure(false);
    setHasStarted(true);
    setIsPlaying(true);
    
    // Start playing audio immediately for first-time users
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Silent failure
      });
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setHasStarted(false);
    setCurrentTime(0);
    onClose();
  };

  const fetchUserStatsAndProfile = async () => {
    if (!user?.id) return;

    try {
      console.log('📊 Fetching stats for user:', user.id);
      
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileData) {
        console.log('📊 Profile data:', profileData);
        setUserProfile(profileData);
      }

      // Fetch user stats from progress table
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', true);

      const totalSessions = progressData?.length || 0;
      
      // Calculate total minutes from completed sessions
      const sessionIds = progressData?.map(p => p.class_id) || [];
      if (sessionIds.length > 0) {
        const { data: classesData } = await supabase
          .from('classes')
          .select('duration_minutes')
          .in('id', sessionIds);
        
        const totalMinutes = classesData?.reduce((sum, c) => sum + (c.duration_minutes || 0), 0) || 0;
        
        setUserStats({
          totalSessions,
          totalMinutes,
          currentStreak: 1 // Could calculate actual streak based on dates
        });
      } else {
        setUserStats({ totalSessions: 0, totalMinutes: 0, currentStreak: 0 });
      }
    } catch (error) {
      console.error('📊 Error fetching user stats:', error);
    }
  };

  const markSessionComplete = async () => {
    if (!user?.id || !classId) return;

    try {
      console.log('📊 Marking session complete:', { userId: user.id, classId });
      
      // Mark session as completed in user_progress
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('class_id', classId)
        .maybeSingle();

      if (existingProgress) {
        const { error } = await supabase
          .from('user_progress')
          .update({
            completed: true,
            completed_at: new Date().toISOString(),
            last_position_seconds: 0
          })
          .eq('id', existingProgress.id);
        
        if (error) {
          console.error('Error updating progress:', error);
        }
      } else {
        const { error } = await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            class_id: classId,
            completed: true,
            completed_at: new Date().toISOString(),
            last_position_seconds: 0
          });
        
        if (error) {
          console.error('Error inserting progress:', error);
        }
      }

      // Refresh stats and show completion modal
      await fetchUserStatsAndProfile();
      setShowCompletionModal(true);
    } catch (error) {
      console.error('Error marking session complete:', error);
    }
  };

  const handleFavourite = () => {
    if (classId) {
      toggleFavourite(classId);
    }
  };

  const handleShare = async () => {
    if (!classData?.is_published) {
      toast.error("This session cannot be shared");
      return;
    }

    const shareUrl = `${window.location.origin}/shared-session/${classId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: classData?.title,
          text: `Check out this breathwork session: ${classData?.title}`,
          url: shareUrl,
        });
        toast.success("Shared successfully");
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          await navigator.clipboard.writeText(shareUrl);
          toast.success("Link copied to clipboard");
        }
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Safety Disclosure Dialog */}
      <Dialog open={showSafetyDisclosure && open} onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}>
        <DialogContent className="max-w-2xl backdrop-blur-xl bg-black/75 border border-white/30 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-4xl font-editorial text-[#E6DBC7]">Breathwork Safety</DialogTitle>
            <DialogDescription className="text-[#E6DBC7]/70 font-light text-base md:text-lg">
              Please read this important safety information before starting your breathwork practice.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-base md:text-lg text-[#E6DBC7]/90 font-light leading-relaxed">
              Never practice while in water, at heights or while operating a vehicle. Before doing breathwork, please consult a doctor if any of these apply to you. Remember, you are safe and in control of your own experience.
            </p>
            <Button 
              onClick={handleStart} 
              className="w-full bg-[#E6DBC7] text-background hover:bg-[#E6DBC7]/90 py-6 text-base font-light tracking-wide rounded-full"
            >
              I Understand, Begin Class
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Player Modal */}
      <Dialog open={!showSafetyDisclosure && open && hasStarted} onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}>
        <DialogContent 
          className="max-w-6xl h-[95vh] md:h-auto p-0 backdrop-blur-xl bg-black/75 border border-white/30 overflow-hidden rounded-xl w-[98%] md:w-[95%]"
          hideClose
        >
          <DialogTitle className="sr-only">
            {classData?.title || "Audio Player"}
          </DialogTitle>
          {loading ? (
            <ModalContentSkeleton variant="player" />
          ) : (
            <>
              {/* Mobile Layout - Vertical with background image */}
              <div className="relative h-[95vh] flex flex-col md:hidden">
                {/* Background Image */}
                {classData?.image_url && (
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${classData.image_url})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background/90" />
                  </div>
                )}

                {/* Top bar with favorite/share on left, close on right */}
                <div className="relative z-10 p-3 flex justify-between items-start">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavourite();
                      }}
                      className="transition-all p-2 rounded-lg hover:bg-[#E6DBC7]/10"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          classId && isFavourite(classId) ? "fill-[#E6DBC7] text-[#E6DBC7]" : "text-[#E6DBC7]"
                        }`}
                        strokeWidth={1.5}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare();
                      }}
                      className="transition-all p-2 rounded-lg hover:bg-[#E6DBC7]/10"
                    >
                      <Share2 className="w-5 h-5 text-[#E6DBC7]" strokeWidth={1.5} />
                    </button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="text-[#E6DBC7] hover:bg-[#E6DBC7]/10 rounded-lg p-2"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Title and Info */}
                <div className="relative z-10 px-4 pt-2">
                  <h2 className="text-3xl font-editorial text-[#E6DBC7] mb-2 leading-tight">{classData?.title}</h2>
                  <p className="text-[#E6DBC7]/70 text-base font-light">
                    {classData?.teacher_name || "March Russell"} • {classData?.duration_minutes || 0} min
                  </p>
                  {classCategories.length > 0 && (
                    <p className="text-[#EC9037] text-sm mt-2 font-light tracking-[0.15em] uppercase">
                      {classCategories.map((c: any) => c.name).join(" · ")}
                    </p>
                  )}
                </div>

                {/* Main Content - Play/Pause Button in Center */}
                <div className="relative z-10 flex-1 flex items-center justify-center py-8">
                  <Button
                    onClick={handlePlayPause}
                    variant="outline"
                    size="lg"
                    className="bg-[#E6DBC7]/5 backdrop-blur-xl border-2 border-[#E6DBC7] text-[#E6DBC7] hover:bg-[#E6DBC7]/10 rounded-full h-28 w-28 p-0 transition-colors duration-300"
                  >
                    {isPlaying ? (
                      <Pause className="h-10 w-10" strokeWidth={1.5} fill="none" />
                    ) : (
                      <Play className="h-10 w-10 ml-1" strokeWidth={1.5} fill="none" />
                    )}
                  </Button>
                </div>

                {/* Progress Bar - Bottom */}
                <div className="relative z-10 px-4 pb-6">
                  <div className="space-y-2">
                    <Slider
                      value={[currentTime]}
                      max={duration}
                      step={1}
                      onValueChange={handleSliderChange}
                      className="cursor-pointer touch-none"
                    />
                    <div className="flex justify-between text-xs text-[#E6DBC7]/70 font-light">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Layout - Horizontal rectangle */}
              <div className="hidden md:grid md:grid-cols-2 md:gap-0 md:h-[600px]">
                {/* Left side - Image */}
                <div className="relative overflow-hidden">
                  {classData?.image_url && (
                    <img 
                      src={classData.image_url} 
                      alt={classData?.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20" />
                </div>

                {/* Right side - Controls and Info */}
                <div className="relative bg-background/60 backdrop-blur-xl flex flex-col p-8 lg:p-12">
                  {/* Close button - top right */}
                  <div className="absolute top-6 right-6">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClose}
                      className="text-[#E6DBC7] hover:bg-[#E6DBC7]/10 rounded-lg"
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>

                  {/* Top section - Title and actions */}
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-4xl lg:text-5xl font-editorial text-[#E6DBC7] mb-3 leading-tight pr-12">{classData?.title}</h2>
                      <p className="text-[#E6DBC7]/70 text-lg font-light">
                        {classData?.teacher_name || "March Russell"} • {classData?.duration_minutes || 0} min
                      </p>
                      {classCategories.length > 0 && (
                        <p className="text-[#EC9037] text-base mt-3 font-light tracking-[0.15em] uppercase">
                          {classCategories.map((c: any) => c.name).join(" · ")}
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFavourite();
                        }}
                        className="transition-all p-2.5 rounded-lg hover:bg-[#E6DBC7]/10 border border-[#E6DBC7]/20"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            classId && isFavourite(classId) ? "fill-[#E6DBC7] text-[#E6DBC7]" : "text-[#E6DBC7]"
                          }`}
                          strokeWidth={1.5}
                        />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare();
                        }}
                        className="transition-all p-2.5 rounded-lg hover:bg-[#E6DBC7]/10 border border-[#E6DBC7]/20"
                      >
                        <Share2 className="w-5 h-5 text-[#E6DBC7]" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>

                  {/* Middle section - Play button */}
                  <div className="flex-1 flex items-center justify-center py-12">
                    <Button
                      onClick={handlePlayPause}
                      variant="outline"
                      size="lg"
                      className="bg-[#E6DBC7]/5 backdrop-blur-xl border-2 border-[#E6DBC7] text-[#E6DBC7] hover:bg-[#E6DBC7]/10 rounded-full h-32 w-32 lg:h-40 lg:w-40 p-0 transition-colors duration-300"
                    >
                      {isPlaying ? (
                        <Pause className="h-12 w-12 lg:h-16 lg:w-16" strokeWidth={1.5} fill="none" />
                      ) : (
                        <Play className="h-12 w-12 lg:h-16 lg:w-16 ml-1" strokeWidth={1.5} fill="none" />
                      )}
                    </Button>
                  </div>

                  {/* Bottom section - Progress bar */}
                  <div className="space-y-3">
                    <Slider
                      value={[currentTime]}
                      max={duration}
                      step={1}
                      onValueChange={handleSliderChange}
                      className="cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-[#E6DBC7]/60">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Session Completion Celebration */}
      <SessionCompletionModal
        open={showCompletionModal}
        onClose={() => {
          setShowCompletionModal(false);
          handleClose();
        }}
        userName={userProfile?.full_name?.split(' ')[0] || userProfile?.first_name || user?.user_metadata?.full_name?.split(' ')[0] || 'there'}
        sessionId={classId || undefined}
        sessionTitle={classData?.title}
        userId={user?.id}
        userStats={userStats}
      />
    </>
  );
};

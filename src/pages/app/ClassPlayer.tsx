import { OptimizedImage } from "@/components/OptimizedImage";
import { SafetyDisclosureModal } from "@/components/SafetyDisclosureModal";
import { ClassPlayerSkeleton } from "@/components/skeletons/ClassPlayerSkeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { IMAGE_PRESETS } from "@/lib/supabaseImageOptimization";
import { ArrowLeft, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ClassPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasAcceptedSafetyDisclosure, checkSubscription, refreshOnboardingStatus } = useAuth();
  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSessionSafetyDisclosure, setShowSessionSafetyDisclosure] = useState(true);
  const [showGlobalSafetyModal, setShowGlobalSafetyModal] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync modal state with acceptance status
  useEffect(() => {
    setShowGlobalSafetyModal(!hasAcceptedSafetyDisclosure);
  }, [hasAcceptedSafetyDisclosure]);

  useEffect(() => {
    const fetchClass = async () => {
      const { data } = await supabase
        .from("classes")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setClassData(data);
        // Duration in minutes from database, convert to seconds
        setDuration((data.duration_minutes || 3) * 60);
        // Only show session safety disclosure if the class has show_safety_reminder enabled
        setShowSessionSafetyDisclosure(data.show_safety_reminder || false);
      }
      setLoading(false);
    };

    fetchClass();
  }, [id]);

  // Playback timer
  useEffect(() => {
    if (isPlaying && hasStarted) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, hasStarted, duration]);

  const handleGlobalSafetyAccept = async () => {
    setShowGlobalSafetyModal(false);
    // Refresh onboarding status to pick up the safety acceptance
    await refreshOnboardingStatus();
  };

  const handleStart = () => {
    setShowSessionSafetyDisclosure(false);
    setHasStarted(true);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRewind = () => {
    setCurrentTime((prev) => Math.max(0, prev - 10));
  };

  const handleForward = () => {
    setCurrentTime((prev) => Math.min(duration, prev + 10));
  };

  const handleSliderChange = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return <ClassPlayerSkeleton />;
  }

  return (
    <>
      {/* Global Safety Disclosure Modal - Must accept before accessing any sessions */}
      {user && (
        <SafetyDisclosureModal
          isOpen={showGlobalSafetyModal}
          onAccept={handleGlobalSafetyAccept}
          userId={user.id}
        />
      )}

      {/* Session-specific Safety Reminder */}
      {classData?.show_safety_reminder && (
        <Dialog open={showSessionSafetyDisclosure} onOpenChange={setShowSessionSafetyDisclosure}>
          <DialogContent className="backdrop-blur-xl bg-black/30 border border-white/30 max-w-2xl rounded-xl">
            <DialogHeader>
              <DialogTitle>Safety Reminder</DialogTitle>
              <DialogDescription>
                Please read this important safety information before starting this breathwork session.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {classData?.safety_note && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{classData.safety_note}</p>
                </div>
              )}
              <Button onClick={handleStart} className="w-full bg-white text-black hover:bg-white/90">
                I Understand, Begin Class
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="min-h-screen relative overflow-hidden">
        {/* Blurred Background Image */}
        {classData?.image_url && (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${classData.image_url})` }}
            />
            {/* Glassmorphism Overlay */}
            <div className="absolute inset-0 backdrop-blur-3xl bg-black/40" />
          </>
        )}

        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Header */}
          <div className="p-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/studio")}
              className="text-white hover:bg-white/10 text-base md:text-lg"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center px-4 md:px-6 lg:px-8">
            {!hasStarted && !(classData?.show_safety_reminder && showSessionSafetyDisclosure) ? (
              <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Session Image Card */}
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
                  <OptimizedImage
                    src={classData?.image_url}
                    alt={classData?.title}
                    className="w-full h-full object-cover"
                    optimizationOptions={IMAGE_PRESETS.hero}
                    priority={true}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                
                {/* Session Info */}
                <div className="space-y-6 text-center md:text-left">
                  <h1 className="text-4xl md:text-5xl font-editorial text-white">
                    {classData?.title}
                  </h1>
                  <p className="text-lg text-white/90 leading-relaxed">{classData?.description}</p>
                  <div className="space-y-2 text-white/70">
                    <p className="text-base">Duration: {classData?.duration_minutes || 3} minutes</p>
                    <p className="text-sm">Teacher: March Russell</p>
                  </div>
                  <Button
                    onClick={handleStart}
                    size="lg"
                    className="mt-8 bg-white text-black hover:bg-white/90 px-8 py-6 text-lg"
                  >
                    <Play className="mr-2 h-5 w-5" strokeWidth={1.5} fill="none" />
                    Begin Class
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {/* Session Image Card */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
                    <OptimizedImage
                      src={classData?.image_url}
                      alt={classData?.title}
                      className="w-full h-full object-cover"
                      optimizationOptions={IMAGE_PRESETS.hero}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                  
                  {/* Player Controls */}
                  <div className="space-y-8">
                    <div className="text-center md:text-left space-y-2">
                      <h2 className="text-3xl md:text-4xl font-editorial text-white">{classData?.title}</h2>
                      <p className="text-white/60 text-sm">Guided by March Russell</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <Slider
                        value={[currentTime]}
                        max={duration}
                        step={1}
                        onValueChange={handleSliderChange}
                        className="cursor-pointer"
                      />
                      <div className="flex justify-between text-sm text-white/70">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center md:justify-start gap-4">
                      <Button
                        onClick={handleRewind}
                        variant="ghost"
                        size="lg"
                        className="text-white hover:bg-white/10 rounded-full h-12 w-12 p-0"
                      >
                        <SkipBack className="h-6 w-6" />
                      </Button>

                      <Button
                        onClick={handlePlayPause}
                        size="lg"
                        className="bg-white text-black hover:bg-white/90 rounded-full h-16 w-16 p-0"
                      >
                        {isPlaying ? (
                          <Pause className="h-8 w-8" strokeWidth={1.5} fill="none" />
                        ) : (
                          <Play className="h-8 w-8" strokeWidth={1.5} fill="none" />
                        )}
                      </Button>

                      <Button
                        onClick={handleForward}
                        variant="ghost"
                        size="lg"
                        className="text-white hover:bg-white/10 rounded-full h-12 w-12 p-0"
                      >
                        <SkipForward className="h-6 w-6" />
                      </Button>
                    </div>

                    {/* Breathing Instruction Area */}
                    <div className="text-center md:text-left py-8">
                      <p className="text-2xl text-white/90 font-light">
                        {isPlaying ? "Follow your breath..." : "Paused"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ClassPlayer;

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

const ClassPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasAcceptedSafetyDisclosure, checkSubscription, refreshOnboardingStatus } =
    useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showSessionSafetyDisclosure, setShowSessionSafetyDisclosure] = useState(false);
  const [showGlobalSafetyModal, setShowGlobalSafetyModal] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data: classData, isLoading: loading } = useQuery({
    queryKey: ["class", id],
    queryFn: async () => {
      const { data } = await supabase.from("classes").select("*").eq("id", id).single();
      return data;
    },
    enabled: !!id,
  });

  const duration = (classData?.duration_minutes || 3) * 60;

  // Sync modal state with acceptance status
  useEffect(() => {
    setShowGlobalSafetyModal(!hasAcceptedSafetyDisclosure);
  }, [hasAcceptedSafetyDisclosure]);

  // Initialize safety disclosure from class data
  useEffect(() => {
    if (classData) {
      setShowSessionSafetyDisclosure(classData.show_safety_reminder || false);
    }
  }, [classData]);

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
          <DialogContent className="max-w-2xl rounded-xl border border-white/30 bg-black/30 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>Safety Reminder</DialogTitle>
              <DialogDescription>
                Please read this important safety information before starting this breathwork
                session.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {classData?.safety_note && (
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="whitespace-pre-wrap text-sm">{classData.safety_note}</p>
                </div>
              )}
              <Button
                onClick={handleStart}
                className="w-full bg-white text-black hover:bg-white/90"
              >
                I Understand, Begin Class
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="relative min-h-screen overflow-hidden">
        {/* Blurred Background Image */}
        {classData?.image_url && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${classData.image_url})` }}
            />
            {/* Glassmorphism Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl" />
          </>
        )}

        <div className="relative z-10 flex min-h-screen flex-col">
          {/* Header */}
          <div className="p-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/online")}
              className="text-base text-white hover:bg-white/10 md:text-lg"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex flex-1 items-center justify-center px-4 md:px-6 lg:px-8">
            {!hasStarted && !(classData?.show_safety_reminder && showSessionSafetyDisclosure) ? (
              <div className="mx-auto grid w-full max-w-4xl grid-cols-1 items-center gap-8 md:grid-cols-2">
                {/* Session Image Card */}
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
                  <OptimizedImage
                    src={classData?.image_url}
                    alt={classData?.title}
                    className="h-full w-full object-cover"
                    optimizationOptions={IMAGE_PRESETS.hero}
                    priority={true}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                {/* Session Info */}
                <div className="space-y-6 text-center md:text-left">
                  <h1 className="font-editorial text-4xl text-white md:text-5xl">
                    {classData?.title}
                  </h1>
                  <p className="text-lg leading-relaxed text-white/90">{classData?.description}</p>
                  <div className="space-y-2 text-white/70">
                    <p className="text-base">
                      Duration: {classData?.duration_minutes || 3} minutes
                    </p>
                    <p className="text-sm">Teacher: March Russell</p>
                  </div>
                  <Button
                    onClick={handleStart}
                    size="lg"
                    className="mt-8 bg-white px-8 py-6 text-lg text-black hover:bg-white/90"
                  >
                    <Play className="mr-2 h-5 w-5" strokeWidth={1.5} fill="none" />
                    Begin Class
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mx-auto w-full max-w-4xl">
                <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
                  {/* Session Image Card */}
                  <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
                    <OptimizedImage
                      src={classData?.image_url}
                      alt={classData?.title}
                      className="h-full w-full object-cover"
                      optimizationOptions={IMAGE_PRESETS.hero}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>

                  {/* Player Controls */}
                  <div className="space-y-8">
                    <div className="space-y-2 text-center md:text-left">
                      <h2 className="font-editorial text-3xl text-white md:text-4xl">
                        {classData?.title}
                      </h2>
                      <p className="text-sm text-white/60">Guided by March Russell</p>
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
                    <div className="flex items-center justify-center gap-4 md:justify-start">
                      <Button
                        onClick={handleRewind}
                        variant="ghost"
                        size="lg"
                        className="h-12 w-12 rounded-full p-0 text-white hover:bg-white/10"
                      >
                        <SkipBack className="h-6 w-6" />
                      </Button>

                      <Button
                        onClick={handlePlayPause}
                        size="lg"
                        className="h-16 w-16 rounded-full bg-white p-0 text-black hover:bg-white/90"
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
                        className="h-12 w-12 rounded-full p-0 text-white hover:bg-white/10"
                      >
                        <SkipForward className="h-6 w-6" />
                      </Button>
                    </div>

                    {/* Breathing Instruction Area */}
                    <div className="py-8 text-center md:text-left">
                      <p className="text-2xl font-light text-white/90">
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

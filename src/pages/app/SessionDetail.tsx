import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronDown, Heart, Play, Share } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ArcCardsModal } from "@/components/ArcCardsModal";
import { ClassPlayerModal } from "@/components/ClassPlayerModal";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useFavourites } from "@/hooks/useFavourites";
import { supabase } from "@/integrations/supabase/client";
import { IMAGE_PRESETS } from "@/lib/supabaseImageOptimization";
interface SessionDetailModalProps {
  sessionId: string | null;
  open: boolean;
  onClose: () => void;
  onShowSubscription?: () => void;
  isFeaturedClass?: boolean;
}
export default function SessionDetailModal({
  sessionId,
  open,
  onClose,
  onShowSubscription,
  isFeaturedClass = false,
}: SessionDetailModalProps) {
  const { user, hasSubscription, isAdmin, isTestUser } = useAuth();
  const { isFavourite, toggleFavourite } = useFavourites();
  const [showPlayer, setShowPlayer] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showFullSafetyDisclosure, setShowFullSafetyDisclosure] = useState(false);
  const [safetyExpanded, setSafetyExpanded] = useState(false);
  const [showArcCardsModal, setShowArcCardsModal] = useState(false);

  const { data, isLoading: loading } = useQuery({
    queryKey: ["session-detail", sessionId],
    queryFn: async () => {
      const { data: classData, error } = await supabase
        .from("classes")
        .select("*")
        .eq("id", sessionId!.trim())
        .maybeSingle();

      if (error) throw error;
      if (!classData) return { session: null, sessionCategories: [] };

      const { data: junctionData } = await supabase
        .from("class_categories")
        .select("categories(*)")
        .eq("class_id", sessionId!.trim());

      let cats = (junctionData || []).map((row: any) => row.categories).filter(Boolean);

      if (cats.length === 0 && classData.category_id) {
        const { data: fallbackCat } = await supabase
          .from("categories")
          .select("*")
          .eq("id", classData.category_id)
          .maybeSingle();
        if (fallbackCat) cats = [fallbackCat];
      }

      return { session: classData, sessionCategories: cats };
    },
    enabled: !!open && !!sessionId,
  });

  const session = data?.session ?? null;
  const sessionCategories = data?.sessionCategories ?? [];

  console.log('Session Detail Data:', data);

  // Reset player state when modal closes
  useEffect(() => {
    if (!open) setShowPlayer(false);
  }, [open]);

  const handleFavourite = () => {
    if (sessionId) {
      toggleFavourite(sessionId);
    }
  };

  const handleShare = async () => {
    if (!session?.is_published) {
      toast.error("This session cannot be shared");
      return;
    }

    const shareUrl = `${window.location.origin}/shared-session/${sessionId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: session?.title,
          text: `Check out this breathwork session: ${session?.title}`,
          url: shareUrl,
        });
        toast.success("Shared successfully");
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          await navigator.clipboard.writeText(shareUrl);
          toast.success("Link copied to clipboard");
        }
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
    }
  };

  // Function to render safety note with clickable Safety Disclosure link
  const renderSafetyNote = (text: string) => {
    const parts = text.split(/(Safety Disclosure)/g);
    return parts.map((part, index) => {
      if (part === "Safety Disclosure") {
        return (
          <button
            key={index}
            onClick={(e) => {
              e.preventDefault();
              setShowFullSafetyDisclosure(true);
            }}
            className="font-bold text-white underline transition-colors hover:text-white/80"
          >
            {part}
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };
  return (
    <>
      <Dialog
        open={open && !showPlayer}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            onClose();
          }
        }}
      >
        <DialogContent
          className="max-h-[90vh] w-[95%] max-w-5xl overflow-y-auto rounded-xl border border-white/[0.08] bg-black/95 p-0 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl md:w-[90%]"
          onCloseAutoFocus={() => {}}
        >
          <DialogTitle className="sr-only">{session?.title || "Session Details"}</DialogTitle>
          {loading ? (
            <div className="p-12">
              <div className="animate-pulse space-y-6">
                {/* Image skeleton */}
                <div className="aspect-square rounded-2xl bg-background/10" />

                {/* Text skeletons */}
                <div className="space-y-4">
                  <div className="h-8 w-3/4 rounded bg-background/15" />
                  <div className="h-4 w-32 rounded bg-background/10" />
                  <div className="space-y-2">
                    <div className="h-4 w-full rounded bg-background/10" />
                    <div className="h-4 w-5/6 rounded bg-background/10" />
                  </div>
                </div>
              </div>
            </div>
          ) : !session ? (
            <div className="flex h-96 items-center justify-center">
              <div className="font-light text-white/60">Session not found</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 p-6 md:p-10 lg:grid-cols-[55%_45%] lg:gap-8 lg:p-12">
              {/* Left side - Image with text overlay and action buttons */}
              <div className="space-y-6">
                <div className="relative aspect-square overflow-hidden rounded-xl p-6 md:rounded-2xl md:p-7">
                  <OptimizedImage
                    src={session.image_url}
                    alt={session.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    optimizationOptions={IMAGE_PRESETS.hero}
                    priority={true}
                  />

                  {/* Gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/60" />

                  {/* Title and info overlay - top left with internal padding */}
                  <div className="relative z-10">
                    <h2 className="mb-1 font-editorial text-2xl text-white md:mb-2 md:text-3xl">
                      {session.title}
                    </h2>
                    <div className="space-y-0.5 text-sm font-light text-white/80 md:text-base">
                      {session.teacher_name && <p>{session.teacher_name}</p>}
                      {session.duration_minutes != null && <p>{session.duration_minutes} min</p>}
                      {session.technique && <p>{session.technique}</p>}
                      {session.intensity && <p>{session.intensity}</p>}
                    </div>
                  </div>

                  {/* Action buttons - bottom with improved spacing */}
                  <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 md:bottom-7 md:left-7 md:right-7 md:gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavourite();
                      }}
                      className="rounded-full bg-white/5 p-2.5 opacity-70 backdrop-blur-sm transition-all hover:bg-white/10 hover:opacity-100 md:p-3"
                    >
                      <Heart
                        className={`h-5 w-5 md:h-6 md:w-6 ${sessionId && isFavourite(sessionId) ? "fill-white text-white" : "text-white"}`}
                        strokeWidth={1.5}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare();
                      }}
                      className="rounded-full bg-white/5 p-2.5 opacity-70 backdrop-blur-sm transition-all hover:bg-white/10 hover:opacity-100 md:p-3"
                    >
                      <Share className="h-5 w-5 text-white md:h-6 md:w-6" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Featured class is always free for everyone
                        // Check if locked (requires subscription and user doesn't have access)
                        const isLocked =
                          !isFeaturedClass &&
                          session.requires_subscription &&
                          !hasSubscription &&
                          !isAdmin &&
                          !isTestUser;
                        if (isLocked) {
                          onShowSubscription?.();
                          onClose();
                        } else if (session.show_safety_reminder || session.safety_note) {
                          // Show safety popup if the class has a custom note or the reminder is toggled on
                          setShowSafetyModal(true);
                        } else {
                          setShowPlayer(true);
                        }
                      }}
                      className="flex h-[52px] flex-1 items-center justify-center gap-2.5 rounded-full border-2 border-white px-5 text-[15px] font-medium tracking-wide text-white transition-all hover:bg-white/10 md:h-[56px] md:px-8 md:text-[17px]"
                    >
                      <Play className="h-5 w-5" strokeWidth={1.5} fill="none" />
                      Start Practice
                    </button>
                  </div>
                </div>
              </div>

              {/* Right side - Tabs for Explore, Description, and Safety */}
              <div className="flex flex-col px-7 md:px-10 lg:px-6 lg:pr-6">
                {/* Category badges - aligned with content */}
                {sessionCategories.length > 0 && (
                  <div className="mb-5 flex flex-wrap gap-2">
                    {sessionCategories.map((cat: any) => (
                      <span
                        key={cat.id}
                        className="text-xs font-light uppercase tracking-[0.12em] text-[#D97757] md:text-sm"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Tabs with improved styling */}
                <Tabs defaultValue="description" className="flex-1">
                  <TabsList className="grid h-11 w-full grid-cols-2 rounded-lg bg-white/5 px-1.5 md:h-12">
                    <TabsTrigger
                      value="description"
                      className="h-9 rounded-md text-sm font-light text-white/70 data-[state=active]:bg-white data-[state=active]:text-black md:h-10 md:text-base"
                    >
                      Description
                    </TabsTrigger>
                    <TabsTrigger
                      value="explore"
                      className="h-9 rounded-md text-sm font-light text-white/70 data-[state=active]:bg-white data-[state=active]:text-black md:h-10 md:text-base"
                    >
                      Explore
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="description" className="mt-10 md:mt-12">
                    {/* Description */}
                    <p className="text-[15px] font-light leading-[1.7] text-white/80 md:text-base">
                      {session.description}
                    </p>

                    {/* Safety Card - Clickable with hover effect */}
                    <div
                      className="group relative mt-8 cursor-pointer overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] transition-all hover:border-white/[0.15] hover:shadow-[0_0_20px_rgba(255,255,255,0.03)]"
                      onClick={() => setSafetyExpanded(!safetyExpanded)}
                    >
                      <Collapsible open={safetyExpanded} onOpenChange={setSafetyExpanded}>
                        <div className="p-4 md:p-6">
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 flex-shrink-0 text-base text-white md:text-xl">
                              ⚠
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-sm font-light tracking-wide text-white md:text-base">
                                  Safety Reminder
                                </h4>
                                <ChevronDown
                                  className={`h-4 w-4 flex-shrink-0 text-white/50 transition-transform ${safetyExpanded ? "rotate-180" : ""}`}
                                />
                              </div>
                              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-white/50 md:text-sm">
                                <span>Tap to read guidelines</span>
                                <ArrowRight
                                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                                  strokeWidth={2}
                                />
                              </p>

                              <CollapsibleContent>
                                <div className="mt-4 space-y-4 border-t border-white/[0.08] pt-4">
                                  {/* Practice safely */}
                                  <div className="flex gap-2.5">
                                    <span className="mt-0.5 text-xs text-white/40">1</span>
                                    <p className="text-[13px] font-light leading-relaxed text-white/70 md:text-sm">
                                      Practice in a safe, comfortable space — never in water, while
                                      driving, or operating machinery.
                                    </p>
                                  </div>

                                  {/* Consult doctor */}
                                  <div className="flex gap-2.5">
                                    <span className="mt-0.5 text-xs text-white/40">2</span>
                                    <p className="text-[13px] font-light leading-relaxed text-white/70 md:text-sm">
                                      Consult your doctor if you have health conditions or concerns.
                                    </p>
                                  </div>

                                  {/* Avoid if */}
                                  <div className="flex gap-2.5">
                                    <span className="mt-0.5 text-xs text-white/40">3</span>
                                    <p className="text-[13px] font-light leading-relaxed text-white/70 md:text-sm">
                                      Avoid breath holds or fast-paced breathing if pregnant, or if
                                      you have epilepsy, serious mental health conditions, or
                                      significant medical issues.
                                    </p>
                                  </div>

                                  {/* Listen to body */}
                                  <div className="flex gap-2.5">
                                    <span className="mt-0.5 text-xs text-white/40">4</span>
                                    <p className="text-[13px] font-light leading-relaxed text-white/70 md:text-sm">
                                      Listen to your body and move at your own pace.
                                    </p>
                                  </div>

                                  {/* Full disclosure link */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowFullSafetyDisclosure(true);
                                    }}
                                    className="mt-2 block text-[13px] font-medium text-white/90 underline underline-offset-2 transition-colors hover:text-white md:text-sm"
                                  >
                                    Read full Safety Disclosure
                                  </button>
                                </div>
                              </CollapsibleContent>
                            </div>
                          </div>
                        </div>
                      </Collapsible>
                    </div>
                  </TabsContent>

                  <TabsContent value="explore" className="mt-10 md:mt-12">
                    <h3 className="mb-7 font-editorial text-[clamp(1.5rem,2.5vw,1.85rem)] leading-[1.2] text-white">
                      If you're wanting more support
                    </h3>

                    <div className="space-y-4 text-[15px] font-light leading-[1.7] text-white/80 md:text-base">
                      <p>Some people find daily practices are enough.</p>
                      <p>
                        Others need guided support to shift deeper patterns of stress, shutdown, or
                        disconnection.
                      </p>
                      <p>That's why The Rise ARC Method exists.</p>
                      <p>
                        A 4-month guided process for those ready to go deeper — to rebuild
                        stability, autonomy, emotional presence, and connection.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowArcCardsModal(true)}
                      className="mt-8 inline-flex items-center gap-3 text-[15px] font-medium text-white transition-colors hover:text-white/80 md:text-base"
                    >
                      Learn about the ARC Method
                      <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Safety Reminder Modal */}
      {(session?.show_safety_reminder || session?.safety_note) && (
        <Dialog open={showSafetyModal} onOpenChange={setShowSafetyModal}>
          <DialogContent className="max-w-2xl rounded-xl border border-white/30 bg-black/30 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="font-editorial text-3xl text-white">
                Safety Reminder
              </DialogTitle>
              <DialogDescription className="text-base text-white/70">
                Please read this important safety information before starting this breathwork
                session.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {session?.safety_note && (
                <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                  <p className="whitespace-pre-wrap text-base leading-relaxed text-white/90">
                    {renderSafetyNote(session.safety_note)}
                  </p>
                </div>
              )}
              <Button
                onClick={() => {
                  setShowSafetyModal(false);
                  setShowPlayer(true);
                }}
                className="w-full bg-white py-6 text-base font-light text-black hover:bg-white/90"
              >
                I Understand, Begin Session
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Full Safety Disclosure Modal */}
      <Dialog open={showFullSafetyDisclosure} onOpenChange={setShowFullSafetyDisclosure}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto rounded-xl border border-white/30 bg-black/30 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="font-editorial text-3xl text-white md:text-4xl">
              Safety Disclosure
            </DialogTitle>
            <DialogDescription className="text-base text-white/70 md:text-lg">
              Please read all of the information below before continuing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 text-white/80">
            {/* Introduction */}
            <div>
              <p className="mb-4 text-base leading-relaxed">
                You will be guided through simple Breathwork techniques which can have a powerful
                and profound effect on your:
              </p>
              <ul className="space-y-2 pl-6 text-base">
                <li className="list-disc">Nervous system</li>
                <li className="list-disc">Respiratory system</li>
                <li className="list-disc">Lymphatic System</li>
                <li className="list-disc">Endocrine system</li>
                <li className="list-disc">Cardiovascular system</li>
              </ul>
              <p className="mt-4 text-base leading-relaxed">
                For your safety, it is important and advisable to consult a medical professional if
                you have any medical history or issues related to the aforementioned bodily systems
                to ensure that the breathwork is safe and appropriate for you.
              </p>
            </div>

            {/* Warning */}
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-base leading-relaxed text-red-200">
                ⚠️ If you experience faintness, dizziness, pain or shortness of breath at any time
                while using the app, you should stop immediately and seek immediate medical
                attention.
              </p>
            </div>

            {/* Contraindications */}
            <div className="border-b border-white/10 pb-6">
              <h3 className="mb-4 text-xl font-light uppercase tracking-wider text-white md:text-2xl">
                Contraindications
              </h3>
              <p className="mb-4 text-base leading-relaxed">
                The breathing classes and techniques in this App are not suitable for anyone with
                the following conditions. Please do not practice breathwork, Online or In-Person,
                without consulting your doctor if you have experienced or have any of the following
                conditions:
              </p>
              <div className="grid grid-cols-1 gap-2 text-base md:grid-cols-2">
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Pregnancy</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Epilepsy</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Serious mental illness</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Respiratory conditions</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Seizures</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>High Blood Pressure</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Eye conditions (detached retina, cataracts, glaucoma)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Cardiovascular disease</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Heart conditions</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Osteoporosis</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Panic attacks</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Family history of aneurysms</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Recent surgery or injury</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Spiritual emergence</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Vertigo</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Spinal disorders</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Any conditions requiring regular medication</span>
                </div>
              </div>
            </div>

            {/* Breath Holds */}
            <div className="border-b border-white/10 pb-6">
              <h3 className="mb-4 text-xl font-light uppercase tracking-wider text-white md:text-2xl">
                Breath Holds
              </h3>
              <p className="mb-4 text-base leading-relaxed">
                Breath retention exercises (breath holds) are only appropriate for individuals in
                good health. If you have any concerns, it&apos;s advisable to consult your doctor
                before participating in these exercises. Please do not practice breath holds if you
                have any of the following:
              </p>
              <div className="grid grid-cols-1 gap-2 text-base md:grid-cols-2">
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Cancer</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Uncontrolled hyperthyroidism</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Schizophrenia</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Sleep apnea</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Pregnancy</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>High blood pressure</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Kidney disease</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Cardiovascular issues</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Epilepsy</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Chest pains or heart problems</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Near water</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Panic disorder and anxiety</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Sickle cell anemia</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Arterial aneurysm</span>
                </div>
                <div className="flex items-start gap-2">
                  <span>•</span>
                  <span>Diabetes</span>
                </div>
              </div>
            </div>

            {/* Where Not to Practice */}
            <div className="border-b border-white/10 pb-6">
              <h3 className="mb-4 text-xl font-light uppercase tracking-wider text-white md:text-2xl">
                Where Not to Practice
              </h3>
              <p className="text-base leading-relaxed">
                Do not use the Services while driving, in water, while operating machinery or
                performing other tasks that require attention and concentration. You understand that
                you are solely responsible for your use of the Services. We assume no responsibility
                for injuries suffered while practicing the techniques presented in the Services. It
                is important to only practice breathwork when you are in a safe place.
              </p>
            </div>

            {/* Legal Disclaimer */}
            <div>
              <p className="mb-4 text-base leading-relaxed">
                Embers Studio Ltd. assumes no responsibility for injuries suffered while practicing
                these techniques and Embers Studio Ltd. shall not be held liable for any damages,
                circumstances, conditions or injuries that may occur, directly or indirectly, from
                engaging in any activities or ideas presented in any Application made by Embers
                Studio Ltd.
              </p>
              <p className="mb-4 text-base leading-relaxed">
                By continuing to access and use the March app, you agree that you have read and
                understood the above Safety Disclosure and accept all responsibility for your
                physical and mental health and any resultant injury or mishap that may affect your
                well-being or health in any way.
              </p>
              <p className="text-base leading-relaxed">
                If you have questions or comments, you may email us at{" "}
                <a
                  href="mailto:support@embersstudio.io"
                  className="text-orange-400 hover:underline"
                >
                  support@embersstudio.io
                </a>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showPlayer && (
        <ClassPlayerModal
          classId={sessionId}
          open={showPlayer}
          onClose={() => setShowPlayer(false)}
          skipSafetyModal={true}
        />
      )}

      <ArcCardsModal open={showArcCardsModal} onOpenChange={setShowArcCardsModal} />
    </>
  );
}

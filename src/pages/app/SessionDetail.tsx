import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Heart, Play, Share } from "lucide-react";
import { useEffect, useState } from "react";

import { ArcCardsModal } from "@/components/ArcCardsModal";
import { ClassPlayerModal } from "@/components/ClassPlayerModal";
import { OptimizedImage } from "@/components/OptimizedImage";
import { SafetyInformationModal } from "@/components/SafetyInformationModal";
import { Button } from "@/components/ui/button";
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
import { useShareSession } from "@/hooks/useShareSession";
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
  const { hasSubscription, isAdmin, isTestUser } = useAuth();
  const { isFavourite, toggleFavourite } = useFavourites();
  const [showPlayer, setShowPlayer] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showFullSafetyDisclosure, setShowFullSafetyDisclosure] = useState(false);
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

  // Reset player state when modal closes
  useEffect(() => {
    if (!open) setShowPlayer(false);
  }, [open]);

  const handleFavourite = () => {
    if (sessionId) {
      toggleFavourite(sessionId);
    }
  };

  const { handleShare } = useShareSession();

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
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) onClose();
        }}
      >
        <DialogContent
          className="max-h-[calc(90dvh-3rem)] w-[95%] max-w-5xl overflow-y-auto overscroll-contain scroll-smooth rounded-xl border border-white/[0.08] bg-black/95 p-0 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl md:max-h-[90dvh] md:w-[90%]"
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
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl p-6 md:aspect-square md:rounded-2xl md:p-7">
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
                      <div className="flex items-center gap-1.5">
                        {session.technique && <p>{session.technique}</p>}
                        {session.duration_minutes != null && (
                          <p> • {session.duration_minutes} min</p>
                        )}
                      </div>
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
                        handleShare(sessionId, session?.is_published);
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
                        } else if (session.safety_note) {
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
              <div className="flex flex-col px-7 text-base md:px-10 lg:px-6 lg:pr-6">
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

                  <div className="mt-8 grid">
                    <TabsContent
                      forceMount
                      value="description"
                      className="flex flex-col justify-between [grid-area:1/1] data-[state=inactive]:pointer-events-none data-[state=inactive]:invisible [&[hidden]]:block"
                    >
                      {/* Description */}
                      <p className="font-light leading-[1.7] text-white/80">
                        {session.description}
                      </p>

                      {/* Safety Card */}
                      <div className="group relative mt-8 overflow-hidden">
                        <div className="flex items-center gap-3 text-sm text-white md:items-start">
                          <div className="min-w-0 flex-1">
                            <h4 className="flex items-baseline gap-4 font-light tracking-wide">
                              <span className="flex-shrink-0 text-base md:text-xl">⚠</span>
                              Safety Reminder
                            </h4>

                            <div className="mt-4 space-y-4 border-white/[0.08] pt-4 md:border-t">
                              {/* Practice safely */}
                              <p className="font-light leading-relaxed text-white/70 md:text-sm">
                                Practice in a safe, comfortable space - never in water, while
                                driving, or operating machinery. Consult your doctor if you have
                                health conditions or concerns and do not practice breath holds or
                                fast-paced breathing if pregnant, or if you have epilepsy, serious
                                mental health conditions, or significant medical issues. Always
                                listen to your body and move at your own pace.
                              </p>

                              {/* Full disclosure link */}
                              <button
                                onClick={() => setShowFullSafetyDisclosure(true)}
                                className="flex items-center gap-1.5 font-medium text-white/90 underline underline-offset-2 transition-colors hover:text-white md:mt-2 md:text-sm"
                              >
                                Read full Safety Information
                                <ArrowRight
                                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                                  strokeWidth={2}
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent
                      forceMount
                      value="explore"
                      className="[grid-area:1/1] data-[state=inactive]:pointer-events-none data-[state=inactive]:invisible [&[hidden]]:block"
                    >
                      <h3 className="text-md mb-7 font-editorial font-light leading-[1.2] text-white">
                        If you're wanting more support
                      </h3>

                      <div className="space-y-4 font-light leading-[1.7] text-white/80">
                        <p>Some people find daily practices are enough.</p>
                        <p>
                          Others need guided support to shift deeper patterns of stress, shutdown,
                          or disconnection.
                        </p>
                        <p>That's why The Rise ARC Method exists.</p>
                        <p>
                          A 4-month guided process for those ready to go deeper — to rebuild
                          stability, autonomy, emotional presence, and connection.
                        </p>
                      </div>

                      <button
                        onClick={() => setShowArcCardsModal(true)}
                        className="mt-8 inline-flex items-center gap-3 font-medium text-white transition-colors hover:text-white/80"
                      >
                        Learn about the ARC Method
                        <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
                      </button>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Safety Reminder Modal */}
      {session?.safety_note && (
        <Dialog open={showSafetyModal} onOpenChange={setShowSafetyModal}>
          <DialogContent className="flex max-h-[calc(90dvh-3rem)] w-[92vw] max-w-lg flex-col overflow-y-auto overscroll-contain scroll-smooth rounded-xl border border-white/30 bg-black/75 p-6 backdrop-blur-xl md:max-h-[90dvh] md:max-w-4xl md:p-10 lg:p-12">
            <DialogHeader className="space-y-2">
              <DialogTitle className="font-editorial text-3xl text-[#E6DBC7] md:text-4xl">
                Safety Reminder
              </DialogTitle>
              <DialogDescription className="text-sm text-[#E6DBC7]/60 md:text-base">
                Please read this important safety information before starting this breathwork
                session.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6 flex flex-col gap-6 md:mt-8">
              {session?.safety_note && (
                <div className="rounded-lg border border-white/10 bg-white/5 p-5">
                  <p className="whitespace-pre-wrap text-base leading-relaxed text-[#E6DBC7]/90">
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

      <SafetyInformationModal
        open={showFullSafetyDisclosure}
        onOpenChange={setShowFullSafetyDisclosure}
      />

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

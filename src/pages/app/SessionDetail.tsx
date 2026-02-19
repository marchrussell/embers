import { ArcCardsModal } from "@/components/ArcCardsModal";
import { ClassPlayerModal } from "@/components/ClassPlayerModal";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useFavourites } from "@/hooks/useFavourites";
import { supabase } from "@/integrations/supabase/client";
import { IMAGE_PRESETS } from "@/lib/supabaseImageOptimization";
import { ArrowRight, ChevronDown, Heart, Play, Share } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
  isFeaturedClass = false
}: SessionDetailModalProps) {
  const {
    user,
    hasSubscription,
    isAdmin,
    isTestUser
  } = useAuth();
  const { isFavourite, toggleFavourite } = useFavourites();
  const [session, setSession] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showFullSafetyDisclosure, setShowFullSafetyDisclosure] = useState(false);
  const [safetyExpanded, setSafetyExpanded] = useState(false);
  const [showArcCardsModal, setShowArcCardsModal] = useState(false);
  useEffect(() => {
    if (!open) {
      // Only reset when modal closes, keep session data while open
      setShowPlayer(false);
      return;
    }
    if (!sessionId) {
      setSession(null);
      setCategory(null);
      setLoading(false);
      return;
    }
    
    let isMounted = true;
    
    const fetchSession = async () => {
      try {
        setLoading(true);
        console.log('🔍 SessionDetail: Fetching session with ID:', sessionId);
        
        const { data: classData, error: classError } = await supabase
          .from("classes")
          .select("*")
          .eq("id", sessionId.trim())
          .maybeSingle();
        
        if (!isMounted) return;
        
        console.log('📊 SessionDetail: Query result:', { data: classData, error: classError });
        
        if (classError) {
          console.error('❌ SessionDetail: Error fetching class:', classError);
          toast.error(`Error loading session: ${classError.message}`);
          setLoading(false);
          return;
        }
        
        if (!classData) {
          console.error('❌ SessionDetail: No class data found for ID:', sessionId);
          toast.error("Session not found in database");
          setLoading(false);
          return;
        }
        
        setSession(classData);

        // Fetch category (non-blocking)
        if (classData.category_id) {
          supabase
            .from("categories")
            .select("*")
            .eq("id", classData.category_id)
            .maybeSingle()
            .then(({ data: categoryData }) => {
              if (isMounted && categoryData) {
                setCategory(categoryData);
              }
            });
        }

        setLoading(false);
      } catch (error) {
        console.error('❌ SessionDetail: Unexpected error:', error);
        if (isMounted) {
          toast.error("Failed to load session");
          setLoading(false);
        }
      }
    };
    
    fetchSession();
    
    return () => {
      isMounted = false;
    };
  }, [sessionId, user?.id, open]);

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
          url: shareUrl
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

  // Function to render safety note with clickable Safety Disclosure link
  const renderSafetyNote = (text: string) => {
    const parts = text.split(/(Safety Disclosure)/g);
    return parts.map((part, index) => {
      if (part === 'Safety Disclosure') {
        return <button key={index} onClick={e => {
          e.preventDefault();
          setShowFullSafetyDisclosure(true);
        }} className="font-bold text-white hover:text-white/80 underline transition-colors">
            {part}
          </button>;
      }
      return <span key={index}>{part}</span>;
    });
  };
  return <>
      <Dialog open={open} onOpenChange={isOpen => {
      if (!isOpen) {
        onClose();
      }
    }}>
        <DialogContent className="max-w-5xl w-[95%] md:w-[90%] max-h-[90vh] bg-black/95 backdrop-blur-2xl border border-white/[0.08] p-0 overflow-y-auto rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.35)]" onCloseAutoFocus={() => {
        // Clean up state after modal closes
        setSession(null);
        setCategory(null);
      }}>
          <DialogTitle className="sr-only">
            {session?.title || "Session Details"}
          </DialogTitle>
          {loading ? <div className="p-12">
              <div className="space-y-6 animate-pulse">
                {/* Image skeleton */}
                <div className="aspect-square bg-background/10 rounded-2xl" />
                
                {/* Text skeletons */}
                <div className="space-y-4">
                  <div className="h-8 w-3/4 bg-background/15 rounded" />
                  <div className="h-4 w-32 bg-background/10 rounded" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-background/10 rounded" />
                    <div className="h-4 w-5/6 bg-background/10 rounded" />
                  </div>
                </div>
              </div>
            </div> : !session ? <div className="flex items-center justify-center h-96">
              <div className="text-white/60 font-light">Session not found</div>
            </div> : <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6 lg:gap-8 p-6 md:p-10 lg:p-12">
              {/* Left side - Image with text overlay and action buttons */}
              <div className="space-y-6">
                <div className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden p-6 md:p-7">
                  <OptimizedImage src={session.image_url} alt={session.title} className="absolute inset-0 w-full h-full object-cover" optimizationOptions={IMAGE_PRESETS.hero} priority={true} />
                  
                  {/* Gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/60" />
                  
                  {/* Title and info overlay - top left with internal padding */}
                  <div className="relative z-10">
                    <h2 className="text-white text-2xl md:text-3xl font-editorial mb-1 md:mb-2">{session.title}</h2>
                    <p className="text-white/80 text-sm md:text-base font-light">{session.teacher_name} • {session.duration_minutes} min • Technique</p>
                  </div>
                  
                  {/* Action buttons - bottom with improved spacing */}
                  <div className="absolute bottom-5 md:bottom-7 left-5 md:left-7 right-5 md:right-7 flex items-center gap-3 md:gap-4">
                    <button onClick={e => {
                  e.stopPropagation();
                  handleFavourite();
                }} className="p-2.5 md:p-3 rounded-full backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all opacity-70 hover:opacity-100">
                      <Heart className={`w-5 h-5 md:w-6 md:h-6 ${sessionId && isFavourite(sessionId) ? "fill-white text-white" : "text-white"}`} strokeWidth={1.5} />
                    </button>
                    <button onClick={e => {
                  e.stopPropagation();
                  handleShare();
                }} className="p-2.5 md:p-3 rounded-full backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all opacity-70 hover:opacity-100">
                      <Share className="w-5 h-5 md:w-6 md:h-6 text-white" strokeWidth={1.5} />
                    </button>
                    <button onClick={e => {
                  e.stopPropagation();
                  // Featured class is always free for everyone
                  // Check if locked (requires subscription and user doesn't have access)
                  const isLocked = !isFeaturedClass && session.requires_subscription && !hasSubscription && !isAdmin && !isTestUser;
                  if (isLocked) {
                    onShowSubscription?.();
                    onClose();
                  } else if (session.show_safety_reminder) {
                    // Show safety modal first if enabled
                    setShowSafetyModal(true);
                  } else {
                    // Directly open player if no safety reminder
                    setShowPlayer(true);
                  }
                }} className="flex-1 border-2 border-white text-white h-[52px] md:h-[56px] px-5 md:px-8 rounded-full flex items-center justify-center gap-2.5 font-medium text-[15px] md:text-[17px] tracking-wide transition-all hover:bg-white/10">
                      <Play className="w-5 h-5" strokeWidth={1.5} fill="none" />
                      Start Practice
                    </button>
                  </div>
                </div>
              </div>

              {/* Right side - Tabs for Explore, Description, and Safety */}
              <div className="flex flex-col px-7 md:px-10 lg:px-6 lg:pr-6">
                {/* Category badge - aligned with content */}
                {category && (
                  <span className="text-[#D97757] text-xs md:text-sm font-light tracking-[0.12em] uppercase mb-5">
                    {category.name}
                  </span>
                )}

                {/* Tabs with improved styling */}
                <Tabs defaultValue="description" className="flex-1">
                  <TabsList className="grid w-full grid-cols-2 bg-white/5 h-11 md:h-12 px-1.5 rounded-lg">
                    <TabsTrigger value="description" className="data-[state=active]:bg-white data-[state=active]:text-black text-white/70 font-light text-sm md:text-base h-9 md:h-10 rounded-md">
                      Description
                    </TabsTrigger>
                    <TabsTrigger value="explore" className="data-[state=active]:bg-white data-[state=active]:text-black text-white/70 font-light text-sm md:text-base h-9 md:h-10 rounded-md">
                      Explore
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="description" className="mt-10 md:mt-12">
                    {/* Description */}
                    <p className="text-white/80 font-light leading-[1.7] text-[15px] md:text-base">
                      {session.description}
                    </p>

                    {/* Safety Card - Clickable with hover effect */}
                    <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] mt-8 cursor-pointer transition-all hover:border-white/[0.15] hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] group" onClick={() => setSafetyExpanded(!safetyExpanded)}>
                      <Collapsible open={safetyExpanded} onOpenChange={setSafetyExpanded}>
                        <div className="p-4 md:p-6">
                          <div className="flex items-start gap-3">
                            <span className="text-white text-base md:text-xl flex-shrink-0 mt-0.5">⚠</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-white font-light text-sm md:text-base tracking-wide">
                                  Safety Reminder
                                </h4>
                                <ChevronDown className={`w-4 h-4 text-white/50 transition-transform flex-shrink-0 ${safetyExpanded ? 'rotate-180' : ''}`} />
                              </div>
                              <p className="text-white/50 text-xs md:text-sm mt-1.5 flex items-center gap-1.5">
                                <span>Tap to read guidelines</span>
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                              </p>

                              <CollapsibleContent>
                                <div className="mt-4 pt-4 border-t border-white/[0.08] space-y-4">
                                  {/* Practice safely */}
                                  <div className="flex gap-2.5">
                                    <span className="text-white/40 text-xs mt-0.5">1</span>
                                    <p className="text-white/70 font-light text-[13px] md:text-sm leading-relaxed">
                                      Practice in a safe, comfortable space — never in water, while driving, or operating machinery.
                                    </p>
                                  </div>

                                  {/* Consult doctor */}
                                  <div className="flex gap-2.5">
                                    <span className="text-white/40 text-xs mt-0.5">2</span>
                                    <p className="text-white/70 font-light text-[13px] md:text-sm leading-relaxed">
                                      Consult your doctor if you have health conditions or concerns.
                                    </p>
                                  </div>

                                  {/* Avoid if */}
                                  <div className="flex gap-2.5">
                                    <span className="text-white/40 text-xs mt-0.5">3</span>
                                    <p className="text-white/70 font-light text-[13px] md:text-sm leading-relaxed">
                                      Avoid breath holds or fast-paced breathing if pregnant, or if you have epilepsy, serious mental health conditions, or significant medical issues.
                                    </p>
                                  </div>

                                  {/* Listen to body */}
                                  <div className="flex gap-2.5">
                                    <span className="text-white/40 text-xs mt-0.5">4</span>
                                    <p className="text-white/70 font-light text-[13px] md:text-sm leading-relaxed">
                                      Listen to your body and move at your own pace.
                                    </p>
                                  </div>

                                  {/* Full disclosure link */}
                                  <button
                                    onClick={e => {
                                      e.stopPropagation();
                                      setShowFullSafetyDisclosure(true);
                                    }}
                                    className="text-white/90 text-[13px] md:text-sm font-medium underline underline-offset-2 hover:text-white transition-colors mt-2 block"
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
                    <h3 className="font-editorial text-[clamp(1.5rem,2.5vw,1.85rem)] text-white leading-[1.2] mb-7">
                      If you're wanting more support
                    </h3>
                    
                    <div className="text-white/80 font-light leading-[1.7] text-[15px] md:text-base space-y-4">
                      <p>Some people find daily practices are enough.</p>
                      <p>Others need guided support to shift deeper patterns of stress, shutdown, or disconnection.</p>
                      <p>That's where The Rise ARC Method exists.</p>
                      <p>A 4-month guided process for those ready to go deeper — to rebuild stability, autonomy, emotional presence, and connection.</p>
                    </div>
                    
                    <button 
                      onClick={() => setShowArcCardsModal(true)}
                      className="font-medium text-white hover:text-white/80 transition-colors inline-flex items-center gap-3 mt-8 text-[15px] md:text-base"
                    >
                      Learn about the ARC Method
                      <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                  </TabsContent>
                </Tabs>
              </div>
            </div>}
        </DialogContent>
      </Dialog>

      {/* Safety Reminder Modal */}
      {session?.show_safety_reminder && <Dialog open={showSafetyModal} onOpenChange={setShowSafetyModal}>
          <DialogContent className="backdrop-blur-xl bg-black/30 border border-white/30 max-w-2xl rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-white text-3xl font-editorial">Safety Reminder</DialogTitle>
              <DialogDescription className="text-white/70 text-base">
                Please read this important safety information before starting this breathwork session.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {session?.safety_note && <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                  <p className="text-base text-white/90 whitespace-pre-wrap leading-relaxed">
                    {renderSafetyNote(session.safety_note)}
                  </p>
                </div>}
              <Button onClick={() => {
            setShowSafetyModal(false);
            setShowPlayer(true);
          }} className="w-full bg-white text-black hover:bg-white/90 py-6 text-base font-light">
                I Understand, Begin Session
              </Button>
            </div>
          </DialogContent>
        </Dialog>}

      {/* Full Safety Disclosure Modal */}
      <Dialog open={showFullSafetyDisclosure} onOpenChange={setShowFullSafetyDisclosure}>
          <DialogContent className="backdrop-blur-xl bg-black/30 border border-white/30 max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-white text-3xl md:text-4xl font-editorial">Safety Disclosure</DialogTitle>
            <DialogDescription className="text-white/70 text-base md:text-lg">
              Please read all of the information below before continuing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 text-white/80">
            {/* Introduction */}
            <div>
              <p className="leading-relaxed mb-4 text-base">
                You will be guided through simple Breathwork techniques which can have a powerful and profound effect on your:
              </p>
              <ul className="space-y-2 pl-6 text-base">
                <li className="list-disc">Nervous system</li>
                <li className="list-disc">Respiratory system</li>
                <li className="list-disc">Lymphatic System</li>
                <li className="list-disc">Endocrine system</li>
                <li className="list-disc">Cardiovascular system</li>
              </ul>
              <p className="leading-relaxed mt-4 text-base">
                For your safety, it is important and advisable to consult a medical professional if you have any medical history or issues related to the aforementioned bodily systems to ensure that the breathwork is safe and appropriate for you.
              </p>
            </div>

            {/* Warning */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-base text-red-200 leading-relaxed">
                ⚠️ If you experience faintness, dizziness, pain or shortness of breath at any time while using the app, you should stop immediately and seek immediate medical attention.
              </p>
            </div>

            {/* Contraindications */}
            <div className="pb-6 border-b border-white/10">
              <h3 className="text-xl md:text-2xl font-light text-white mb-4 uppercase tracking-wider">Contraindications</h3>
              <p className="leading-relaxed mb-4 text-base">
                The breathing classes and techniques in this App are not suitable for anyone with the following conditions. Please do not practice breathwork, Online or In-Person, without consulting your doctor if you have experienced or have any of the following conditions:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-base">
                <div className="flex items-start gap-2"><span>•</span><span>Pregnancy</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Epilepsy</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Serious mental illness</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Respiratory conditions</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Seizures</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>High Blood Pressure</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Eye conditions (detached retina, cataracts, glaucoma)</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Cardiovascular disease</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Heart conditions</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Osteoporosis</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Panic attacks</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Family history of aneurysms</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Recent surgery or injury</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Spiritual emergence</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Vertigo</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Spinal disorders</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Any conditions requiring regular medication</span></div>
              </div>
            </div>

            {/* Breath Holds */}
            <div className="pb-6 border-b border-white/10">
              <h3 className="text-xl md:text-2xl font-light text-white mb-4 uppercase tracking-wider">Breath Holds</h3>
              <p className="leading-relaxed mb-4 text-base">
                Breath retention exercises (breath holds) are only appropriate for individuals in good health. If you have any concerns, it&apos;s advisable to consult your doctor before participating in these exercises. Please do not practice breath holds if you have any of the following:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-base">
                <div className="flex items-start gap-2"><span>•</span><span>Cancer</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Uncontrolled hyperthyroidism</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Schizophrenia</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Sleep apnea</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Pregnancy</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>High blood pressure</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Kidney disease</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Cardiovascular issues</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Epilepsy</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Chest pains or heart problems</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Near water</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Panic disorder and anxiety</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Sickle cell anemia</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Arterial aneurysm</span></div>
                <div className="flex items-start gap-2"><span>•</span><span>Diabetes</span></div>
              </div>
            </div>

            {/* Where Not to Practice */}
            <div className="pb-6 border-b border-white/10">
              <h3 className="text-xl md:text-2xl font-light text-white mb-4 uppercase tracking-wider">Where Not to Practice</h3>
              <p className="leading-relaxed text-base">
                Do not use the Services while driving, in water, while operating machinery or performing other tasks that require attention and concentration. You understand that you are solely responsible for your use of the Services. We assume no responsibility for injuries suffered while practicing the techniques presented in the Services. It is important to only practice breathwork when you are in a safe place.
              </p>
            </div>

            {/* Legal Disclaimer */}
            <div>
              <p className="text-base leading-relaxed mb-4">
                Ripple Effect Ltd. assumes no responsibility for injuries suffered while practicing these techniques and Ripple Effect Ltd. shall not be held liable for any damages, circumstances, conditions or injuries that may occur, directly or indirectly, from engaging in any activities or ideas presented in any Application made by Ripple Effect Ltd.
              </p>
              <p className="text-base leading-relaxed mb-4">
                By continuing to access and use the March app, you agree that you have read and understood the above Safety Disclosure and accept all responsibility for your physical and mental health and any resultant injury or mishap that may affect your well-being or health in any way.
              </p>
              <p className="text-base leading-relaxed">
                If you have questions or comments, you may email us at{" "}
                <a href="mailto:march@marchrussell.com" className="text-orange-400 hover:underline">
                  march@marchrussell.com
                </a>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showPlayer && <ClassPlayerModal classId={sessionId} open={showPlayer} onClose={() => setShowPlayer(false)} skipSafetyModal={true} />}
      
      <ArcCardsModal open={showArcCardsModal} onOpenChange={setShowArcCardsModal} />
    </>;
}
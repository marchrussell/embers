import communityHeroKef from "@/assets/community-hero-kef.webp";
import heroBreathworkWide from "@/assets/hero-breathwork-wide.png";
import threeWaysMushroomBg from "@/assets/three-ways-mushroom-v2.jpg";
import { Footer } from "@/components/Footer";
import { ClassPlayerModal, ContactFormModal, ContactTeamsModal, NewsletterModal, RiseArcIntroModal, SubscriptionModal, TestimonialsModal, VaseBreathModal } from "@/components/modals/LazyModals";
import { NavBar } from "@/components/NavBar";
import { OptimizedImage } from "@/components/OptimizedImage";
import { FeaturedSessionSkeleton } from "@/components/skeletons/FeaturedSessionSkeleton";
import { TermsMicrocopy } from "@/components/TermsMicrocopy";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { companyLogos, marchImages, programImages } from "@/lib/sharedAssets";
import { ArrowRight, Play, X } from "lucide-react";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const isMobile = useIsMobile();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showMeetMarchModal, setShowMeetMarchModal] = useState(false);
  const [showCorporateModal, setShowCorporateModal] = useState(false);
  const [showRiseModal, setShowRiseModal] = useState(false);
  const [showVaseBreathModal, setShowVaseBreathModal] = useState(false);
  const [showTestimonialsModal, setShowTestimonialsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showTeamsModal, setShowTeamsModal] = useState(false);
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);
  const [showArcIntroModal, setShowArcIntroModal] = useState(false);
  const [showIndividualTestimonialModal, setShowIndividualTestimonialModal] = useState(false);
  const [showClassPlayer, setShowClassPlayer] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedTestimonial, setSelectedTestimonial] = useState<{
    name: string;
    quote: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: ""
  });
  const [subscribeToNewsletter, setSubscribeToNewsletter] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredSessions, setFeaturedSessions] = useState<any[]>([]);

  // Fetch categories and featured sessions for app summary
  useEffect(() => {
    let isMounted = true;
    const fetchAppData = async () => {
      try {
        const [categoriesResult, classesResult] = await Promise.all([supabase.from('categories').select('*').order('name'), supabase.from('classes').select(`
            *,
            categories!classes_category_id_fkey (
              name
            )
          `).eq('is_published', true)]);
        if (!isMounted) return;
        if (categoriesResult.data) {
          const categoryOrder = ['CALM', 'ENERGY', 'RESET', 'SLEEP', 'EXPAND', 'HEAL'];
          const sorted = [...categoriesResult.data].filter(cat => categoryOrder.includes(cat.name)).sort((a, b) => categoryOrder.indexOf(a.name) - categoryOrder.indexOf(b.name));
          setCategories(sorted);
        }
        if (classesResult.data && classesResult.data.length > 0) {
          // Find the specific sessions we want (handle trailing spaces by trimming both sides)
          const targetTitles = ['The Landing', 'Instant Energy Boost', 'Box Breathing'];
          const filtered = classesResult.data.filter(c => {
            const trimmedTitle = c.title.trim();
            return targetTitles.some(target => trimmedTitle === target);
          });

          // Order them in the specific order we want
          const orderMap: Record<string, number> = {
            'The Landing': 0,
            'Instant Energy Boost': 1,
            'Box Breathing': 2
          };
          const sorted = filtered.sort((a, b) => (orderMap[a.title.trim()] ?? 99) - (orderMap[b.title.trim()] ?? 99));
          
          // If we found sessions, set them; otherwise use any 3 published sessions as fallback
          if (sorted.length > 0) {
            setFeaturedSessions(sorted);
          } else {
            // Fallback: use first 3 published sessions
            setFeaturedSessions(classesResult.data.slice(0, 3));
          }
        }
      } catch (error) {
        console.error('Error fetching app data:', error);
      }
    };
    fetchAppData();

    // Safety timeout
    const safetyTimeout = setTimeout(() => {
      if (isMounted && featuredSessions.length === 0) {
        console.warn('Index: Safety timeout for featured sessions');
      }
    }, 5000);
    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
    };
  }, []);
  useEffect(() => {
    if (location.state?.openSubscription) {
      setShowSubscriptionModal(true);
    }
  }, [location.state]);
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      toast({
        title: "All fields required",
        description: "Please fill in all fields to send a message.",
        variant: "destructive"
      });
      return;
    }
    if (formData.message.trim().length < 5) {
      toast({
        title: "Message too short",
        description: "Please write at least 5 characters in your message.",
        variant: "destructive"
      });
      return;
    }
    try {
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;

      // Send the message
      const {
        error
      } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: fullName,
          email: formData.email.trim().toLowerCase(),
          message: formData.message.trim(),
          type: 'contact'
        }
      });
      if (error) throw error;

      // If newsletter checkbox is checked, also subscribe them
      if (subscribeToNewsletter) {
        try {
          const {
            error: dbError
          } = await supabase.from('newsletter_subscribers').insert([{
            email: formData.email.trim().toLowerCase(),
            name: fullName
          }]);
          if (dbError && dbError.code !== '23505') {
            // Ignore duplicate error
            throw dbError;
          }

          // Send confirmation email
          await supabase.functions.invoke('send-contact-email', {
            body: {
              name: fullName,
              email: formData.email.trim().toLowerCase(),
              message: '',
              type: 'newsletter'
            }
          });
        } catch (newsletterError) {
          console.error('Error subscribing to newsletter:', newsletterError);
          // Don't fail the message send if newsletter fails
        }
      }
      toast({
        title: subscribeToNewsletter ? "Message sent and subscribed!" : "Message sent!",
        description: subscribeToNewsletter ? "Thank you for your message. You've also been subscribed to our newsletter." : "Thank you for your message. We'll get back to you soon."
      });
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        message: ""
      });
      setSubscribeToNewsletter(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: "Please try again later or contact us directly.",
        variant: "destructive"
      });
    }
  }, [formData, subscribeToNewsletter, toast]);

  // Video testimonials data
  const videoTestimonials = [{
    name: "Shay OB.",
    videoUrl: "/videos/shay-obrien-testimonial.mp4",
    posterUrl: "/videos/shay-obrien-poster.jpg?v=2",
    quote: "I have been working with March for a couple of months now and the change is quite profound. I feel a deeper sense of calm, clarity and I am generally more present. My background is that I am spinning lots of plates in the business world running my own investment fund. I also have 3 children at school and have just moved country so it's often hectic. My sessions with March bring restore my balance. I also use March's App to work in between sessions. I look forward to my little moment of serenity with my breathwork session. I cannot recommend breathwork enough and especially with March who has a lovely gentle and caring presence."
  }, {
    name: "Sara M.",
    videoUrl: "/videos/sara-testimonial.mp4",
    posterUrl: "/videos/sara-poster.jpg?v=2",
    quote: "I began breathwork with March a year after losing my brother very suddenly and traumatically. I have been diagnosed with complex PTSD but despite the usual avenues of CBT therapy, counselling & medication I was still suffering horrendously. I was experiencing regular panic attacks, chest pains, chronic anxiety to name just a few. I had never tried any breathwork and it was completely new for me. March made me feel very comfortable and we started with the very basics and would build on that in our weekly sessions. I found this a very helpful way to learn to incorporate the techniques into my daily routine. After a few months of sessions, my anxiety and panic attacks had reduced dramatically, along with all of my other symptoms too. It's been a year since I completed my programme and I still use the techniques regularly and especially whenever I am feeling stressed, overwhelmed or feel the chest pains sneaking in again. I cannot thank March enough for his work with me and couldn't recommend his programme enough, it's changed my life."
  }, {
    name: "Alex C.",
    videoUrl: "/videos/alex-chandler-testimonial.mp4",
    posterUrl: "/videos/alex-chandler-poster.jpg?v=3",
    quote: "March's breathwork has become the most influential voice in helping me through a deeply personal bereavement. The magic of that is this voice is just breathing. It has taught me a lot, changed the way in which I recognise stress and emotion and given me profound clarity to confront my grief."
  }, {
    name: "Ben F.",
    videoUrl: "/videos/ben-field-testimonial.mp4",
    posterUrl: "/videos/ben-field-poster.jpg?v=2",
    quote: "I did a breathwork program with March when I was going through a difficult time in my life, and the effects were like no other form of therapy I've ever experienced. March's calming presence as he guides you through one of the wildest sensory experiences is incredibly reassuring. Each time I left with a sense of clarity, somehow lighter and importantly more grounded."
  }];
  return <div className="min-h-screen bg-background">
      <NavBar />
      <Suspense fallback={null}>
        <SubscriptionModal open={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} />
        
        <TestimonialsModal open={showTestimonialsModal} onOpenChange={setShowTestimonialsModal} />
        
        <ContactFormModal open={showContactModal} onOpenChange={setShowContactModal} />
        
        <ContactTeamsModal open={showTeamsModal} onOpenChange={setShowTeamsModal} />
        
        <RiseArcIntroModal open={showArcIntroModal} onOpenChange={setShowArcIntroModal} />
        
        <VaseBreathModal open={showVaseBreathModal} onOpenChange={setShowVaseBreathModal} onOpenSubscription={() => setShowSubscriptionModal(true)} />
        
        
      </Suspense>
      
      {/* Meet March Modal - Redesigned to fit without scrolling */}
      <Dialog open={showMeetMarchModal} onOpenChange={setShowMeetMarchModal}>
        <DialogContent hideClose className="w-[95vw] max-w-[960px] max-h-[80vh] lg:overflow-visible overflow-y-auto backdrop-blur-xl bg-black/40 border border-white/20 rounded-[24px] p-10 md:p-12">
          {/* Close button - top right inside padding */}
          <button onClick={() => setShowMeetMarchModal(false)} className="absolute top-5 right-5 md:top-6 md:right-6 z-50 opacity-70 hover:opacity-100 transition-opacity">
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Mobile/Tablet Layout - Stacked with scroll */}
          <div className="lg:hidden space-y-6 pt-6">
            {/* Image at top */}
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg">
              <OptimizedImage src={marchImages.bio} alt="March - Breathwork Facilitator" className="w-full h-full object-cover" priority={false} />
            </div>

            {/* Text content */}
            <div className="space-y-6">
              <p className="text-white text-[clamp(0.9rem,1vw,1rem)] leading-[1.6]">
                Hi, I'm a London based certified breathwork facilitator. Having extensively explored meditation since my teens, my dedication to the practice has taken me around the world, from Buddhist monasteries to learning from some of the best teachers in India, Europe and UK.
              </p>

              {/* How did breathwork help me? */}
              <div className="border-t border-white/[0.14] pt-6 space-y-6">
                <h3 className="font-editorial text-[22px] text-white">How did breathwork help me?</h3>
                <p className="text-white text-[clamp(0.9rem,1vw,1rem)] leading-[1.6]">
                  Breathwork has had a profound impact on my life. Bouts of depression, anxiety and a lack of self-confidence took me through a rollercoaster during my early 20's. The instantly tangible effects of breathing tools filled me with confidence to implement a regular practice, and over time, I started to feel more at home in my own body.
                </p>
              </div>

              {/* What do I teach? */}
              <div className="border-t border-white/[0.14] pt-6 space-y-6">
                <h3 className="font-editorial text-[22px] text-white">What do I teach?</h3>
                <p className="text-white text-[clamp(0.9rem,1vw,1rem)] leading-[1.6]">
                  I am a trained and certified breathwork facilitator. Having explored a variety of modalities, I provide well-rounded support with scientifically-backed breathing tools. Your breath is like a fingerprint — everyone's pattern is unique, so techniques are carefully determined by your needs.
                </p>
              </div>

              {/* Featured on ITV */}
              <div className="flex items-center justify-center gap-2 pt-8 mt-6">
                <span className="text-white/50 text-sm tracking-wide uppercase">Featured on</span>
                <OptimizedImage src={companyLogos.itv} alt="ITV" className="h-10 w-auto object-contain opacity-70" priority={false} />
              </div>

              {/* Contact link - secondary CTA */}
              <button onClick={() => {
              setShowMeetMarchModal(false);
              setShowContactModal(true);
            }} className="flex items-center justify-center gap-3 text-white/90 hover:text-white transition-colors text-[15px] tracking-wide pt-4 w-full">
                Contact Me <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Desktop Layout - 2 columns, image matches text height */}
          <div className="hidden lg:grid lg:grid-cols-[280px,1fr] gap-10 items-stretch pt-2">
            {/* Column 1: Image - Stretches to match text height */}
            <div className="relative overflow-hidden rounded-lg">
              <OptimizedImage src={marchImages.bio} alt="March - Breathwork Facilitator" className="w-full h-full object-cover" priority={false} />
            </div>

            {/* Column 2: All text content */}
            <div className="flex flex-col space-y-5 max-w-[580px]">
              {/* Intro */}
              <p className="text-white text-[clamp(0.9rem,1vw,1rem)] leading-[1.6]">
                Hi, I'm a London based certified breathwork facilitator. Having extensively explored meditation since my teens, my dedication to the practice has taken me around the world, from Buddhist monasteries to learning from some of the best teachers in India, Europe and UK.
              </p>

              {/* How did breathwork help me? */}
              <div className="border-t border-white/[0.14] pt-5 space-y-3">
                <h3 className="font-editorial text-[26px] text-white leading-[1.2]">How did breathwork help me?</h3>
                <p className="text-white text-[clamp(0.9rem,1vw,1rem)] leading-[1.6]">
                  Breathwork has had a profound impact on my life. Bouts of depression, anxiety and a lack of self-confidence took me through a rollercoaster during my early 20's. The instantly tangible effects of breathing tools filled me with confidence to implement a regular practice, and over time, I started to feel more at home in my own body.
                </p>
              </div>

              {/* What do I teach? */}
              <div className="border-t border-white/[0.14] pt-5 space-y-3">
                <h3 className="font-editorial text-[26px] text-white leading-[1.2]">What do I teach?</h3>
                <p className="text-white text-[clamp(0.9rem,1vw,1rem)] leading-[1.6]">
                  I am a trained and certified breathwork facilitator. Having explored a variety of modalities, I provide well-rounded support with scientifically-backed breathing tools. Your breath is like a fingerprint — everyone's pattern is unique, so techniques are carefully determined by your needs.
                </p>
              </div>

              {/* Footer row: Featured on ITV + Contact link */}
              <div className="flex items-center justify-between pt-12 mt-6 border-t border-white/[0.14]">
                <div className="flex items-center gap-2">
                  <span className="text-white/50 text-sm tracking-wide uppercase">Featured on</span>
                  <OptimizedImage src={companyLogos.itv} alt="ITV" className="h-10 w-auto object-contain opacity-70" priority={false} />
                </div>
                <button onClick={() => {
                setShowMeetMarchModal(false);
                setShowContactModal(true);
              }} className="flex items-center gap-3 text-white/90 hover:text-white transition-colors text-[15px] tracking-wide">
                  Contact Me <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Corporate Work Modal - REDUCED */}
      <Dialog open={showCorporateModal} onOpenChange={setShowCorporateModal}>
        <DialogContent hideClose className="max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-black/30 border border-white/30 p-0">
          <button onClick={() => setShowCorporateModal(false)} className="absolute top-8 right-8 z-50 opacity-70 hover:opacity-100 transition-opacity">
            <X className="w-7 h-7 md:w-8 md:h-8 text-white" />
          </button>
          
          <div className="p-10 pt-20 md:p-14 md:pt-24 space-y-8">
            {/* Header */}
            <div className="text-center space-y-3">
              <h2 className="font-['PP_Editorial_Old'] text-4xl md:text-5xl lg:text-6xl text-white">Corporate Breathwork</h2>
              <p className="text-xl md:text-2xl lg:text-3xl text-white/80 font-light max-w-3xl mx-auto">
                Transform your workplace with scientifically-backed breathwork training
              </p>
            </div>
            
            {/* Company Logos */}
            <div className="pt-6">
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-14">
                <OptimizedImage src={companyLogos.zoe} alt="ZOE" className="h-6 sm:h-9 md:h-10 w-auto object-contain opacity-70" optimizationOptions={{
                quality: 75,
                width: 150,
                height: 40
              }} priority={false} />
                <OptimizedImage src={companyLogos.tesla} alt="Tesla" className="h-6 sm:h-14 md:h-16 w-auto object-contain opacity-70" optimizationOptions={{
                quality: 75,
                width: 200,
                height: 64
              }} priority={false} />
                <OptimizedImage src={companyLogos.google} alt="Google" className="h-7 sm:h-11 md:h-12 w-auto object-contain opacity-70" optimizationOptions={{
                quality: 75,
                width: 150,
                height: 48
              }} priority={false} />
                <OptimizedImage src={companyLogos.justeat} alt="Just Eat" className="h-16 sm:h-32 md:h-36 w-auto object-contain opacity-70" optimizationOptions={{
                quality: 75,
                width: 350,
                height: 144
              }} priority={false} />
                <OptimizedImage src={companyLogos.itv} alt="ITV" className="h-14 sm:h-28 md:h-32 w-auto object-contain opacity-70" optimizationOptions={{
                quality: 75,
                width: 250,
                height: 128
              }} priority={false} />
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid md:grid-cols-2 gap-10 pt-6 pb-14">
              {/* Left Column - What's Included */}
              <div className="space-y-5">
                <h3 className="font-editorial text-3xl md:text-4xl text-white mb-8">What's Included</h3>
                <ul className="space-y-5 text-xl md:text-2xl text-white/80 leading-relaxed">
                  <li className="flex items-start gap-3">
                    <span className="text-white/50 mt-1">•</span>
                    <span>Customized workshops for teams of any size</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-white/50 mt-1">•</span>
                    <span>Stress management and energy optimization</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-white/50 mt-1">•</span>
                    <span>On-site or virtual sessions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-white/50 mt-1">•</span>
                    <span>Measurable improvements in focus</span>
                  </li>
                </ul>
              </div>

              {/* Right Column - Additional Info */}
              <div className="space-y-5">
                <h3 className="font-editorial text-3xl md:text-4xl text-white mb-8">Benefits</h3>
                <ul className="space-y-5 text-xl md:text-2xl text-white/80 leading-relaxed">
                  <li className="flex items-start gap-3">
                    <span className="text-white/50 mt-1">•</span>
                    <span>Enhanced team performance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-white/50 mt-1">•</span>
                    <span>Reduced workplace stress</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-white/50 mt-1">•</span>
                    <span>Improved mental clarity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-white/50 mt-1">•</span>
                    <span>Better work-life balance</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* CTA Section */}
            <div className="pt-14 pb-10 border-t border-white/20 space-y-4 mt-14">
              <p className="text-xl md:text-2xl text-white/70 font-light text-center">
                Schedule a free consultation to discuss how breathwork can benefit your team
              </p>
              <Button onClick={() => window.open('https://calendly.com/march-marchrussell/arc-resilience-leadership-for-teams-discovery-call', '_blank')} className="w-full bg-transparent border-2 border-white text-white hover:bg-white hover:text-black transition-all rounded-full py-6 md:py-7 text-xl md:text-2xl">
                Book a Discovery Call
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* RISE Method Modal */}
      <Dialog open={showRiseModal} onOpenChange={setShowRiseModal}>
        <DialogContent hideClose className="max-w-5xl max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-black/30 border border-white/30 p-0">
          <button onClick={() => setShowRiseModal(false)} className="absolute top-8 right-8 z-50 opacity-70 hover:opacity-100 transition-opacity">
            <X className="w-7 h-7 md:w-8 md:h-8 text-white" />
          </button>
          
          <div className="p-10 md:p-12 pt-20 md:pt-24 space-y-7 md:space-y-8">
            <div className="text-center space-y-3">
              <h2 className="font-['PP_Editorial_Old'] text-4xl md:text-5xl lg:text-6xl text-white">The RISE Method</h2>
              <p className="text-xl md:text-2xl lg:text-3xl font-light text-white/90 max-w-3xl mx-auto">
                A transformative 12-week program that teaches you to regulate your nervous system
              </p>
            </div>
            
            <div className="space-y-5 md:space-y-6 text-xl md:text-2xl text-white/90 leading-relaxed font-light">
              <p>
                The RISE Method combines ancient breathwork and meditation wisdom with cutting-edge neuroscience to create lasting change. You'll learn to shift from chronic stress patterns into states of calm, clarity, and confidence—building resilience that transforms every area of your life.
              </p>
              
              <div className="pt-3 space-y-5 md:space-y-6">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-light text-white">Two Pathways to Transformation:</h3>
                
                <div className="space-y-5">
                  <div className="bg-white/5 border border-white/20 p-5 md:p-6 rounded-lg">
                    <h4 className="font-light text-white mb-3 text-lg md:text-xl lg:text-2xl">DIY Version</h4>
                    <p className="text-lg md:text-xl lg:text-2xl text-white/80 leading-relaxed">
                      Self-guided access to the complete 5-month curriculum, video lessons, breathwork protocols, and worksheets. Perfect for self-motivated individuals who want to work at their own pace.
                    </p>
                  </div>
                  
                  <div className="bg-white/5 border border-white/20 p-5 md:p-6 rounded-lg">
                    <h4 className="font-light text-white mb-3 text-lg md:text-xl lg:text-2xl">Personalized Mentorship</h4>
                    <p className="text-lg md:text-xl lg:text-2xl text-white/80 leading-relaxed">
                      Everything in the DIY version (complete 5-month curriculum, video lessons, breathwork protocols, and worksheets) PLUS one-on-one weekly sessions with March, tailored breathwork protocols, direct feedback, and ongoing support. Ideal for those seeking accountability and personalized guidance.
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="pt-3 md:pt-5 font-light text-lg md:text-xl">
                Whether you choose the DIY path or personalized mentorship, The RISE Method gives you the tools to master your nervous system and create profound, lasting change.
              </p>
            </div>

            <div className="pt-6 md:pt-8 border-t border-white/20 space-y-4 md:space-y-5">
              <p className="text-lg md:text-xl lg:text-2xl text-white/70 font-light text-center">Let's discuss your goals and see if The RISE Method is right for you</p>
              <Button onClick={() => window.open('https://calendly.com/march-marchrussell/welcome-call', '_blank')} className="w-full bg-transparent border-2 border-white text-white hover:bg-white hover:text-black transition-all rounded-full py-6 md:py-7 text-xl md:text-2xl">
                Book a Discovery Call
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <main>
        {/* Hero Section with Optimized Background */}
        <section className="relative h-[100dvh] overflow-hidden flex flex-col justify-center items-center">
          <OptimizedImage src={heroBreathworkWide} alt="Hero background" className="absolute inset-0 w-full h-full object-cover object-[30%_40%] lg:object-center" priority={true} optimizationOptions={{
          quality: 85,
          format: 'webp',
          width: 1920,
          height: 1080
        }} />
          
          {/* Subtle dark overlay to reduce glare */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/5 to-black/10" />

          {/* Bottom Text - Full Width, 3 Lines */}
          <div className="absolute bottom-8 sm:bottom-10 md:bottom-12 left-5 sm:left-8 md:left-16 right-5 sm:right-6 md:right-8 z-10">
          <p className="font-editorial text-white leading-[1.15] drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]" style={{
            textShadow: '0 2px 12px rgba(0,0,0,0.5)',
            fontSize: 'clamp(2.4rem, 3.5vw, 3.5rem)',
            fontWeight: 300
          }}>Where your nervous system rests — and your senses awaken.</p>
          <p className="font-unica text-white/90 mt-5 md:mt-6 ml-[0.1em] drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]" style={{
            fontSize: 'clamp(1.1rem, 1.3vw, 1.3rem)',
            letterSpacing: '0.02em',
            fontWeight: 450,
            lineHeight: 1.6
          }}>Science-led breathwork and nervous system training for real-world stress and sustainable change.</p>
          </div>

        </section>

        {/* Three Ways to Work With Me Section */}
        <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden py-12 md:py-0">
          {/* Background Image */}
          <OptimizedImage src={threeWaysMushroomBg} alt="Background" className="absolute inset-0 w-full h-full object-cover object-bottom" optimizationOptions={{
          quality: 85,
          format: 'webp',
          width: 1920,
          height: 1080
        }} priority={false} />
          <div className="absolute inset-0 bg-black/30" />
          
          <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1200px]">
            {/* Section Title - REDUCED */}
            <h2 className="font-editorial text-white text-center mb-[32px] md:mb-[40px] lg:mb-[48px] tracking-[0.01em]" style={{
            fontSize: 'clamp(1.8rem, 2.2vw, 2.4rem)',
            lineHeight: 1.15,
            fontWeight: 400
          }}>
              Three Ways to Work With Me
            </h2>
            
            {/* Three Tiles - Reduced padding and gaps */}
            <div className="flex flex-col md:flex-row flex-wrap lg:flex-nowrap justify-center items-stretch gap-[24px] md:gap-[32px] lg:gap-[36px]">
              
              {/* Tile 1 - Rise ARC Method - REDUCED PADDING */}
              <div className="flex flex-col bg-black/[0.28] backdrop-blur-[16px] rounded-[20px] pt-[32px] pb-[32px] px-[18px] lg:pt-[36px] lg:pb-[36px] lg:px-[22px] w-full md:w-[calc(50%-16px)] lg:w-auto lg:min-w-[200px] lg:max-w-[250px] lg:flex-1 mx-auto lg:mx-0 hover:bg-black/[0.35] transition-colors duration-300 border border-white/[0.08]" style={{
              boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.2)'
            }}>
                <h3 className="font-sans text-white mb-[14px] leading-[1.3]" style={{
                fontSize: 'clamp(1rem, 1.25vw, 1.35rem)',
                fontWeight: 500
              }}>
                  Rise ARC Method
                </h3>
                <div className="text-[rgba(255,255,255,0.92)] font-normal mb-[20px] space-y-3" style={{
                fontSize: 'clamp(0.9rem, 1vw, 1rem)',
                lineHeight: 1.6
              }}>
                  <p>A 4-month, high-touch nervous system recalibration for people living in chronic stress, fatigue, or emotional overload — restoring steadiness, clarity, and real presence in daily life.</p>
                </div>
                <button onClick={() => setShowArcIntroModal(true)} className="inline-flex items-center gap-2 mt-auto text-white hover:opacity-85 tracking-[0.02em] transition-opacity group text-left" style={{
                fontSize: 'clamp(0.8rem, 0.9vw, 0.9rem)'
              }}>
                  Learn More
                  <ArrowRight className="w-[12px] h-[12px] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Tile 2 - The Studio - REDUCED PADDING */}
              <div className="flex flex-col bg-black/[0.28] backdrop-blur-[16px] rounded-[20px] pt-[32px] pb-[32px] px-[18px] lg:pt-[36px] lg:pb-[36px] lg:px-[22px] w-full md:w-[calc(50%-16px)] lg:w-auto lg:min-w-[200px] lg:max-w-[250px] lg:flex-1 mx-auto lg:mx-0 hover:bg-black/[0.35] transition-colors duration-300 border border-white/[0.08]" style={{
              boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.2)'
            }}>
                <h3 className="font-sans text-white mb-[14px] leading-[1.3]" style={{
                fontSize: 'clamp(1rem, 1.25vw, 1.35rem)',
                fontWeight: 500
              }}>The Studio</h3>
                <div className="text-[rgba(255,255,255,0.92)] font-normal mb-[20px] space-y-3" style={{
                fontSize: 'clamp(0.9rem, 1vw, 1rem)',
                lineHeight: 1.6
              }}>
                  <p>Daily breathwork, meditation, and somatic tools — designed to regulate stress, restore energy, deepen sleep, and steady you in under 10 minutes.</p>
                </div>
                <Link to="/studio" className="inline-flex items-center gap-2 mt-auto text-white hover:opacity-85 tracking-[0.02em] transition-opacity group text-left" style={{
                fontSize: 'clamp(0.8rem, 0.9vw, 0.9rem)'
              }}>
                  Explore The Studio
                  <ArrowRight className="w-[12px] h-[12px] group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Tile 3 - For Companies & Teams - REDUCED PADDING */}
              <div className="flex flex-col bg-black/[0.28] backdrop-blur-[16px] rounded-[20px] pt-[32px] pb-[32px] px-[18px] lg:pt-[36px] lg:pb-[36px] lg:px-[22px] w-full md:w-[calc(50%-16px)] lg:w-auto lg:min-w-[200px] lg:max-w-[250px] lg:flex-1 mx-auto lg:mx-0 hover:bg-black/[0.35] transition-colors duration-300 border border-white/[0.08]" style={{
              boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.2)'
            }}>
                <h3 className="font-sans text-white mb-[14px] leading-[1.3]" style={{
                fontSize: 'clamp(1rem, 1.25vw, 1.35rem)',
                fontWeight: 500
              }}>For Companies</h3>
                <div className="text-[rgba(255,255,255,0.92)] font-normal mb-[20px] space-y-3" style={{
                fontSize: 'clamp(0.9rem, 1vw, 1rem)',
                lineHeight: 1.6
              }}>
                  <p>Science-backed nervous system and breathwork training that helps teams regulate stress, sleep more deeply, restore energy, and perform with clarity under pressure.</p>
                </div>
                <button onClick={() => setShowTeamsModal(true)} className="inline-flex items-center gap-2 mt-auto text-white hover:opacity-85 tracking-[0.02em] transition-opacity group text-left" style={{
                fontSize: 'clamp(0.8rem, 0.9vw, 0.9rem)'
              }}>
                  Start The Conversation
                  <ArrowRight className="w-[12px] h-[12px] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              
            </div>
            
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="pb-12 sm:pb-14 md:pb-16 px-4 bg-background">
          <div className="container mx-auto max-w-6xl text-center pt-8 sm:pt-10 md:pt-14 lg:pt-16">
            <p className="uppercase text-white mb-12 sm:mb-14 md:mb-16 lg:mb-20" style={{
            fontSize: 'clamp(0.85rem, 0.9vw, 0.95rem)',
            letterSpacing: '0.04em'
          }}>
              Trusted by leading organizations
            </p>
            {/* Mobile/Tablet: Single row layout */}
            <div className="md:hidden flex items-center justify-between px-2 sm:px-6">
              <OptimizedImage src={companyLogos.zoe} alt="ZOE" className="h-5 sm:h-6 w-auto object-contain" optimizationOptions={{
                quality: 75,
                width: 80,
                height: 24
              }} priority={false} />
              <OptimizedImage src={companyLogos.tesla} alt="Tesla" className="h-6 sm:h-8 w-auto object-contain" optimizationOptions={{
                quality: 75,
                width: 80,
                height: 64
              }} priority={false} />
              <OptimizedImage src={companyLogos.itv} alt="ITV" className="h-12 sm:h-14 w-auto object-contain" optimizationOptions={{
                quality: 75,
                width: 80,
                height: 96
              }} priority={false} />
              <OptimizedImage src={companyLogos.justeat} alt="Just Eat" className="h-12 sm:h-14 w-auto object-contain" optimizationOptions={{
                quality: 75,
                width: 120,
                height: 96
              }} priority={false} />
              <OptimizedImage src={companyLogos.google} alt="Google" className="h-5 sm:h-6 w-auto object-contain" optimizationOptions={{
                quality: 75,
                width: 80,
                height: 40
              }} priority={false} />
            </div>

            {/* Desktop: Single horizontal row - editorial gallery with balanced visual weight */}
            <div className="hidden md:flex flex-nowrap items-center justify-center gap-32 sm:gap-36 md:gap-48 lg:gap-56 xl:gap-64 mb-8 sm:mb-10 md:mb-12 lg:mb-14">
              <OptimizedImage src={companyLogos.zoe} alt="ZOE" className="h-6 sm:h-7 md:h-8 lg:h-9 w-auto object-contain opacity-70 hover:opacity-95 transition-opacity duration-300" optimizationOptions={{
              quality: 75,
              width: 100,
              height: 36
            }} priority={false} />
              <OptimizedImage src={companyLogos.tesla} alt="Tesla" className="h-8 sm:h-9 md:h-10 lg:h-12 w-auto object-contain opacity-65 hover:opacity-90 transition-opacity duration-300" optimizationOptions={{
              quality: 75,
              width: 120,
              height: 96
            }} priority={false} />
              <OptimizedImage src={companyLogos.itv} alt="ITV" className="h-10 sm:h-12 md:h-14 lg:h-20 w-auto object-contain opacity-70 hover:opacity-95 transition-opacity duration-300" optimizationOptions={{
              quality: 75,
              width: 120,
              height: 144
            }} priority={false} />
              <OptimizedImage src={companyLogos.justeat} alt="Just Eat" className="h-20 sm:h-24 md:h-28 lg:h-36 w-auto object-contain opacity-70 hover:opacity-95 transition-opacity duration-300" optimizationOptions={{
              quality: 75,
              width: 180,
              height: 192
            }} priority={false} />
              <OptimizedImage src={companyLogos.google} alt="Google" className="h-6 sm:h-7 md:h-8 lg:h-11 w-auto object-contain opacity-65 hover:opacity-90 transition-opacity duration-300" optimizationOptions={{
              quality: 75,
              width: 120,
              height: 56
            }} priority={false} />
            </div>
          </div>
        </section>

        {/* Conscious Community Hero Section */}
        <section className="relative h-[100svh] overflow-hidden">
          <OptimizedImage src={communityHeroKef} alt="Community hero background" className="absolute inset-0 w-full h-full object-cover" style={{
          objectPosition: 'center 35%'
        }} optimizationOptions={{
          quality: 85,
          format: 'webp',
          width: 1920,
          height: 1080
        }} priority={false} />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent z-0" />
          <div className="absolute left-5 sm:left-8 md:left-12 lg:left-16 right-5 sm:right-8 bottom-8 sm:bottom-10 md:bottom-12 lg:bottom-16 z-20">
            <button onClick={() => setShowMeetMarchModal(true)} className="font-editorial text-white hover:opacity-80 transition-opacity whitespace-nowrap text-left" style={{
            fontSize: 'clamp(2rem, 2.4vw, 2.6rem)',
            lineHeight: 1.15,
            fontWeight: 400
          }}>
              Meet March →
            </button>
            <p className="font-unica text-white/85 mt-4 md:mt-5" style={{
            fontSize: 'clamp(1.05rem, 1.15vw, 1.2rem)',
            letterSpacing: '0.02em',
            fontWeight: 450,
            lineHeight: 1.55
          }}>Founder of the Rise ARC Method  •  Breathwork Consultant for global brands</p>
          </div>
        </section>

        {/* Glowing orange divider line after hero */}
        <div className="w-full" style={{
        height: '4px',
        backgroundColor: '#E64C20',
        boxShadow: '0 0 80px rgba(230, 76, 32, 1), 0 0 140px rgba(230, 76, 32, 1), 0 0 200px rgba(230, 76, 32, 0.9)'
      }}></div>

        {/* Why This Work Matters Section */}
        <section className="w-full py-10 md:py-[60px] lg:py-[80px] px-5 sm:px-6 lg:px-8 animate-fade-in" style={{
        background: 'linear-gradient(180deg, rgba(7,7,7,1) 0%, rgba(14,14,14,1) 50%, rgba(7,7,7,1) 100%)'
      }}>
          <div className="max-w-[1100px] mx-auto">
            {/* Section Title */}
            <h2 className="font-editorial text-white text-center mb-6 md:mb-[48px] lg:mb-[56px] tracking-[0.01em]" style={{
            fontSize: 'clamp(1.8rem, 2.2vw, 2.4rem)',
            lineHeight: 1.15,
            fontWeight: 400
          }}>
              Why This Work Matters
            </h2>
            
            {/* Single Block Copy */}
            <div className="max-w-[46rem] mx-auto text-center" style={{
            fontSize: 'clamp(0.9rem, 1vw, 1rem)',
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.9)'
          }}>
              <p className="mb-8">Many people I work with are carrying far more than they realise - not because they're doing anything wrong, but because modern life keeps us in a quiet state of survival. Constant input, constant pace, constant pressure. 


Over time the body adapts so intelligently that most people don't even notice how tense, tired, or disconnected they've become. Things still "work," but something feels off. Sleep doesn't restore you. Stress doesn't let go. You're functioning, but not fully living.</p>
              
              <p>
                This work meets that pattern directly. Through breath, somatic practice, and nervous-system re-patterning, your body learns what safety, rest, and real presence feel like again - not conceptually, but physically. When the baseline shifts, everything shifts with it: reactions soften, sleep deepens, connection feels easier, and life stops feeling like something you manage and becomes something you can genuinely inhabit again.
              </p>
            </div>
          </div>
        </section>

        {/* Glowing orange divider line after Why This Work Matters */}
        <div className="w-full" style={{
        height: '4px',
        backgroundColor: '#E64C20',
        boxShadow: '0 0 80px rgba(230, 76, 32, 1), 0 0 140px rgba(230, 76, 32, 1), 0 0 200px rgba(230, 76, 32, 0.9)'
      }}></div>

        {/* App Summary Section - CENTERED LAYOUT */}
        <section className="pt-10 md:pt-16 lg:pt-[96px] pb-14 md:pb-24 lg:pb-[96px] bg-background px-5 md:px-12 lg:px-[80px] xl:px-[100px]">
          <div className="max-w-[1200px] mx-auto">
            {/* Top Text - Centered above cards */}
            <div className="text-center max-w-[720px] mx-auto mb-10 md:mb-16 lg:mb-20 px-2 md:px-0">
              {/* Title */}
              <h2 className="font-editorial text-white mb-5" style={{
              fontSize: 'clamp(1.8rem, 2.5vw, 2.6rem)',
              lineHeight: 1.2,
              fontWeight: 400
            }}>The Studio — Your Nervous System Companion</h2>
              
              {/* Sub-header */}
              <p className="mb-6 text-white" style={{
              fontSize: 'clamp(1rem, 1.1vw, 1.15rem)',
              lineHeight: 1.65
            }}>
                Reset stress. Restore energy. Deepen sleep. Feel steady — anytime you need it.
              </p>
              
              {/* Paragraph A */}
              <p className="text-white/85 mb-5" style={{
              fontSize: 'clamp(0.9rem, 0.95vw, 1rem)',
              lineHeight: 1.75
            }}>
                Short, science-backed practices to regulate stress, restore energy, deepen sleep, and steady your mind<br />— whenever you need them.
              </p>
              
              {/* Paragraph B */}
              <p className="text-white/70" style={{
              fontSize: 'clamp(0.9rem, 0.95vw, 1rem)',
              lineHeight: 1.75
            }}>
                Weekly resets, monthly deep dives, guest teachers, and an expanding practice library designed to meet your nervous system where you are.
              </p>
            </div>

            {/* Session Cards - Centered */}
            <div className="w-full relative mb-12 md:mb-16 lg:mb-20">
              {featuredSessions.length === 0 ? (
                <FeaturedSessionSkeleton />
              ) : (
                <>
              
              {/* Desktop: 3 cards centered */}
              <div className="hidden lg:flex flex-row gap-6 xl:gap-8 items-stretch justify-center">
                {featuredSessions.map(session => <Link key={session.id} to={`/studio?session=${session.id}`} className="group flex flex-col w-[320px] xl:w-[340px]">
                    <div 
                      className="relative overflow-hidden rounded-2xl text-left w-full h-[420px] xl:h-[460px] border border-[#E6DBC7]/20 hover:border-[#E6DBC7]/40 transition-[border-color,box-shadow] duration-500 hover:shadow-[0_0_60px_rgba(230,219,199,0.35)]"
                    >
                      <OptimizedImage 
                        src={session.image_url || programImages.breathingBasics} 
                        alt={session.title} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" 
                        optimizationOptions={{
                          width: 700,
                          quality: 85
                        }} 
                        loading="lazy" 
                      />
                      <div 
                        className="absolute inset-0" 
                        style={{
                          background: 'linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.92) 100%)'
                        }}
                      />
                      {/* Glassmorphism play button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div 
                          className="w-20 h-20 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105" 
                          style={{
                            background: 'rgba(255,255,255,0.12)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.25)'
                          }}
                        >
                          <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col">
                        <p 
                          className="tracking-[0.14em] uppercase mb-2.5 font-medium" 
                          style={{
                            fontSize: '11px',
                            color: '#D4A574'
                          }}
                        >
                          {session.categories?.name || 'BREATHWORK'}
                        </p>
                        <p 
                          className="font-editorial text-[#E6DBC7] mb-1.5 line-clamp-2 font-light tracking-[-0.01em]" 
                          style={{
                            fontSize: 'clamp(1.3rem, 1.5vw, 1.5rem)',
                            lineHeight: 1.25
                          }}
                        >
                          {session.title}
                        </p>
                        <p className="text-[#E6DBC7]/50 text-[13px] tracking-wide">{session.duration_minutes} min</p>
                      </div>
                    </div>
                  </Link>)}
              </div>
              
              {/* Tablet: 2 columns grid centered */}
              <div className="hidden md:grid lg:hidden grid-cols-2 gap-5 max-w-[620px] mx-auto">
                {featuredSessions.map(session => <Link key={session.id} to={`/studio?session=${session.id}`} className="group flex flex-col">
                    <div 
                      className="relative overflow-hidden rounded-2xl text-left w-full h-[380px] border border-[#E6DBC7]/20 hover:border-[#E6DBC7]/40 transition-[border-color,box-shadow] duration-500 hover:shadow-[0_0_60px_rgba(230,219,199,0.35)]"
                    >
                      <OptimizedImage 
                        src={session.image_url || programImages.breathingBasics} 
                        alt={session.title} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" 
                        optimizationOptions={{
                          width: 600,
                          quality: 85
                        }} 
                        loading="lazy" 
                      />
                      <div 
                        className="absolute inset-0" 
                        style={{
                          background: 'linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.92) 100%)'
                        }}
                      />
                      {/* Glassmorphism play button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div 
                          className="w-18 h-18 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105" 
                          style={{
                            background: 'rgba(255,255,255,0.12)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                            width: '72px',
                            height: '72px'
                          }}
                        >
                          <Play className="w-7 h-7 text-white ml-0.5" fill="currentColor" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col">
                        <p 
                          className="tracking-[0.14em] uppercase mb-2 font-medium" 
                          style={{
                            fontSize: '10px',
                            color: '#D4A574'
                          }}
                        >
                          {session.categories?.name || 'BREATHWORK'}
                        </p>
                        <p 
                          className="font-editorial text-[#E6DBC7] mb-1 line-clamp-2 font-light tracking-[-0.01em]" 
                          style={{
                            fontSize: '1.25rem',
                            lineHeight: 1.25
                          }}
                        >
                          {session.title}
                        </p>
                        <p className="text-[#E6DBC7]/50 text-[12px] tracking-wide">{session.duration_minutes} min</p>
                      </div>
                    </div>
                  </Link>)}
              </div>
              
              {/* Mobile: Carousel */}
              <div className="md:hidden">
                <div 
                  className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 -mx-5 px-5 scrollbar-hide"
                  style={{ 
                    scrollbarWidth: 'none', 
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  {featuredSessions.map(session => (
                    <Link key={session.id} to={`/studio?session=${session.id}`} className="group flex-shrink-0 w-[280px] snap-start">
                      <div className="relative overflow-hidden rounded-2xl text-left w-full h-[340px] border border-[#E6DBC7]/20 shadow-lg">
                        <OptimizedImage 
                          src={session.image_url || programImages.breathingBasics} 
                          alt={session.title} 
                          className="absolute inset-0 w-full h-full object-cover" 
                          optimizationOptions={{ width: 600, quality: 85 }} 
                          loading="lazy" 
                        />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.92) 100%)' }} />
                        {/* Play button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                            <Play className="w-6 h-6 text-white ml-0.5" fill="currentColor" />
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col">
                          <p className="tracking-[0.14em] uppercase mb-2 font-medium text-[10px]" style={{ color: '#D4A574' }}>{session.categories?.name || 'BREATHWORK'}</p>
                          <p className="font-editorial text-[#E6DBC7] mb-1 line-clamp-2 font-light text-[1.15rem] leading-[1.25]">{session.title}</p>
                          <p className="text-[#E6DBC7]/50 text-[12px] tracking-wide">{session.duration_minutes} min</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {/* Carousel hint */}
                <p className="text-white/40 text-xs text-center mt-1 tracking-wide">Swipe to see more →</p>
              </div>
              </>
              )}
            </div>

            {/* Bottom Content - Centered below cards */}
            <div className="text-center max-w-[1100px] mx-auto">
              {/* Benefits - Pills with better mobile layout */}
              <div className="flex flex-col items-center gap-3 md:gap-5 lg:gap-6 mb-10 md:mb-16">
                {/* Mobile: Stacked in 2 columns */}
                <div className="md:hidden grid grid-cols-2 gap-2 w-full max-w-[360px]">
                  {[
                    "Restore energy",
                    "Ease overwhelm",
                    "Reset in minutes",
                    "Sleep deeper",
                    "Feel more alive",
                    "Build resilience"
                  ].map((item, idx) => (
                    <span key={idx} className="px-4 py-2.5 rounded-full bg-[#E6DBC7] text-[#1A1A1A] text-[0.8rem] font-medium border border-white/30 text-center">
                      {item}
                    </span>
                  ))}
                </div>
                
                {/* Tablet/Desktop: Original layout */}
                <div className="hidden md:flex flex-col items-center gap-4 lg:gap-5">
                  {/* Top row - 4 items */}
                  <div className="flex flex-wrap justify-center gap-4 lg:gap-5">
                    <span className="px-7 py-3 rounded-full bg-[#E6DBC7] text-[#1A1A1A] text-[clamp(0.88rem,0.95vw,0.98rem)] font-medium border border-white/30">
                      Restore your energy quickly
                    </span>
                    <span className="px-7 py-3 rounded-full bg-[#E6DBC7] text-[#1A1A1A] text-[clamp(0.88rem,0.95vw,0.98rem)] font-medium border border-white/30">
                      Feel steady under pressure
                    </span>
                    <span className="px-7 py-3 rounded-full bg-[#E6DBC7] text-[#1A1A1A] text-[clamp(0.88rem,0.95vw,0.98rem)] font-medium border border-white/30">
                      Ease overwhelm + emotional load
                    </span>
                    <span className="px-7 py-3 rounded-full bg-[#E6DBC7] text-[#1A1A1A] text-[clamp(0.88rem,0.95vw,0.98rem)] font-medium border border-white/30">Reset your nervous system in minutes</span>
                  </div>
                  {/* Bottom row - 3 items */}
                  <div className="flex flex-wrap justify-center gap-4 lg:gap-5">
                    <span className="px-7 py-3 rounded-full bg-[#E6DBC7] text-[#1A1A1A] text-[clamp(0.88rem,0.95vw,0.98rem)] font-medium border border-white/30">
                      Sleep deeper and unwind properly
                    </span>
                    <span className="px-7 py-3 rounded-full bg-[#E6DBC7] text-[#1A1A1A] text-[clamp(0.88rem,0.95vw,0.98rem)] font-medium border border-white/30">Feel more alive and present</span>
                    <span className="px-7 py-3 rounded-full bg-[#E6DBC7] text-[#1A1A1A] text-[clamp(0.88rem,0.95vw,0.98rem)] font-medium border border-white/30">Build real nervous system resilience</span>
                  </div>
                </div>
              </div>
              
              {/* Signature line */}
              <p className="text-white/50 italic mt-12 mb-12" style={{
              fontSize: 'clamp(0.8rem, 0.85vw, 0.88rem)'
            }}>
                Led by March + guest teachers — new practices added weekly.
              </p>
              
              {/* CTA button */}
              <Link to="/studio" className="inline-block">
                <Button className="bg-transparent text-white border border-white/50 hover:bg-white/10 hover:border-white/70 transition-colors duration-300 h-[56px] px-10 rounded-full inline-flex items-center justify-center" style={{
                fontSize: 'clamp(0.92rem, 0.98vw, 1rem)'
              }}>
                  Explore The Studio
                </Button>
              </Link>
            </div>
          </div>
        </section>
        {/* Testimonials Section - REDUCED */}
        <section className="py-8 md:py-12 lg:py-16 px-4 md:px-6 bg-background">
          <div className="max-w-[1400px] mx-auto">
            {/* Title and subtitle with matching horizontal padding */}
            <div className="px-1 md:px-4 lg:px-6">
              {/* Title centered */}
              <div className="text-center mb-3 md:mb-5">
                <h2 className="font-editorial text-white text-center tracking-[0.01em]" style={{
                fontSize: 'clamp(1.8rem, 2.2vw, 2.4rem)',
                lineHeight: 1.15,
                fontWeight: 400
              }}>
                  What People Are Saying
                </h2>
              </div>
              
              {/* Lead-in question - editorial subtitle style */}
              <p className="text-center text-white/85 tracking-[0.03em] mb-6 md:mb-12 lg:mb-14" style={{
              fontSize: 'clamp(0.95rem, 1.15vw, 1.2rem)',
              fontWeight: 450,
              lineHeight: 1.5
            }}>
                What changes when the nervous system feels safe again?
              </p>
            </div>
            
            {/* Mobile Carousel */}
            <div className="md:hidden mb-8 px-6">
              <div 
                className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide"
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {videoTestimonials.map((testimonial, index) => (
                  <Card 
                    key={index} 
                    className="flex-shrink-0 w-[300px] snap-start border border-white/50 rounded-xl overflow-hidden flex flex-col cursor-pointer bg-black/30 shadow-lg"
                    onClick={() => {
                      setSelectedTestimonial(testimonial);
                      setShowIndividualTestimonialModal(true);
                    }}
                  >
                    <CardContent className="p-0 flex flex-col">
                      <div className="relative pb-[100%] rounded-t-xl overflow-hidden">
                        <video className="absolute inset-0 w-full h-full object-cover" src={testimonial.videoUrl} poster={testimonial.posterUrl} controls playsInline preload="metadata" onClick={e => e.stopPropagation()} />
                      </div>
                      <div className="p-5 flex flex-col">
                        <h3 className="font-unica font-medium text-base text-white mb-2">{testimonial.name}</h3>
                        <p className="text-white/90 line-clamp-3 mb-3 text-[0.9rem] leading-[1.6]">{testimonial.quote}</p>
                        <button className="text-white/70 text-left flex items-center gap-2 text-[0.9rem]">
                          Full testimonial <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* Carousel hint */}
              <p className="text-white/40 text-xs text-center mt-1 tracking-wide">Swipe to see more</p>
            </div>
            
            {/* Tablet/Desktop Grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mb-10 md:mb-12">
              {videoTestimonials.map((testimonial, index) => <Card key={index} className="border border-white/50 rounded-xl overflow-hidden flex flex-col cursor-pointer bg-black/30" style={{
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
            }} onClick={() => {
              setSelectedTestimonial(testimonial);
              setShowIndividualTestimonialModal(true);
            }}>
                  <CardContent className="p-0 flex flex-col">
                    {/* Video Thumbnail - reduced height */}
                    <div className="relative pb-[100%] rounded-t-xl overflow-hidden">
                      <video className="absolute inset-0 w-full h-full object-cover" src={testimonial.videoUrl} poster={testimonial.posterUrl} controls playsInline preload="metadata" onClick={e => e.stopPropagation()} />
                    </div>
                    
                    {/* Content Area */}
                    <div className="p-4 md:p-5 lg:p-6 flex flex-col">
                      {/* Name */}
                      <h3 className="font-unica font-medium text-base md:text-lg text-white mb-3">{testimonial.name}</h3>
                      
                      {/* Quote - Limited to 3 lines */}
                      <p className="text-white/90 line-clamp-3 mb-4" style={{
                    fontSize: 'clamp(0.9rem, 1vw, 1rem)',
                    lineHeight: 1.6
                  }}>
                        {testimonial.quote}
                      </p>
                      
                      {/* CTA Link */}
                      <button className="text-white/70 hover:text-white transition-colors text-left flex items-center gap-2 pb-2" style={{
                    fontSize: 'clamp(0.9rem, 1vw, 1rem)'
                  }}>
                        Full testimonial <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>)}
            </div>
    
            {/* See More CTA - Right aligned to card edge */}
            <div className="flex justify-end px-1 md:px-0">
              <button 
                onClick={() => setShowTestimonialsModal(true)} 
                className="text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-3 uppercase tracking-[0.06em] font-medium min-h-[44px]"
                style={{ fontSize: 'clamp(0.85rem, 0.95vw, 0.95rem)' }}
              >
                See more transformations <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Nervous System Program Card - White-lined curved box */}
        <section className="w-full px-6 md:px-8 lg:px-12 py-12 md:py-16 lg:py-20 bg-background">
          <div className="rounded-2xl border border-white/50 overflow-hidden max-w-[1400px] mx-auto shadow-[0_0_60px_rgba(230,219,199,0.4)]">
            <div className="grid md:grid-cols-2 min-h-[280px] sm:min-h-[320px] md:min-h-[380px]">
              {/* Left: Image */}
              <div className="relative min-h-[160px] sm:min-h-[180px] md:min-h-[380px]">
                <OptimizedImage src={programImages.trial} alt="Nervous system program" className="absolute inset-0 w-full h-full object-cover" style={{
                objectPosition: 'center 65%'
              }} optimizationOptions={{
                quality: 85,
                format: 'webp',
                width: 960,
                height: 500
              }} priority={true} />
              </div>
              
              {/* Right: Content */}
              <div className="bg-black flex flex-col justify-center px-6 sm:px-8 md:px-10 lg:px-12 py-6 sm:py-8 md:py-10">
                <h3 className="font-editorial text-white mb-5 sm:mb-6" style={{
                fontSize: 'clamp(1.8rem, 2.2vw, 2.4rem)',
                lineHeight: 1.15,
                fontWeight: 400
              }}>
                  14-Day Program
                </h3>
                <p className="text-[#EC9037] font-light tracking-[0.1em] mb-5 sm:mb-6 uppercase" style={{
                fontSize: 'clamp(0.7rem, 0.8vw, 0.85rem)'
              }}>14-DAY PROGRAM ON THE STUDIO</p>
                <p className="text-white/90 mb-5 sm:mb-6" style={{
                fontSize: 'clamp(0.85rem, 0.92vw, 0.95rem)',
                lineHeight: 1.65
              }}>
                  Are you stuck in chronic stress, overwhelm, or reactive patterns? Modern life can keep your system in fight-or-flight. This 7-Day Program helps you guide your nervous system back into balance — restoring clarity, emotional steadiness, and a felt sense of safety in your body.
                </p>
                
                <Button onClick={() => {
                localStorage.setItem('postOnboardingRedirect', 'nervous-system-program');
                setShowSubscriptionModal(true);
              }} className="bg-transparent text-white border border-white hover:bg-white/10 transition-all rounded-full inline-flex items-center justify-center w-fit" style={{
                fontSize: 'clamp(0.85rem, 0.9vw, 0.95rem)',
                fontWeight: 400,
                letterSpacing: '0.02em',
                padding: '0.6rem 1.4rem'
              }}>
                Start the 7-Day Program
              </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter & Contact Card Section - PREMIUM REFINED */}
        <section className="py-10 md:py-12 lg:py-14 bg-background">
          <div className="max-w-3xl mx-auto px-6 md:px-8 space-y-3">
            {/* Newsletter Row */}
            
            
            {/* Send A Message Row */}
            <button onClick={() => setShowContactModal(true)} className="w-full border-[1.25px] border-white rounded-[32px] md:rounded-[36px] h-[52px] md:h-[56px] px-5 md:px-6 flex items-center justify-center hover:bg-white/5 transition-colors">
              <span className="text-white/80 text-[13px] md:text-[14px] tracking-[0.01em]">Send A Message</span>
            </button>
          </div>
        </section>

        {/* Spacer after Contact Section */}
        <div className="h-12 md:h-16 lg:h-20 bg-background" />
        
        {/* Individual Testimonial Modal */}
        <Dialog open={showIndividualTestimonialModal} onOpenChange={setShowIndividualTestimonialModal}>
          <DialogContent hideClose className="w-[96%] sm:w-[90%] max-w-4xl min-h-[300px] max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-black/30 border border-white/30 rounded-xl p-8 sm:p-10 md:p-12 flex flex-col items-center justify-center text-center !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 !m-0">
            <button onClick={() => setShowIndividualTestimonialModal(false)} className="absolute top-5 right-5 md:top-6 md:right-6 z-50 opacity-70 hover:opacity-100 transition-opacity">
              <X className="w-6 h-6 text-white" />
            </button>
            <div className="space-y-6 w-full max-w-3xl mx-auto">
              <h3 className="font-unica font-medium text-base md:text-lg text-white">
                {selectedTestimonial?.name}
              </h3>
              <p className="text-white/90" style={{
              fontSize: 'clamp(0.9rem, 1vw, 1rem)',
              lineHeight: 1.6
            }}>
                {selectedTestimonial?.quote}
              </p>
            </div>
          </DialogContent>
        </Dialog>

        <NewsletterModal open={showNewsletterModal} onOpenChange={setShowNewsletterModal} />

        <ClassPlayerModal classId={selectedClassId} open={showClassPlayer} onClose={() => setShowClassPlayer(false)} />

      </main>
      
      <TermsMicrocopy />
      <Footer />
    </div>;
};
export default Index;
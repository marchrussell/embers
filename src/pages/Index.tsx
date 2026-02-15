import heroBreathworkWide from "@/assets/hero-breathwork-wide.png";
import { Footer } from "@/components/Footer";
import { ClassPlayerModal, ContactFormModal, ContactTeamsModal, NewsletterModal, RiseArcIntroModal, SubscriptionModal, TestimonialsModal, VaseBreathModal } from "@/components/modals/LazyModals";
import { NavBar } from "@/components/NavBar";
import { OptimizedImage } from "@/components/OptimizedImage";
import { PhoneMockups } from "@/components/PhoneMockups";
import { TermsMicrocopy } from "@/components/TermsMicrocopy";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Pill } from "@/components/ui/pill";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatEventDate, getNextEventDate } from "@/lib/experienceDateUtils";
import { eventsData } from "@/lib/experiencesData";
import { companyLogos, marchImages, programImages } from "@/lib/sharedAssets";
import { ArrowRight, X } from "lucide-react";
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
          }}>Embers is a place to come back to the body.
Through breath, movement, and sensory practice, it creates space for the nervous system to settle, perception to soften, and experience to open.
</p>

          {/* Hero Pills */}
          <div className="flex flex-wrap gap-2 md:gap-3 mt-5 md:mt-6">
            {["Calm the Nervous System", "Sharpen Attention", "Restore Energy", "Sleep More Deeply"].map((label) => (
              <Pill key={label} variant="dark">{label}</Pill>
            ))}
          </div>
          </div>

        </section>

        {/* Glowing orange divider line after hero */}
        <div className="w-full" style={{
        height: '4px',
        backgroundColor: '#E64C20',
        boxShadow: '0 0 80px rgba(230, 76, 32, 1), 0 0 140px rgba(230, 76, 32, 1), 0 0 200px rgba(230, 76, 32, 0.9)'
      }}></div>

        {/* Glowing orange divider line after Why This Work Matters */}
        <div className="w-full" style={{
        height: '4px',
        backgroundColor: '#E64C20',
        boxShadow: '0 0 80px rgba(230, 76, 32, 1), 0 0 140px rgba(230, 76, 32, 1), 0 0 200px rgba(230, 76, 32, 0.9)'
      }}></div>

        {/* Phone Mockups Section */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-48 lg:pb-32 bg-background">
          <div className="mx-auto px-5 md:px-12 lg:px-20 w-full">
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
            {/* Light pills below mockups */}
            <div className="flex flex-col items-center gap-4 md:gap-5 mt-12 md:mt-16">
              <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                {["Daily resets", "Sleep Stories", "Courses"].map((label) => (
                  <Pill key={label} variant="light">{label}</Pill>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                {["Workshops + Guest Experts", "Live gathering"].map((label) => (
                  <Pill key={label} variant="light">{label}</Pill>
                ))}
              </div>
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

        {/* ========== EXPERIENCES ========== */}
        <section className="pb-16 md:pb-28 lg:pb-48 relative overflow-hidden bg-background">
          <div className="mx-auto px-6 md:px-10 lg:px-12 max-w-[1400px] relative z-10">
            {/* Section Header - Centered */}
            <div className="mb-10 md:mb-14 text-center">
              <h2 className="font-editorial text-white mb-3 leading-[1.15]" style={{
                fontSize: 'clamp(2rem, 3.5vw, 3.5rem)',
                fontWeight: 300
              }}>
                Experiences
              </h2>
              <p className="text-white/65 max-w-lg mx-auto leading-[1.6] px-2 md:px-0" style={{
                fontSize: 'clamp(0.95rem, 1.1vw, 1.1rem)'
              }}>
                Live sessions, workshops, and gatherings — online and in-person
              </p>
            </div>

            {/* Vertical Event Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
              {eventsData
                .filter(event => event.id !== 'breath-presence-inperson' && event.id !== 'breathwork-to-dub')
                .map((event) => {
                const nextDate = getNextEventDate(event.recurrence, event.time);
                const formattedDate = formatEventDate(nextDate, event.time);
                const isOnline = event.format === 'Online' || event.format === 'Studio Membership Only';

                return (
                  <Link
                    key={event.id}
                    to="/experiences"
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

                      {/* Format Badge */}
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-[0.12em] font-medium bg-black/60 backdrop-blur-sm"
                        style={{ color: isOnline ? '#4ade80' : '#D4A574' }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isOnline ? '#4ade80' : '#D4A574' }} />
                        {isOnline ? 'Online' : 'In-Person'}
                      </span>

                      {/* Content overlaid on image bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="font-editorial text-[clamp(1.1rem,1.4vw,1.3rem)] text-white font-light leading-[1.25] mb-2 tracking-[-0.01em]">
                          {event.title}
                        </h3>
                        <p className="text-[12px] text-white/70 leading-[1.5] mb-3 line-clamp-2">
                          {event.subtitle}
                        </p>
                        <p className="text-[11px] text-white/50 font-medium tracking-wide">
                          {event.recurrenceLabel} · {formattedDate}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* View All Experiences CTA */}
            <div className="text-center mt-12">
              <Link
                to="/experiences"
                className="inline-flex items-center gap-2 text-white/80 text-[13px] tracking-wide font-light hover:text-white transition-colors duration-300 min-h-[44px]"
              >
                View All Experiences
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Spacer after Contact Section */}
        <div className="h-12 md:h-16 lg:h-20 bg-background" />
        
        <NewsletterModal open={showNewsletterModal} onOpenChange={setShowNewsletterModal} />

        <ClassPlayerModal classId={selectedClassId} open={showClassPlayer} onClose={() => setShowClassPlayer(false)} />

      </main>
      
      <TermsMicrocopy />
      <Footer />
    </div>;
};
export default Index;
import mLogo from "@/assets/m-logo.png";
import { TestimonialsModal } from "@/components/modals/LazyModals";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { companyLogos } from "@/lib/sharedAssets";
import { getStorageUrl } from "@/lib/supabaseConfig";
import { ArrowRight, Check, ChevronDown, Sparkles, X } from "lucide-react";
import { useState } from "react";

const RiseMethod = () => {
  const calendlyUrl = 'https://calendly.com/march-marchrussell/welcome-call';
  
  // Testimonial states
  const [showTestimonialsModal, setShowTestimonialsModal] = useState(false);
  const [showIndividualTestimonialModal, setShowIndividualTestimonialModal] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<{
    name: string;
    quote: string;
  } | null>(null);
  
  // Accordion state for "How it works" on mobile
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

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
  
  return (
    <div className="min-h-screen bg-march-dark">
      
      {/* HERO - Simple cream background with centered text */}
      <section className="relative w-full overflow-hidden bg-march-bone">
        <div className="relative h-[35vh] md:h-[40vh] lg:h-[45vh] flex items-center justify-center px-6 md:px-12">
          {/* M Logo - top left, black */}
          <img 
            src={mLogo} 
            alt="March" 
            className="absolute top-6 left-6 md:top-8 md:left-8 lg:top-10 lg:left-10 w-8 md:w-10 lg:w-11 h-auto brightness-0"
          />
          
          {/* RISE ARC METHOD - top right */}
          <div className="absolute top-6 right-6 md:top-8 md:right-8 lg:top-10 lg:right-10 flex flex-col items-end">
            <span className="font-sans text-xs md:text-sm tracking-[0.2em] text-march-dark">
              RISE ARC METHOD
            </span>
            <span className="font-handwriting text-base md:text-lg text-march-dark/80 mt-0.5 mr-1">
              with march russell
            </span>
          </div>
          
          {/* Text container - centered, wider */}
          <div className="text-center max-w-5xl mt-16 md:mt-14">
            <h1 
              className="font-sans font-bold text-[clamp(2.2rem,7vw,5rem)] leading-[1.1] text-march-dark"
            >
              Wired. Tired.<br />Overwhelmed. Numb.
            </h1>
            <p 
              className="text-base md:text-xl lg:text-2xl font-medium leading-relaxed text-march-dark/80 mt-5 md:mt-7"
            >
              This isn't who you are — it's how your body adapted to keep you going.
            </p>
            <p 
              className="text-xs md:text-base lg:text-lg font-normal leading-relaxed text-march-dark/70 mt-4 md:mt-5"
            >
              A nervous system–based approach to restore calm, deep sleep, steady energy, and presence — through a structured, supported method — so you can respond instead of react, and feel fully here again.
            </p>
          </div>
        </div>
      </section>


      {/* VIDEO SECTION - Edge-to-edge on mobile */}
      <section className="pt-32 md:pt-36 lg:pt-40 pb-6 md:pb-10 lg:pb-14">
        <div className="mx-auto max-w-[1400px] px-0 md:px-12 lg:px-20">
          <div className="space-y-4 md:space-y-6">
            {/* Orientation text above video */}
            <div className="text-center text-sm md:text-base lg:text-lg text-text-light/80 leading-snug px-6 md:px-2">
              <p className="md:hidden">If you've tried to think or push your way out of exhaustion or overwhelm — but still feel stuck — this will explain why.</p>
              <p className="hidden md:block">If you've tried to think or push your way out of exhaustion or overwhelm — but still feel stuck — this will explain why.</p>
            </div>
            
            {/* Video - edge-to-edge on mobile */}
            <div className="md:mx-auto overflow-hidden md:max-w-5xl shadow-2xl shadow-black/30">
              <video 
                controls 
                preload="metadata"
                className="w-full aspect-video"
                poster=""
              >
                <source 
                  src={getStorageUrl('videos', '21-Dec-2025-1766338084_9165061.mp4')} 
                  type="video/mp4" 
                />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Bigger button, bigger arrow, more breathing room */}
      <section className="bg-march-dark -mt-4 md:-mt-6 pb-4 md:pb-6">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12 lg:px-20 text-center">
          <Button 
            onClick={() => window.open(calendlyUrl, '_blank')} 
            className="w-full sm:w-auto h-[4.5rem] md:h-[5rem] lg:h-[5.5rem] px-10 md:px-12 lg:px-14 text-lg md:text-xl lg:text-2xl font-medium rounded-full bg-transparent border-2 border-white/80 text-text-light hover:bg-white/10 transition-[transform,box-shadow] hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.3),0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4),0_0_60px_rgba(255,255,255,0.2)]"
          >
            Book Your ARC Welcome Call
          </Button>
          
          {/* More breathing room around microcopy */}
          <p className="text-sm md:text-base lg:text-lg text-text-light/70 mt-4 md:mt-5">
            A calm, 30-minute clarity conversation. No pressure. No pitch.
          </p>
        </div>
      </section>

      {/* Trusted By - 4 logos in one row on all devices */}
      <section className="bg-march-dark pt-8 md:pt-12 lg:pt-14 pb-8 md:pb-10 lg:pb-12">
        <div className="mx-auto max-w-4xl px-6 md:px-12 lg:px-20 text-center">
          <p className="text-text-light-muted/50 text-xs tracking-[0.2em] uppercase mb-4 md:mb-5">
            Trusted by individuals and teams at
          </p>
          {/* 4 logos in one row on all devices */}
          <div className="flex flex-nowrap items-center justify-center gap-10 sm:gap-14 md:gap-18 lg:gap-24 xl:gap-28">
            <img src={companyLogos.zoe} alt="ZOE" className="h-5 sm:h-6 md:h-[1.85rem] lg:h-[2.1rem] w-auto object-contain" />
            <img src={companyLogos.tesla} alt="Tesla" className="h-9 sm:h-10 md:h-12 lg:h-14 w-auto object-contain" />
            <img src={companyLogos.google} alt="Google" className="h-6 sm:h-7 md:h-8 lg:h-11 w-auto object-contain" />
            <img src={companyLogos.itv} alt="ITV" className="h-10 sm:h-12 md:h-14 lg:h-20 w-auto object-contain" />
          </div>
        </div>
      </section>

      {/* SECTION 2 — IF THIS IS YOU */}
      <section className="bg-black py-10 md:py-12 lg:py-14">
        <div className="mx-auto max-w-[900px] px-6 md:px-12 lg:px-20">
          
          {/* Cream box container */}
          <div className="relative p-8 md:p-12 lg:p-16 rounded-2xl md:rounded-3xl bg-[#E6DBC7]">
            
            {/* Section header */}
            <div className="relative text-center mb-8 md:mb-10">
              <Sparkles className="w-10 h-10 md:w-14 md:h-14 text-[#FF6B35] mx-auto mb-4 md:mb-6" />
              
              {/* Explanatory text below star */}
              <div className="max-w-xl mx-auto mb-10 md:mb-14 lg:mb-16 space-y-2">
                <p className="text-base md:text-lg lg:text-xl text-march-dark font-medium leading-relaxed">
                  Your body isn't overreacting — it's overprotecting.
                </p>
              </div>
              
              <h2 className="font-editorial italic text-[clamp(1.6rem,4vw,3rem)] text-march-dark leading-tight">
                If This Is You — ARC Can Help
              </h2>
            </div>
            
            {/* Pills layout - 2x2 grid - Black pills with white text */}
            <div className="relative grid grid-cols-2 gap-3 md:gap-5 max-w-2xl mx-auto">
              {[
                "Wired, tense, always 'on'",
                "Exhausted but unable to rest",
                "Racing thoughts you can't switch off",
                "Numb, flat, or not fully here"
              ].map((item, i) => (
                <span 
                  key={i} 
                  className="bg-march-dark text-white px-4 py-3 md:px-8 md:py-4 rounded-full text-sm md:text-base lg:text-lg font-medium text-center animate-fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Arrow connecting sections */}
      <section className="bg-black py-8 md:py-10 lg:py-12">
        <div className="flex flex-col items-center justify-center">
          {/* Custom thin line with arrow */}
          <div className="w-[2px] h-10 md:h-14 lg:h-16 bg-text-light-muted/40" />
          <div className="w-3.5 h-3.5 border-r-2 border-b-2 border-text-light-muted/40 transform rotate-45 -mt-2" />
        </div>
      </section>

      {/* SECTION 5 — FINAL CTA - Clean, no repeat language */}
      <section className="bg-black pt-4 md:pt-6 lg:pt-8 pb-24 md:pb-32 lg:pb-40 xl:pb-48">
        <div className="mx-auto max-w-[1000px] px-6 md:px-12 lg:px-20 text-center">
          
          {/* Header - sans-serif, smaller */}
          <h3 className="font-unica text-[clamp(1.2rem,3vw,2rem)] text-text-light leading-[1.3] mb-5 md:mb-8 tracking-wide">
            The First Step Isn't a Commitment —<br className="hidden md:block" />
            <span className="md:hidden"> It's a Conversation.</span>
            <span className="hidden md:inline">It's a Conversation.</span>
          </h3>
          
          {/* Body - shortened */}
          <p className="text-base md:text-lg lg:text-xl text-text-light/85 mb-6 md:mb-10 max-w-2xl mx-auto leading-relaxed">
            A calm space to understand what you've been carrying, what's been keeping you stuck, and whether ARC is the right next step.
          </p>
          
          {/* CTA - Full width on mobile, bigger */}
          <div className="mb-6 md:mb-12">
            <Button 
              onClick={() => window.open(calendlyUrl, '_blank')} 
              className="w-full sm:w-auto h-[4.5rem] md:h-[5rem] lg:h-[5.5rem] px-10 md:px-12 lg:px-14 text-lg md:text-xl lg:text-2xl font-medium rounded-full bg-transparent border-2 border-white/80 text-text-light hover:bg-white/10 transition-[transform,box-shadow] hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.3),0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4),0_0_60px_rgba(255,255,255,0.2)]"
            >
              Book Your ARC Welcome Call
            </Button>
            
            <p className="text-sm md:text-base text-text-light-muted mt-5 md:mt-8">
              30-minute clarity conversation
            </p>
          </div>
          
          {/* Closing quote - hidden on mobile to reduce scroll */}
          <div className="hidden md:block border-t border-white/10 pt-10 lg:pt-12">
            <p className="font-unica text-base lg:text-lg text-text-light-muted leading-relaxed">
              When your body feels safe, your senses awaken —<br className="hidden lg:block" />
              <span className="md:hidden"> </span>and life becomes something you can finally feel.
            </p>
            <p className="font-handwriting text-base text-text-light-muted mt-4">
              — March
            </p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION - Lead with featured video */}
      <section className="py-12 md:py-16 lg:py-20 xl:py-24 pb-20 md:pb-28 lg:pb-36 xl:pb-44 px-4 md:px-6 bg-[#E6DBC7]">
        <div className="max-w-[1400px] mx-auto">
          {/* Title and subtitle */}
          <div className="px-2 md:px-4 lg:px-6">
            <div className="text-center mb-3 md:mb-4 lg:mb-5">
              <h2 className="font-unica text-[clamp(1.5rem,3.5vw,2.5rem)] text-black leading-tight tracking-wide">
                What People Are Saying
              </h2>
            </div>
            
            <p className="text-center text-black/75 tracking-[0.03em] mb-8 md:mb-10 lg:mb-14 font-unica text-base md:text-lg lg:text-xl leading-relaxed">
              What changes when the nervous system feels safe again?
            </p>
          </div>
          
          {/* Featured testimonial - Alex C. (shortest, most emotionally grounded) */}
          <div className="max-w-2xl mx-auto mb-10 md:mb-14 lg:mb-16">
            <div className="border border-black/20 overflow-hidden">
              <video 
                className="w-full aspect-video"
                src={videoTestimonials[0].videoUrl}
                poster={videoTestimonials[0].posterUrl}
                controls
                playsInline
                preload="metadata"
              />
            </div>
            <div className="text-center mt-4 md:mt-6">
              <p className="font-unica font-medium text-base md:text-lg text-black">
                {videoTestimonials[0].name}
              </p>
            </div>
          </div>
          
          {/* More testimonials - Centered grid */}
          <div className="mt-12 md:mt-16 lg:mt-20 px-4 md:px-8 lg:px-12">
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {videoTestimonials.filter((_, i) => i !== 0).map((testimonial, index) => (
              <Card 
                  key={index} 
                  className="border border-black/20 overflow-hidden flex-shrink-0 w-[280px] md:w-[320px] cursor-pointer bg-[#E6DBC7] rounded-none"
                  onClick={() => {
                    setSelectedTestimonial(testimonial);
                    setShowIndividualTestimonialModal(true);
                  }}
                >
                  <CardContent className="p-0 flex flex-col">
                    <div className="relative pb-[100%] overflow-hidden">
                      <video 
                        className="absolute inset-0 w-full h-full object-cover" 
                        src={testimonial.videoUrl} 
                        poster={testimonial.posterUrl} 
                        controls 
                        playsInline 
                        preload="metadata" 
                        onClick={e => e.stopPropagation()} 
                      />
                    </div>
                    
                    <div className="p-5 md:p-6 flex flex-col">
                      <h3 className="font-unica font-medium text-base text-black mb-2">
                        {testimonial.name}
                      </h3>
                      
                      <p className="text-black/70 line-clamp-2 mb-3 text-sm leading-relaxed">
                        {testimonial.quote}
                      </p>
                      
                      <button className="text-black/60 hover:text-black transition-colors text-left flex items-center gap-3 text-sm">
                        Full testimonial <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* WHAT YOU GET - Collapsible section after testimonials */}
      <section className="bg-black py-12 md:py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-6 md:px-12 lg:px-20">
          <Collapsible>
            <CollapsibleTrigger className="w-full text-center group">
              <p className="text-text-light/70 text-sm md:text-base hover:text-text-light transition-colors inline-flex items-center gap-2">
                If you'd like details about the structure, you'll find them here
                <ChevronDown className="w-5 h-5 md:w-6 md:h-6 group-data-[state=open]:rotate-180 transition-transform" />
              </p>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-8 md:pt-12">
              <div className="rounded-card bg-march-bone p-6 md:p-8 lg:p-10">
                <div className="mb-6 md:mb-8">
                  <h4 className="font-editorial italic text-[clamp(1.25rem,2.5vw,2rem)] text-text-dark leading-tight">
                    Inside the ARC Program
                  </h4>
                </div>
                
                {/* Support & Structure */}
                <div className="mb-6 md:mb-8">
                  <h5 className="text-sm uppercase tracking-widest text-text-dark/60 mb-4 font-medium">
                    Support & Structure
                  </h5>
                  <ul className="space-y-3 md:space-y-4">
                    {[
                      "Weekly ARC sessions (1hr)",
                      "1:1 support with guided integration",
                      "Ongoing WhatsApp support between sessions",
                      "Studio access (daily support, sleep & nervous system resources)"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 md:gap-4 text-base md:text-lg text-text-dark leading-relaxed">
                        <Check className="w-5 h-5 md:w-6 md:h-6 text-text-dark shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Practices & Tools */}
                <div className="pt-6 border-t border-text-dark/15">
                  <h5 className="text-sm uppercase tracking-widest text-text-dark/60 mb-4 font-medium">
                    Practices & Tools
                  </h5>
                  <ul className="space-y-3 md:space-y-4">
                    {[
                      "Nervous system regulation practices",
                      "Functional breathing correction",
                      "Somatic work for real-life stress and burnout",
                      "A core guided programme with theory, reflection & embodied practices",
                      "Tools and practices tailored to where you are and what you need"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 md:gap-4 text-base md:text-lg text-text-dark leading-relaxed">
                        <Check className="w-5 h-5 md:w-6 md:h-6 text-text-dark shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </section>


      <TestimonialsModal open={showTestimonialsModal} onOpenChange={setShowTestimonialsModal} />
      
      {/* Individual Testimonial Modal */}
      <Dialog open={showIndividualTestimonialModal} onOpenChange={setShowIndividualTestimonialModal}>
        <DialogContent hideClose className="w-[96%] sm:w-[90%] max-w-4xl min-h-[300px] max-h-[90vh] overflow-y-auto bg-black border border-white/20 rounded-xl p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col items-center justify-center text-center !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 !m-0">
          <button onClick={() => setShowIndividualTestimonialModal(false)} className="absolute top-4 right-4 md:top-6 md:right-6 z-50 opacity-70 hover:opacity-100 transition-opacity">
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="space-y-4 md:space-y-6 w-full max-w-3xl mx-auto">
            <h3 className="font-unica font-medium text-base md:text-lg text-white">
              {selectedTestimonial?.name}
            </h3>
            <p className="text-white/90 text-sm md:text-base leading-relaxed">
              {selectedTestimonial?.quote}
            </p>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default RiseMethod;

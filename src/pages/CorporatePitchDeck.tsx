import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Mail, Globe, MapPin } from "lucide-react";
import communityHeroKef from "@/assets/community-hero-kef.jpg";
import marchPortrait from "@/assets/march-portrait-casual.jpg";
import teamSessionHands from "@/assets/pitch-deck/team-session-hands.png";
import teamsSessionGroup from "@/assets/teams-session-group.png";
import marchSpeakingOutdoor from "@/assets/march-speaking-outdoor.png";
import teamsSessionWide from "@/assets/teams-session-wide.png";
import slide5WorkshopScene from "@/assets/teams-hero-gathering.jpg";
import studioMatsRoom from "@/assets/pitch-deck/studio-mats-room.jpg";
import slide3DandelionHand from "@/assets/pitch-deck/slide-3-dandelion-hand.jpg";
import teamsTestimonial1 from "@/assets/testimonials/teams-testimonial-1.png";
import teamsTestimonial2 from "@/assets/testimonials/teams-testimonial-2.png";
import teamsTestimonial3 from "@/assets/testimonials/teams-testimonial-3.png";
import teamsTestimonial4 from "@/assets/testimonials/teams-testimonial-4.png";
import teamsTestimonial5 from "@/assets/testimonials/teams-testimonial-5.png";
import teamsTestimonial6 from "@/assets/testimonials/teams-testimonial-6.png";
import { companyLogos } from "@/lib/sharedAssets";
import { ContactTeamsModal } from "@/components/ContactTeamsModal";

const CorporatePitchDeck = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const totalSlides = 4;

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <div className="flex justify-between items-center p-6 lg:p-8 relative z-50">
          <button
            onClick={prevSlide}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
          >
            <ChevronLeft className="w-5 h-5 text-white/70" />
          </button>
          
          <span className="text-white uppercase tracking-[0.15em] text-center" style={{
            fontSize: 'clamp(0.75rem, 0.9vw, 0.85rem)'
          }}>
            {currentSlide === 1 && "What Teams Say"}
            {currentSlide === 2 && "Ways to Work Together"}
            {currentSlide === 3 && "Getting Started"}
          </span>
          
          <button
            onClick={nextSlide}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
          >
            <ChevronRight className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Slide content area */}
        <div className="flex-1 flex items-center justify-center px-8 md:px-16 lg:px-24 pb-20">
          <div className="w-full max-w-5xl mx-auto">
            
            {/* Slide 1: Title */}
            {currentSlide === 0 && (
              <div className="fixed inset-0 z-0">
                <img 
                  src={communityHeroKef} 
                  alt="March Russell meditation" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/5" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                  {/* Main headline - dominant */}
                  <h1 className="font-editorial text-[clamp(2.2rem,4.5vw,4rem)] text-white leading-[1.1] mb-8 max-w-5xl drop-shadow-lg">
                    Nervous System–Based Support for Teams Under Real Work Pressure
                  </h1>
                  
                  {/* ARC method line - quiet authority */}
                  <p className="font-unica text-[clamp(0.7rem,0.9vw,0.85rem)] text-white/70 tracking-[0.12em] uppercase drop-shadow-md mb-6">
                    Delivered Through the ARC Method (Autonomy, Regulation, Connection)
                  </p>
                  
                  {/* Outcome sentence - demoted, softer */}
                  <p className="font-unica text-[clamp(0.9rem,1.1vw,1rem)] text-white/60 max-w-lg leading-[1.8] drop-shadow-md mb-12">
                    Supporting calm decision-making, clearer communication, and steadier performance — even when things are busy or uncertain.
                  </p>
                  
                  {/* Logo footer - proportional sizing and spacing */}
                  <div className="absolute bottom-16 left-0 right-0 flex flex-col items-center px-8">
                    <div className="flex flex-nowrap items-center justify-center w-full max-w-5xl" style={{ gap: 'clamp(2rem, 8vw, 10rem)' }}>
                      <img src={companyLogos.zoe} alt="ZOE" className="w-auto object-contain opacity-70" style={{ height: 'clamp(1.5rem, 2vw, 2.25rem)' }} />
                      <img src={companyLogos.tesla} alt="Tesla" className="w-auto object-contain opacity-65" style={{ height: 'clamp(2rem, 2.8vw, 3rem)' }} />
                      <img src={companyLogos.itv} alt="ITV" className="w-auto object-contain opacity-70" style={{ height: 'clamp(2.5rem, 4vw, 5rem)' }} />
                      <img src={companyLogos.justeat} alt="Just Eat" className="w-auto object-contain opacity-70" style={{ height: 'clamp(5rem, 8vw, 9rem)' }} />
                      <img src={companyLogos.google} alt="Google" className="w-auto object-contain opacity-65" style={{ height: 'clamp(1.5rem, 2.4vw, 2.75rem)' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Slide 2: What Teams Say */}
            {currentSlide === 1 && (
              <div className="fixed inset-0 z-0 bg-black overflow-y-auto">
                <div className="min-h-screen px-8 md:px-16 lg:px-24 flex flex-col justify-center" style={{ transform: 'scale(0.93)', transformOrigin: 'center center' }}>
                  
                  {/* Video + Written Testimonials Side by Side */}
                  <div className="flex flex-col lg:flex-row lg:items-stretch gap-8 lg:gap-10 max-w-[1400px] mx-auto">
                    {/* Video Testimonial - Left Side - fixed size container */}
                    <div className="lg:w-[390px] lg:h-[520px] shrink-0 overflow-hidden shadow-md bg-black border border-white/30">
                      <video
                        controls
                        controlsList="nofullscreen nodownload"
                        disablePictureInPicture
                        poster="/videos/shay-obrien-poster.jpg"
                        className="w-full h-full object-cover"
                        preload="metadata"
                        playsInline
                        style={{ width: '390px', height: '520px', objectFit: 'cover' }}
                      >
                        <source src="/videos/shay-obrien-testimonial.mp4" type="video/mp4" />
                      </video>
                    </div>
                    
                    {/* Testimonial Screenshot Grid - Right Side */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-7 items-stretch">
                      {[teamsTestimonial1, teamsTestimonial2, teamsTestimonial3, teamsTestimonial4, teamsTestimonial5, teamsTestimonial6].map((testimonialImg, idx) => (
                        <div key={idx} className="overflow-hidden shadow-md bg-white border border-white/30">
                          <img src={testimonialImg} alt={`Team testimonial ${idx + 1}`} className="w-full h-auto object-contain" loading="lazy" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Slide 3: Ways to Work Together - Single Overview Page */}
            {currentSlide === 2 && (
              <div className="fixed inset-0 z-0 bg-black overflow-y-auto">
                <div className="min-h-screen px-6 md:px-12 lg:px-16 pt-[100px] pb-16">
                  {/* Guidance text */}
                  <div className="max-w-[1400px] mx-auto mb-12 text-center">
                    <p className="font-unica text-[clamp(0.9rem,1.1vw,1rem)] text-white/60">
                      Most teams begin with a Custom Workshop or 3 months of Monthly Support.
                    </p>
                  </div>
                  
                  {/* Three columns - equal height cards */}
                  <div className="max-w-[1400px] mx-auto grid lg:grid-cols-3 gap-8 lg:gap-10">
                    
                    {/* Column 1: Custom Workshops */}
                    <div className="border border-white/20 p-6 lg:p-8 flex flex-col h-full">
                      {/* Title + Subtitle */}
                      <div className="mb-5">
                        <span className="font-unica text-[0.75rem] uppercase tracking-[0.2em] text-[#E6DBC7]/70">01.</span>
                        <h2 className="font-editorial text-[clamp(1.4rem,1.8vw,1.6rem)] text-white mt-2 mb-2">
                          Custom Workshops
                        </h2>
                        <p className="font-unica text-[clamp(0.85rem,0.95vw,0.9rem)] text-white/70 leading-relaxed">
                          Targeted, in-the-moment nervous system support
                        </p>
                      </div>
                      
                      {/* Main content - grows to fill space */}
                      <div className="flex-1 space-y-6">
                        {/* Best For */}
                        <div>
                          <h3 className="font-unica text-[0.65rem] uppercase tracking-[0.2em] text-[#E6DBC7]/70 mb-2">Best For</h3>
                          <ul className="space-y-1 leading-relaxed">
                            <li className="font-unica text-[clamp(0.8rem,0.9vw,0.85rem)] text-white">Team offsites & leadership days</li>
                            <li className="font-unica text-[clamp(0.8rem,0.9vw,0.85rem)] text-white">Moments of high stress or change</li>
                          </ul>
                        </div>
                        
                        {/* Format */}
                        <div>
                          <h3 className="font-unica text-[0.65rem] uppercase tracking-[0.2em] text-[#E6DBC7]/70 mb-2">Format</h3>
                          <ul className="space-y-1 leading-relaxed">
                            <li className="font-unica text-[clamp(0.8rem,0.9vw,0.85rem)] text-white">30-minute ARC Reset — £450</li>
                            <li className="font-unica text-[clamp(0.8rem,0.9vw,0.85rem)] text-white">60-minute ARC Workshop — £750</li>
                            <li className="font-unica text-[clamp(0.8rem,0.9vw,0.85rem)] text-white">Online or in person</li>
                          </ul>
                        </div>
                        
                        {/* Includes */}
                        <div>
                          <h3 className="font-unica text-[0.65rem] uppercase tracking-[0.2em] text-[#E6DBC7]/70 mb-2">Includes</h3>
                          <ul className="space-y-1 leading-relaxed">
                            <li className="font-unica text-[clamp(0.8rem,0.9vw,0.85rem)] text-white">Live guided regulation & breathwork</li>
                            <li className="font-unica text-[clamp(0.8rem,0.9vw,0.85rem)] text-white">Practical tools for immediate use</li>
                          </ul>
                        </div>
                      </div>
                      
                      {/* Investment - fixed position */}
                      <div className="mt-auto pt-6">
                        <h3 className="font-unica text-[0.65rem] uppercase tracking-[0.2em] text-[#E6DBC7]/70 mb-2">Investment</h3>
                        <p className="font-unica text-[clamp(0.95rem,1.1vw,1rem)] text-white font-medium">£450–£750 per session</p>
                      </div>
                      
                      {/* Footer */}
                      <div className="mt-6 pt-4 border-t border-white/10">
                        <p className="font-unica text-[clamp(0.85rem,0.95vw,0.9rem)] text-white/70 leading-relaxed">
                          Best as a first session or one-off intervention.
                        </p>
                      </div>
                    </div>
                    
                    {/* Column 2: Monthly Support */}
                    <div className="border border-white/20 p-6 lg:p-8 flex flex-col h-full">
                      {/* Title + Subtitle */}
                      <div className="mb-5">
                        <span className="font-unica text-[0.75rem] uppercase tracking-[0.2em] text-[#E6DBC7]/70">02.</span>
                        <h2 className="font-editorial text-[clamp(1.4rem,1.8vw,1.6rem)] text-white mt-2 mb-2">
                          Monthly Support
                        </h2>
                        <p className="font-unica text-[clamp(0.85rem,0.95vw,0.9rem)] text-white/70 leading-relaxed">
                          Consistent support that builds regulation over time
                        </p>
                        <p className="font-unica text-[clamp(0.8rem,0.9vw,0.85rem)] text-white/60 leading-relaxed mt-2">
                          Designed to reduce reactivity, improve communication, and support teams as pressures continue — not just when something breaks.
                        </p>
                      </div>
                      
                      {/* Main content - grows to fill space */}
                      <div className="flex-1 space-y-6">
                        {/* Best For */}
                        <div>
                          <h3 className="font-unica text-[0.65rem] uppercase tracking-[0.2em] text-[#E6DBC7]/70 mb-2">Best For</h3>
                          <ul className="space-y-1 leading-relaxed">
                            <li className="font-unica text-[clamp(0.8rem,0.9vw,0.85rem)] text-white">Teams wanting ongoing support</li>
                            <li className="font-unica text-[clamp(0.8rem,0.9vw,0.85rem)] text-white">Building long-term regulation habits</li>
                          </ul>
                        </div>
                        
                        {/* Format */}
                        <div>
                          <h3 className="font-unica text-[0.65rem] uppercase tracking-[0.2em] text-[#E6DBC7]/70 mb-2">Format</h3>
                          <ul className="space-y-1 leading-relaxed">
                            <li className="font-unica text-[clamp(0.8rem,0.9vw,0.85rem)] text-white">1 × 45-min live session per month</li>
                            <li className="font-unica text-[clamp(0.8rem,0.9vw,0.85rem)] text-white">Up to 30 people, 3-month minimum</li>
                          </ul>
                        </div>
                        
                        {/* Includes */}
                        <div>
                          <h3 className="font-unica text-[0.65rem] uppercase tracking-[0.2em] text-[#E6DBC7]/70 mb-2">Includes</h3>
                          <ul className="space-y-1 leading-relaxed">
                            <li className="font-unica text-[clamp(0.8rem,0.9vw,0.85rem)] text-white">Studio membership for participants</li>
                            <li className="font-unica text-[clamp(0.8rem,0.9vw,0.85rem)] text-white">Online or in person delivery</li>
                          </ul>
                        </div>
                      </div>
                      
                      {/* Investment - fixed position */}
                      <div className="mt-auto pt-6">
                        <h3 className="font-unica text-[0.65rem] uppercase tracking-[0.2em] text-[#E6DBC7]/70 mb-2">Investment</h3>
                        <p className="font-unica text-[clamp(0.95rem,1.1vw,1rem)] text-white font-medium">£950 per month</p>
                      </div>
                      
                      {/* Footer */}
                      <div className="mt-6 pt-4 border-t border-white/10">
                        <p className="font-unica text-[clamp(0.85rem,0.95vw,0.9rem)] text-white/70 leading-relaxed mb-2">
                          Ideal for continuity without a full programme.
                        </p>
                        <p className="font-editorial italic text-[clamp(0.8rem,0.9vw,0.85rem)] text-white/50 leading-relaxed">
                          Ongoing regulation costs less than recovery from burnout.
                        </p>
                      </div>
                    </div>
                    
                    {/* Column 3: ARC Workplace Foundations */}
                    <div className="border border-white/20 p-6 lg:p-8 flex flex-col h-full">
                      {/* Title + Subtitle */}
                      <div className="mb-5">
                        <span className="font-unica text-[0.75rem] uppercase tracking-[0.2em] text-[#E6DBC7]/70">03.</span>
                        <h2 className="font-editorial text-[clamp(1.4rem,1.8vw,1.6rem)] text-white mt-2 mb-2">
                          ARC Foundations (8 Weeks)
                        </h2>
                        <p className="font-unica text-[clamp(0.85rem,0.95vw,0.9rem)] text-white/70 leading-relaxed">
                          A structured nervous system programme for teams
                        </p>
                      </div>
                      
                      {/* Main content - grows to fill space */}
                      <div className="flex-1 space-y-6">
                        {/* Best For */}
                        <div>
                          <h3 className="font-unica text-[0.65rem] uppercase tracking-[0.2em] text-[#E6DBC7]/70 mb-2">Best For</h3>
                          <ul className="space-y-1 leading-relaxed">
                            <li className="font-unica text-[clamp(0.8rem,0.9vw,0.85rem)] text-white">Teams ready for deeper transformation</li>
                            <li className="font-unica text-[clamp(0.8rem,0.9vw,0.85rem)] text-white">Sustainable behaviour change</li>
                          </ul>
                        </div>
                        
                        {/* Format */}
                        <div>
                          <h3 className="font-unica text-[0.65rem] uppercase tracking-[0.2em] text-[#E6DBC7]/70 mb-2">Format</h3>
                          <ul className="space-y-1 leading-relaxed">
                            <li className="font-unica text-[clamp(0.8rem,0.9vw,0.85rem)] text-white">8 weekly 60-min sessions</li>
                            <li className="font-unica text-[clamp(0.8rem,0.9vw,0.85rem)] text-white">Up to 15 per cohort, online or in person</li>
                          </ul>
                        </div>
                        
                        {/* Focus */}
                        <div>
                          <h3 className="font-unica text-[0.65rem] uppercase tracking-[0.2em] text-[#E6DBC7]/70 mb-2">Focus</h3>
                          <ul className="space-y-1 leading-relaxed">
                            <li className="font-unica text-[clamp(0.8rem,0.9vw,0.85rem)] text-white">Stress & emotional regulation</li>
                            <li className="font-unica text-[clamp(0.8rem,0.9vw,0.85rem)] text-white">Burnout prevention & presence</li>
                          </ul>
                        </div>
                      </div>
                      
                      {/* Investment - fixed position */}
                      <div className="mt-auto pt-6">
                        <h3 className="font-unica text-[0.65rem] uppercase tracking-[0.2em] text-[#E6DBC7]/70 mb-2">Investment</h3>
                        <p className="font-unica text-[clamp(0.95rem,1.1vw,1rem)] text-white font-medium">£4,500 per cohort</p>
                      </div>
                      
                      {/* Footer */}
                      <div className="mt-6 pt-4 border-t border-white/10">
                        <p className="font-unica text-[clamp(0.85rem,0.95vw,0.9rem)] text-white/70 leading-relaxed">
                          Capped for safety, depth, and real change.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>
            )}

            {/* Slide 4: Getting Started + Contact (merged) */}
            {currentSlide === 3 && (
              <div className="fixed inset-0 z-0 flex bg-black">
                {/* Centered container with joined box and image */}
                <div className="w-full h-full flex items-center justify-center px-8 lg:px-12">
                  <div className="flex h-[85vh] max-h-[750px]">
                    
                    {/* Left side - Content in bordered box */}
                    <div className="border border-white/30 border-r-0 p-8 lg:p-10 xl:p-12 flex flex-col justify-center w-[420px] lg:w-[480px] xl:w-[520px]">
                      {/* Getting Started content */}
                      <div className="space-y-6 max-w-md">
                        <div className="space-y-6 leading-relaxed">
                          <p className="font-unica text-[clamp(0.85rem,1vw,0.95rem)] text-white/80 leading-[1.7]">
                            This is an informal conversation (around 20 minutes) to explore:
                          </p>
                          
                          <ul className="space-y-4 pl-4">
                            <li className="font-unica text-[clamp(0.85rem,1vw,0.95rem)] text-white leading-[1.7] flex items-start gap-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-white mt-2.5 flex-shrink-0" />
                              Where stress and pressure are showing up
                            </li>
                            <li className="font-unica text-[clamp(0.85rem,1vw,0.95rem)] text-white leading-[1.7] flex items-start gap-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-white mt-2.5 flex-shrink-0" />
                              How communication changes under load
                            </li>
                            <li className="font-unica text-[clamp(0.85rem,1vw,0.95rem)] text-white leading-[1.7] flex items-start gap-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-white mt-2.5 flex-shrink-0" />
                              Where regulation and presence may be slipping
                            </li>
                          </ul>
                          
                          <p className="font-unica text-[clamp(0.9rem,1.1vw,1rem)] text-white leading-[1.7]">
                            From there, I'll recommend the most appropriate next step — whether that's a one-off session, ongoing support, or simply some clarity.
                          </p>
                          
                          <p className="font-unica text-[clamp(0.85rem,1vw,0.95rem)] text-white/80 leading-[1.7]">
                            If it's helpful, you're welcome to reach out by email to arrange a time.
                          </p>
                        </div>
                        
                        {/* Contact info */}
                        <div className="pt-8 space-y-3">
                          <div className="flex flex-col gap-1">
                            <a 
                              href="mailto:march@marchrussell.com"
                              className="font-unica text-[clamp(0.8rem,0.9vw,0.85rem)] text-white hover:text-white/70 transition-colors"
                            >
                              march@marchrussell.com
                            </a>
                            <a 
                              href="https://marchrussell.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-unica text-[clamp(0.8rem,0.9vw,0.85rem)] text-white hover:text-white/70 transition-colors"
                            >
                              marchrussell.com
                            </a>
                            <p className="font-unica text-[clamp(0.75rem,0.85vw,0.8rem)] text-white/70">
                              London & International
                            </p>
                          </div>
                          
                          {/* CTA */}
                          <div className="pt-6 mt-4 border-t border-white/20">
                            <button 
                              onClick={() => setIsContactModalOpen(true)}
                              className="inline-block font-unica text-[clamp(0.9rem,1.1vw,1rem)] text-white font-medium hover:text-white/80 transition-colors mb-3 text-left"
                            >
                              Book a Discovery Conversation →
                            </button>
                            <p className="font-unica text-[clamp(0.75rem,0.85vw,0.8rem)] text-white/60 leading-[1.7]">
                              A short, informal conversation to explore your team's needs and whether this support is a good fit. No obligation — just clarity.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right side - Image with matching border */}
                    <div className="border border-white/30 border-l-0 h-full w-[400px] lg:w-[450px] xl:w-[500px] overflow-hidden">
                      <img
                        src={marchPortrait} 
                        alt="March Russell" 
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Slide indicators */}
        <div className="flex justify-center gap-2 pb-8 relative z-50">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentSlide 
                  ? 'bg-[#E6DBC7] w-6' 
                  : 'bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Contact Teams Modal */}
      <ContactTeamsModal 
        open={isContactModalOpen} 
        onOpenChange={setIsContactModalOpen} 
      />
    </div>
  );
};

export default CorporatePitchDeck;

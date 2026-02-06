import { FeedbackSection } from "@/components/FeedbackSection";
import { Footer } from "@/components/Footer";
import { PrivacyModal, TermsModal } from "@/components/LegalModals";
import { NavBar } from "@/components/NavBar";
import { OptimizedImage } from "@/components/OptimizedImage";
import { marchImages } from "@/lib/sharedAssets";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const About = () => {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      
      <main className="flex-1 pt-36 md:pt-24 pb-16 md:pb-24">
        {/* Hero Section - Full width on desktop */}
        <div className="px-6 md:px-10 lg:px-16 xl:px-24 max-w-[1600px] mx-auto">
          {/* Header row with Welcome and Back button */}
          <div className="mt-20 flex items-center justify-between mb-12">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-editorial text-[#E6DBC7]">Welcome</h1>
            <Link
              to="/studio"
              className="inline-flex items-center gap-2 text-[#E6DBC7]/70 hover:text-[#E6DBC7] transition-colors text-sm md:text-base tracking-wide shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Studio</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
          
          {/* Desktop: Side-by-side hero layout */}
          <div className="mb-20 md:mb-32">
            {/* Mobile: Stacked layout */}
            <div className="md:hidden">
              <div className="flex flex-col gap-0 items-stretch mb-6">
                <OptimizedImage 
                  src={marchImages.bio} 
                  alt="March Russell - Breathwork Facilitator"
                  className="w-full h-auto object-cover rounded-t-lg"
                />
                <div 
                  className="flex-1 relative rounded-b-lg overflow-hidden"
                  style={{
                    backgroundImage: `url(${marchImages.bio})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="absolute inset-0 backdrop-blur-2xl bg-black/60" />
                  <div className="relative z-10 p-6 space-y-3 text-foreground/90 leading-relaxed text-base">
                    <p>Hey, welcome to this space.</p>
                    <p>Everything we seek already lives within us. This studio is an invitation to experience that for yourself.</p>
                    <p>Here, we'll explore how to care for our inner world, not by forcing change, but by meeting ourselves with warmth, understanding, presence, and connection.</p>
                    <p>Try letting go of the word "heal." Nothing here needs fixing. Every feeling, every pattern, every reaction is a signal - your body's way of communicating. I hope these practices help you listen, understand, and return to a sense of wholeness.</p>
                    <p>I'm right here with you. Reach out anytime with questions, reflections, or requests. Like you, I'm learning too - a curious explorer.</p>
                    <p className="text-foreground/80 mt-6">Thank you for giving yourself this space, and for being here on this journey with me.</p>
                    <p className="text-foreground/80">Big love,</p>
                    <p className="text-foreground/80">March x</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop: Two-column hero */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
              {/* Image column */}
              <div className="lg:col-span-2">
                <OptimizedImage 
                  src={marchImages.bio} 
                  alt="March Russell - Breathwork Facilitator"
                  className="w-full h-auto object-cover rounded-xl shadow-2xl"
                />
              </div>
              
              {/* Text column */}
              <div className="lg:col-span-3 space-y-6 text-foreground/90 leading-relaxed text-lg lg:text-xl">
                <p className="text-2xl lg:text-3xl font-light text-[#E6DBC7]">
                  Hey, welcome to this space.
                </p>
                <p>
                  Everything we seek already lives within us. This studio is an invitation to experience that for yourself.
                </p>
                <p>
                  Here, we'll explore how to care for our inner world, not by forcing change, but by meeting ourselves with warmth, understanding, presence, and connection.
                </p>
                <p>
                  Try letting go of the word "heal." Nothing here needs fixing. Every feeling, every pattern, every reaction is a signal - your body's way of communicating. I hope these practices help you listen, understand, and return to a sense of wholeness.
                </p>
                <p>
                  I'm right here with you. Reach out anytime with questions, reflections, or requests. Like you, I'm learning too - a curious explorer.
                </p>
                <div className="pt-4 space-y-2 text-foreground/70">
                  <p>Thank you for giving yourself this space, and for being here on this journey with me.</p>
                  <p>Big love,</p>
                  <p className="font-editorial text-[#E6DBC7] text-xl">March x</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="px-6 md:px-10 lg:px-16 xl:px-24 max-w-[1600px] mx-auto">
          {/* Desktop: Two-column grid for main sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 lg:gap-20 mb-16 md:mb-32">
            {/* Breathwork Safety Section */}
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-editorial text-[#E6DBC7] mb-6 md:mb-8">
                Breathwork Safety
              </h2>
              
              <div className="space-y-4 md:space-y-5 text-foreground/90 leading-relaxed text-base md:text-lg">
                <p>
                  The breathing classes and techniques in this app are not suitable for everyone. We're all unique, with different nervous systems, health histories, and needs — so please take things at your own pace.
                </p>
                <p>
                  Before diving in, read through the session descriptions carefully and familiarize yourself with the Safety Disclosure below. If you're unsure whether breathwork is right for you, please reach out to your doctor or healthcare provider.
                </p>
                <p>
                  And of course, I'm always here if you want to drop me a message with any questions or concerns. Your safety and wellbeing come first.
                </p>
                <p className="pt-2">
                  <strong className="text-[#E6DBC7]">Please read the full Safety Disclosure:</strong>
                </p>
                <Link 
                  to="/safety-disclosure" 
                  className="inline-block text-sm text-[#E6DBC7] hover:text-[#E6DBC7]/80 transition-colors underline"
                >
                  View Safety Disclosure
                </Link>
              </div>
            </div>

            {/* About the App Section */}
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-editorial text-[#E6DBC7] mb-6 md:mb-8">
                About the App
              </h2>
              
              <div className="space-y-4 md:space-y-5 text-foreground/90 leading-relaxed text-base md:text-lg">
                <p>
                  This app is designed to make transformative breathwork practices accessible whenever and wherever you need them. Whether you're looking to calm anxiety, improve sleep, boost energy, or access deeper states of awareness, we've curated a collection of guided sessions to support your journey.
                </p>
                <p>
                  We upload new sessions monthly, so there's always something fresh to explore and deepen your practice with.
                </p>
              </div>
            </div>
          </div>

          {/* Additional sections in a narrower container */}
          <div className="max-w-4xl mx-auto lg:mx-0 lg:max-w-none">
            {/* Desktop: Three-column grid for feature sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 lg:gap-16 mb-16 md:mb-32">
              <div>
                <h3 className="text-xl md:text-2xl font-editorial text-[#E6DBC7] mb-4 md:mb-5">
                  How It Works
                </h3>
                <div className="space-y-4 text-foreground/90 leading-relaxed text-base md:text-lg">
                  <p>
                    Each session is carefully crafted to guide you through specific breathing techniques that work with your nervous system. From quick 3-minute resets to deeper 60-minute journeys, you'll find practices for every moment of your day.
                  </p>
                  <p>
                    Browse by category to find what you need right now - whether that's calming your mind, preparing for sleep, energizing your body, or processing emotions.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl md:text-2xl font-editorial text-[#E6DBC7] mb-4 md:mb-5">
                  Music & Sound
                </h3>
                <p className="text-foreground/90 leading-relaxed text-base md:text-lg">
                  Music is a passion of mine and I believe it's such a powerful tool for breathwork sessions. We work closely with music producers to create bespoke music specifically designed for each session, enhancing your journey and deepening the experience.
                </p>
              </div>

              <div>
                <h3 className="text-xl md:text-2xl font-editorial text-[#E6DBC7] mb-4 md:mb-5">
                  Your Journey
                </h3>
                <div className="space-y-4 text-foreground/90 leading-relaxed text-base md:text-lg">
                  <p>
                    Start with whatever calls you. There's no wrong way to begin. Some people prefer to follow a structured program, while others choose sessions intuitively based on how they're feeling in the moment.
                  </p>
                  <p>
                    Take your time with each session. Each one builds on the last, and your only job is to keep showing up with curiosity.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact section */}
            <div className="pt-8 md:pt-10 border-t border-muted-foreground/20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
                <div className="space-y-4">
                  <p className="text-foreground/70 text-base md:text-lg">
                    For any questions or support, please reach out through the contact form on our main website or reach out to March on{" "}
                    <a
                      href="mailto:march@marchrussell.com"
                      className="text-[#E6DBC7] hover:text-[#E6DBC7]/80 transition-colors underline"
                    >
                      march@marchrussell.com
                    </a>.
                  </p>
                </div>

                <div className="lg:justify-self-end">
                  <FeedbackSection />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <TermsModal open={showTerms} onOpenChange={setShowTerms} />
      <PrivacyModal open={showPrivacy} onOpenChange={setShowPrivacy} />
    </div>
  );
};

export default About;

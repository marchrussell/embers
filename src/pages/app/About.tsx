import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { FeedbackSection } from "@/components/FeedbackSection";
import { Footer } from "@/components/Footer";
import { PrivacyModal, TermsModal } from "@/components/LegalModals";
import { NavBar } from "@/components/NavBar";
import { OptimizedImage } from "@/components/OptimizedImage";
import { CLOUD_IMAGES, getCloudImageUrl } from "@/lib/cloudImageUrls";

const marchBioPhoto = getCloudImageUrl(CLOUD_IMAGES.march);

const About = () => {
  const navigate = useNavigate();
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NavBar />

      <main className="flex-1 pb-16 pt-36 md:pb-24 md:pt-24">
        {/* Hero Section - Full width on desktop */}
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 lg:px-16 xl:px-24">
          {/* Header row with Welcome and Back button */}
          <div className="mb-12 mt-20 flex items-center justify-between">
            <h1 className="font-editorial text-3xl text-[#E6DBC7] md:text-5xl lg:text-6xl">
              Welcome
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex shrink-0 items-center gap-2 text-sm tracking-wide text-[#E6DBC7]/70 transition-colors hover:text-[#E6DBC7] md:text-base"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>
          </div>

          {/* Desktop: Side-by-side hero layout */}
          <div className="mb-20 md:mb-32">
            {/* Mobile: Stacked layout */}
            <div className="md:hidden">
              <div className="mb-6 flex flex-col items-stretch gap-0">
                <OptimizedImage
                  src={marchBioPhoto}
                  alt="March Russell - Breathwork Facilitator"
                  className="h-auto w-full rounded-t-lg object-cover"
                />
                <div
                  className="relative flex-1 overflow-hidden rounded-b-lg"
                  style={{
                    backgroundImage: `url(${marchBioPhoto})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl" />
                  <div className="relative z-10 space-y-3 p-6 text-base leading-relaxed text-foreground/90">
                    <p className="font-editorial text-lg text-[#E6DBC7]">Hey, welcome to this space.</p>
                    <p>
                      Everything we seek already lives within us. This studio is an invitation to
                      experience that for yourself.
                    </p>
                    <p>
                      Here, we'll explore how to care for our inner world, not by forcing change,
                      but by meeting ourselves with warmth, understanding, presence, and connection.
                    </p>
                    <p>
                      Try letting go of the word "heal." Nothing here needs fixing. Every feeling,
                      every pattern, every reaction is a signal - your body's way of communicating.
                      I hope these practices help you listen, understand, and return to a sense of
                      wholeness.
                    </p>
                    <p>
                      I'm right here with you. Reach out anytime with questions, reflections, or
                      requests. Like you, I'm learning too - a curious explorer.
                    </p>
                    <p className="mt-6 text-foreground/70">
                      Thank you for giving yourself this space, and for being here on this journey
                      with me.
                    </p>
                    <p className="text-foreground/70">Big love,</p>
                    <p className="font-editorial text-lg text-[#E6DBC7]">March x</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop: Two-column hero */}
            <div className="hidden items-start gap-8 md:grid md:grid-cols-2 lg:grid-cols-5 lg:gap-12">
              {/* Image column */}
              <div className="lg:col-span-2">
                <OptimizedImage
                  src={marchBioPhoto}
                  alt="March Russell - Breathwork Facilitator"
                  className="h-auto w-full rounded-xl object-cover shadow-2xl"
                />
              </div>

              {/* Text column */}
              <div className="space-y-6 text-lg leading-relaxed text-foreground/90 lg:col-span-3 lg:text-xl">
                <p className="font-editorial text-2xl text-[#E6DBC7] lg:text-3xl">
                  Hey, welcome to this space.
                </p>
                <p>
                  Everything we seek already lives within us. This studio is an invitation to
                  experience that for yourself.
                </p>
                <p>
                  Here, we'll explore how to care for our inner world, not by forcing change, but by
                  meeting ourselves with warmth, understanding, presence, and connection.
                </p>
                <p>
                  Try letting go of the word "heal." Nothing here needs fixing. Every feeling, every
                  pattern, every reaction is a signal - your body's way of communicating. I hope
                  these practices help you listen, understand, and return to a sense of wholeness.
                </p>
                <p>
                  I'm right here with you. Reach out anytime with questions, reflections, or
                  requests. Like you, I'm learning too - a curious explorer.
                </p>
                <div className="space-y-2 pt-4 text-foreground/70">
                  <p>
                    Thank you for giving yourself this space, and for being here on this journey
                    with me.
                  </p>
                  <p>Big love,</p>
                  <p className="font-editorial text-xl text-[#E6DBC7]">March x</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 lg:px-16 xl:px-24">
          {/* All content sections stacked with dividers */}
          <div className="mb-16 md:mb-32">
            {/* Breathwork Safety Section */}
            <div className="border-t border-muted-foreground/20 py-10 md:py-14">
              <h2 className="mb-6 font-editorial text-2xl text-[#E6DBC7] md:mb-8 md:text-3xl">
                Breathwork Safety
              </h2>
              <div className="space-y-4 text-base leading-relaxed text-foreground/90 md:space-y-5 md:text-lg">
                <p>
                  The breathing classes and techniques in this app are not suitable for everyone.
                  We're all unique, with different nervous systems, health histories, and needs — so
                  please take things at your own pace.
                </p>
                <p>
                  Before diving in, read through the session descriptions carefully and familiarize
                  yourself with the Safety Disclosure below. If you're unsure whether breathwork is
                  right for you, please reach out to your doctor or healthcare provider.
                </p>
                <p>
                  And of course, I'm always here if you want to drop me a message with any questions
                  or concerns. Your safety and wellbeing come first.
                </p>
                <p className="pt-2">
                  <strong className="text-[#E6DBC7]">
                    Please read the full Safety Disclosure:
                  </strong>
                </p>
                <Link
                  to="/safety-disclosure"
                  className="inline-block text-sm text-[#E6DBC7] underline transition-colors hover:text-[#E6DBC7]/80"
                >
                  View Safety Disclosure
                </Link>
              </div>
            </div>

            {/* About the App Section */}
            <div className="border-t border-muted-foreground/20 py-10 md:py-14">
              <h2 className="mb-6 font-editorial text-2xl text-[#E6DBC7] md:mb-8 md:text-3xl">
                About the App
              </h2>
              <div className="space-y-4 text-base leading-relaxed text-foreground/90 md:space-y-5 md:text-lg">
                <p>
                  This app is designed to make transformative breathwork practices accessible
                  whenever and wherever you need them. Whether you're looking to calm anxiety,
                  improve sleep, boost energy, or access deeper states of awareness, we've curated a
                  collection of guided sessions to support your journey.
                </p>
                <p>
                  We upload new sessions monthly, so there's always something fresh to explore and
                  deepen your practice with.
                </p>
              </div>
            </div>

            {/* How It Works Section */}
            <div className="border-t border-muted-foreground/20 py-10 md:py-14">
              <h2 className="mb-6 font-editorial text-2xl text-[#E6DBC7] md:mb-8 md:text-3xl">
                How It Works
              </h2>
              <div className="space-y-4 text-base leading-relaxed text-foreground/90 md:space-y-5 md:text-lg">
                <p>
                  Each session is carefully crafted to guide you through specific breathing
                  techniques that work with your nervous system. From quick 3-minute resets to
                  deeper 60-minute journeys, you'll find practices for every moment of your day.
                </p>
                <p>
                  Browse by category to find what you need right now - whether that's calming your
                  mind, preparing for sleep, energizing your body, or processing emotions.
                </p>
              </div>
            </div>

            {/* Music & Sound Section */}
            <div className="border-t border-muted-foreground/20 py-10 md:py-14">
              <h2 className="mb-6 font-editorial text-2xl text-[#E6DBC7] md:mb-8 md:text-3xl">
                Music & Sound
              </h2>
              <p className="text-base leading-relaxed text-foreground/90 md:text-lg">
                Music is a passion of mine and I believe it's such a powerful tool for breathwork
                sessions. We work closely with music producers to create bespoke music
                specifically designed for each session, enhancing your journey and deepening the
                experience.
              </p>
            </div>

            {/* Your Journey Section */}
            <div className="border-t border-muted-foreground/20 py-10 md:py-14">
              <h2 className="mb-6 font-editorial text-2xl text-[#E6DBC7] md:mb-8 md:text-3xl">
                Your Journey
              </h2>
              <div className="space-y-4 text-base leading-relaxed text-foreground/90 md:text-lg">
                <p>
                  Start with whatever calls you. There's no wrong way to begin. Some people prefer
                  to follow a structured program, while others choose sessions intuitively based
                  on how they're feeling in the moment.
                </p>
                <p>
                  Take your time with each session. Each one builds on the last, and your only job
                  is to keep showing up with curiosity.
                </p>
              </div>
            </div>

            {/* Contact section */}
            <div className="border-t border-muted-foreground/20 pt-8 md:pt-10">
              <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-16">
                <div className="space-y-4">
                  <p className="text-base text-foreground/70 md:text-lg">
                    For any questions or support, please reach out through the contact form on our
                    main website or reach out to March on{" "}
                    <a
                      href="mailto:support@embersstudio.io"
                      className="text-[#E6DBC7] underline transition-colors hover:text-[#E6DBC7]/80"
                    >
                      support@embersstudio.io
                    </a>
                    .
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

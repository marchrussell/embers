import { ArrowRight } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { FadeUp } from "@/components/FadeUp";
import { Footer } from "@/components/Footer";
import { SubscriptionModal } from "@/components/modals/LazyModals";
import { NavBar } from "@/components/NavBar";
import { PhoneMockups } from "@/components/PhoneMockups";
import { TermsMicrocopy } from "@/components/TermsMicrocopy";
import { GlowButton } from "@/components/ui/glow-button";
import { Pill } from "@/components/ui/pill";
import SplitCard from "@/components/ui/split-card";
import { useLiveSessionsData } from "@/hooks/useLiveSessionsData";
import { CLOUD_IMAGES, getCloudImageUrl } from "@/lib/cloudImageUrls";

const mentalResetImg = getCloudImageUrl(
  CLOUD_IMAGES.mentalReset,
  {
    width: 960,
    quality: 85,
  },
  "program-images"
);

const SUPABASE_STORAGE_URL =
  import.meta.env.VITE_SUPABASE_STORAGE_URL || import.meta.env.VITE_SUPABASE_URL;
const firstScreenImg = `${SUPABASE_STORAGE_URL}/storage/v1/object/public/site-images/${CLOUD_IMAGES.threeWaysMushroom}`;

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const liveSessionsData = useLiveSessionsData();

  useEffect(() => {
    if (location.state?.openSubscription) {
      setShowSubscriptionModal(true);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <Suspense>
        <SubscriptionModal
          open={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
        />
      </Suspense>

      <main>
        {/* Hero Section with Optimized Background */}
        <section className="relative flex h-[100dvh] flex-col items-center justify-center overflow-hidden">
          <img
            src={firstScreenImg}
            alt="Home Page Image"
            aria-hidden="true"
            onLoad={() => setHeroLoaded(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${heroLoaded ? "opacity-100" : "opacity-0"}`}
            fetchPriority="high"
          />

          {/* Subtle dark overlay to reduce glare */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/5 to-black/10" />

          {/* Gradient fade into next section */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-b from-transparent to-black" />
        </section>

        {/* Second Screen Section */}
        <section>
          <div className="mx-auto w-full px-5 py-20 md:px-12 lg:px-20">
            <div>
              {/* Micro-heading above mockups - centered */}
              <div className="px-5 py-10 text-center md:px-16 md:py-20">
                <FadeUp>
                  <p className="text-center font-sans leading-[1.6] text-white">
                    <p className="font-editorial text-[24px] font-bold">
                      HŌM is a place to come back to the body.
                    </p>
                    <br />
                    <p className="mt-4 text-[18px]">
                      Through breath, movement, and sensory practice, it creates space for the
                      nervous system to settle, <br className="hidden md:block" /> perception to
                      soften, and experience to open.
                    </p>
                  </p>
                </FadeUp>
                <FadeUp delay={150}>
                  <div className="my-12 flex flex-wrap justify-center gap-3 md:my-10">
                    {[
                      "Calm the Nervous System",
                      "Sharpen Attention",
                      "Restore Energy",
                      "Sleep More Deeply",
                    ].map((label) => (
                      <Pill key={label} variant="dark">
                        {label}
                      </Pill>
                    ))}
                  </div>
                </FadeUp>
              </div>

              {/* Phone Mockups - centered */}
              <FadeUp delay={100}>
                <PhoneMockups />
              </FadeUp>

              {/* Bottom Text - Full Width, 3 Lines */}
              <div className="absolute bottom-8 left-5 right-5 z-10 sm:bottom-10 sm:left-8 sm:right-6 md:bottom-12 md:left-16 md:right-8">
                <p
                  className="font-editorial leading-[1.15] text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]"
                  style={{
                    textShadow: "0 2px 12px rgba(0,0,0,0.5)",
                    fontSize: "clamp(2.4rem, 3.5vw, 3.5rem)",
                    fontWeight: 300,
                  }}
                >
                  Where your nervous system resets - and your senses awaken
                  {/* to add gradient  */}
                  <Link to="/online" className="group inline-flex items-baseline">
                    <span
                      className="ml-6 inline-block font-editorial transition-transform duration-300 group-hover:translate-x-2"
                      style={{ fontSize: "clamp(2.4rem, 3.5vw, 3.5rem)", fontWeight: 300 }}
                    >
                      →
                    </span>
                  </Link>
                </p>
              </div>

              {/* Closing Line - moved here under mockups */}
              <p
                className="mx-auto mt-16 max-w-[800px] text-center italic leading-[1.7] text-white/75 md:mt-20"
                style={{
                  fontSize: "clamp(0.95rem, 1.1vw, 1.1rem)",
                }}
              >
                Your nervous system becomes your anchor — not your obstacle.
              </p>
            </div>
            {/* Pills below mockups */}
            <div className="mt-14 flex flex-col items-center gap-6 md:mt-16 md:gap-6">
              <FadeUp delay={0}>
                <div className="flex flex-wrap gap-4">
                  {["Daily Resets", "Sleep Stories", "Courses"].map((label) => (
                    <Pill key={label} variant="dark">
                      {label}
                    </Pill>
                  ))}
                </div>
              </FadeUp>
              <FadeUp delay={80}>
                <div className="flex flex-wrap gap-4">
                  {["Workshops + Guest Experts", "Live Gathering"].map((label) => (
                    <Pill key={label} variant="dark">
                      {label}
                    </Pill>
                  ))}
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

        {/* Mental Reset Course Card - White-lined curved box */}
        <section className="relative w-full overflow-hidden px-6 py-16 md:px-8 md:py-20 lg:px-12 lg:py-36">
          {/* Section Header - Centered */}
          <FadeUp>
            <div className="my-20 text-center md:my-12">
              <h2
                className="mb-3 font-editorial leading-[1.15] text-white"
                style={{
                  fontSize: "clamp(2rem, 3.5vw, 3.5rem)",
                  fontWeight: 300,
                }}
              >
                Courses
              </h2>
              <p
                className="mx-auto max-w-lg px-2 leading-[1.6] text-white/65 md:px-0"
                style={{
                  fontSize: "clamp(0.95rem, 1.1vw, 1.1rem)",
                }}
              >
                Structured pathways for lasting change and integration
              </p>
            </div>
          </FadeUp>
          <FadeUp>
            <SplitCard
              imageSrc={mentalResetImg}
              imageAlt="Mental Reset Course"
              breakpoint="lg"
              mobileLayout="stacked"
              contentClassName="bg-black/95 p-6 md:p-8 lg:bg-transparent lg:px-10 lg:py-10 lg:pl-6"
            >
              <h3
                className="mb-5 font-editorial font-light text-[#E6DBC7] sm:mb-6"
                style={{
                  fontSize: "clamp(1.8rem, 2.2vw, 2.4rem)",
                  lineHeight: 1.15,
                  fontWeight: 400,
                }}
              >
                Mental Reset
              </h3>
              <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#D4A574]/80 sm:mb-6">
                10-Day Course
              </p>
              <p className="mb-5 font-editorial text-[14px] italic leading-[1.5] text-[#E6DBC7]/65 sm:mb-6 lg:text-[15px]">
                A guided reset to clear mental noise, reduce overstimulation, and restore clarity.
              </p>
              <GlowButton
                onClick={() => {
                  navigate("/online?tab=courses&course=mental-reset");
                }}
                className="mt-auto inline-flex w-fit items-center justify-center rounded-full border border-white bg-transparent text-white transition-all hover:bg-white/10 lg:self-end"
                style={{
                  fontSize: "clamp(0.85rem, 0.9vw, 0.95rem)",
                  fontWeight: 400,
                  letterSpacing: "0.02em",
                  padding: "0.6rem 1.4rem",
                }}
              >
                Start Course
              </GlowButton>
            </SplitCard>
          </FadeUp>
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-black md:h-20" />
          {/* View All Courses CTA */}
          <FadeUp delay={200}>
            <div className="mt-12 text-center">
              <Link
                to="/online?tab=courses"
                className="group inline-flex min-h-[44px] items-center gap-2 text-[13px] font-light tracking-wide text-white/80 transition-colors duration-300 hover:text-white"
              >
                View All Courses
                <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </FadeUp>
        </section>

        {/* ========== EXPERIENCES ========== */}
        <section className="relative overflow-hidden bg-background py-20 md:py-24 lg:py-32">
          <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-10 lg:px-12">
            {/* Section Header - Centered */}
            <FadeUp>
              <div className="my-20 text-center md:my-12">
                <h2
                  className="mb-3 font-editorial leading-[1.15] text-white"
                  style={{
                    fontSize: "clamp(2rem, 3.5vw, 3.5rem)",
                    fontWeight: 300,
                  }}
                >
                  Experiences
                </h2>
                <p
                  className="mx-auto max-w-lg px-2 leading-[1.6] text-white/65 md:px-0"
                  style={{
                    fontSize: "clamp(0.95rem, 1.1vw, 1.1rem)",
                  }}
                >
                  Online live sessions, workshops, and gatherings
                </p>
              </div>
            </FadeUp>

            {/* Vertical Event Cards */}
            <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 md:grid-cols-3">
              {liveSessionsData.map((event, index) => (
                <FadeUp key={event.sessionType} delay={index * 100}>
                  <Link
                    to="/online?tab=live"
                    className="group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.12] bg-black/40 shadow-lg transition-colors duration-500 hover:border-white/25 md:shadow-[0_0_60px_rgba(230,219,199,0.25)]"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.9) 100%)",
                        }}
                      />

                      {/* Format Badge */}
                      <span
                        className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.12em] backdrop-blur-sm"
                        style={{ color: "#4ade80" }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: "#4ade80" }}
                        />
                        Online
                      </span>

                      {/* Content overlaid on image bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="mb-2 font-editorial text-[clamp(1.1rem,1.4vw,1.3rem)] font-light leading-[1.25] tracking-[-0.01em] text-white">
                          {event.title}
                        </h3>
                        <p className="mb-3 line-clamp-2 text-[12px] leading-[1.5] text-white/70">
                          {event.description}
                        </p>
                        {event.recurrenceLabel && (
                          <p className="text-[11px] font-medium tracking-wide text-white/50">
                            {event.recurrenceLabel}
                          </p>
                        )}
                        {event.nextDate && (
                          <p className="mt-1 text-[11px] tracking-wide text-white/40">
                            {event.nextDate}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </FadeUp>
              ))}
            </div>

            {/* View All Experiences CTA */}
            <FadeUp delay={200}>
              <div className="mt-12 text-center">
                <Link
                  to="/online?tab=live"
                  className="group inline-flex min-h-[44px] items-center gap-2 text-[13px] font-light tracking-wide text-white/80 transition-colors duration-300 hover:text-white"
                >
                  View All Lives
                  <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </FadeUp>
          </div>
        </section>
      </main>

      <TermsMicrocopy />
      <Footer />
    </div>
  );
};
export default Index;

import { ArrowRight } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { Footer } from "@/components/Footer";
import { SubscriptionModal } from "@/components/modals/LazyModals";
import { NavBar } from "@/components/NavBar";
import { PhoneMockups } from "@/components/PhoneMockups";
import { TermsMicrocopy } from "@/components/TermsMicrocopy";
import { Button } from "@/components/ui/button";
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

const Index = () => {
  const location = useLocation();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const liveSessionsData = useLiveSessionsData();

  useEffect(() => {
    if (location.state?.openSubscription) {
      setShowSubscriptionModal(true);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <Suspense fallback={null}>
        <SubscriptionModal
          open={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
        />
      </Suspense>

      <main>
        {/* Hero Section with Optimized Background */}
        <section className="relative flex h-[100dvh] flex-col items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 h-full w-full"
            style={{
              backgroundImage: `url("${getCloudImageUrl(CLOUD_IMAGES.threeWaysMushroom, { width: 1920, quality: 85 })}")`,
              backgroundSize: "cover",
              backgroundPosition: "30% 40%",
            }}
          />

          {/* Subtle dark overlay to reduce glare */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/5 to-black/10" />

          {/* Gradient fade into next section */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-b from-transparent to-black" />
        </section>

        {/* Phone Mockups Section */}
        <section className="bg-background">
          <div className="mx-auto w-full px-5 pb-20 pt-12 md:px-12 lg:px-20">
            <div>
              {/* Micro-heading above mockups - centered */}
              <div className="px-5 pb-8 text-center sm:px-8 sm:pb-10 md:px-16 md:py-20">
                <p
                  className="text-center font-sans leading-[1.6] text-white"
                  // style={{
                  //   fontSize: "clamp(0.95rem, 1.5vw, 1.15rem)",
                  //   fontWeight: 400,
                  //   textShadow: "0 2px 12px rgba(0,0,0,0.5)",
                  // }}
                >
                  <span className="font-editorial text-[24px] font-bold">
                    Embers Studio is a place to come back to the body.
                  </span>
                  <br className="hidden md:block" />
                  <br className="hidden md:block" />
                  <span className="text-[18px]">
                    Through breath, movement, and sensory practice, it creates space for the nervous
                    system to settle, <br className="hidden md:block" /> perception to soften, and
                    experience to open.
                  </span>
                </p>
                <div className="mt-10 flex flex-wrap justify-center gap-2 md:gap-3">
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
              </div>

              {/* Phone Mockups - centered */}
              <PhoneMockups />

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
                      className="ml-4 inline-block font-editorial transition-transform duration-300 group-hover:translate-x-2"
                      style={{ fontSize: "clamp(2.4rem, 3.5vw, 3.5rem)", fontWeight: 300 }}
                    >
                      →
                    </span>
                  </Link>
                </p>
              </div>

              {/* Closing Line - moved here under mockups */}
              <p
                className="mx-auto mt-12 max-w-[800px] text-center italic leading-[1.7] text-white/75 md:mt-20"
                style={{
                  fontSize: "clamp(0.95rem, 1.1vw, 1.1rem)",
                }}
              >
                Your nervous system becomes your anchor — not your obstacle.
              </p>
            </div>
            {/* Pills below mockups */}
            <div className="mt-12 flex flex-col items-center gap-4 md:mt-16 md:gap-6">
              <div className="flex flex-wrap gap-4">
                {["Daily Resets", "Sleep Stories", "Courses"].map((label) => (
                  <Pill key={label} variant="dark">
                    {label}
                  </Pill>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                {["Workshops + Guest Experts", "Live Gathering"].map((label) => (
                  <Pill key={label} variant="dark">
                    {label}
                  </Pill>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Mental Reset Course Card - White-lined curved box */}
        <section className="w-full bg-background px-6 py-16 md:px-8 md:py-20 lg:px-12 lg:py-36">
          <SplitCard
            imageSrc={mentalResetImg}
            imageAlt="Mental Reset Course"
            breakpoint="lg"
            mobileLayout="stacked"
            contentClassName="bg-black/95 p-6 md:p-8 lg:bg-transparent lg:px-10 lg:py-10 lg:pl-6"
          >
            <h3
              className="mb-5 font-editorial text-white sm:mb-6"
              style={{
                fontSize: "clamp(1.8rem, 2.2vw, 2.4rem)",
                lineHeight: 1.15,
                fontWeight: 400,
              }}
            >
              Mental Reset
            </h3>
            <p
              className="mb-5 font-light uppercase tracking-[0.1em] text-[#EC9037] sm:mb-6"
              style={{
                fontSize: "clamp(0.7rem, 0.8vw, 0.85rem)",
              }}
            >
              10-Day Course
            </p>
            <p
              className="mb-5 text-white/90 sm:mb-6"
              style={{
                fontSize: "clamp(0.85rem, 0.92vw, 0.95rem)",
                lineHeight: 1.65,
              }}
            >
              A guided reset to clear mental noise, reduce overstimulation, and restore clarity.
            </p>
            <Button
              onClick={() => {
                window.open("/online/program/mental-reset", "_blank");
              }}
              className="mt-auto inline-flex w-fit items-center justify-center rounded-full border border-white bg-transparent text-white transition-all hover:bg-white/10"
              style={{
                fontSize: "clamp(0.85rem, 0.9vw, 0.95rem)",
                fontWeight: 400,
                letterSpacing: "0.02em",
                padding: "0.6rem 1.4rem",
              }}
            >
              Start Course
            </Button>
          </SplitCard>
        </section>

        {/* ========== EXPERIENCES ========== */}
        <section className="relative overflow-hidden bg-background py-16 md:py-24 lg:py-32">
          <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-10 lg:px-12">
            {/* Section Header - Centered */}
            <div className="mb-10 text-center md:mb-14">
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

            {/* Vertical Event Cards */}
            <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 md:grid-cols-3">
              {liveSessionsData.map((event) => (
                <Link
                  key={event.sessionType}
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
              ))}
            </div>

            {/* View All Experiences CTA */}
            <div className="mt-12 text-center">
              <Link
                to="/online?tab=live"
                className="inline-flex min-h-[44px] items-center gap-2 text-[13px] font-light tracking-wide text-white/80 transition-colors duration-300 hover:text-white"
              >
                View All Lives
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <TermsMicrocopy />
      <Footer />
    </div>
  );
};
export default Index;

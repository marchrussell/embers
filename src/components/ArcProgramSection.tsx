import { useState } from "react";
import { ArrowRight, Leaf, Users, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ArcProgramModal } from "@/components/ArcProgramModal";
import { RiseArcApplicationForm } from "@/components/RiseArcApplicationForm";
import { GlowButton } from "@/components/ui/glow-button";
import studioBreatheSilhouette from "@/assets/studio-breathe-silhouette.jpg";
interface ArcProgramSectionProps {
  title?: string;
  showStudioCard?: boolean;
  withOuterSpacing?: boolean;
}

export const ArcProgramSection = ({ 
  title = "More Ways to Practice",
  showStudioCard = true,
  withOuterSpacing = true,
}: ArcProgramSectionProps) => {
  const navigate = useNavigate();
  const [arcModalOpen, setArcModalOpen] = useState(false);
  const [arcProgramType, setArcProgramType] = useState<'self-study' | 'group' | 'one-on-one'>('self-study');
  const [applicationFormOpen, setApplicationFormOpen] = useState(false);
  const containerClasses = withOuterSpacing ? "mt-24 lg:mt-32 mb-16" : "";

  return (
    <>
      <div className={containerClasses}>
        <div className="space-y-20">
          <h2 className="font-editorial text-[#E6DBC7] text-left mb-4" style={{
            fontSize: 'clamp(2rem, 3.5vw, 3rem)'
          }}>
            {title}
          </h2>

          {/* The Studio Card - Horizontal Layout */}
          {showStudioCard && (
            <div 
              className="group relative flex flex-col md:flex-row overflow-hidden rounded-3xl cursor-pointer bg-black border border-[#E6DBC7]/20 shadow-[0_0_60px_rgba(230,219,199,0.4)] transition-colors duration-500"
              onClick={() => navigate('/studio')}
              style={{ minHeight: '340px' }}
            >
              {/* Image Side */}
              <div className="relative md:w-[45%] h-[240px] md:h-auto shrink-0 overflow-hidden">
                <img 
                  src={studioBreatheSilhouette} 
                  alt="The Studio"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
                {/* Gradient overlay for seamless blend */}
                <div className="absolute inset-0 hidden md:block" style={{
                  background: 'linear-gradient(to right, transparent 40%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,1) 100%)'
                }} />
                <div className="absolute inset-0 md:hidden" style={{
                  background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.9) 100%)'
                }} />
              </div>
              
              {/* Content Side */}
              <div className="relative flex-1 flex flex-col justify-center p-8 md:p-10 lg:p-12">
                <p className="text-[#C89B5F] text-[11px] uppercase tracking-[0.15em] mb-4 font-medium">
                  Monthly Membership
                </p>
                <h3 className="font-editorial text-[clamp(1.8rem,2.5vw,2.4rem)] text-[#E6DBC7] font-light leading-[1.1] mb-5">
                  The Studio
                </h3>
                <p className="text-[15px] md:text-[16px] text-[#E6DBC7]/75 mb-8 max-w-[440px] leading-[1.65]">
                  A monthly membership for short daily resets, guided practices, courses and live weekly sessions that help you stay grounded, clear, and connected.
                </p>
                <GlowButton className="gap-3">
                  Explore The Studio <ArrowRight className="w-5 h-5" />
                </GlowButton>
              </div>
            </div>
          )}

          {/* ARC Program Cards - 3 Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
          {/* Card 1 — Self-Study */}
          <div 
            className="relative rounded-none text-left flex flex-col h-full transition-colors duration-300 cursor-pointer bg-transparent border border-white/30 hover:border-white/50"
            onClick={() => {
              setArcProgramType('self-study');
              setArcModalOpen(true);
            }}
          >
            {/* Content */}
            <div className="p-8 lg:p-10 flex flex-col h-full">
              {/* Header */}
              <div className="mb-6">
                <span className="inline-flex items-center gap-3 text-white/60 text-xs uppercase tracking-[0.15em] mb-4">
                  <Leaf className="w-5 h-5 text-white/80" />
                  Self-Paced
                </span>
                <h4 className="text-white font-editorial text-2xl lg:text-3xl mb-2" style={{ fontWeight: 300 }}>
                  ARC Self-Study
                </h4>
              </div>

              {/* Description */}
              <p className="text-white/75 text-sm leading-relaxed mb-6">
                A structured, private 4-month journey to stabilise your nervous system, improve sleep and energy, reduce anxiety, and build real internal steadiness — at your own pace.
              </p>

              {/* Perfect for */}
              <div className="mb-8">
                <p className="text-white/40 text-xs uppercase tracking-[0.12em] mb-2">Perfect for</p>
                <p className="text-white/70 text-sm leading-relaxed">
                  People who want depth, privacy, and structured support without live sessions.
                </p>
              </div>

              {/* Bottom section - pushed to bottom */}
              <div className="mt-auto">
                <button className="w-full text-white border border-white/40 px-5 py-4 rounded-none text-sm font-normal tracking-wide hover:bg-white/10 hover:border-white/60 transition-all flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(255,255,255,0.08)] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                  Explore Self-Study
                </button>
              </div>
            </div>
          </div>

          {/* Card 2 — Group Programme */}
          <div 
            className="relative rounded-none text-left flex flex-col h-full transition-colors duration-300 cursor-pointer bg-transparent border border-white/30 hover:border-white/50"
            onClick={() => {
              setArcProgramType('group');
              setArcModalOpen(true);
            }}
          >
            {/* Content */}
            <div className="p-8 lg:p-10 flex flex-col h-full">
              {/* Header */}
              <div className="mb-6">
                <span className="inline-flex items-center gap-3 text-white/60 text-xs uppercase tracking-[0.15em] mb-4">
                  <Users className="w-5 h-5 text-white/80" />
                  Live Group
                </span>
                <h4 className="text-white font-editorial text-2xl lg:text-3xl mb-2" style={{ fontWeight: 300 }}>
                  ARC Group Programme
                </h4>
              </div>

              {/* Description */}
              <p className="text-white/75 text-sm leading-relaxed mb-6">
                A guided live experience blending nervous system repair, emotional processing and relational connection — inside a supportive community.
              </p>

              {/* Perfect for */}
              <div className="mb-8">
                <p className="text-white/40 text-xs uppercase tracking-[0.12em] mb-2">Perfect for</p>
                <p className="text-white/70 text-sm leading-relaxed">
                  People who want accountability, guidance, and to feel more regulated, connected, and steady day-to-day.
                </p>
              </div>

              {/* Bottom section - pushed to bottom */}
              <div className="mt-auto">
                <button className="w-full text-white border border-white/40 px-5 py-4 rounded-none text-sm font-normal tracking-wide hover:bg-white/10 hover:border-white/60 transition-all flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(255,255,255,0.08)] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                  Explore Group Programme
                </button>
              </div>
            </div>
          </div>

          {/* Card 3 — 1:1 Programme */}
          <div 
            className="relative rounded-none text-left flex flex-col h-full transition-colors duration-300 cursor-pointer bg-transparent border border-white/30 hover:border-white/50"
            onClick={() => {
              setArcProgramType('one-on-one');
              setArcModalOpen(true);
            }}
          >
            {/* Content */}
            <div className="p-8 lg:p-10 flex flex-col h-full">
              {/* Header */}
              <div className="mb-6">
                <span className="inline-flex items-center gap-3 text-white/60 text-xs uppercase tracking-[0.15em] mb-4">
                  <Sparkles className="w-5 h-5 text-white/80" />
                  High-Touch
                </span>
                <h4 className="text-white font-editorial text-2xl lg:text-3xl mb-2" style={{ fontWeight: 300 }}>
                  ARC 1:1 Programme
                </h4>
              </div>

              {/* Description */}
              <p className="text-white/75 text-sm leading-relaxed mb-6">
                A personalised, high-touch 4-month immersion for emotional clarity, patterns that won't shift alone, and deep nervous-system repatterning.
              </p>

              {/* Perfect for */}
              <div className="mb-8">
                <p className="text-white/40 text-xs uppercase tracking-[0.12em] mb-2">Perfect for</p>
                <p className="text-white/70 text-sm leading-relaxed">
                  People ready for precise guidance, real-time regulation support, and lasting internal change.
                </p>
              </div>

              {/* Bottom section - pushed to bottom */}
              <div className="mt-auto">
                <button className="w-full text-white border border-white/40 px-5 py-4 rounded-none text-sm font-normal tracking-wide hover:bg-white/10 hover:border-white/60 transition-all flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(255,255,255,0.08)] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                  Explore 1:1 Programme
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
      <ArcProgramModal
        open={arcModalOpen}
        onOpenChange={setArcModalOpen}
        programType={arcProgramType}
        onApply={() => {
          setArcModalOpen(false);
          setApplicationFormOpen(true);
        }}
      />
      
      <RiseArcApplicationForm
        open={applicationFormOpen}
        onOpenChange={setApplicationFormOpen}
      />
    </>
  );
};

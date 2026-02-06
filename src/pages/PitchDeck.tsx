import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/SectionHeading";
import sanctuaryCircle from "@/assets/pitch-deck/sanctuary-circle.jpg";
import hearthLounge from "@/assets/pitch-deck/hearth-lounge.jpg";
import thermalRoom from "@/assets/pitch-deck/thermal-room.jpg";
import studioSpace from "@/assets/pitch-deck/studio-space.png";
import earthTexture from "@/assets/pitch-deck/earth-texture.jpg";
import ambientGathering from "@/assets/pitch-deck/ambient-gathering.png";
import candlelightBlur from "@/assets/pitch-deck/candlelight-blur.png";
import warmGathering from "@/assets/pitch-deck/warm-gathering.png";
import ambientWarmth from "@/assets/pitch-deck/ambient-warmth.png";
import marchTeacher from "@/assets/march-russell-teacher.jpg";
import jossStoddart from "@/assets/pitch-deck/joss-stoddart.png";
import sanctuaryGathering from "@/assets/pitch-deck/sanctuary-gathering.jpg";
import loungeSpace from "@/assets/pitch-deck/lounge-space.jpg";
import thermalSpace from "@/assets/pitch-deck/thermal-space.jpg";
import studioRoom from "@/assets/pitch-deck/studio-room.png";
import amphitheaterSpace from "@/assets/pitch-deck/amphitheater-space.jpg";
import circularCeiling from "@/assets/pitch-deck/circular-ceiling.jpg";
import problemCandles from "@/assets/pitch-deck/problem-candles.jpg";
import slide3GroupSession from "@/assets/pitch-deck/slide-3-group-session.png";

const slides = [
  {
    id: 1,
    title: "EMBERS",
    subtitle: "AWAKEN THE SENSES",
    tagline: "Enter a space where the nervous system rests, and community begins."
  },
  {
    id: 2,
    title: "The Problem",
    subtitle: "Modern life overwhelms the mind and exhausts the nervous system.",
    feelings: ["Mentally overloaded", "Physiologically dysregulated", "Emotionally disconnected", "Socially isolated"],
    table: [
      { option: "Yoga & Meditation Studios", missing: "Sensory environment, nervous system science" },
      { option: "Ice Labs & Gyms", missing: "Atmosphere, warmth, emotional safety" },
      { option: "Day Spas", missing: "Connection, community, belonging" },
      { option: "Social Clubs", missing: "Stillness, grounding, nervous system regulation" }
    ],
    conclusion: "People are seeking calm, softness, sensory depth, and real human connection. But there is no place that brings these together."
  },
  {
    id: 3,
    title: "The Opportunity",
    subtitle: "Wellness has evolved from:",
    evolution: "Fitness → Mindfulness → Sensory & Nervous System Wellness → Community Healing",
    stats: [
      { label: "Global Wellness Economy", value: "$5.6 Trillion" },
      { label: "Fastest growth sectors", value: "Breathwork, Sauna Culture, Somatic Healing, Cold Plunge, Social Wellness, Hospitality" }
    ],
    highlight: "There is no category leader for nervous system restoration and sensory hospitality.",
    tagline: "We're not building a spa. We're creating the first Nervous System Sanctuary."
  },
  {
    id: 4,
    title: "What We Are Building",
    description: "A sensory sanctuary where breath, movement, sauna heat, clay grounding, warm water, cold immersion, sound, light, and tea help people soften, restore, and reconnect — to themselves and to community."
  },
  {
    id: 5,
    title: "The Experience Zones",
    studio: {
      title: "The Studio",
      capacity: "25-person atmospheric studio for:",
      activities: ["Breathwork", "Somatic movement", "Qi Gong", "Candlelight meditation", "Sound immersion", "Storytelling / Hearthside gatherings"],
      tagline: "Movement for presence, not performance."
    },
    elementsRoom: {
      title: "The Elements Room",
      subtitle: "Sensory-designed heat, water, clay, and light experiences:",
      experiences: [
        { name: "Large Immersive Sauna", capacity: "15–20 people", description: "Social, ambient sound, breath-led, warm amber & cedar" },
        { name: "Quiet Contemplation Sauna", capacity: "10 people", description: "Silence-only, dark timber, minimal light" },
        { name: "Red Light Sauna Chamber", capacity: "8 people", description: "Infrared warmth + red glow for emotional calming" },
        { name: "Warm Mineral Baths (x2)", capacity: "6-person cycle", description: "Floating warmth, candlelit calm, tea service" },
        { name: "Cold Plunge Pools (x2)", capacity: "4-person cycle", description: "Breath-led awakening, sharing, resilience" },
        { name: "Clay Grounding Station", capacity: "4–6 people", description: "Hand-applied clay, stillness, sensory grounding" },
        { name: "Transition Spaces", capacity: "Tea, warm towels, dimming light, reset pathway", description: "" }
      ],
      tagline: "Heat, cold, touch, light, breath, and silence — orchestrated for nervous system balance."
    },
    hearthLounge: {
      title: "The Hearth Lounge",
      capacity: "50-person barefoot gathering space.",
      description: "Soft lighting, blankets, tea, carpets, low tables, acoustic evenings.",
      tagline: "Where warmth, presence, and community quietly form."
    }
  },
  {
    id: 6,
    title: "Signature Flow (Elements Cycle)",
    flow: "Sauna → Mineral Warm Bath → Clay Application → Warm Rinse → Cold Plunge → Tea Stillness",
    clayExperience: {
      title: "The Clay Experience Explained:",
      points: [
        "Handmade mineral clay, warmed naturally, applied slowly to hands, feet, or arms",
        "Focus on tactile sensation – slow movement, grounding, texture awareness",
        "Encourages stillness, presence, embodiment — \"feel yourself in your skin\"",
        "Wipes off gently using warm flowing water, followed by tea and silence"
      ],
      tagline: "Clay is not treatment — it is sensory grounding."
    }
  },
  {
    id: 7,
    title: "Memberships",
    tiers: [
      { name: "Gatherer", price: "£95 / mo", for: "Gentle access, occasional sensory reset" },
      { name: "Sanctuary Member*", price: "£195 / mo", for: "Regular nervous system wellness" },
      { name: "Hearth Member", price: "£295 / mo", for: "Deep sensory immersion + guests" }
    ]
  },
  {
    id: 8,
    title: "Membership Benefits",
    benefits: [
      { feature: "Studio Access", gatherer: "3 sessions", sanctuary: "Unlimited", hearth: "Unlimited" },
      { feature: "Elements Room", gatherer: "1 visit", sanctuary: "4 visits", hearth: "8 visits" },
      { feature: "Lounge Access", gatherer: "Off-peak", sanctuary: "Anytime", hearth: "Anytime + guests" },
      { feature: "Evening Sensory Gatherings", gatherer: "Member Rate", sanctuary: "1 free / mo", hearth: "3 free / mo" },
      { feature: "Guests", gatherer: "–", sanctuary: "1", hearth: "2" },
      { feature: "Retreat & Workshop Access", gatherer: "Early", sanctuary: "Priority", hearth: "Priority + discount" }
    ]
  },
  {
    id: 9,
    title: "Non-Member Pricing",
    experiences: [
      { name: "Studio Class", price: "£32" },
      { name: "Breath & Sound Immersion", price: "£38" },
      { name: "Elements Cycle (Sauna + Clay + Cold + Tea)", price: "£55" },
      { name: "Night Glow Sauna", price: "£65" },
      { name: "Full Reset Day", price: "£125" },
      { name: "Acoustic Tea Gathering", price: "£45–£60" },
      { name: "Elements Private Hire", price: "£650 / 2 hrs" },
      { name: "Full Venue Hire", price: "£4k–£8k / day" }
    ]
  },
  {
    id: 10,
    title: "Financials (Year 2)",
    subtitle: "Updated",
    streams: [
      { category: "Memberships (350–450 members)", revenue: "£1.6M–£2.4M" },
      { category: "Elements Room Experiences", revenue: "£350k–£550k" },
      { category: "Studio Classes & Events", revenue: "£275k–£450k" },
      { category: "Private Hire", revenue: "£220k–£400k" },
      { category: "Retail (tea, sensory kits)", revenue: "£75k–£120k" }
    ],
    total: "£2.5M–£3.9M",
    assumptions: "Assumptions based on ~5,500 sq ft location: 25-person studio, 50-person lounge, 3 saunas, 4 baths, 160 visit capacity/day."
  },
  {
    id: 11,
    title: "Investment",
    costs: [
      { category: "Property acquisition / lease", amount: "£400k–£700k" },
      { category: "Architectural build (bespoke sensory design)", amount: "£900k–£1.4M" },
      { category: "Sauna, thermal & water engineering", amount: "£350k–£600k" },
      { category: "Showers, lockers, changing rooms", amount: "£100k–£200k" },
      { category: "Lighting, sound, atmospheric tech", amount: "£150k–£300k" },
      { category: "Branding, launch, pre-marketing", amount: "£100k–£200k" },
      { category: "Working capital (12-month runway)", amount: "£350k–£500k" }
    ],
    raise: "£2.3M–£3.0M",
    equity: "~20–25%"
  },
  {
    id: 12,
    title: "Team",
    members: [
      { 
        name: "March", 
        role: "Nervous System Specialist, Breathwork Educator, Founder MOOD360",
        photo: marchTeacher
      },
      { 
        name: "Joss", 
        role: "Experience Curator, Sensory Atmosphere Designer, Community Architect",
        photo: jossStoddart
      }
    ],
    advisors: "Advisors (in conversation): Hospitality strategist · Sauna culture engineer · Brand architect"
  },
  {
    id: 13,
    title: "Vision",
    locations: "London Flagship → Amsterdam → Berlin → Copenhagen → Kyoto → New York",
    tagline: "A network of sensory sanctuaries — where warmth, beauty, nervous system science, and community live together."
  },
  {
    id: 14,
    title: "Awaken the senses.",
    subtitle: "Where the nervous system rests, and community begins."
  }
];

export default function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen text-[#E6DBC7] relative overflow-x-hidden" style={{ backgroundColor: "#000000" }}>
      {/* Slide counter - top left */}
      <div className="absolute top-8 left-8 text-xl md:text-2xl font-light z-30 px-6 py-3 rounded-full" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)', color: '#E6DBC7' }}>
        {currentSlide + 1} / {slides.length}
      </div>

      {/* Navigation - top right, larger arrows */}
      <div className="absolute top-8 right-8 z-30">
        <div className="flex items-center justify-center gap-8">
          <Button
            onClick={prevSlide}
            variant="ghost"
            size="icon"
            className="bg-transparent hover:bg-transparent shadow-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 hover:opacity-70 transition-opacity"
            style={{ color: "#E6DBC7" }}
          >
            <ChevronLeft className="h-40 w-40 md:h-48 md:w-48 lg:h-56 lg:w-56" strokeWidth={1.5} />
          </Button>
          <Button
            onClick={nextSlide}
            variant="ghost"
            size="icon"
            className="bg-transparent hover:bg-transparent shadow-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 hover:opacity-70 transition-opacity"
            style={{ color: "#E6DBC7" }}
          >
            <ChevronRight className="h-40 w-40 md:h-48 md:w-48 lg:h-56 lg:w-56" strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      {/* Main slide content */}
      <div
        className="relative z-20 h-screen overflow-y-auto flex items-center justify-center py-16 pb-32"
        style={
          slide.id === 1
            ? {
                backgroundColor: "#000000",
                paddingLeft: "2.5rem",
                paddingRight: "2.5rem",
                paddingTop: "3rem",
                paddingBottom: "6rem",
              }
            : slide.id === 2 || slide.id === 3
            ? {
                paddingLeft: "3rem",
                paddingRight: "3rem",
              }
            : {
                paddingLeft: "2rem",
                paddingRight: "2rem",
              }
        }
      >
        <div className={slide.id === 1 ? "w-full max-w-none" : slide.id === 2 || slide.id === 3 ? "w-full max-w-[95vw] mx-auto" : "w-full max-w-7xl mx-auto"}>
          
          {/* Slide 1: Cover */}
          {slide.id === 1 && (
            <div className="h-full flex flex-col justify-between pb-32">
              {/* Top and middle content */}
              <div className="text-center space-y-6 flex-1 flex flex-col justify-center">
                <div>
                  <SectionHeading variant="h1" className="font-editorial text-[14rem] md:text-[18rem] lg:text-[22rem] mb-3" style={{ color: 'hsl(30, 80%, 57%)' }}>
                    {slide.title}
                  </SectionHeading>
                  <p className="text-4xl md:text-5xl lg:text-6xl font-light tracking-[0.5em] uppercase mb-12" style={{ color: '#E6DBC7' }}>
                    {slide.subtitle}
                  </p>
                </div>
                {/* Images - single row, all equal height and LARGE */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 px-0 md:px-8 lg:px-16">
                  <div className="rounded-3xl overflow-hidden h-[220px] md:h-[260px] lg:h-[300px]">
                    <img src={amphitheaterSpace} alt="Embers amphitheater" className="w-full h-full object-cover" />
                  </div>
                  <div className="rounded-3xl overflow-hidden h-[220px] md:h-[260px] lg:h-[300px]">
                    <img src={circularCeiling} alt="Circular ceiling" className="w-full h-full object-cover" />
                  </div>
                  <div className="rounded-3xl overflow-hidden h-[220px] md:h-[260px] lg:h-[300px]">
                    <img src={sanctuaryGathering} alt="Sanctuary gathering" className="w-full h-full object-cover" />
                  </div>
                  <div className="rounded-3xl overflow-hidden h-[220px] md:h-[260px] lg:h-[300px]">
                    <img src={loungeSpace} alt="Hearth lounge" className="w-full h-full object-cover" />
                  </div>
                  <div className="rounded-3xl overflow-hidden h-[220px] md:h-[260px] lg:h-[300px]">
                    <img src={thermalSpace} alt="Thermal room" className="w-full h-full object-cover" />
                  </div>
                  <div className="rounded-3xl overflow-hidden h-[220px] md:h-[260px] lg:h-[300px]">
                    <img src={studioRoom} alt="Studio room" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
              
              {/* Bottom description text - at the very bottom of the slide */}
              <div className="w-full mt-16">
                <p className="font-editorial text-4xl md:text-6xl lg:text-7xl xl:text-8xl text-center text-[#E6DBC7] leading-tight">
                  A sensory wellness sanctuary where breath, warmth, movement, sound, stillness, and elemental experiences help people soften, restore, and reconnect — to themselves, and to community.
                </p>
              </div>
            </div>
          )}

          {/* Slide 2: Problem */}
          {slide.id === 2 && (
            <div className="h-full flex flex-col justify-between gap-10 py-6">
              {/* Top section: Image and Content side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-16 items-stretch">
                {/* Left: Image */}
                <div className="rounded-3xl overflow-hidden h-[480px]">
                  <img 
                    src={problemCandles} 
                    alt="Warm candlelit atmosphere" 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Right: Content */}
                <div className="h-[480px] flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <SectionHeading variant="h1" className="font-editorial text-7xl md:text-8xl leading-[0.9]" style={{ color: 'hsl(30, 80%, 57%)' }}>
                      {slide.title}
                    </SectionHeading>
                    
                    <p className="text-3xl font-light leading-tight" style={{ color: '#E6DBC7' }}>
                      {slide.subtitle}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-2xl font-light" style={{ color: 'hsl(30, 80%, 57%)' }}>People feel:</p>
                    <ul className="space-y-2">
                      {slide.feelings?.map((feeling, idx) => (
                        <li
                          key={idx}
                          className="text-xl font-light pl-5 border-l-2"
                          style={{ color: '#FFFFFF', borderColor: 'hsl(30, 80%, 57%)' }}
                        >
                          {feeling}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <p className="text-2xl font-light" style={{ color: '#E6DBC7' }}>
                      Existing wellness options don&apos;t solve this.
                    </p>

                    <div
                      className="space-y-2 p-4 rounded-2xl"
                      style={{
                        backgroundColor: 'rgba(230, 219, 199, 0.08)',
                        border: '1px solid rgba(230, 219, 199, 0.2)',
                      }}
                    >
                      <div
                        className="grid grid-cols-2 gap-x-8 pb-2 border-b-2"
                        style={{ borderColor: 'hsl(30, 80%, 57%)' }}
                      >
                        <span className="text-base font-light" style={{ color: 'hsl(30, 80%, 57%)' }}>
                          Existing Spaces
                        </span>
                        <span className="text-base font-light" style={{ color: 'hsl(30, 80%, 57%)' }}>
                          Missing Element
                        </span>
                      </div>
                      {slide.table?.map((row, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-2 gap-x-8 py-2 border-b last:border-0"
                          style={{ borderColor: 'rgba(230, 219, 199, 0.15)' }}
                        >
                          <span className="text-sm font-light" style={{ color: '#E6DBC7' }}>
                            {row.option}
                          </span>
                          <span className="text-sm font-light opacity-80" style={{ color: '#E6DBC7' }}>
                            {row.missing}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom: Full-width conclusion text */}
              <div className="w-full">
                <p
                  className="font-editorial text-4xl md:text-5xl lg:text-6xl leading-tight text-center"
                  style={{ color: '#E6DBC7' }}
                >
                  {slide.conclusion}
                </p>
              </div>
            </div>
          )}

          {/* Slide 3: Opportunity */}
          {slide.id === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-20 items-start h-full py-8">
              {/* Left: Image */}
              <div className="rounded-3xl overflow-hidden h-[680px]">
                <img 
                  src={slide3GroupSession} 
                  alt="Group wellness session" 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Right: Content - matching image height exactly */}
              <div className="space-y-8 h-[680px] flex flex-col justify-between">
                <div className="space-y-5">
                  <SectionHeading variant="h1" className="font-editorial text-7xl md:text-8xl leading-[0.95]" style={{ color: 'hsl(30, 80%, 57%)' }}>
                    {slide.title}
                  </SectionHeading>
                  
                  <p className="text-3xl md:text-4xl font-editorial leading-relaxed" style={{ color: 'hsl(30, 80%, 57%)' }}>
                    {slide.evolution}
                  </p>
                </div>

                {/* Stats section - 2-column grid */}
                <div className="grid grid-cols-2 gap-5">
                  {slide.stats?.map((stat, idx) => (
                    <div 
                      key={idx} 
                      className="p-5 rounded-2xl" 
                      style={{ 
                        backgroundColor: 'rgba(230, 219, 199, 0.1)', 
                        backdropFilter: 'blur(10px)',
                        border: '2px solid rgba(230, 219, 199, 0.25)'
                      }}
                    >
                      <div className="space-y-2">
                        <p className="text-base font-light" style={{ color: 'hsl(30, 80%, 57%)' }}>{stat.label}</p>
                        <p className="text-xl font-light leading-relaxed" style={{ color: '#E6DBC7' }}>{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-5">
                  <p className="text-2xl md:text-3xl font-editorial italic leading-relaxed" style={{ color: 'hsl(30, 80%, 57%)' }}>
                    {slide.highlight}
                  </p>

                  <p className="text-3xl md:text-4xl font-editorial leading-relaxed" style={{ color: '#E6DBC7' }}>
                    {slide.tagline}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Slide 4: What We Are Building */}
          {slide.id === 4 && (
            <div className="space-y-12 flex flex-col justify-center h-full">
              <SectionHeading variant="h1" className="font-editorial text-7xl md:text-8xl lg:text-9xl text-center" style={{ color: 'hsl(30, 80%, 57%)' }}>
                {slide.title}
              </SectionHeading>
              <p className="text-4xl md:text-5xl font-light leading-relaxed text-center max-w-6xl mx-auto" style={{ color: '#E6DBC7' }}>
                {slide.description}
              </p>
            </div>
          )}

          {/* Slide 5: Experience Zones */}
          {slide.id === 5 && (
            <div className="space-y-10">
              <SectionHeading variant="h1" className="font-editorial text-6xl md:text-7xl" style={{ color: 'hsl(30, 80%, 57%)' }}>
                {slide.title}
              </SectionHeading>
              
              {/* Studio */}
              <div className="p-8 rounded-3xl" style={{ backgroundColor: 'rgba(230, 219, 199, 0.15)', border: '1px solid rgba(230, 219, 199, 0.3)' }}>
                <h3 className="text-3xl font-semibold mb-4" style={{ color: 'hsl(30, 80%, 57%)' }}>{slide.studio?.title}</h3>
                <p className="text-xl mb-3" style={{ color: '#E6DBC7' }}>{slide.studio?.capacity}</p>
                <ul className="space-y-2 mb-4">
                  {slide.studio?.activities?.map((activity, idx) => (
                    <li key={idx} className="text-lg pl-4 border-l-2" style={{ color: '#E6DBC7', borderColor: 'hsl(30, 80%, 57%)' }}>{activity}</li>
                  ))}
                </ul>
                <p className="text-xl italic" style={{ color: 'hsl(30, 80%, 57%)' }}>{slide.studio?.tagline}</p>
              </div>

              {/* Elements Room - with table */}
              <div className="p-8 rounded-3xl space-y-6" style={{ backgroundColor: 'rgba(230, 219, 199, 0.15)', border: '1px solid rgba(230, 219, 199, 0.3)' }}>
                <h3 className="text-3xl font-semibold" style={{ color: 'hsl(30, 80%, 57%)' }}>{slide.elementsRoom?.title}</h3>
                <p className="text-xl" style={{ color: '#E6DBC7' }}>{slide.elementsRoom?.subtitle}</p>
                
                <div className="space-y-3">
                  {slide.elementsRoom?.experiences?.map((exp, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-4 p-4 rounded-xl" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                      <span className="text-base font-light" style={{ color: 'hsl(30, 80%, 57%)' }}>{exp.name}</span>
                      <span className="text-sm font-light" style={{ color: '#E6DBC7' }}>{exp.capacity}</span>
                      <span className="text-sm font-light" style={{ color: '#E6DBC7' }}>{exp.description}</span>
                    </div>
                  ))}
                </div>
                
                <p className="text-xl italic pt-4" style={{ color: 'hsl(30, 80%, 57%)' }}>{slide.elementsRoom?.tagline}</p>
              </div>

              {/* Hearth Lounge */}
              <div className="p-8 rounded-3xl" style={{ backgroundColor: 'rgba(230, 219, 199, 0.15)', border: '1px solid rgba(230, 219, 199, 0.3)' }}>
                <h3 className="text-3xl font-semibold mb-4" style={{ color: 'hsl(30, 80%, 57%)' }}>{slide.hearthLounge?.title}</h3>
                <p className="text-xl mb-3" style={{ color: '#E6DBC7' }}>{slide.hearthLounge?.capacity}</p>
                <p className="text-lg mb-4" style={{ color: '#E6DBC7' }}>{slide.hearthLounge?.description}</p>
                <p className="text-xl italic" style={{ color: 'hsl(30, 80%, 57%)' }}>{slide.hearthLounge?.tagline}</p>
              </div>
            </div>
          )}

          {/* Slide 6: Signature Flow */}
          {slide.id === 6 && (
            <div className="space-y-10 flex flex-col justify-center h-full">
              <SectionHeading variant="h1" className="font-editorial text-6xl md:text-7xl text-center" style={{ color: 'hsl(30, 80%, 57%)' }}>
                {slide.title}
              </SectionHeading>
              
              <p className="text-4xl md:text-5xl font-editorial text-center leading-relaxed" style={{ color: '#E6DBC7' }}>
                {slide.flow}
              </p>

              <div className="p-8 rounded-3xl mt-8" style={{ backgroundColor: 'rgba(230, 219, 199, 0.15)', border: '1px solid rgba(230, 219, 199, 0.3)' }}>
                <h3 className="text-3xl font-semibold mb-6" style={{ color: 'hsl(30, 80%, 57%)' }}>{slide.clayExperience?.title}</h3>
                <ul className="space-y-4 mb-6">
                  {slide.clayExperience?.points?.map((point, idx) => (
                    <li key={idx} className="text-xl pl-6 border-l-2" style={{ color: '#E6DBC7', borderColor: 'hsl(30, 80%, 57%)' }}>{point}</li>
                  ))}
                </ul>
                <p className="text-2xl italic" style={{ color: 'hsl(30, 80%, 57%)' }}>{slide.clayExperience?.tagline}</p>
              </div>
            </div>
          )}

          {/* Slide 7: Memberships */}
          {slide.id === 7 && (
            <div className="space-y-10 flex flex-col justify-center h-full">
              <SectionHeading variant="h1" className="font-editorial text-6xl md:text-7xl text-center" style={{ color: 'hsl(30, 80%, 57%)' }}>
                {slide.title}
              </SectionHeading>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {slide.tiers?.map((tier, idx) => (
                  <div key={idx} className="p-10 rounded-3xl text-center space-y-6" style={{ backgroundColor: 'rgba(230, 219, 199, 0.2)', border: '1px solid rgba(230, 219, 199, 0.3)' }}>
                    <h3 className="text-3xl font-semibold" style={{ color: 'hsl(30, 80%, 57%)' }}>{tier.name}</h3>
                    <p className="text-4xl font-bold" style={{ color: '#E6DBC7' }}>{tier.price}</p>
                    <p className="text-lg font-light" style={{ color: 'rgba(230, 219, 199, 0.8)' }}>{tier.for}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slide 8: Membership Benefits */}
          {slide.id === 8 && (
            <div className="space-y-8">
              <SectionHeading variant="h1" className="font-editorial text-5xl md:text-6xl text-center" style={{ color: 'hsl(30, 80%, 57%)' }}>
                {slide.title}
              </SectionHeading>
              
              <div className="space-y-3">
                {/* Header */}
                <div className="grid grid-cols-4 gap-4 p-4 rounded-xl" style={{ backgroundColor: 'rgba(230, 219, 199, 0.3)' }}>
                  <span className="text-lg font-semibold" style={{ color: '#E6DBC7' }}>Feature</span>
                  <span className="text-lg text-center font-semibold" style={{ color: 'hsl(30, 80%, 57%)' }}>Gatherer</span>
                  <span className="text-lg text-center font-semibold" style={{ color: 'hsl(30, 80%, 57%)' }}>Sanctuary</span>
                  <span className="text-lg text-center font-semibold" style={{ color: 'hsl(30, 80%, 57%)' }}>Hearth</span>
                </div>
                {slide.benefits?.map((benefit, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-4 p-4 rounded-xl" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
                    <span className="text-base font-light" style={{ color: 'hsl(30, 80%, 57%)' }}>{benefit.feature}</span>
                    <span className="text-base text-center font-light" style={{ color: '#E6DBC7' }}>{benefit.gatherer}</span>
                    <span className="text-base text-center font-light" style={{ color: '#E6DBC7' }}>{benefit.sanctuary}</span>
                    <span className="text-base text-center font-light" style={{ color: '#E6DBC7' }}>{benefit.hearth}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slide 9: Non-Member Pricing */}
          {slide.id === 9 && (
            <div className="space-y-10">
              <SectionHeading variant="h1" className="font-editorial text-6xl md:text-7xl text-center" style={{ color: 'hsl(30, 80%, 57%)' }}>
                {slide.title}
              </SectionHeading>
              
              <div className="space-y-4">
                {slide.experiences?.map((exp, idx) => (
                  <div key={idx} className="p-6 rounded-xl flex justify-between items-center" style={{ backgroundColor: 'rgba(230, 219, 199, 0.15)', border: '1px solid rgba(230, 219, 199, 0.3)' }}>
                    <span className="text-xl font-light" style={{ color: '#E6DBC7' }}>{exp.name}</span>
                    <span className="text-3xl font-semibold" style={{ color: 'hsl(30, 80%, 57%)' }}>{exp.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slide 10: Financials */}
          {slide.id === 10 && (
            <div className="space-y-10">
              <SectionHeading variant="h1" className="font-editorial text-6xl md:text-7xl text-center" style={{ color: 'hsl(30, 80%, 57%)' }}>
                {slide.title}
              </SectionHeading>
              <p className="text-2xl text-center" style={{ color: 'hsl(30, 80%, 57%)' }}>{slide.subtitle}</p>
              
              <div className="space-y-4">
                {slide.streams?.map((stream, idx) => (
                  <div key={idx} className="p-6 rounded-xl flex justify-between items-center" style={{ backgroundColor: 'rgba(230, 219, 199, 0.2)', border: '1px solid rgba(230, 219, 199, 0.3)' }}>
                    <span className="text-xl font-light" style={{ color: '#E6DBC7' }}>{stream.category}</span>
                    <span className="text-3xl font-semibold" style={{ color: 'hsl(30, 80%, 57%)' }}>{stream.revenue}</span>
                  </div>
                ))}
              </div>

              <div className="p-8 rounded-xl text-center space-y-4" style={{ backgroundColor: 'rgba(230, 219, 199, 0.25)', border: '2px solid rgba(230, 219, 199, 0.4)' }}>
                <p className="text-2xl" style={{ color: '#E6DBC7' }}>Projected Total:</p>
                <p className="text-6xl font-bold" style={{ color: 'hsl(30, 80%, 57%)' }}>{slide.total}</p>
              </div>

              <p className="text-lg italic text-center" style={{ color: 'rgba(230, 219, 199, 0.7)' }}>{slide.assumptions}</p>
            </div>
          )}

          {/* Slide 11: Investment */}
          {slide.id === 11 && (
            <div className="space-y-10">
              <SectionHeading variant="h1" className="font-editorial text-6xl md:text-7xl text-center" style={{ color: 'hsl(30, 80%, 57%)' }}>
                {slide.title}
              </SectionHeading>
              
              <div className="space-y-4">
                {slide.costs?.map((cost, idx) => (
                  <div key={idx} className="p-6 rounded-xl flex justify-between items-center" style={{ backgroundColor: 'rgba(230, 219, 199, 0.15)', border: '1px solid rgba(230, 219, 199, 0.3)' }}>
                    <span className="text-xl font-light" style={{ color: '#E6DBC7' }}>{cost.category}</span>
                    <span className="text-2xl font-semibold" style={{ color: 'hsl(30, 80%, 57%)' }}>{cost.amount}</span>
                  </div>
                ))}
              </div>

              <div className="p-8 rounded-xl text-center space-y-4" style={{ backgroundColor: 'rgba(230, 219, 199, 0.25)', border: '2px solid rgba(230, 219, 199, 0.4)' }}>
                <p className="text-4xl font-bold" style={{ color: 'hsl(30, 80%, 57%)' }}>Seed Raise Target: {slide.raise}</p>
                <p className="text-2xl" style={{ color: '#E6DBC7' }}>Equity Offered: {slide.equity}</p>
              </div>
            </div>
          )}

          {/* Slide 12: Team */}
          {slide.id === 12 && (
            <div className="space-y-10">
              <SectionHeading variant="h1" className="font-editorial text-6xl md:text-7xl text-center" style={{ color: 'hsl(30, 80%, 57%)' }}>
                {slide.title}
              </SectionHeading>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {slide.members?.map((member, idx) => (
                  <div key={idx} className="rounded-3xl overflow-hidden" style={{ backgroundColor: 'rgba(230, 219, 199, 0.2)', border: '1px solid rgba(230, 219, 199, 0.3)' }}>
                    <img src={member.photo} alt={member.name} className="w-full h-64 object-cover" />
                    <div className="p-8 space-y-4">
                      <h3 className="text-3xl font-semibold" style={{ color: 'hsl(30, 80%, 57%)' }}>{member.name}</h3>
                      <p className="text-lg leading-relaxed font-light" style={{ color: '#E6DBC7' }}>{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-lg text-center italic" style={{ color: 'rgba(230, 219, 199, 0.7)' }}>{slide.advisors}</p>
            </div>
          )}

          {/* Slide 13: Vision */}
          {slide.id === 13 && (
            <div className="space-y-10 flex flex-col justify-center h-full">
              <SectionHeading variant="h1" className="font-editorial text-6xl md:text-7xl text-center" style={{ color: 'hsl(30, 80%, 57%)' }}>
                {slide.title}
              </SectionHeading>
              
              <p className="text-4xl md:text-5xl font-editorial text-center leading-relaxed" style={{ color: '#E6DBC7' }}>
                {slide.locations}
              </p>

              <p className="text-3xl md:text-4xl font-light italic text-center leading-relaxed max-w-5xl mx-auto" style={{ color: 'rgba(230, 219, 199, 0.9)' }}>
                {slide.tagline}
              </p>
            </div>
          )}

          {/* Slide 14: Closing */}
          {slide.id === 14 && (
            <div className="space-y-10 flex flex-col justify-center h-full">
              <SectionHeading variant="h1" className="font-editorial text-8xl md:text-9xl lg:text-[10rem] text-center" style={{ color: 'hsl(30, 80%, 57%)' }}>
                {slide.title}
              </SectionHeading>
              
              <p className="text-4xl md:text-5xl font-light text-center leading-relaxed" style={{ color: '#E6DBC7' }}>
                {slide.subtitle}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

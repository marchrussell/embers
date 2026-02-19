import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ExperienceBookingModal } from "@/components/ExperienceBookingModal";
import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { TermsMicrocopy } from "@/components/TermsMicrocopy";
import { GlowButton } from "@/components/ui/glow-button";
import { IconButton } from "@/components/ui/icon-button";
import {
  CalendarEvent,
  downloadICalFile,
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
} from "@/lib/calendarUtils";
import { formatEventDate, getNextEventDate } from "@/lib/experienceDateUtils";
import { EventSchedule, eventsData } from "@/lib/experiencesData";
import { Calendar, Share } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import studioBreatheSilhouette from "@/assets/studio-breathe-silhouette.jpg";

const Experiences = () => {
  const navigate = useNavigate();
  const [openCalendarId, setOpenCalendarId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventSchedule | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const handleBookEvent = (event: EventSchedule) => {
    // For Instagram live events, just open the link
    if (event.id === 'unwind-rest') {
      window.open(event.ctaLink, '_blank');
      return;
    }
    // For studio member events, open subscription modal
    if (event.eventType === 'studio-member') {
      setIsSubscriptionModalOpen(true);
      return;
    }
    // For bookable events, open the booking modal
    setSelectedEvent(event);
    setIsBookingModalOpen(true);
  };

  // Scroll to event if hash is in URL
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, []);

  // Generate calendar event details from event data
  const getCalendarEvent = (event: typeof eventsData[0]): CalendarEvent => {
    const nextDate = getNextEventDate(event.recurrence, event.time);
    const [hours, minutes] = event.time.split(':').map(Number);

    const startDate = new Date(nextDate!);
    startDate.setHours(hours, minutes, 0, 0);

    const duration = event.id === 'unwind-rest' ? 15 :
                     event.id.includes('breath-presence') ? 90 : 60;
    const endDate = new Date(startDate.getTime() + duration * 60000);

    const location = event.format === 'Online' ? 'Online' : (event.venue || 'TBA');
    const linkLabel = event.eventType === 'free' ? 'Join' : 'Book';

    return {
      title: event.title,
      description: `${event.subtitle}\n\nClass taught by March Russell\n\n${linkLabel}: ${event.ctaLink}`,
      location,
      startDate,
      endDate,
      url: event.ctaLink,
    };
  };

  const handleDownloadICal = (event: typeof eventsData[0]) => {
    const calendarEvent = getCalendarEvent(event);
    const filename = event.title.replace(/\s+/g, '-').toLowerCase();
    downloadICalFile(calendarEvent, filename);
    setOpenCalendarId(null);
  };

  const handleGoogleCalendar = (event: typeof eventsData[0]) => {
    const calendarEvent = getCalendarEvent(event);
    window.open(getGoogleCalendarUrl(calendarEvent), '_blank');
    setOpenCalendarId(null);
  };

  const handleOutlookCalendar = (event: typeof eventsData[0]) => {
    const calendarEvent = getCalendarEvent(event);
    window.open(getOutlookCalendarUrl(calendarEvent), '_blank');
    setOpenCalendarId(null);
  };

  const handleShare = (event: typeof eventsData[0]) => {
    const shareUrl = `${window.location.origin}/experiences#${event.id}`;
    const shareText = `Join March Russell for ${event.title} - ${event.subtitle}`;
    
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: shareText,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-black">
        <NavBar />
        
        <main className="flex-1">
        {/* Hero Section - Desktop Only */}
        <section className="hidden md:block px-6 md:px-10 lg:px-12 pt-48 md:pt-44 lg:pt-48 pb-12 md:pb-16 lg:pb-20">
          <div className="max-w-[1600px] mx-auto">
            <h1 className="font-editorial text-[clamp(2.4rem,4vw,4rem)] text-[#E6DBC7] font-light tracking-[-0.02em] mb-3">
              Experiences
            </h1>
            <p className="font-unica text-[clamp(1rem,1.15vw,1.1rem)] text-white/60 font-light">
              Live sessions, workshops, and gatherings — online and in-person
            </p>
          </div>
        </section>

        {/* Mobile Spacer - pushes content below fixed NavBar logo */}
        <div className="md:hidden pt-44" />

        {/* Events Grid */}
        <section className="px-6 md:px-10 lg:px-12 pb-40 md:pb-56 lg:pb-72">
            <div className="md:hidden max-w-[1600px] mb-6">

           <h1 className="font-editorial text-[clamp(2.4rem,4vw,4rem)] text-[#E6DBC7] font-light tracking-[-0.02em] mb-3">
              Experiences
            </h1>
             <p className="font-unica text-[clamp(1rem,1.15vw,1.1rem)] text-white/60 font-light">
              Live sessions, workshops, and gatherings — online and in-person
            </p>
            </div>
          <div className="space-y-9 md:space-y-10 lg:space-y-12 max-w-[1600px] mx-auto">
              {eventsData
                .filter((event) => {
                  const nextDate = getNextEventDate(event.recurrence, event.time);
                  return nextDate !== null;
                })
                .map((event) => {
                const nextDate = getNextEventDate(event.recurrence, event.time);
                const formattedDate = formatEventDate(nextDate, event.time);
                const isOnline = event.format === 'Online';
                const isStudioMember = event.format === 'For Studio Members';
                const isFree = event.eventType === 'free';
                
                return (
                  <div 
                    key={event.id}
                    id={event.id}
                    className="group relative flex flex-col lg:flex-row overflow-hidden rounded-2xl border border-white/[0.12] hover:border-white/25 transition-colors duration-500 shadow-[0_0_60px_rgba(230,219,199,0.4)]"
                    style={{ 
                      minHeight: '340px',
                      background: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.98) 55%)'
                    }}
                  >
                    {/* Image - Left Side - Fills full card height */}
                    <div className="relative lg:w-[52%] h-[240px] lg:h-auto lg:min-h-full shrink-0 overflow-hidden">
                      <img 
                        src={event.image}
                        alt={event.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                      />
                      <div 
                        className="absolute inset-0 hidden lg:block" 
                        style={{
                          background: 'linear-gradient(to right, transparent 20%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.98) 100%)'
                        }}
                      />
                      <div 
                        className="absolute inset-0 lg:hidden" 
                        style={{
                          background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.98) 100%)'
                        }}
                      />
                    </div>
                    
                    {/* Content - Right Side */}
                    <div className="relative flex-1 flex flex-col justify-center p-6 md:p-8 lg:py-10 lg:px-10 lg:pl-6 bg-black/95 lg:bg-transparent">
                      
                      <div>
                        {/* Format Badge - Simplified */}
                        <div className="mb-5">
                          <span className="inline-flex items-center text-[11px] uppercase tracking-[0.14em] font-medium"
                            style={{ color: isStudioMember ? '#9B87F5' : isOnline ? 'rgb(74, 222, 128)' : '#D4A574' }}>
                            {isStudioMember 
                              ? `For Studio Members • Online${event.duration ? ` • ${event.duration}` : ''}` 
                              : isOnline 
                                ? (isFree ? `Free • IG Live • Weekly${event.duration ? ` • ${event.duration}` : ''}` : `Online • Monthly${event.duration ? ` • ${event.duration}` : ''}`) 
                                : `In-Person • Monthly${event.duration ? ` • ${event.duration}` : ''}`}
                          </span>
                        </div>
                        
                        {/* Title */}
                        <h2 className="font-editorial text-[clamp(1.5rem,2.4vw,2.1rem)] text-[#E6DBC7] font-light leading-[1.2] mb-3 tracking-[-0.01em]">
                          {event.title}
                        </h2>
                        
                        {/* Subtitle - Two lines max */}
                        <p className="font-editorial italic text-[14px] lg:text-[15px] text-[#E6DBC7]/65 mb-6 max-w-[340px] leading-[1.5]">
                          {event.subtitle}
                        </p>
                        
                        {/* Date Block */}
                        <div className="mb-2">
                          <p className="text-[10px] uppercase tracking-[0.16em] text-[#E6DBC7]/45 mb-1.5 font-medium">
                            Next Event
                          </p>
                          <p className="text-[15px] lg:text-[16px] text-[#E6DBC7] font-medium tracking-wide">
                            {formattedDate}
                          </p>
                        </div>
                        
                        {/* Cadence - Micro text */}
                        <p className="text-[11px] text-[#E6DBC7]/40 tracking-wide mb-5">
                          Occurs: {event.recurrenceLabel}
                          {event.venue && <span className="block mt-0.5 text-[#E6DBC7]/35">{event.venue}</span>}
                        </p>
                        
                        {/* Utility Icons */}
                        <div className="flex items-center gap-4">
                          <IconButton 
                            size="lg"
                            onClick={() => handleShare(event)}
                          >
                            <Share />
                          </IconButton>
                          
                          <Popover open={openCalendarId === event.id} onOpenChange={(open) => setOpenCalendarId(open ? event.id : null)}>
                            <PopoverTrigger asChild>
                              <IconButton size="lg">
                                <Calendar />
                              </IconButton>
                            </PopoverTrigger>
                            <PopoverContent 
                              className="w-auto p-0 bg-[#1A1A1A] border border-[#E6DBC7]/15 rounded-full shadow-lg"
                              align="start"
                              sideOffset={8}
                            >
                              <div className="flex items-center gap-0.5 px-3 py-2">
                                <button
                                  onClick={() => handleDownloadICal(event)}
                                  className="text-[#E6DBC7]/80 text-[12px] font-light tracking-wide hover:text-white transition-colors px-2.5 py-1 rounded-full hover:bg-white/5"
                                >
                                  iCal
                                </button>
                                <button
                                  onClick={() => handleGoogleCalendar(event)}
                                  className="text-[#E6DBC7]/80 text-[12px] font-light tracking-wide hover:text-white transition-colors px-2.5 py-1 rounded-full hover:bg-white/5"
                                >
                                  Google
                                </button>
                                <button
                                  onClick={() => handleOutlookCalendar(event)}
                                  className="text-[#E6DBC7]/80 text-[12px] font-light tracking-wide hover:text-white transition-colors px-2.5 py-1 rounded-full hover:bg-white/5"
                                >
                                  Outlook
                                </button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      
                      {/* CTA - Positioned below icons with right offset */}
                      <div className="flex justify-start mt-8 lg:mt-10 lg:ml-auto lg:mr-8">
                        <button 
                          onClick={() => handleBookEvent(event)}
                          className="px-10 py-2.5 rounded-full border border-[#E6DBC7]/30 text-[#E6DBC7] text-[13px] font-normal tracking-wide hover:border-[#E6DBC7]/50 hover:bg-white/[0.03] transition-colors duration-300"
                        >
                          {event.cta}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Divider */}
            <div className="h-[1px] w-full max-w-[1600px] mx-auto bg-[#E6DBC7] my-32 md:my-40 lg:my-48" />

            {/* More Ways to Practice */}
            <div className="max-w-[1600px] mx-auto space-y-20">
              <h2 className="font-editorial text-[#E6DBC7] text-left mb-4" style={{
                fontSize: 'clamp(2rem, 3.5vw, 3rem)'
              }}>
                More Ways to Practice
              </h2>

              {/* The Ripple Effect Card - Horizontal Layout */}
              <div 
                className="group relative flex flex-col md:flex-row overflow-hidden rounded-3xl cursor-pointer bg-black border border-[#E6DBC7]/20 shadow-[0_0_60px_rgba(230,219,199,0.4)] transition-colors duration-500"
                onClick={() => navigate('/online')}
                style={{ minHeight: '340px' }}
              >
                {/* Image Side */}
                <div className="relative md:w-[45%] h-[240px] md:h-auto shrink-0 overflow-hidden">
                  <img 
                    src={studioBreatheSilhouette} 
                    alt="Ripple Effect"
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
                <div className="relative flex-1 flex flex-col justify-center p-10 lg:p-12">
                  <p className="text-[#C89B5F] text-[11px] uppercase tracking-[0.15em] mb-4 font-medium">
                    Monthly Membership
                  </p>
                  <h3 className="font-editorial text-[clamp(1.8rem,2.5vw,2.4rem)] text-[#E6DBC7] font-light leading-[1.1] mb-5">
                    Ripple Effect
                  </h3>
                  <p className="text-[15px] md:text-[16px] text-[#E6DBC7]/75 mb-10 max-w-[440px] leading-[1.65]">
                    A monthly membership for short daily resets, guided practices, courses and live weekly sessions that help you stay grounded, clear, and connected.
                  </p>
                  <GlowButton>
                    Explore
                  </GlowButton>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <TermsMicrocopy />
        <Footer />
        
        {/* Event Booking Modal */}
        {selectedEvent && (
          <ExperienceBookingModal
            open={isBookingModalOpen}
            onClose={() => {
              setIsBookingModalOpen(false);
              setSelectedEvent(null);
            }}
            event={{
              id: selectedEvent.id,
              title: selectedEvent.title,
              subtitle: selectedEvent.subtitle,
              recurrence: selectedEvent.recurrence,
              time: selectedEvent.time,
            }}
          />
        )}
        
        <SubscriptionModal 
          open={isSubscriptionModalOpen} 
          onClose={() => setIsSubscriptionModalOpen(false)} 
        />
      </div>
    </ErrorBoundary>
  );
};

export default Experiences;

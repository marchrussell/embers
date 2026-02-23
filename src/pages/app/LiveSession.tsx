import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video } from "lucide-react";
import { Footer } from "@/components/Footer";
import OnlineFooter from "@/components/OnlineFooter";
import weeklyResetEvent from "@/assets/weekly-reset-event.jpg";
import liveSessionCountdownBg from "@/assets/live-session-countdown-bg.png";
import heroHandsSession from "@/assets/hero-hands-session.png";
import marchPortrait from "@/assets/march-portrait-casual.jpg";
import guestSessionBg from "@/assets/guest-session-bg.png";
import OnlineHeader from "@/components/OnlineHeader";
import { useNextGuestTeacher, formatGuestSessionDate, getNextThirdThursday } from "@/hooks/useNextGuestTeacher";

interface LiveSessionData {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  nextDate: string;
  teacher: string;
  teacherTitle?: string;
  teacherImage?: string;
  duration: string;
  time: string;
  whatToExpect?: string[];
}

const staticSessionsConfig: Record<string, LiveSessionData> = {
  'weekly-reset': {
    title: "Weekly Reset",
    subtitle: "Live every Tuesday",
    description: "A live weekly space with practices to pause, soothe your central nervous system, and come back home to yourself - wherever you are in the week.",
    image: weeklyResetEvent,
    nextDate: "Tuesday, December 31",
    teacher: "March",
    duration: "30 mins",
    time: "7:00 PM GMT"
  },
  'monthly-presence': {
    title: "Monthly Breath & Presence",
    subtitle: "First Saturday of each month",
    description: "A longer, spacious session to soften tension and reconnect with yourself.",
    image: heroHandsSession,
    nextDate: "Saturday, January 4",
    teacher: "March",
    duration: "90 mins",
    time: "10:00 AM GMT"
  }
};

const LiveSession = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  // Fetch next guest teacher for guest-session page
  const { teacher: nextGuestTeacher, loading: guestLoading } = useNextGuestTeacher();
  
  // Build session config dynamically
  const session: LiveSessionData | null = (() => {
    if (!sessionId) return null;
    
    if (sessionId === 'guest-session') {
      if (nextGuestTeacher) {
        return {
          title: nextGuestTeacher.session_title,
          subtitle: "3rd Thursday of every month",
          description: nextGuestTeacher.short_description || "A unique session featuring a guest teacher with fresh perspectives and new practices to explore.",
          image: nextGuestTeacher.photo_url || guestSessionBg,
          nextDate: formatGuestSessionDate(new Date(nextGuestTeacher.session_date)),
          teacher: nextGuestTeacher.name,
          teacherTitle: nextGuestTeacher.title,
          teacherImage: nextGuestTeacher.photo_url || undefined,
          duration: "1 hour",
          time: "7:30 PM GMT",
          whatToExpect: nextGuestTeacher.what_to_expect,
        };
      }
      // Fallback when no guest teacher is scheduled
      return {
        title: "Guest Session",
        subtitle: "3rd Thursday of every month",
        description: "A unique session featuring a guest teacher with fresh perspectives and new practices to explore.",
        image: guestSessionBg,
        nextDate: formatGuestSessionDate(getNextThirdThursday()),
        teacher: "Guest Teacher",
        duration: "1 hour",
        time: "7:30 PM GMT",
      };
    }
    
    return staticSessionsConfig[sessionId] || null;
  })();

  // Calculate countdown to next session
  useEffect(() => {
    if (!session) return;

    const calculateCountdown = () => {
      const now = new Date();
      let targetDate = new Date();
      
      if (sessionId === 'weekly-reset') {
        // Tuesday is day 2 (0=Sunday, 1=Monday, 2=Tuesday, etc.)
        const daysUntilTuesday = (2 - now.getDay() + 7) % 7 || 7;
        targetDate = new Date(now);
        targetDate.setDate(now.getDate() + daysUntilTuesday);
        targetDate.setHours(19, 0, 0, 0);
      } else if (sessionId === 'monthly-presence') {
        targetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        while (targetDate.getDay() !== 6) {
          targetDate.setDate(targetDate.getDate() + 1);
        }
        targetDate.setHours(10, 0, 0, 0);
      } else if (sessionId === 'guest-session' && nextGuestTeacher) {
        targetDate = new Date(nextGuestTeacher.session_date);
      } else {
        targetDate = getNextThirdThursday();
      }

      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [session, sessionId, nextGuestTeacher]);

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-[#E6DBC7]">Session not found</p>
      </div>
    );
  }

  const isLive = countdown.days === 0 && countdown.hours === 0 && countdown.minutes <= 5;
  const teacherImage = session.teacherImage || (sessionId === 'guest-session' ? session.image : marchPortrait);
  const whatToExpectItems = session.whatToExpect || [
    "A guided, voice-led practice",
    "You can sit, lie down, or simply listen",
    "Camera and microphone are not used",
    "You're welcome to arrive late or leave early"
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <OnlineHeader />
      
      {/* Hero Section - matches StartHere layout */}
      <div className="relative h-[500px] z-10 mt-[340px] md:mt-[380px]">
        <img 
          src={session.image}
          alt={session.title}
          className="absolute inset-0 w-full h-full object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        
        <div className="relative h-full flex items-end justify-center px-6 md:px-10 lg:px-12 pb-14">
          <div className="text-center">
            <p className="text-[#D4A574] text-sm tracking-[0.15em] uppercase font-light mb-3">
              {session.subtitle}
            </p>
            <h1 className="text-5xl md:text-6xl font-editorial text-[#E6DBC7]">
              {session.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Meta info - between title and description */}
      <div className="flex items-center justify-center gap-8 text-base text-[#E6DBC7]/60 pt-10 pb-6 px-6">
        <span className="flex items-center gap-3">
          <Clock className="w-5 h-5" />
          {session.duration}
        </span>
        <span className="flex items-center gap-3">
          <Calendar className="w-5 h-5" />
          Every Tuesday at {session.time}
        </span>
      </div>

      {/* Description - italic editorial style like category pages */}
      <div className="px-6 md:px-10 lg:px-12 pt-6 pb-16">
        <p className="text-xl md:text-2xl lg:text-3xl font-editorial italic text-[#E6DBC7]/70 leading-relaxed max-w-4xl mx-auto text-center">
          {session.description}
        </p>
      </div>

      {/* Main Content */}
      <div className="px-6 md:px-10 lg:px-12 pb-24">
        <div className="max-w-4xl mx-auto">

          {/* Facilitator and What to expect - connected layout */}
          <div className="mt-32 mb-32 flex flex-col md:flex-row rounded-2xl overflow-hidden">
          {/* Image on the left - height determined by content */}
            <div className="md:w-1/2 flex-shrink-0 relative border-t border-l border-b border-[#E6DBC7]/20 md:border-r-0 rounded-l-2xl overflow-hidden">
              <img 
                src={teacherImage} 
                alt={session.teacher}
                className="w-full h-80 md:h-full md:absolute md:inset-0 object-cover object-[center_40%]"
              />
            </div>
            
            {/* What to expect box on the right - black background with border on 3 sides */}
            <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-black border-t border-r border-b border-[#E6DBC7]/20 md:border-l-0 md:rounded-r-2xl">
              <div>
                <h3 className="text-2xl md:text-3xl font-editorial text-[#E6DBC7] mb-2">
                  What to expect
                </h3>
                <p className="text-xs text-[#D4A574] tracking-[0.15em] uppercase font-light mb-6">
                  Held live by {session.teacher}
                </p>
                <ul className="space-y-3 text-sm text-[#E6DBC7]/70 font-light">
                  {whatToExpectItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-[#E6DBC7]/40 mt-0.5">–</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Countdown / Status Box - video container size with 16:9 aspect ratio */}
        <div>
          <div className="relative overflow-hidden rounded-2xl border border-[#E6DBC7]/10 aspect-[16/9] max-w-6xl mx-auto flex items-center justify-center">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-[length:100%_100%] bg-center"
              style={{ backgroundImage: `url('${liveSessionCountdownBg}')` }}
            />
            {/* Glassmorphism Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            {isLive ? (
              <div className="relative z-10 text-center p-8">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Video className="w-6 h-6 text-red-500 animate-pulse" />
                  <span className="text-xl md:text-2xl font-editorial text-[#E6DBC7]">We're Live</span>
                </div>
                <p className="text-[#E6DBC7]/70 font-light mb-8">
                  The session is open now. Join when you're ready.
                </p>
                <Button className="bg-[#E6DBC7] text-[#1A1A1A] hover:bg-[#E6DBC7]/90 px-12 py-6 text-base font-medium rounded-full">
                  Join Live Session
                </Button>
              </div>
            ) : (
              <div className="relative z-10 text-center p-8">
                <p className="text-sm text-[#E6DBC7]/40 font-light mb-6">
                  Next live gathering begins in
                </p>
                
                {/* Countdown */}
                <div className="flex items-center justify-center gap-4 md:gap-8 mb-8">
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl lg:text-6xl font-editorial text-[#E6DBC7] mb-1">
                      {String(countdown.days).padStart(2, '0')}
                    </div>
                    <p className="text-xs text-[#E6DBC7]/40 font-light tracking-wider uppercase">Days</p>
                  </div>
                  <span className="text-2xl md:text-3xl text-[#E6DBC7]/30">:</span>
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl lg:text-6xl font-editorial text-[#E6DBC7] mb-1">
                      {String(countdown.hours).padStart(2, '0')}
                    </div>
                    <p className="text-xs text-[#E6DBC7]/40 font-light tracking-wider uppercase">Hours</p>
                  </div>
                  <span className="text-2xl md:text-3xl text-[#E6DBC7]/30">:</span>
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl lg:text-6xl font-editorial text-[#E6DBC7] mb-1">
                      {String(countdown.minutes).padStart(2, '0')}
                    </div>
                    <p className="text-xs text-[#E6DBC7]/40 font-light tracking-wider uppercase">Mins</p>
                  </div>
                  <span className="text-2xl md:text-3xl text-[#E6DBC7]/30">:</span>
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl lg:text-6xl font-editorial text-[#E6DBC7] mb-1">
                      {String(countdown.seconds).padStart(2, '0')}
                    </div>
                    <p className="text-xs text-[#E6DBC7]/40 font-light tracking-wider uppercase">Secs</p>
                  </div>
                </div>

                <p className="text-[#E6DBC7]/50 font-light mb-2">
                  Next session: <span className="text-[#E6DBC7]/70">{session.nextDate}</span> at <span className="text-[#E6DBC7]/70">{session.time}</span>
                </p>
                <p className="text-sm text-[#E6DBC7]/35 font-light">
                  When we go live, the session will open here — no separate link needed.
                </p>
              </div>
            )}
          </div>

          {/* Reassurance line */}
          <p className="text-sm text-[#E6DBC7]/35 font-light text-center mt-6">
            If you miss this one, you can return next week — nothing to catch up on.
          </p>
        </div>
      </div>

      <OnlineFooter />
      <Footer />
    </div>
  );
};

export default LiveSession;

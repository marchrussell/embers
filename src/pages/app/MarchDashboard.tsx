import { useEffect, useState, useRef, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { IconButton } from "@/components/ui/icon-button";
import { toast } from "@/hooks/use-toast";
import { TrendingUp, ArrowRight, RefreshCw, MessageCircle, Loader2 } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { useSessionRecommendations } from "@/hooks/useSessionRecommendations";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChatInput } from "@/components/march/ChatInput";
import { ChatMessage } from "@/components/march/ChatMessage";
import { TypingIndicator } from "@/components/march/TypingIndicator";
import SessionDetailModal from "@/pages/app/SessionDetail";
import { SubscriptionModal } from "@/components/modals/LazyModals";
import { WeeklyInsights } from "@/components/WeeklyInsights";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import dashboardBackground from "@/assets/explore-background.png";
import marchHeroImage from "@/assets/march-hero-golden.jpg";
import glowingCircle from "@/assets/march-glowing-circle.png";
import marchHeroOrangeFlowers from "@/assets/march-hero-orange-flowers.jpg";
import featherTexture from "@/assets/feather-texture.jpg";

export default function MarchDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [todaySession, setTodaySession] = useState<any>(null);
  const [alternativeSessions, setAlternativeSessions] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [moodScore, setMoodScore] = useState([3]);
  const [weeklyStreak, setWeeklyStreak] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [thisMonthSessions, setThisMonthSessions] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [moodTrend, setMoodTrend] = useState<'improving' | 'stable' | 'declining' | null>(null);
  const [showSwapDialog, setShowSwapDialog] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: "Hi there 🤎 This is March Chat which is here to help you build and sustain your practice.\n\nTo give you the most helpful guidance, I'd love to understand where you are today; emotionally, mentally, and physically. Knowing how you're feeling helps me tailor recommendations and keep you supported along the way.\n\nI'm not a therapist, but I'm here to offer steady accountability, structure, and kindness as you work toward your goals.\n\nSo, how are you feeling today?",
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { 
    getTodayRecommendation, 
    getAlternativeRecommendations,
    getRecommendedSessions,
    isLoading: recommendationsLoading 
  } = useSessionRecommendations();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    checkOnboardingAndLoadData();
    
    // Safety timeout - force loading to false after 8 seconds
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn('MarchDashboard: Safety timeout triggered');
        setIsLoading(false);
      }
    }, 8000);
    
    return () => clearTimeout(safetyTimeout);
  }, [user]);

  const checkOnboardingAndLoadData = async () => {
    if (!user) return;

    try {
      // Check onboarding status
      const { data: onboarding, error: onboardingError } = await supabase
        .from("user_onboarding")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (onboardingError) throw onboardingError;

      if (!onboarding || !onboarding.onboarding_completed) {
        navigate("/onboarding/march");
        return;
      }

      setOnboardingData(onboarding);

      // Load today's recommended session
      await loadTodaySession();

      // Load upcoming sessions (next 2 recommendations)
      await loadUpcomingSessions();

      // Calculate weekly streak and total sessions
      const { data: progress, error: progressError } = await supabase
        .from("user_progress")
        .select("completed_at, completed, class_id")
        .eq("user_id", user.id)
        .eq("completed", true)
        .order("completed_at", { ascending: true });

      if (!progressError && progress) {
        // Weekly sessions
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const weeklySessions = progress.filter(p => 
          p.completed_at && new Date(p.completed_at) >= weekAgo
        );
        setWeeklyStreak(weeklySessions.length);
        
        // Total sessions ever
        setTotalSessions(progress.length);
        
        // This month's sessions
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const monthSessions = progress.filter(p => 
          p.completed_at && new Date(p.completed_at) >= startOfMonth
        );
        setThisMonthSessions(monthSessions.length);

        // Calculate current streak (consecutive days)
        const completedDates = progress
          .map(p => new Date(p.completed_at).toDateString())
          .filter((date, index, self) => self.indexOf(date) === index)
          .sort();

        let streak = 0;
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        // Check if current streak is active
        if (completedDates.includes(today) || completedDates.includes(yesterday)) {
          for (let i = completedDates.length - 1; i >= 0; i--) {
            const currentDate = new Date(completedDates[i]);
            const previousDate = i > 0 ? new Date(completedDates[i - 1]) : null;
            
            if (previousDate) {
              const diffDays = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
              if (diffDays === 1) {
                streak++;
              } else {
                break;
              }
            }
          }
          setCurrentStreak(streak + 1); // +1 for the starting day
        }

        // Calculate total minutes
        const classIds = progress.map(p => p.class_id);
        const { data: classesData } = await supabase
          .from('classes')
          .select('id, duration_minutes')
          .in('id', classIds);

        const minutes = classesData?.reduce((sum, cls) => sum + (cls.duration_minutes || 0), 0) || 0;
        setTotalMinutes(minutes);
      }

      // Calculate mood trend - show even with limited data
      const { data: moodLogs, error: moodError } = await supabase
        .from("user_mood_logs")
        .select("mood_score, logged_at")
        .eq("user_id", user.id)
        .gte("logged_at", new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
        .order("logged_at", { ascending: true });

      if (!moodError && moodLogs && moodLogs.length >= 2) {
        // Calculate average mood for each period
        const lastMonth = moodLogs.filter(m => {
          const logDate = new Date(m.logged_at);
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          return logDate >= thirtyDaysAgo;
        });
        
        const previousMonth = moodLogs.filter(m => {
          const logDate = new Date(m.logged_at);
          const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          return logDate >= sixtyDaysAgo && logDate < thirtyDaysAgo;
        });

        // Show trend if we have data from both periods
        if (lastMonth.length > 0 && previousMonth.length > 0) {
          const lastMonthAvg = lastMonth.reduce((sum, m) => sum + m.mood_score, 0) / lastMonth.length;
          const prevMonthAvg = previousMonth.reduce((sum, m) => sum + m.mood_score, 0) / previousMonth.length;
          
          const difference = lastMonthAvg - prevMonthAvg;
          
          if (difference > 0.3) {
            setMoodTrend('improving');
          } else if (difference < -0.3) {
            setMoodTrend('declining');
          } else {
            setMoodTrend('stable');
          }
        } else if (lastMonth.length > 0) {
          // If we only have recent data, show as stable
          setMoodTrend('stable');
        }
      }
    } catch (error) {
      console.error("❌ [MarchDashboard] Error loading dashboard:", error);
      toast({
        title: "Error loading dashboard",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      console.log("✅ [MarchDashboard] Loading complete");
      setIsLoading(false);
    }
  };

  const loadTodaySession = async () => {
    const session = await getTodayRecommendation();
    if (session) {
      setTodaySession(session);
    }
  };

  const loadUpcomingSessions = async () => {
    const sessions = await getRecommendedSessions({});
    setUpcomingSessions(sessions.slice(1, 3)); // Get 2nd and 3rd recommendations
  };

  const handleSwapSession = async () => {
    if (!todaySession) return;
    
    setIsSwapping(true);
    setShowSwapDialog(true);
    
    // Get alternative recommendations
    const alternatives = await getAlternativeRecommendations(todaySession.id);
    setAlternativeSessions(alternatives);
    setIsSwapping(false);
  };

  const selectAlternativeSession = (sessionId: string) => {
    setShowSwapDialog(false);
    setSelectedSessionId(sessionId);
  };

  const handleMoodSubmit = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_mood_logs")
        .insert({
          user_id: user.id,
          mood_score: moodScore[0],
        });

      if (error) throw error;

      toast({
        title: "Mood logged",
        description: "Thank you for checking in 💛",
      });
    } catch (error) {
      console.error("Error logging mood:", error);
      toast({
        title: "Error logging mood",
        variant: "destructive",
      });
    }
  };

  const handleStartSession = () => {
    if (todaySession) {
      setSelectedSessionId(todaySession.id);
    }
  };

  const streamChat = async (userMessage: string) => {
    const newMessages = [...chatMessages, { role: "user" as const, content: userMessage }];
    setChatMessages(newMessages);
    setIsChatLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/march-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: newMessages }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let assistantMessage = "";
      let textBuffer = "";

      setChatMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantMessage += content;
              setChatMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantMessage };
                return updated;
              });
            }
          } catch (e) {
            console.error("Error parsing SSE:", e);
          }
        }
      }

      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (error: any) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get response from March chat",
        variant: "destructive",
      });
      setChatMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsChatLoading(false);
    }
  };

  if (isLoading || recommendationsLoading) {
    return <DashboardSkeleton variant="march" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Clean black background */}
      <div className="fixed inset-0 -z-10 bg-black" />

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(10px, -15px) scale(1.02); }
          50% { transform: translate(-8px, -10px) scale(0.98); }
          75% { transform: translate(12px, 8px) scale(1.01); }
        }
        
        @keyframes float-slower {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-12px, 10px) scale(1.01); }
          66% { transform: translate(8px, -12px) scale(0.99); }
        }
        
        @keyframes float-gentle {
          0%, 100% { transform: translate(0, 0) scale(1); }
          20% { transform: translate(6px, -8px) scale(1.01); }
          40% { transform: translate(-10px, 6px) scale(0.99); }
          60% { transform: translate(8px, 10px) scale(1.02); }
          80% { transform: translate(-6px, -6px) scale(0.98); }
        }
      `}</style>
      
      <NavBar />
      
      <div className="min-h-screen pb-24">
        {/* Spacer for navbar with back button */}
        <div className="h-[240px] md:h-[284px] bg-background flex items-end px-4 md:px-6 pb-6 md:pb-8">
          <button 
            onClick={() => navigate("/studio")}
            className="text-white/80 hover:text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-base md:text-lg font-light tracking-wide">Back to App Library</span>
          </button>
        </div>

        {/* Hero Image Section - Full Width */}
        <div className="relative h-[280px] z-10">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${marchHeroOrangeFlowers})` }}
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
          
          {/* Centered Title */}
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-editorial text-[#E6DBC7] px-4 text-center">
              Welcome to March Chat
            </h1>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="container max-w-5xl mx-auto px-4 md:px-6 pt-16 pb-16">
          <div className="max-w-4xl mx-auto text-lg md:text-xl text-[#E6DBC7]/90 font-light leading-relaxed text-center">
            <p className="font-editorial italic">This is a carefully curated service to help you find your rhythm. This is here to help you stay connected to yourself through simple, consistent practice, and feel supported along the way. I'll offer guidance, structure, and suggestions based on what you need most. This is a supportive service, not a therapist, and I can't replace professional care, but I'm here to support you with kindness, practicality, and presence. If you're ever struggling or in distress, please reach out to a trusted person or professional, you don't have to go through that alone.</p>
          </div>
        </div>

        <main className="container max-w-5xl mx-auto px-4 md:px-6 pt-12 md:pt-20">

          {/* How are you feeling today - Glassmorphism Box with mood slider and chat */}
          <div className="mb-24 mx-auto">
            <div className="max-w-4xl mx-auto relative rounded-2xl overflow-hidden border-2 border-white/30">
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${featherTexture})` }}
              />
              
              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
              
              {/* Content */}
              <div className="relative p-8 md:p-10">
              <h2 className="text-2xl md:text-3xl font-editorial text-[#E6DBC7] mb-6">How are you feeling today?</h2>
              
              {/* Mood Slider */}
              <div className="mb-8 space-y-6">
                <div className="flex justify-between text-2xl md:text-3xl px-2">
                  <span>😔</span>
                  <span>🙂</span>
                  <span>🌞</span>
                </div>
                <Slider
                  value={moodScore}
                  onValueChange={setMoodScore}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <button 
                  onClick={handleMoodSubmit}
                  className="relative inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-light tracking-wide text-[#E6DBC7] bg-white/[0.05] backdrop-blur-md border border-[#E6DBC7]/30 hover:border-[#EC9037] hover:shadow-[0_0_20px_rgba(236,144,55,0.5),0_0_35px_rgba(236,144,55,0.2)] rounded-full transition-[border-color,box-shadow] duration-300 w-full md:w-auto"
                >
                  Log mood
                </button>
              </div>

              {/* Quick emotion buttons */}
              <div className="mb-8">
                <p className="text-sm md:text-base text-[#E6DBC7]/70 font-light mb-4">Or tell me what's going on</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => streamChat("I'm feeling stressed, scattered, and overwhelmed with too much to handle")}
                    className="px-4 py-2 text-xs md:text-sm font-light bg-white/5 hover:bg-white/10 text-[#E6DBC7]/80 hover:text-[#E6DBC7] border border-[#E6DBC7]/20 hover:border-[#EC9037] hover:shadow-[0_0_20px_rgba(236,144,55,0.5),0_0_35px_rgba(236,144,55,0.2)] rounded-full transition-all"
                  >
                    😓 Overwhelmed
                  </button>
                  <button
                    onClick={() => streamChat("My mind is racing with anxious thoughts and I'm having trouble focusing")}
                    className="px-4 py-2 text-xs md:text-sm font-light bg-white/5 hover:bg-white/10 text-[#E6DBC7]/80 hover:text-[#E6DBC7] border border-[#E6DBC7]/20 hover:border-[#EC9037] hover:shadow-[0_0_20px_rgba(236,144,55,0.5),0_0_35px_rgba(236,144,55,0.2)] rounded-full transition-all"
                  >
                    🌀 Mind racing
                  </button>
                  <button
                    onClick={() => streamChat("I'm feeling anxious with worry and tension throughout my body")}
                    className="px-4 py-2 text-xs md:text-sm font-light bg-white/5 hover:bg-white/10 text-[#E6DBC7]/80 hover:text-[#E6DBC7] border border-[#E6DBC7]/20 hover:border-[#EC9037] hover:shadow-[0_0_20px_rgba(236,144,55,0.5),0_0_35px_rgba(236,144,55,0.2)] rounded-full transition-all"
                  >
                    😰 Anxious
                  </button>
                  <button
                    onClick={() => streamChat("I'm having trouble falling asleep and my mind is racing at night")}
                    className="px-4 py-2 text-xs md:text-sm font-light bg-white/5 hover:bg-white/10 text-[#E6DBC7]/80 hover:text-[#E6DBC7] border border-[#E6DBC7]/20 hover:border-[#EC9037] hover:shadow-[0_0_20px_rgba(236,144,55,0.5),0_0_35px_rgba(236,144,55,0.2)] rounded-full transition-all"
                  >
                    😴 Can't sleep
                  </button>
                  <button
                    onClick={() => streamChat("I'm feeling tired, sluggish, and lacking motivation or energy")}
                    className="px-4 py-2 text-xs md:text-sm font-light bg-white/5 hover:bg-white/10 text-[#E6DBC7]/80 hover:text-[#E6DBC7] border border-[#E6DBC7]/20 hover:border-[#EC9037] hover:shadow-[0_0_20px_rgba(236,144,55,0.5),0_0_35px_rgba(236,144,55,0.2)] rounded-full transition-all"
                  >
                    ⚡ Tired
                  </button>
                  <button
                    onClick={() => streamChat("I feel disconnected, numb, flat, and withdrawn from myself and others")}
                    className="px-4 py-2 text-xs md:text-sm font-light bg-white/5 hover:bg-white/10 text-[#E6DBC7]/80 hover:text-[#E6DBC7] border border-[#E6DBC7]/20 hover:border-[#EC9037] hover:shadow-[0_0_20px_rgba(236,144,55,0.5),0_0_35px_rgba(236,144,55,0.2)] rounded-full transition-all"
                  >
                    🌊 Disconnected
                  </button>
                  <button
                    onClick={() => streamChat("I'm feeling sad with a low mood and emotional heaviness")}
                    className="px-4 py-2 text-xs md:text-sm font-light bg-white/5 hover:bg-white/10 text-[#E6DBC7]/80 hover:text-[#E6DBC7] border border-[#E6DBC7]/20 hover:border-[#EC9037] hover:shadow-[0_0_20px_rgba(236,144,55,0.5),0_0_35px_rgba(236,144,55,0.2)] rounded-full transition-all"
                  >
                    💭 Sad
                  </button>
                  <button
                    onClick={() => streamChat("I need a reset / lift - something to shift my energy and help me feel more grounded and present")}
                    className="px-4 py-2 text-xs md:text-sm font-light bg-white/5 hover:bg-white/10 text-[#E6DBC7]/80 hover:text-[#E6DBC7] border border-[#E6DBC7]/20 hover:border-[#EC9037] hover:shadow-[0_0_20px_rgba(236,144,55,0.5),0_0_35px_rgba(236,144,55,0.2)] rounded-full transition-all"
                  >
                    🔄 Need a reset / lift
                  </button>
                </div>
              </div>

              {/* Integrated Chat Interface */}
              <div className="border-t border-[#E6DBC7]/10 pt-6">
                {/* Chat Messages */}
                <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                  {chatMessages.map((msg, index) => (
                    <ChatMessage 
                      key={index} 
                      message={msg.content}
                      isFromMarch={msg.role === "assistant"}
                    />
                  ))}
                  {isChatLoading && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <ChatInput onSend={streamChat} disabled={isChatLoading} />
              </div>
              </div>
            </div>
          </div>

          {/* Today's Suggested Session - Only shown if exists */}
          {todaySession && (
            <div className="mb-24 border-t border-[#E6DBC7]/10 pt-16 mx-auto">
              <div className="max-w-4xl mx-auto relative rounded-2xl overflow-hidden border-2 border-white/30">
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-20"
                  style={{ backgroundImage: `url(${featherTexture})` }}
                />
                
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                
                {/* Content */}
                <div className="relative p-8 md:p-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl md:text-3xl font-editorial text-[#E6DBC7]">
                      Suggested for You
                    </h3>
                    <button
                      onClick={handleSwapSession}
                      className="text-xs md:text-sm font-light text-[#E6DBC7]/70 hover:text-[#E6DBC7] transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="h-3 h-3 md:h-4 md:w-4" />
                      See alternatives
                    </button>
                  </div>
                  <p className="text-sm text-[#E6DBC7]/70 font-light mb-6">Based on your chat and preferences</p>
                  
                  {/* Nested Session Card */}
                  <div className="rounded-2xl overflow-hidden relative group cursor-pointer hover:scale-[1.02] transition-transform duration-300 border-2 border-white/30">
                    {/* Background image with less blur */}
                    {todaySession.image_url && (
                      <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ 
                          backgroundImage: `url(${todaySession.image_url})`,
                        }}
                      />
                    )}
                    
                    {/* Gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
                    
                    {/* Content */}
                    <div className="relative p-8 md:p-10">
                      {/* Category Tag */}
                      {todaySession.focus_tags && todaySession.focus_tags.length > 0 && (
                        <p className="text-xs font-light tracking-[0.2em] uppercase mb-4 text-[#EC9037]">
                          {todaySession.focus_tags[0]}
                        </p>
                      )}
                      
                      {/* Title */}
                      <h4 className="text-3xl md:text-4xl font-editorial text-white mb-4 leading-tight">
                        {todaySession.title}
                      </h4>
                      
                      {/* Meta Info */}
                      <div className="flex items-center gap-2 text-sm text-white/80 font-light mb-6">
                        <span>{todaySession.teacher_name || 'March Russell'}</span>
                        <span>•</span>
                        <span>{todaySession.duration_minutes} min</span>
                        {todaySession.technique && (
                          <>
                            <span>•</span>
                            <span>Technique</span>
                          </>
                        )}
                      </div>
                      
                      {/* Description */}
                      <p className="text-base text-white/90 font-light leading-relaxed mb-8">
                        {todaySession.short_description || todaySession.description}
                      </p>

                      {/* Action buttons */}
                      <div className="flex items-center gap-4">
                        {/* Start Session Button */}
                        <button 
                          onClick={handleStartSession}
                          className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-light tracking-wide text-white bg-white/10 backdrop-blur-md border border-white/30 hover:border-white hover:bg-white/20 rounded-full transition-colors duration-300"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          Start Practice
                        </button>
                        
                        {/* Icon buttons */}
                        <IconButton variant="white" size="xl">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </IconButton>
                        
                        <IconButton variant="white" size="xl">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </IconButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress Section */}
          {(weeklyStreak > 0 || totalSessions > 0) && (
            <div className="mb-24 border-t border-[#E6DBC7]/10 pt-16 mx-auto">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-xl md:text-2xl font-editorial text-[#E6DBC7] mb-8">
                  Your Progress
                </h3>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white/[0.02] backdrop-blur-md border-2 border-white/30 rounded-lg p-4">
                    <p className="text-3xl md:text-4xl font-editorial text-[#E6DBC7] mb-1">{weeklyStreak}</p>
                    <p className="text-xs text-[#E6DBC7]/60 font-light">this week</p>
                  </div>
                  <div className="bg-white/[0.02] backdrop-blur-md border-2 border-white/30 rounded-lg p-4">
                    <p className="text-3xl md:text-4xl font-editorial text-[#E6DBC7] mb-1">{thisMonthSessions}</p>
                    <p className="text-xs text-[#E6DBC7]/60 font-light">this month</p>
                  </div>
                  <div className="bg-white/[0.02] backdrop-blur-md border-2 border-white/30 rounded-lg p-4">
                    <p className="text-3xl md:text-4xl font-editorial text-[#E6DBC7] mb-1">{currentStreak}</p>
                    <p className="text-xs text-[#E6DBC7]/60 font-light">day streak</p>
                  </div>
                  <div className="bg-white/[0.02] backdrop-blur-md border-2 border-white/30 rounded-lg p-4">
                    <p className="text-3xl md:text-4xl font-editorial text-[#E6DBC7] mb-1">{totalMinutes}</p>
                    <p className="text-xs text-[#E6DBC7]/60 font-light">total minutes</p>
                  </div>
                </div>
                
                {/* Weekly Streak Visualization */}
                {weeklyStreak > 0 && (
                  <div className="mb-8">
                    <p className="text-sm text-[#E6DBC7]/70 font-light mb-4">This week's sessions</p>
                    <div className="flex gap-2">
                      {[...Array(7)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-10 md:h-12 flex-1 rounded ${
                            i < weeklyStreak 
                              ? "bg-[#d4915e]/70" 
                              : "bg-[#E6DBC7]/10"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Mood Trend */}
                {moodTrend && (
                  <div className="bg-white/[0.02] backdrop-blur-md border-2 border-white/30 rounded-lg p-4 md:p-6 mb-8">
                    <p className="text-sm text-[#E6DBC7]/70 font-light mb-2">Mood over last month</p>
                    {moodTrend === 'improving' && (
                      <p className="text-sm md:text-base text-[#E6DBC7] font-light leading-relaxed">
                        Your mood's been trending upward. Keep going—consistency is working.
                      </p>
                    )}
                    {moodTrend === 'stable' && (
                      <p className="text-sm md:text-base text-[#E6DBC7] font-light leading-relaxed">
                        You're staying steady. That's real progress, even when it doesn't feel dramatic.
                      </p>
                    )}
                    {moodTrend === 'declining' && (
                      <p className="text-sm md:text-base text-[#E6DBC7] font-light leading-relaxed">
                        Things have been tough lately. That's okay—keep showing up, even if it's just for a few minutes. If you need more support, please reach out to someone you trust.
                      </p>
                    )}
                  </div>
                )}

                {/* Weekly Insights */}
                <div className="mb-8">
                  <WeeklyInsights />
                </div>

                {/* Supportive message */}
                {weeklyStreak > 0 && (
                  <p className="text-sm text-[#E6DBC7]/60 font-light italic text-center">
                    {weeklyStreak === 1 ? "You started. That matters." : weeklyStreak < 3 ? "You're building something here." : "You're really showing up for yourself."}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Upcoming Sessions Queue */}
          {upcomingSessions.length > 0 && (
            <div className="mb-24 border-t border-[#E6DBC7]/10 pt-16 mx-auto">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-xl md:text-2xl font-editorial text-[#E6DBC7] mb-6">
                  Coming Up Next
                </h3>
                <p className="text-sm text-[#E6DBC7]/70 font-light mb-8">Your personalized queue</p>
                
                <div className="space-y-4">
                  {upcomingSessions.map((session, index) => (
                    <div 
                      key={session.id}
                      onClick={() => setSelectedSessionId(session.id)}
                      className="group flex gap-4 p-4 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-[#E6DBC7]/10 hover:border-[#E6DBC7]/20 transition-all cursor-pointer"
                    >
                      {session.image_url && (
                        <div className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0">
                          <img 
                            src={session.image_url} 
                            alt={session.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#E6DBC7]/50 font-light mb-1">
                          {index === 0 ? "Tomorrow's suggestion" : "Later this week"}
                        </p>
                        <h4 className="text-base md:text-lg font-editorial text-[#E6DBC7] mb-1 truncate">{session.title}</h4>
                        <p className="text-xs md:text-sm text-[#E6DBC7]/60 font-light">
                          {session.duration_minutes} min • {session.teacher_name}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#E6DBC7]/40 group-hover:text-[#E6DBC7] group-hover:translate-x-1 transition-all self-center" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Time-Based Practice Suggestions */}
          <div className="mb-16 border-t border-[#E6DBC7]/10 pt-12">
            <div className="max-w-3xl">
              <h3 className="text-xl md:text-2xl font-editorial text-[#E6DBC7] mb-6">
                When to Practice
              </h3>
              <p className="text-sm text-[#E6DBC7]/70 font-light mb-8">
                Let me know your schedule in chat to get time-specific recommendations
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 rounded-lg bg-gradient-to-br from-[#d4915e]/10 to-transparent border border-[#d4915e]/20">
                  <p className="text-lg font-editorial text-[#d4915e] mb-2">☀️ Morning</p>
                  <p className="text-sm text-[#E6DBC7]/60 font-light">Energizing practices to start grounded</p>
                </div>
                <div className="p-6 rounded-lg bg-gradient-to-br from-[#e8a57a]/10 to-transparent border border-[#e8a57a]/20">
                  <p className="text-lg font-editorial text-[#e8a57a] mb-2">🌤️ Midday</p>
                  <p className="text-sm text-[#E6DBC7]/60 font-light">Quick resets when you need a pause</p>
                </div>
                <div className="p-6 rounded-lg bg-gradient-to-br from-[#c97a4f]/10 to-transparent border border-[#c97a4f]/20">
                  <p className="text-lg font-editorial text-[#c97a4f] mb-2">🌙 Evening</p>
                  <p className="text-sm text-[#E6DBC7]/60 font-light">Calming practices to unwind</p>
                </div>
              </div>
            </div>
          </div>

          {/* Supportive Message */}
          <div className="mb-16 border-t border-[#E6DBC7]/10 pt-12">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-base md:text-lg text-[#E6DBC7]/80 font-light leading-relaxed italic mb-8">
                "Show up for yourself, not for perfection. One intentional breath at a time, you're reconnecting, grounding, and becoming more yourself."
              </p>
              <p className="text-sm text-[#E6DBC7]/50 font-light">— March chat</p>
            </div>
          </div>
        </main>
      </div>

      <Footer />

      {/* Swap Dialog */}
      <Dialog open={showSwapDialog} onOpenChange={setShowSwapDialog}>
        <DialogContent className="backdrop-blur-xl bg-black/30 border border-white/30 max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle>Choose a Different Session</DialogTitle>
            <DialogDescription>
              Here are some alternative recommendations based on your preferences
            </DialogDescription>
          </DialogHeader>
          
          {isSwapping ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : alternativeSessions.length > 0 ? (
            <div className="space-y-3">
              {alternativeSessions.map((session) => {
                const technique = session.focus_tags?.[0] 
                  ? session.focus_tags[0].charAt(0).toUpperCase() + session.focus_tags[0].slice(1)
                  : 'Breathwork';
                
                return (
                  <div
                    key={session.id}
                    className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => selectAlternativeSession(session.id)}
                  >
                    {session.image_url && (
                      <div className="relative w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                        <img 
                          src={session.image_url} 
                          alt={session.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold mb-1 text-base">{session.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {session.teacher_name} • {session.duration_minutes} min • {technique}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {session.short_description || session.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No alternative sessions available right now
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Session Detail Modal */}
      <SessionDetailModal
        sessionId={selectedSessionId}
        open={!!selectedSessionId}
        onClose={() => setSelectedSessionId(null)}
        onShowSubscription={() => setShowSubscriptionModal(true)}
        isFeaturedClass={false}
      />

      {/* Subscription Modal */}
      <Suspense fallback={null}>
        <SubscriptionModal
          open={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
        />
      </Suspense>
    </div>
  );
}
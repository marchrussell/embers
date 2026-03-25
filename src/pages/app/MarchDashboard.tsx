import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import featherTexture from "@/assets/feather-texture.jpg";
import marchHeroOrangeFlowers from "@/assets/march-hero-orange-flowers.jpg";
import { Footer } from "@/components/Footer";
import { ChatInput } from "@/components/march/ChatInput";
import { ChatMessage } from "@/components/march/ChatMessage";
import { TypingIndicator } from "@/components/march/TypingIndicator";
import { SubscriptionModal } from "@/components/modals/LazyModals";
import { NavBar } from "@/components/NavBar";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { Slider } from "@/components/ui/slider";
import { WeeklyInsights } from "@/components/WeeklyInsights";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useSessionRecommendations } from "@/hooks/useSessionRecommendations";
import { supabase } from "@/integrations/supabase/client";
import SessionDetailModal from "@/pages/app/SessionDetail";

export default function MarchDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todaySession, setTodaySession] = useState<any>(null);
  const [alternativeSessions, setAlternativeSessions] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [moodScore, setMoodScore] = useState([3]);
  const [showSwapDialog, setShowSwapDialog] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([
    {
      role: "assistant",
      content:
        "Hi there 🤎 This is March Chat which is here to help you build and sustain your practice.\n\nTo give you the most helpful guidance, I'd love to understand where you are today; emotionally, mentally, and physically. Knowing how you're feeling helps me tailor recommendations and keep you supported along the way.\n\nI'm not a therapist, but I'm here to offer steady accountability, structure, and kindness as you work toward your goals.\n\nSo, how are you feeling today?",
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    getTodayRecommendation,
    getAlternativeRecommendations,
    getRecommendedSessions,
    isLoading: recommendationsLoading,
  } = useSessionRecommendations();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate("/auth");
  }, [user, navigate]);

  const { data: onboardingData, isLoading: onboardingLoading } = useQuery({
    queryKey: ["onboarding", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_onboarding")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (onboardingData && !onboardingData.onboarding_completed) {
      navigate("/onboarding/march");
    }
  }, [onboardingData, navigate]);

  const onboardingComplete = !!onboardingData?.onboarding_completed;

  const { data: progressStats } = useQuery({
    queryKey: ["dashboard-progress", user?.id],
    queryFn: async () => {
      const { data: progress } = await supabase
        .from("user_progress")
        .select("completed_at, completed, class_id")
        .eq("user_id", user!.id)
        .eq("completed", true)
        .order("completed_at", { ascending: true });

      if (!progress)
        return {
          weeklyStreak: 0,
          totalSessions: 0,
          thisMonthSessions: 0,
          currentStreak: 0,
          totalMinutes: 0,
        };

      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const weeklyStreak = progress.filter(
        (p) => p.completed_at && new Date(p.completed_at) >= weekAgo
      ).length;
      const totalSessions = progress.length;
      const thisMonthSessions = progress.filter(
        (p) => p.completed_at && new Date(p.completed_at) >= startOfMonth
      ).length;

      const completedDates = progress
        .map((p) => new Date(p.completed_at).toDateString())
        .filter((date, index, self) => self.indexOf(date) === index)
        .sort();

      let streak = 0;
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      if (completedDates.includes(today) || completedDates.includes(yesterday)) {
        for (let i = completedDates.length - 1; i >= 0; i--) {
          const currentDate = new Date(completedDates[i]);
          const previousDate = i > 0 ? new Date(completedDates[i - 1]) : null;
          if (previousDate) {
            const diffDays = Math.floor(
              (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (diffDays === 1) {
              streak++;
            } else {
              break;
            }
          }
        }
      }
      const currentStreak = streak > 0 ? streak + 1 : 0;

      const classIds = progress.map((p) => p.class_id);
      const { data: classesData } = await supabase
        .from("classes")
        .select("id, duration_minutes")
        .in("id", classIds);
      const totalMinutes =
        classesData?.reduce((sum, cls) => sum + (cls.duration_minutes || 0), 0) || 0;

      return { weeklyStreak, totalSessions, thisMonthSessions, currentStreak, totalMinutes };
    },
    enabled: !!user?.id && onboardingComplete,
  });

  const { data: moodTrend = null } = useQuery<"improving" | "stable" | "declining" | null>({
    queryKey: ["dashboard-mood-trend", user?.id],
    queryFn: async () => {
      const { data: moodLogs } = await supabase
        .from("user_mood_logs")
        .select("mood_score, logged_at")
        .eq("user_id", user!.id)
        .gte("logged_at", new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
        .order("logged_at", { ascending: true });

      if (!moodLogs || moodLogs.length < 2) return null;

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

      const lastMonth = moodLogs.filter((m) => new Date(m.logged_at) >= thirtyDaysAgo);
      const previousMonth = moodLogs.filter((m) => {
        const d = new Date(m.logged_at);
        return d >= sixtyDaysAgo && d < thirtyDaysAgo;
      });

      if (lastMonth.length > 0 && previousMonth.length > 0) {
        const lastAvg = lastMonth.reduce((s, m) => s + m.mood_score, 0) / lastMonth.length;
        const prevAvg = previousMonth.reduce((s, m) => s + m.mood_score, 0) / previousMonth.length;
        const diff = lastAvg - prevAvg;
        if (diff > 0.3) return "improving";
        if (diff < -0.3) return "declining";
        return "stable";
      }
      if (lastMonth.length > 0) return "stable";
      return null;
    },
    enabled: !!user?.id && onboardingComplete,
  });

  const weeklyStreak = progressStats?.weeklyStreak ?? 0;
  const totalSessions = progressStats?.totalSessions ?? 0;
  const thisMonthSessions = progressStats?.thisMonthSessions ?? 0;
  const currentStreak = progressStats?.currentStreak ?? 0;
  const totalMinutes = progressStats?.totalMinutes ?? 0;
  const isLoading = onboardingLoading;

  // Load session recommendations once onboarding is confirmed
  useEffect(() => {
    if (!onboardingComplete) return;
    getTodayRecommendation().then((session) => {
      if (session) setTodaySession(session);
    });
    getRecommendedSessions({}).then((sessions) => setUpcomingSessions(sessions.slice(1, 3)));
  }, [onboardingComplete]);

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
      const { error } = await supabase.from("user_mood_logs").insert({
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
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/march-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      });

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
    <div className="flex min-h-screen flex-col bg-black">
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
        <div className="flex h-[240px] items-end bg-background px-4 pb-6 md:h-[284px] md:px-6 md:pb-8">
          <button
            onClick={() => navigate("/online")}
            className="flex items-center gap-2 text-white/80 transition-colors hover:text-white"
          >
            <svg
              className="h-4 w-4 md:h-5 md:w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="text-base font-light tracking-wide md:text-lg">
              Back to App Library
            </span>
          </button>
        </div>

        {/* Hero Image Section - Full Width */}
        <div className="relative z-10 h-[280px]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${marchHeroOrangeFlowers})` }}
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

          {/* Centered Title */}
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="px-4 text-center font-editorial text-5xl text-[#E6DBC7] md:text-6xl lg:text-7xl">
              Welcome to March Chat
            </h1>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="container mx-auto max-w-5xl px-4 pb-16 pt-16 md:px-6">
          <div className="mx-auto max-w-4xl text-center text-lg font-light leading-relaxed text-[#E6DBC7]/90 md:text-xl">
            <p className="font-editorial italic">
              This is a carefully curated service to help you find your rhythm. This is here to help
              you stay connected to yourself through simple, consistent practice, and feel supported
              along the way. I'll offer guidance, structure, and suggestions based on what you need
              most. This is a supportive service, not a therapist, and I can't replace professional
              care, but I'm here to support you with kindness, practicality, and presence. If you're
              ever struggling or in distress, please reach out to a trusted person or professional,
              you don't have to go through that alone.
            </p>
          </div>
        </div>

        <main className="container mx-auto max-w-5xl px-4 pt-12 md:px-6 md:pt-20">
          {/* How are you feeling today - Glassmorphism Box with mood slider and chat */}
          <div className="mx-auto mb-24">
            <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border-2 border-white/30">
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${featherTexture})` }}
              />

              {/* Glassmorphism overlay */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

              {/* Content */}
              <div className="relative p-8 md:p-10">
                <h2 className="mb-6 font-editorial text-2xl text-[#E6DBC7] md:text-3xl">
                  How are you feeling today?
                </h2>

                {/* Mood Slider */}
                <div className="mb-8 space-y-6">
                  <div className="flex justify-between px-2 text-2xl md:text-3xl">
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
                    className="relative inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#E6DBC7]/30 bg-white/[0.05] px-6 py-3 text-sm font-light tracking-wide text-[#E6DBC7] backdrop-blur-md transition-[border-color,box-shadow] duration-300 hover:border-[#EC9037] hover:shadow-[0_0_20px_rgba(236,144,55,0.5),0_0_35px_rgba(236,144,55,0.2)] md:w-auto"
                  >
                    Log mood
                  </button>
                </div>

                {/* Quick emotion buttons */}
                <div className="mb-8">
                  <p className="mb-4 text-sm font-light text-[#E6DBC7]/70 md:text-base">
                    Or tell me what's going on
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        streamChat(
                          "I'm feeling stressed, scattered, and overwhelmed with too much to handle"
                        )
                      }
                      className="rounded-full border border-[#E6DBC7]/20 bg-white/5 px-4 py-2 text-xs font-light text-[#E6DBC7]/80 transition-all hover:border-[#EC9037] hover:bg-white/10 hover:text-[#E6DBC7] hover:shadow-[0_0_20px_rgba(236,144,55,0.5),0_0_35px_rgba(236,144,55,0.2)] md:text-sm"
                    >
                      😓 Overwhelmed
                    </button>
                    <button
                      onClick={() =>
                        streamChat(
                          "My mind is racing with anxious thoughts and I'm having trouble focusing"
                        )
                      }
                      className="rounded-full border border-[#E6DBC7]/20 bg-white/5 px-4 py-2 text-xs font-light text-[#E6DBC7]/80 transition-all hover:border-[#EC9037] hover:bg-white/10 hover:text-[#E6DBC7] hover:shadow-[0_0_20px_rgba(236,144,55,0.5),0_0_35px_rgba(236,144,55,0.2)] md:text-sm"
                    >
                      🌀 Mind racing
                    </button>
                    <button
                      onClick={() =>
                        streamChat("I'm feeling anxious with worry and tension throughout my body")
                      }
                      className="rounded-full border border-[#E6DBC7]/20 bg-white/5 px-4 py-2 text-xs font-light text-[#E6DBC7]/80 transition-all hover:border-[#EC9037] hover:bg-white/10 hover:text-[#E6DBC7] hover:shadow-[0_0_20px_rgba(236,144,55,0.5),0_0_35px_rgba(236,144,55,0.2)] md:text-sm"
                    >
                      😰 Anxious
                    </button>
                    <button
                      onClick={() =>
                        streamChat(
                          "I'm having trouble falling asleep and my mind is racing at night"
                        )
                      }
                      className="rounded-full border border-[#E6DBC7]/20 bg-white/5 px-4 py-2 text-xs font-light text-[#E6DBC7]/80 transition-all hover:border-[#EC9037] hover:bg-white/10 hover:text-[#E6DBC7] hover:shadow-[0_0_20px_rgba(236,144,55,0.5),0_0_35px_rgba(236,144,55,0.2)] md:text-sm"
                    >
                      😴 Can't sleep
                    </button>
                    <button
                      onClick={() =>
                        streamChat("I'm feeling tired, sluggish, and lacking motivation or energy")
                      }
                      className="rounded-full border border-[#E6DBC7]/20 bg-white/5 px-4 py-2 text-xs font-light text-[#E6DBC7]/80 transition-all hover:border-[#EC9037] hover:bg-white/10 hover:text-[#E6DBC7] hover:shadow-[0_0_20px_rgba(236,144,55,0.5),0_0_35px_rgba(236,144,55,0.2)] md:text-sm"
                    >
                      ⚡ Tired
                    </button>
                    <button
                      onClick={() =>
                        streamChat(
                          "I feel disconnected, numb, flat, and withdrawn from myself and others"
                        )
                      }
                      className="rounded-full border border-[#E6DBC7]/20 bg-white/5 px-4 py-2 text-xs font-light text-[#E6DBC7]/80 transition-all hover:border-[#EC9037] hover:bg-white/10 hover:text-[#E6DBC7] hover:shadow-[0_0_20px_rgba(236,144,55,0.5),0_0_35px_rgba(236,144,55,0.2)] md:text-sm"
                    >
                      🌊 Disconnected
                    </button>
                    <button
                      onClick={() =>
                        streamChat("I'm feeling sad with a low mood and emotional heaviness")
                      }
                      className="rounded-full border border-[#E6DBC7]/20 bg-white/5 px-4 py-2 text-xs font-light text-[#E6DBC7]/80 transition-all hover:border-[#EC9037] hover:bg-white/10 hover:text-[#E6DBC7] hover:shadow-[0_0_20px_rgba(236,144,55,0.5),0_0_35px_rgba(236,144,55,0.2)] md:text-sm"
                    >
                      💭 Sad
                    </button>
                    <button
                      onClick={() =>
                        streamChat(
                          "I need a reset / lift - something to shift my energy and help me feel more grounded and present"
                        )
                      }
                      className="rounded-full border border-[#E6DBC7]/20 bg-white/5 px-4 py-2 text-xs font-light text-[#E6DBC7]/80 transition-all hover:border-[#EC9037] hover:bg-white/10 hover:text-[#E6DBC7] hover:shadow-[0_0_20px_rgba(236,144,55,0.5),0_0_35px_rgba(236,144,55,0.2)] md:text-sm"
                    >
                      🔄 Need a reset / lift
                    </button>
                  </div>
                </div>

                {/* Integrated Chat Interface */}
                <div className="border-t border-[#E6DBC7]/10 pt-6">
                  {/* Chat Messages */}
                  <div className="mb-6 max-h-[400px] space-y-4 overflow-y-auto">
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
            <div className="mx-auto mb-24 border-t border-[#E6DBC7]/10 pt-16">
              <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border-2 border-white/30">
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-20"
                  style={{ backgroundImage: `url(${featherTexture})` }}
                />

                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

                {/* Content */}
                <div className="relative p-8 md:p-10">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-editorial text-2xl text-[#E6DBC7] md:text-3xl">
                      Suggested for You
                    </h3>
                    <button
                      onClick={handleSwapSession}
                      className="flex items-center gap-2 text-xs font-light text-[#E6DBC7]/70 transition-colors hover:text-[#E6DBC7] md:text-sm"
                    >
                      <RefreshCw className="h-3 md:h-4 md:w-4" />
                      See alternatives
                    </button>
                  </div>
                  <p className="mb-6 text-sm font-light text-[#E6DBC7]/70">
                    Based on your chat and preferences
                  </p>

                  {/* Nested Session Card */}
                  <div className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-white/30 transition-transform duration-300 hover:scale-[1.02]">
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
                        <p className="mb-4 text-xs font-light uppercase tracking-[0.2em] text-[#EC9037]">
                          {todaySession.focus_tags[0]}
                        </p>
                      )}

                      {/* Title */}
                      <h4 className="mb-4 font-editorial text-3xl leading-tight text-white md:text-4xl">
                        {todaySession.title}
                      </h4>

                      {/* Meta Info */}
                      <div className="mb-6 flex items-center gap-2 text-sm font-light text-white/80">
                        <span>{todaySession.teacher_name || "March Russell"}</span>
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
                      <p className="mb-8 text-base font-light leading-relaxed text-white/90">
                        {todaySession.short_description || todaySession.description}
                      </p>

                      {/* Action buttons */}
                      <div className="flex items-center gap-4">
                        {/* Start Session Button */}
                        <button
                          onClick={handleStartSession}
                          className="inline-flex flex-1 items-center justify-center gap-3 rounded-full border border-white/30 bg-white/10 px-8 py-4 text-base font-light tracking-wide text-white backdrop-blur-md transition-colors duration-300 hover:border-white hover:bg-white/20"
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          Start Practice
                        </button>

                        {/* Icon buttons */}
                        <IconButton variant="white" size="xl">
                          <svg
                            className="h-5 w-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                        </IconButton>

                        <IconButton variant="white" size="xl">
                          <svg
                            className="h-5 w-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                            />
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
            <div className="mx-auto mb-24 border-t border-[#E6DBC7]/10 pt-16">
              <div className="mx-auto max-w-4xl">
                <h3 className="mb-8 font-editorial text-xl text-[#E6DBC7] md:text-2xl">
                  Your Progress
                </h3>

                {/* Stats Grid */}
                <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-lg border-2 border-white/30 bg-white/[0.02] p-4 backdrop-blur-md">
                    <p className="mb-1 font-editorial text-3xl text-[#E6DBC7] md:text-4xl">
                      {weeklyStreak}
                    </p>
                    <p className="text-xs font-light text-[#E6DBC7]/60">this week</p>
                  </div>
                  <div className="rounded-lg border-2 border-white/30 bg-white/[0.02] p-4 backdrop-blur-md">
                    <p className="mb-1 font-editorial text-3xl text-[#E6DBC7] md:text-4xl">
                      {thisMonthSessions}
                    </p>
                    <p className="text-xs font-light text-[#E6DBC7]/60">this month</p>
                  </div>
                  <div className="rounded-lg border-2 border-white/30 bg-white/[0.02] p-4 backdrop-blur-md">
                    <p className="mb-1 font-editorial text-3xl text-[#E6DBC7] md:text-4xl">
                      {currentStreak}
                    </p>
                    <p className="text-xs font-light text-[#E6DBC7]/60">day streak</p>
                  </div>
                  <div className="rounded-lg border-2 border-white/30 bg-white/[0.02] p-4 backdrop-blur-md">
                    <p className="mb-1 font-editorial text-3xl text-[#E6DBC7] md:text-4xl">
                      {totalMinutes}
                    </p>
                    <p className="text-xs font-light text-[#E6DBC7]/60">total minutes</p>
                  </div>
                </div>

                {/* Weekly Streak Visualization */}
                {weeklyStreak > 0 && (
                  <div className="mb-8">
                    <p className="mb-4 text-sm font-light text-[#E6DBC7]/70">
                      This week's sessions
                    </p>
                    <div className="flex gap-2">
                      {[...Array(7)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-10 flex-1 rounded md:h-12 ${
                            i < weeklyStreak ? "bg-[#d4915e]/70" : "bg-[#E6DBC7]/10"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Mood Trend */}
                {moodTrend && (
                  <div className="mb-8 rounded-lg border-2 border-white/30 bg-white/[0.02] p-4 backdrop-blur-md md:p-6">
                    <p className="mb-2 text-sm font-light text-[#E6DBC7]/70">
                      Mood over last month
                    </p>
                    {moodTrend === "improving" && (
                      <p className="text-sm font-light leading-relaxed text-[#E6DBC7] md:text-base">
                        Your mood's been trending upward. Keep going—consistency is working.
                      </p>
                    )}
                    {moodTrend === "stable" && (
                      <p className="text-sm font-light leading-relaxed text-[#E6DBC7] md:text-base">
                        You're staying steady. That's real progress, even when it doesn't feel
                        dramatic.
                      </p>
                    )}
                    {moodTrend === "declining" && (
                      <p className="text-sm font-light leading-relaxed text-[#E6DBC7] md:text-base">
                        Things have been tough lately. That's okay—keep showing up, even if it's
                        just for a few minutes. If you need more support, please reach out to
                        someone you trust.
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
                  <p className="text-center text-sm font-light italic text-[#E6DBC7]/60">
                    {weeklyStreak === 1
                      ? "You started. That matters."
                      : weeklyStreak < 3
                        ? "You're building something here."
                        : "You're really showing up for yourself."}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Upcoming Sessions Queue */}
          {upcomingSessions.length > 0 && (
            <div className="mx-auto mb-24 border-t border-[#E6DBC7]/10 pt-16">
              <div className="mx-auto max-w-4xl">
                <h3 className="mb-6 font-editorial text-xl text-[#E6DBC7] md:text-2xl">
                  Coming Up Next
                </h3>
                <p className="mb-8 text-sm font-light text-[#E6DBC7]/70">Your personalized queue</p>

                <div className="space-y-4">
                  {upcomingSessions.map((session, index) => (
                    <div
                      key={session.id}
                      onClick={() => setSelectedSessionId(session.id)}
                      className="group flex cursor-pointer gap-4 rounded-lg border border-[#E6DBC7]/10 bg-white/[0.02] p-4 transition-all hover:border-[#E6DBC7]/20 hover:bg-white/[0.05]"
                    >
                      {session.image_url && (
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded">
                          <img
                            src={session.image_url}
                            alt={session.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 text-xs font-light text-[#E6DBC7]/50">
                          {index === 0 ? "Tomorrow's suggestion" : "Later this week"}
                        </p>
                        <h4 className="mb-1 truncate font-editorial text-base text-[#E6DBC7] md:text-lg">
                          {session.title}
                        </h4>
                        <p className="text-xs font-light text-[#E6DBC7]/60 md:text-sm">
                          {session.duration_minutes} min • {session.teacher_name}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 self-center text-[#E6DBC7]/40 transition-all group-hover:translate-x-1 group-hover:text-[#E6DBC7]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Time-Based Practice Suggestions */}
          <div className="mb-16 border-t border-[#E6DBC7]/10 pt-12">
            <div className="max-w-3xl">
              <h3 className="mb-6 font-editorial text-xl text-[#E6DBC7] md:text-2xl">
                When to Practice
              </h3>
              <p className="mb-8 text-sm font-light text-[#E6DBC7]/70">
                Let me know your schedule in chat to get time-specific recommendations
              </p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-[#d4915e]/20 bg-gradient-to-br from-[#d4915e]/10 to-transparent p-6">
                  <p className="mb-2 font-editorial text-lg text-[#d4915e]">☀️ Morning</p>
                  <p className="text-sm font-light text-[#E6DBC7]/60">
                    Energizing practices to start grounded
                  </p>
                </div>
                <div className="rounded-lg border border-[#e8a57a]/20 bg-gradient-to-br from-[#e8a57a]/10 to-transparent p-6">
                  <p className="mb-2 font-editorial text-lg text-[#e8a57a]">🌤️ Midday</p>
                  <p className="text-sm font-light text-[#E6DBC7]/60">
                    Quick resets when you need a pause
                  </p>
                </div>
                <div className="rounded-lg border border-[#c97a4f]/20 bg-gradient-to-br from-[#c97a4f]/10 to-transparent p-6">
                  <p className="mb-2 font-editorial text-lg text-[#c97a4f]">🌙 Evening</p>
                  <p className="text-sm font-light text-[#E6DBC7]/60">
                    Calming practices to unwind
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Supportive Message */}
          <div className="mb-16 border-t border-[#E6DBC7]/10 pt-12">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-8 text-base font-light italic leading-relaxed text-[#E6DBC7]/80 md:text-lg">
                "Show up for yourself, not for perfection. One intentional breath at a time, you're
                reconnecting, grounding, and becoming more yourself."
              </p>
              <p className="text-sm font-light text-[#E6DBC7]/50">— March chat</p>
            </div>
          </div>
        </main>
      </div>

      <Footer />

      {/* Swap Dialog */}
      <Dialog open={showSwapDialog} onOpenChange={setShowSwapDialog}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto rounded-xl border border-white/30 bg-black/30 backdrop-blur-xl">
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
                  : "Breathwork";

                return (
                  <div
                    key={session.id}
                    className="flex cursor-pointer gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
                    onClick={() => selectAlternativeSession(session.id)}
                  >
                    {session.image_url && (
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
                        <img
                          src={session.image_url}
                          alt={session.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="mb-1 text-base font-semibold">{session.title}</h4>
                      <p className="mb-2 text-sm text-muted-foreground">
                        {session.teacher_name} • {session.duration_minutes} min • {technique}
                      </p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {session.short_description || session.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
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

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, TrendingDown, Calendar, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface WeeklyInsightsData {
  sessionsCompleted: number;
  moodTrend: "improving" | "declining" | "stable";
  avgMood: number;
  topFocusAreas: string[];
  consistency: "excellent" | "good" | "needs-work";
  daysSinceLastPractice: number;
}

export function WeeklyInsights() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [insights, setInsights] = useState<WeeklyInsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadWeeklyInsights();
  }, [user]);

  const loadWeeklyInsights = async () => {
    if (!user) return;

    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Load completed sessions
      const { data: sessions } = await supabase
        .from("user_progress")
        .select(`
          completed_at,
          classes (
            focus_tags
          )
        `)
        .eq("user_id", user.id)
        .eq("completed", true)
        .gte("completed_at", sevenDaysAgo.toISOString());

      // Load mood logs
      const { data: moodLogs } = await supabase
        .from("user_mood_logs")
        .select("mood_score, logged_at")
        .eq("user_id", user.id)
        .gte("logged_at", sevenDaysAgo.toISOString())
        .order("logged_at", { ascending: true });

      // Calculate insights
      const sessionsCompleted = sessions?.length || 0;
      
      // Mood trend
      let moodTrend: "improving" | "declining" | "stable" = "stable";
      let avgMood = 0;
      
      if (moodLogs && moodLogs.length >= 2) {
        avgMood = moodLogs.reduce((sum, log) => sum + (log.mood_score || 0), 0) / moodLogs.length;
        const firstHalf = moodLogs.slice(0, Math.floor(moodLogs.length / 2));
        const secondHalf = moodLogs.slice(Math.floor(moodLogs.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, log) => sum + (log.mood_score || 0), 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, log) => sum + (log.mood_score || 0), 0) / secondHalf.length;
        
        if (secondAvg > firstAvg + 0.5) moodTrend = "improving";
        else if (secondAvg < firstAvg - 0.5) moodTrend = "declining";
      }

      // Top focus areas
      const focusTags = sessions
        ?.flatMap((s: any) => s.classes?.focus_tags || [])
        .filter((tag): tag is string => !!tag) || [];
      
      const tagCounts = focusTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topFocusAreas = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([tag]) => tag);

      // Consistency
      let consistency: "excellent" | "good" | "needs-work" = "needs-work";
      if (sessionsCompleted >= 5) consistency = "excellent";
      else if (sessionsCompleted >= 3) consistency = "good";

      // Days since last practice
      const lastSession = sessions?.[0];
      const daysSinceLastPractice = lastSession?.completed_at
        ? Math.floor((Date.now() - new Date(lastSession.completed_at).getTime()) / (1000 * 60 * 60 * 24))
        : 7;

      setInsights({
        sessionsCompleted,
        moodTrend,
        avgMood,
        topFocusAreas,
        consistency,
        daysSinceLastPractice,
      });
    } catch (error) {
      console.error("Error loading weekly insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatWithMarch = () => {
    navigate("/online/march-chat", {
      state: { quickMessage: "Can you give me insights on my progress this week and suggest what I should focus on next?" }
    });
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-[hsl(var(--warm-amber))]/10 via-[hsl(var(--warm-peach))]/10 to-background/50 border-[#E6DBC7]/20">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-muted/20 rounded w-1/2"></div>
          <div className="h-4 bg-muted/20 rounded w-3/4"></div>
          <div className="h-4 bg-muted/20 rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  if (!insights) return null;

  const getMoodTrendIcon = () => {
    if (insights.moodTrend === "improving") return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (insights.moodTrend === "declining") return <TrendingDown className="w-5 h-5 text-orange-500" />;
    return <span className="text-muted-foreground">→</span>;
  };

  const getConsistencyMessage = () => {
    if (insights.consistency === "excellent") return "Amazing consistency! 🌟";
    if (insights.consistency === "good") return "Good work this week! 💛";
    return "Let's build momentum together";
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-[hsl(var(--warm-amber))]/10 via-[hsl(var(--warm-peach))]/10 to-background/50 border-[#E6DBC7]/20 backdrop-blur-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#E6DBC7]" />
          <h3 className="font-editorial text-xl text-[#E6DBC7]">Your Week at a Glance</h3>
        </div>
        {getMoodTrendIcon()}
      </div>

      <div className="space-y-4">
        {/* Sessions completed */}
        <div className="flex items-center gap-3">
          <Award className="w-4 h-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              {insights.sessionsCompleted} session{insights.sessionsCompleted !== 1 ? "s" : ""} completed
            </p>
            <p className="text-xs text-muted-foreground">{getConsistencyMessage()}</p>
          </div>
        </div>

        {/* Mood trend */}
        {insights.avgMood > 0 && (
          <div className="flex items-center gap-3">
            {getMoodTrendIcon()}
            <div className="flex-1">
              <p className="text-sm font-medium">
                Mood: {insights.avgMood.toFixed(1)}/10 average
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {insights.moodTrend === "improving" && "Trending up this week ↗"}
                {insights.moodTrend === "declining" && "Let's check in - seems like a tougher week ↘"}
                {insights.moodTrend === "stable" && "Holding steady →"}
              </p>
            </div>
          </div>
        )}

        {/* Top focus areas */}
        {insights.topFocusAreas.length > 0 && (
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Most practiced</p>
              <p className="text-xs text-muted-foreground">
                {insights.topFocusAreas.join(", ")}
              </p>
            </div>
          </div>
        )}

        {/* Days since practice */}
        {insights.daysSinceLastPractice >= 3 && (
          <div className="p-3 bg-[hsl(var(--warm-amber))]/10 rounded-lg border border-[#E6DBC7]/20">
            <p className="text-xs text-muted-foreground">
              It's been {insights.daysSinceLastPractice} day{insights.daysSinceLastPractice !== 1 ? "s" : ""} since your last practice. 
              What's been getting in the way?
            </p>
          </div>
        )}

        {/* CTA */}
        <Button
          onClick={handleChatWithMarch}
          variant="outline"
          className="w-full mt-2 border-[#E6DBC7]/30 hover:bg-[hsl(var(--warm-amber))]/10"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Ask March about my week
        </Button>
      </div>
    </Card>
  );
}
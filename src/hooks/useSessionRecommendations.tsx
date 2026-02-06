import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Session {
  id: string;
  title: string;
  description: string;
  short_description: string;
  duration_minutes: number;
  teacher_name: string;
  image_url: string;
  focus_tags: string[];
  goal_fit: string[];
  recommended_for_time: string;
}

interface RecommendationParams {
  goals: string[];
  timeAvailability: string;
  recentMood?: number;
  excludeSessionIds?: string[];
}

export const useSessionRecommendations = () => {
  const { user } = useAuth();
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [recentMood, setRecentMood] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const loadUserData = async () => {
      try {
        // Load onboarding preferences
        const { data: onboarding } = await supabase
          .from("user_onboarding")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        setOnboardingData(onboarding);

        // Load recent mood (last 7 days average)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: moodLogs } = await supabase
          .from("user_mood_logs")
          .select("mood_score")
          .eq("user_id", user.id)
          .gte("logged_at", sevenDaysAgo.toISOString())
          .order("logged_at", { ascending: false })
          .limit(7);

        if (moodLogs && moodLogs.length > 0) {
          const avgMood = moodLogs.reduce((sum, log) => sum + log.mood_score, 0) / moodLogs.length;
          setRecentMood(Math.round(avgMood));
        }
      } catch (error) {
        console.error("Error loading user data for recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const getRecommendedSessions = async (params?: Partial<RecommendationParams>): Promise<Session[]> => {
    try {
      // Use provided params or fall back to user's onboarding data
      const goals = params?.goals || onboardingData?.goals || [];
      const timeAvailability = params?.timeAvailability || onboardingData?.time_availability || "10";
      const mood = params?.recentMood !== undefined ? params.recentMood : recentMood;
      const excludeIds = params?.excludeSessionIds || [];

      console.log("Getting recommendations with:", { goals, timeAvailability, mood });

      // Map time availability to recommended_for_time values
      const timeCategory = timeAvailability === "5" ? "short" : timeAvailability === "10" ? "medium" : "long";

      // Build query
      let query = supabase
        .from("classes")
        .select("*")
        .eq("is_published", true);

      // Exclude specific sessions
      if (excludeIds.length > 0) {
        query = query.not("id", "in", `(${excludeIds.join(",")})`);
      }

      const { data: allSessions, error } = await query;

      if (error) throw error;
      if (!allSessions) return [];

      // Score and rank sessions
      const scoredSessions = allSessions.map((session: any) => {
        let score = 0;
        const sessionGoals = session.goal_fit || [];
        const sessionTags = session.focus_tags || [];
        const sessionTime = session.recommended_for_time;

        // Goal matching (highest weight)
        const matchedGoals = goals.filter((goal: string) => sessionGoals.includes(goal));
        score += matchedGoals.length * 10;

        // Time matching
        if (sessionTime === timeCategory) {
          score += 8;
        } else if (Math.abs(parseInt(timeAvailability) - (session.duration_minutes || 10)) <= 3) {
          score += 5;
        }

        // Mood-based recommendations
        if (mood !== null) {
          if (mood <= 2 && sessionTags.includes("calm")) score += 7;
          if (mood <= 2 && sessionTags.includes("gentle")) score += 5;
          if (mood >= 4 && sessionTags.includes("energy")) score += 7;
          if (mood >= 4 && sessionTags.includes("activating")) score += 5;
          if (mood === 3 && sessionTags.includes("balanced")) score += 6;
        }

        // Bonus for specific goal combinations
        if (goals.includes("stress") && sessionTags.includes("breathwork")) score += 5;
        if (goals.includes("habit") && sessionTags.includes("routine")) score += 5;
        if (goals.includes("accountability") && sessionTags.includes("structure")) score += 5;

        return {
          ...session,
          score,
          focus_tags: sessionTags,
          goal_fit: sessionGoals,
        };
      });

      // Sort by score and return top matches
      const sorted = scoredSessions.sort((a, b) => b.score - a.score);
      
      console.log("Top recommendations:", sorted.slice(0, 3).map(s => ({ 
        title: s.title, 
        score: s.score,
        goals: s.goal_fit,
        tags: s.focus_tags 
      })));

      return sorted.slice(0, 5); // Return top 5
    } catch (error) {
      console.error("Error getting recommendations:", error);
      return [];
    }
  };

  const getTodayRecommendation = async (excludeIds: string[] = []): Promise<Session | null> => {
    const recommendations = await getRecommendedSessions({ excludeSessionIds: excludeIds });
    return recommendations[0] || null;
  };

  const getAlternativeRecommendations = async (currentSessionId: string): Promise<Session[]> => {
    try {
      // Get the current session to find similar ones
      const { data: currentSession } = await supabase
        .from("classes")
        .select("*")
        .eq("id", currentSessionId)
        .single();

      if (!currentSession) {
        // Fallback to regular recommendations
        const recommendations = await getRecommendedSessions({ 
          excludeSessionIds: [currentSessionId] 
        });
        return recommendations.slice(0, 3);
      }

      // Get all published sessions except current
      const { data: allSessions, error } = await supabase
        .from("classes")
        .select("*")
        .eq("is_published", true)
        .neq("id", currentSessionId);

      if (error || !allSessions) return [];

      // Score alternatives based on similarity to current session
      const scoredAlternatives = allSessions.map((session: any) => {
        let score = 0;
        const currentGoals = Array.isArray(currentSession.goal_fit) ? currentSession.goal_fit : [];
        const currentTags = Array.isArray(currentSession.focus_tags) ? currentSession.focus_tags : [];
        const sessionGoals = Array.isArray(session.goal_fit) ? session.goal_fit : [];
        const sessionTags = Array.isArray(session.focus_tags) ? session.focus_tags : [];

        // Heavily weight matching goals (user's current need)
        const matchedGoals = sessionGoals.filter((goal: any) => 
          typeof goal === 'string' && currentGoals.includes(goal)
        );
        score += matchedGoals.length * 15;

        // Similar focus/technique type (breathwork, meditation, etc.)
        const matchedTags = sessionTags.filter((tag: any) => 
          typeof tag === 'string' && currentTags.includes(tag)
        );
        score += matchedTags.length * 10;

        // Similar duration (within 5 minutes)
        const durationDiff = Math.abs((session.duration_minutes || 10) - (currentSession.duration_minutes || 10));
        if (durationDiff <= 5) {
          score += 12 - durationDiff; // More points for closer duration
        }

        // Exact time category match
        if (session.recommended_for_time === currentSession.recommended_for_time) {
          score += 8;
        }

        // Bonus for user's preferences if available
        if (onboardingData?.goals && Array.isArray(onboardingData.goals)) {
          const userGoalMatches = onboardingData.goals.filter((goal: string) => 
            sessionGoals.includes(goal)
          );
          score += userGoalMatches.length * 5;
        }

        return {
          ...session,
          score,
          focus_tags: sessionTags,
          goal_fit: sessionGoals,
        };
      });

      // Sort by score and return top 3
      const sorted = scoredAlternatives.sort((a, b) => b.score - a.score);
      
      console.log("Alternative recommendations:", sorted.slice(0, 3).map(s => ({ 
        title: s.title, 
        score: s.score,
        matchedGoals: s.goal_fit,
        matchedTags: s.focus_tags 
      })));

      return sorted.slice(0, 3);
    } catch (error) {
      console.error("Error getting alternative recommendations:", error);
      return [];
    }
  };

  return {
    isLoading,
    onboardingData,
    recentMood,
    getRecommendedSessions,
    getTodayRecommendation,
    getAlternativeRecommendations,
  };
};
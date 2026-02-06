import { AdminLayout, AdminStatsCard } from "@/components/admin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity,
  CheckCircle,
  Search,
  Trash2,
  TrendingUp,
  User,
  Users as UsersIcon,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  has_completed_onboarding: boolean;
  has_accepted_safety_disclosure: boolean;
  subscription_status: string | null;
  subscription_end: string | null;
  subscription_type: 'monthly' | 'annual' | null;
  roles: string[];
}

interface AnalyticsData {
  totalSignups: number;
  activeSubscribers: number;
  monthlySubscribers: number;
  annualSubscribers: number;
  retentionRate: number;
  day1Retention: number;
  day7Retention: number;
  day30Retention: number;
  activeToday: number;
  activeThisWeek: number;
  activeThisMonth: number;
  avgSessionsPerUser: number;
  sessionCompletionRate: number;
  sessionDropOffRate: number;
  avgDaysSinceLastActivity: number;
  churnRate: number;
  peakUsageHours: Array<{ hour: number; sessions: number }>;
  peakUsageDays: Array<{ day: string; sessions: number }>;
  categoryPerformance: Array<{ category: string; plays: number }>;
  programCompletionRates: Array<{ programTitle: string; completionRate: number; totalEnrollments: number }>;
  sessionStats: Array<{ id: string; title: string; completions: number; favorites: number }>;
}

const AdminUsers = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [sortBy, setSortBy] = useState<'plays' | 'favorites'>('plays');

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchAnalytics();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (user) =>
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);

      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all subscriptions with price_id to determine type
      const { data: subscriptions, error: subsError } = await supabase
        .from("user_subscriptions")
        .select("user_id, status, current_period_end, stripe_price_id");

      if (subsError) throw subsError;

      // Fetch pending subscriptions (users who paid but haven't created account yet)
      const { data: pendingSubs, error: pendingError } = await supabase
        .from("pending_subscriptions")
        .select("*");

      if (pendingError) throw pendingError;

      // Fetch all roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Helper to determine subscription type from price_id
      const getSubscriptionType = (priceId: string | null): 'monthly' | 'annual' | null => {
        if (!priceId) return null;
        // Annual price ID
        if (priceId === 'price_1SaMMWGBlPMRpwZ64lDmN0cr') return 'annual';
        // Monthly price ID  
        if (priceId === 'price_1SaMRuGBlPMRpwZ6M3bbM1H8') return 'monthly';
        return null;
      };

      // Combine data - start with existing profiles
      const usersData: UserData[] = profiles.map((profile) => {
        const userSub = subscriptions?.find((sub) => sub.user_id === profile.id);
        const userRoles = roles?.filter((role) => role.user_id === profile.id).map((r) => r.role) || [];

        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          created_at: profile.created_at,
          has_completed_onboarding: profile.has_completed_onboarding,
          has_accepted_safety_disclosure: profile.has_accepted_safety_disclosure,
          subscription_status: userSub?.status || null,
          subscription_end: userSub?.current_period_end || null,
          subscription_type: getSubscriptionType(userSub?.stripe_price_id || null),
          roles: userRoles,
        };
      });

      // Add pending subscriptions (users who paid but haven't signed up yet)
      // Only add if they don't already have a profile
      pendingSubs?.forEach((pendingSub) => {
        const existingProfile = usersData.find(u => u.email === pendingSub.email);
        if (!existingProfile) {
          usersData.push({
            id: pendingSub.id, // Use pending subscription ID as temporary ID
            email: pendingSub.email,
            full_name: "Pending Account", // Placeholder name
            created_at: pendingSub.created_at,
            has_completed_onboarding: false,
            has_accepted_safety_disclosure: false,
            subscription_status: pendingSub.status,
            subscription_end: pendingSub.current_period_end,
            subscription_type: getSubscriptionType(pendingSub.stripe_price_id || null),
            roles: [],
          });
        }
      });

      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Total signups
      const { count: totalSignups } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Get all profiles with created_at for retention calculations
      const { data: allProfiles } = await supabase
        .from("profiles")
        .select("id, created_at");

      // Active subscribers with price info for type breakdown
      const { data: activeSubs } = await supabase
        .from("user_subscriptions")
        .select("user_id, stripe_price_id")
        .eq("status", "active");

      // Count monthly vs annual
      const monthlySubscribers = activeSubs?.filter(s => s.stripe_price_id === 'price_1SaMRuGBlPMRpwZ6M3bbM1H8').length || 0;
      const annualSubscribers = activeSubs?.filter(s => s.stripe_price_id === 'price_1SaMMWGBlPMRpwZ64lDmN0cr').length || 0;

      // Get all user progress data
      const { data: allProgress } = await supabase
        .from("user_progress")
        .select("user_id, class_id, completed, updated_at, last_position_seconds, created_at");

      // Calculate time-based metrics
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Active users (by session activity)
      const activeToday = new Set(
        allProgress?.filter(p => new Date(p.updated_at) >= oneDayAgo).map(p => p.user_id)
      ).size;

      const activeThisWeek = new Set(
        allProgress?.filter(p => new Date(p.updated_at) >= sevenDaysAgo).map(p => p.user_id)
      ).size;

      const activeThisMonth = new Set(
        allProgress?.filter(p => new Date(p.updated_at) >= thirtyDaysAgo).map(p => p.user_id)
      ).size;

      // Retention calculations - users who came back after signup
      let day1Retention = 0;
      let day7Retention = 0;
      let day30Retention = 0;

      if (allProfiles && allProgress) {
        const usersSignedUpAtLeast1DayAgo = allProfiles.filter(
          p => new Date(p.created_at) <= oneDayAgo
        );
        const usersSignedUpAtLeast7DaysAgo = allProfiles.filter(
          p => new Date(p.created_at) <= sevenDaysAgo
        );
        const usersSignedUpAtLeast30DaysAgo = allProfiles.filter(
          p => new Date(p.created_at) <= thirtyDaysAgo
        );

        // Day 1 retention: users who signed up at least 1 day ago and had activity within day 2-3
        const day1RetainedUsers = usersSignedUpAtLeast1DayAgo.filter(profile => {
          const signupDate = new Date(profile.created_at);
          const day2Start = new Date(signupDate.getTime() + 24 * 60 * 60 * 1000);
          const day3End = new Date(signupDate.getTime() + 72 * 60 * 60 * 1000);
          return allProgress.some(p => 
            p.user_id === profile.id && 
            new Date(p.updated_at) >= day2Start && 
            new Date(p.updated_at) <= day3End
          );
        }).length;
        day1Retention = usersSignedUpAtLeast1DayAgo.length > 0 
          ? (day1RetainedUsers / usersSignedUpAtLeast1DayAgo.length) * 100 
          : 0;

        // Day 7 retention: users who signed up at least 7 days ago and had activity within day 7-14
        const day7RetainedUsers = usersSignedUpAtLeast7DaysAgo.filter(profile => {
          const signupDate = new Date(profile.created_at);
          const day7Start = new Date(signupDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          const day14End = new Date(signupDate.getTime() + 14 * 24 * 60 * 60 * 1000);
          return allProgress.some(p => 
            p.user_id === profile.id && 
            new Date(p.updated_at) >= day7Start && 
            new Date(p.updated_at) <= day14End
          );
        }).length;
        day7Retention = usersSignedUpAtLeast7DaysAgo.length > 0 
          ? (day7RetainedUsers / usersSignedUpAtLeast7DaysAgo.length) * 100 
          : 0;

        // Day 30 retention: users who signed up at least 30 days ago and had activity within day 30-60
        const day30RetainedUsers = usersSignedUpAtLeast30DaysAgo.filter(profile => {
          const signupDate = new Date(profile.created_at);
          const day30Start = new Date(signupDate.getTime() + 30 * 24 * 60 * 60 * 1000);
          const day60End = new Date(signupDate.getTime() + 60 * 24 * 60 * 60 * 1000);
          return allProgress.some(p => 
            p.user_id === profile.id && 
            new Date(p.updated_at) >= day30Start && 
            new Date(p.updated_at) <= day60End
          );
        }).length;
        day30Retention = usersSignedUpAtLeast30DaysAgo.length > 0 
          ? (day30RetainedUsers / usersSignedUpAtLeast30DaysAgo.length) * 100 
          : 0;
      }

      // 30-day retention rate (existing metric)
      const retentionRate = totalSignups ? (activeThisMonth / totalSignups) * 100 : 0;

      // Average sessions per active user
      const activeUsersSet = new Set(allProgress?.map(p => p.user_id));
      const totalSessions = allProgress?.length || 0;
      const avgSessionsPerUser = activeUsersSet.size > 0 ? totalSessions / activeUsersSet.size : 0;

      // Session completion rate
      const completedSessions = allProgress?.filter(p => p.completed).length || 0;
      const sessionCompletionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

      // Session drop-off rate (sessions started but not completed)
      const sessionDropOffRate = 100 - sessionCompletionRate;

      // Average days since last activity
      let avgDaysSinceLastActivity = 0;
      if (allProgress && allProgress.length > 0) {
        const userLastActivity = new Map<string, Date>();
        allProgress.forEach(p => {
          const activityDate = new Date(p.updated_at);
          const existing = userLastActivity.get(p.user_id);
          if (!existing || activityDate > existing) {
            userLastActivity.set(p.user_id, activityDate);
          }
        });
        
        const daysSinceActivities = Array.from(userLastActivity.values()).map(date => 
          Math.floor((now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000))
        );
        avgDaysSinceLastActivity = daysSinceActivities.length > 0 
          ? daysSinceActivities.reduce((sum, days) => sum + days, 0) / daysSinceActivities.length 
          : 0;
      }

      // Churn rate: users who were active 30-60 days ago but not in last 30 days
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      const usersActive30to60DaysAgo = new Set(
        allProgress?.filter(p => {
          const activityDate = new Date(p.updated_at);
          return activityDate >= sixtyDaysAgo && activityDate < thirtyDaysAgo;
        }).map(p => p.user_id)
      );
      
      const recentlyActiveUsers = new Set(
        allProgress?.filter(p => new Date(p.updated_at) >= thirtyDaysAgo).map(p => p.user_id)
      );
      
      const churnedUsers = Array.from(usersActive30to60DaysAgo).filter(
        userId => !recentlyActiveUsers.has(userId)
      ).length;
      
      const churnRate = usersActive30to60DaysAgo.size > 0 
        ? (churnedUsers / usersActive30to60DaysAgo.size) * 100 
        : 0;

      // Peak usage times - analyze by hour and day of week
      const hourlyUsage = new Map<number, number>();
      const dailyUsage = new Map<string, number>();
      
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      allProgress?.forEach(p => {
        const activityDate = new Date(p.updated_at);
        const hour = activityDate.getHours();
        const dayName = dayNames[activityDate.getDay()];
        
        hourlyUsage.set(hour, (hourlyUsage.get(hour) || 0) + 1);
        dailyUsage.set(dayName, (dailyUsage.get(dayName) || 0) + 1);
      });
      
      const peakUsageHours = Array.from(hourlyUsage.entries())
        .filter(([_, sessions]) => sessions > 0) // Only include hours with activity
        .map(([hour, sessions]) => ({ hour, sessions }))
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, 5); // Top 5 hours
      
      const peakUsageDays = Array.from(dailyUsage.entries())
        .map(([day, sessions]) => ({ day, sessions }))
        .sort((a, b) => b.sessions - a.sessions);

      // Get all published sessions with categories
      const { data: allClasses } = await supabase
        .from("classes")
        .select("id, title, category_id")
        .eq("is_published", true);

      // Get categories
      const { data: categories } = await supabase
        .from("categories")
        .select("id, name");

      // Get all favorites
      const { data: favorites } = await supabase
        .from("user_favourites")
        .select("session_id");

      // Category performance - just plays, no completion rates
      const categoryMap = new Map();
      categories?.forEach(cat => {
        categoryMap.set(cat.id, {
          category: cat.name,
          plays: 0,
        });
      });

      allClasses?.forEach(cls => {
        if (cls.category_id && categoryMap.has(cls.category_id)) {
          const sessionProgress = allProgress?.filter(p => p.class_id === cls.id) || [];
          const categoryData = categoryMap.get(cls.category_id);
          categoryData.plays += sessionProgress.length;
        }
      });

      const categoryPerformance = Array.from(categoryMap.values())
        .map(cat => ({
          category: cat.category,
          plays: cat.plays,
        }))
        .sort((a, b) => b.plays - a.plays);

      // Individual program completion rates
      const { data: programs } = await supabase
        .from("programs")
        .select("id, title")
        .eq("is_published", true);

      const { data: programClasses } = await supabase
        .from("classes")
        .select("id, program_id")
        .not("program_id", "is", null)
        .eq("is_published", true);

      const programCompletionRates: Array<{ programTitle: string; completionRate: number; totalEnrollments: number }> = [];
      
      if (programs && programClasses && allProgress) {
        const programMap = new Map();
        programs.forEach(prog => {
          programMap.set(prog.id, {
            title: prog.title,
            totalClasses: 0,
            userProgress: new Map<string, number>(),
          });
        });

        programClasses.forEach(cls => {
          if (cls.program_id && programMap.has(cls.program_id)) {
            programMap.get(cls.program_id).totalClasses += 1;
          }
        });

        allProgress.forEach(progress => {
          const programClass = programClasses.find(pc => pc.id === progress.class_id);
          if (programClass?.program_id && progress.completed) {
            const progData = programMap.get(programClass.program_id);
            const userCompletions = progData.userProgress.get(progress.user_id) || 0;
            progData.userProgress.set(progress.user_id, userCompletions + 1);
          }
        });

        programMap.forEach(progData => {
          let totalEnrollments = 0;
          let completedPrograms = 0;
          
          progData.userProgress.forEach((completions: number) => {
            totalEnrollments += 1;
            if (completions >= progData.totalClasses) {
              completedPrograms += 1;
            }
          });

          if (totalEnrollments > 0) {
            programCompletionRates.push({
              programTitle: progData.title,
              completionRate: (completedPrograms / totalEnrollments) * 100,
              totalEnrollments,
            });
          }
        });

        // Sort by completion rate descending
        programCompletionRates.sort((a, b) => b.completionRate - a.completionRate);
      }

      // Build session stats map
      const sessionMap = new Map();
      allClasses?.forEach((cls) => {
        sessionMap.set(cls.id, {
          id: cls.id,
          title: cls.title,
          completions: 0,
          favorites: 0,
        });
      });

      // Count completions
      allProgress?.filter(p => p.completed).forEach((item) => {
        if (sessionMap.has(item.class_id)) {
          sessionMap.get(item.class_id).completions++;
        }
      });

      // Count favorites
      favorites?.forEach((item) => {
        if (sessionMap.has(item.session_id)) {
          sessionMap.get(item.session_id).favorites++;
        }
      });

      // Convert to array and sort by completions
      const allSessionStats = Array.from(sessionMap.values())
        .sort((a, b) => b.completions - a.completions);

      setAnalytics({
        totalSignups: totalSignups || 0,
        activeSubscribers: activeSubs?.length || 0,
        monthlySubscribers,
        annualSubscribers,
        retentionRate,
        day1Retention,
        day7Retention,
        day30Retention,
        activeToday,
        activeThisWeek,
        activeThisMonth,
        avgSessionsPerUser,
        sessionCompletionRate,
        sessionDropOffRate,
        avgDaysSinceLastActivity,
        churnRate,
        peakUsageHours,
        peakUsageDays,
        categoryPerformance,
        programCompletionRates,
        sessionStats: allSessionStats,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "mentorship_guided":
        return "Guided";
      case "mentorship_diy":
        return "DIY";
      default:
        return role;
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      console.log('🗑️ Starting user deletion for:', selectedUser.email);
      
      // Step 1: Cancel any Stripe subscriptions first
      if (selectedUser.subscription_status === 'active') {
        try {
          console.log('💳 Attempting to cancel Stripe subscription...');
          const { error: cancelError } = await supabase.functions.invoke(
            "cancel-user-subscription",
            {
              body: { email: selectedUser.email }
            }
          );
          
          if (cancelError) {
            console.warn("⚠️ Warning: Failed to cancel Stripe subscription:", cancelError);
            toast.error("Failed to cancel subscription. User will still be deleted.");
          } else {
            console.log('✅ Stripe subscription cancelled');
          }
        } catch (stripeError) {
          console.warn("⚠️ Warning: Stripe cancellation failed:", stripeError);
        }
      } else {
        console.log('ℹ️ No active subscription to cancel');
      }

      // Step 2: Delete user via Edge Function (requires service role)
      console.log('🔐 Deleting user via Edge Function...');
      const { error } = await supabase.functions.invoke("delete-user", {
        body: { userId: selectedUser.id }
      });

      if (error) {
        console.error('❌ Deletion error:', error);
        throw new Error(error.message || 'Failed to delete user');
      }

      console.log('✅ User deleted successfully');
      toast.success("User deleted successfully");
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      
      // Refresh analytics after deletion
      fetchAnalytics();
    } catch (error) {
      console.error("❌ Error deleting user:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to delete user: ${errorMessage}`);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout
        title="App Users & Analytics"
        description="Manage users and track key metrics"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-white/5 rounded-lg w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="App Users & Analytics"
      description="Manage users and track key metrics"
    >
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 bg-white/5 border border-white/10">
          <TabsTrigger value="analytics" className="data-[state=active]:bg-white/10 text-white/70 data-[state=active]:text-white">Analytics</TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-white/10 text-white/70 data-[state=active]:text-white">Users</TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <UsersIcon className="h-5 w-5 text-[#E6DBC7]" />
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-2xl font-light text-[#E6DBC7]">
                      {analytics.totalSignups}
                    </div>
                    <div className="text-sm text-foreground/70">Total Signups</div>
                    <div className="text-xs text-foreground/60 mt-1">All-time total</div>
                  </CardContent>
                </Card>

                <Card className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <Activity className="h-5 w-5 text-[#E6DBC7]" />
                    </div>
                    <div className="text-2xl font-light text-[#E6DBC7]">
                      {analytics.activeSubscribers}
                    </div>
                    <div className="text-sm text-foreground/70">Active Subscribers</div>
                    <div className="text-xs text-foreground/60 mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span>Monthly:</span>
                        <span className="text-[#E6DBC7]">{analytics.monthlySubscribers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Annual:</span>
                        <span className="text-[#E6DBC7]">{analytics.annualSubscribers}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-light text-[#E6DBC7]">
                      {analytics.churnRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-foreground/70">Churn Rate</div>
                    <div className="text-xs text-foreground/60 mt-1">
                      Users inactive in last 30 days
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Peak Usage Times */}
              <Card className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20">
                <CardHeader>
                  <CardTitle className="text-[#E6DBC7]">Peak Usage Times</CardTitle>
                  <p className="text-sm text-foreground/60 mt-1">
                    When users are most active
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-[#E6DBC7] mb-3">Top Hours</h4>
                      <div className="space-y-2">
                        {analytics.peakUsageHours.map((hourData, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-2 rounded border border-[#E6DBC7]/10"
                          >
                            <div className="text-sm text-foreground/90">
                              {hourData.hour.toString().padStart(2, '0')}:00 - {(hourData.hour + 1).toString().padStart(2, '0')}:00
                            </div>
                            <div className="text-sm font-light text-[#E6DBC7]">
                              {hourData.sessions} sessions
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-[#E6DBC7] mb-3">By Day of Week</h4>
                      <div className="space-y-2">
                        {analytics.peakUsageDays.map((dayData, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-2 rounded border border-[#E6DBC7]/10"
                          >
                            <div className="text-sm text-foreground/90">{dayData.day}</div>
                            <div className="text-sm font-light text-[#E6DBC7]">
                              {dayData.sessions} sessions
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Retention Metrics */}
              <Card className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20">
                <CardHeader>
                  <CardTitle className="text-[#E6DBC7]">Retention Rates</CardTitle>
                  <p className="text-sm text-foreground/60 mt-1">
                    Percentage of users who return after signup
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg border border-[#E6DBC7]/10">
                      <div className="text-3xl font-light text-[#E6DBC7] mb-1">
                        {analytics.day1Retention.toFixed(1)}%
                      </div>
                      <div className="text-sm text-foreground/70">Day 1 Retention</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border border-[#E6DBC7]/10">
                      <div className="text-3xl font-light text-[#E6DBC7] mb-1">
                        {analytics.day7Retention.toFixed(1)}%
                      </div>
                      <div className="text-sm text-foreground/70">Day 7 Retention</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border border-[#E6DBC7]/10">
                      <div className="text-3xl font-light text-[#E6DBC7] mb-1">
                        {analytics.day30Retention.toFixed(1)}%
                      </div>
                      <div className="text-sm text-foreground/70">Day 30 Retention</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Users */}
              <Card className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20">
                <CardHeader>
                  <CardTitle className="text-[#E6DBC7]">Active Users</CardTitle>
                  <p className="text-sm text-foreground/60 mt-1">
                    Users with session activity
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg border border-[#E6DBC7]/10">
                      <div className="text-3xl font-light text-[#E6DBC7] mb-1">
                        {analytics.activeToday}
                      </div>
                      <div className="text-sm text-foreground/70">Active Today</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border border-[#E6DBC7]/10">
                      <div className="text-3xl font-light text-[#E6DBC7] mb-1">
                        {analytics.activeThisWeek}
                      </div>
                      <div className="text-sm text-foreground/70">Active This Week</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border border-[#E6DBC7]/10">
                      <div className="text-3xl font-light text-[#E6DBC7] mb-1">
                        {analytics.activeThisMonth}
                      </div>
                      <div className="text-sm text-foreground/70">Active This Month</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Session Engagement */}
              <Card className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20">
                <CardHeader>
                  <CardTitle className="text-[#E6DBC7]">Session Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg border border-[#E6DBC7]/10">
                      <div className="text-2xl font-light text-[#E6DBC7] mb-1">
                        {analytics.avgSessionsPerUser.toFixed(1)}
                      </div>
                      <div className="text-sm text-foreground/70">Avg Sessions/User</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border border-[#E6DBC7]/10">
                      <div className="text-2xl font-light text-[#E6DBC7] mb-1">
                        {analytics.sessionCompletionRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-foreground/70">Completion Rate</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border border-[#E6DBC7]/10">
                      <div className="text-2xl font-light text-[#E6DBC7] mb-1">
                        {analytics.sessionDropOffRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-foreground/70">Drop-off Rate</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border border-[#E6DBC7]/10">
                      <div className="text-2xl font-light text-[#E6DBC7] mb-1">
                        {analytics.avgDaysSinceLastActivity.toFixed(0)}
                      </div>
                      <div className="text-sm text-foreground/70">Days Since Activity</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Performance */}
              <Card className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20">
                <CardHeader>
                  <CardTitle className="text-[#E6DBC7]">Category Performance</CardTitle>
                  <p className="text-sm text-foreground/60 mt-1">
                    Total plays by category
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.categoryPerformance.map((cat, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border border-[#E6DBC7]/10"
                      >
                        <div className="font-medium text-foreground/90">{cat.category}</div>
                        <div className="text-right">
                          <div className="text-lg font-light text-[#E6DBC7]">
                            {cat.plays}
                          </div>
                          <div className="text-xs text-foreground/60">total plays</div>
                        </div>
                      </div>
                    ))}
                    {analytics.categoryPerformance.length === 0 && (
                      <div className="text-center text-foreground/60 py-4">
                        No category data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Program Completion Rates */}
              <Card className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20">
                <CardHeader>
                  <CardTitle className="text-[#E6DBC7]">Program Completion Rates</CardTitle>
                  <p className="text-sm text-foreground/60 mt-1">
                    Completion rate for each multi-session program
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.programCompletionRates.map((program, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border border-[#E6DBC7]/10"
                      >
                        <div>
                          <div className="font-medium text-foreground/90">{program.programTitle}</div>
                          <div className="text-xs text-foreground/60 mt-1">
                            {program.totalEnrollments} user{program.totalEnrollments !== 1 ? 's' : ''} enrolled
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-light text-[#E6DBC7]">
                            {program.completionRate.toFixed(1)}%
                          </div>
                          <div className="text-xs text-foreground/60">completed</div>
                        </div>
                      </div>
                    ))}
                    {analytics.programCompletionRates.length === 0 && (
                      <div className="text-center text-foreground/60 py-4">
                        No program data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* All Sessions Stats */}
              <Card className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-[#E6DBC7]">
                        All Sessions - Popularity Stats
                      </CardTitle>
                      <p className="text-sm text-foreground/60 mt-1">
                        Ranked by {sortBy === 'plays' ? 'most played' : 'most favorited'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={sortBy === 'plays' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy('plays')}
                        className={sortBy === 'plays' ? 'bg-[#E6DBC7] text-[#1A1F2C]' : 'border-white/20 text-white hover:bg-white/10'}
                      >
                        Most Played
                      </Button>
                      <Button
                        variant={sortBy === 'favorites' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy('favorites')}
                        className={sortBy === 'favorites' ? 'bg-[#E6DBC7] text-[#1A1F2C]' : 'border-white/20 text-white hover:bg-white/10'}
                      >
                        Most Favorited
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {[...analytics.sessionStats]
                      .sort((a, b) => sortBy === 'plays' ? b.completions - a.completions : b.favorites - a.favorites)
                      .map((session, index) => (
                      <div 
                        key={session.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-[#E6DBC7]/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-lg font-light text-[#E6DBC7] min-w-[40px]">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-foreground/90">
                              {session.title}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-lg font-light text-[#E6DBC7]">
                              {session.completions}
                            </div>
                            <div className="text-xs text-foreground/60">
                              plays
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-light text-[#E6DBC7]">
                              {session.favorites}
                            </div>
                            <div className="text-xs text-foreground/60">
                              favorites
                            </div>
                          </div>
                        </div>
                      </div>
                      ))}
                    {analytics.sessionStats.length === 0 && (
                      <div className="text-center text-foreground/60 py-8">
                        No session data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          
          {/* Search & Filters */}
          <Card className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20 p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#E6DBC7]/60 h-5 w-5" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-background/60 border-[#E6DBC7]/30 text-foreground placeholder:text-foreground/50 focus:border-[#E6DBC7]/60"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-foreground/50 hover:text-foreground/80 transition-colors"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                )}
              </div>
              
              {/* Quick Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-foreground/70">Active:</span>
                  <span className="text-[#E6DBC7] font-medium">
                    {filteredUsers.filter(u => u.subscription_status === 'active' || u.roles.length > 0).length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#E6DBC7]/40" />
                  <span className="text-foreground/70">Past:</span>
                  <span className="text-[#E6DBC7] font-medium">
                    {filteredUsers.filter(u => u.subscription_status && u.subscription_status !== 'active' && u.roles.length === 0).length}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Search Results Count */}
            {searchQuery && (
              <div className="mt-4 pt-4 border-t border-[#E6DBC7]/10">
                <p className="text-sm text-foreground/60">
                  Found <span className="text-[#E6DBC7] font-medium">{filteredUsers.length}</span> users matching "{searchQuery}"
                </p>
              </div>
            )}
          </Card>

          {/* Active/Past User Tabs */}
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6 bg-white/5 border border-white/10">
              <TabsTrigger value="active" className="data-[state=active]:bg-white/10 text-white/70 data-[state=active]:text-white">
                Active Users ({filteredUsers.filter(u => u.subscription_status === 'active' || u.roles.length > 0).length})
              </TabsTrigger>
              <TabsTrigger value="past" className="data-[state=active]:bg-white/10 text-white/70 data-[state=active]:text-white">
                Past Subscribers ({filteredUsers.filter(u => u.subscription_status && u.subscription_status !== 'active' && u.roles.length === 0).length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <AdminStatsCard
                  title="Active Users"
                  value={filteredUsers.filter(u => u.subscription_status === 'active' || u.roles.length > 0).length}
                  icon={UsersIcon}
                  iconColor="#E6DBC7"
                  iconBgColor="#E6DBC720"
                />
                <AdminStatsCard
                  title="Paying Subscribers"
                  value={filteredUsers.filter((u) => u.subscription_status === "active").length}
                  icon={Activity}
                  iconColor="#22c55e"
                  iconBgColor="#22c55e20"
                />
              </div>
              {/* Active Users List */}
              <div className="grid gap-4">
                {filteredUsers
                  .filter(u => u.subscription_status === 'active' || u.roles.length > 0)
                  .map((user) => (
                    <Card
                      key={user.id}
                      className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20 hover:border-[#E6DBC7]/40 transition-all"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#E6DBC7]/10 flex items-center justify-center">
                              <User className="w-5 h-5 text-[#E6DBC7]" />
                            </div>
                            <div>
                              <CardTitle className="text-lg text-[#E6DBC7] font-normal">
                                {user.full_name || "No name"}
                              </CardTitle>
                              <p className="text-sm text-foreground/70">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 items-center">
                            {/* Subscription Status Badge */}
                            {user.subscription_status === "active" && (
                              <Badge 
                                className="capitalize bg-green-500/20 text-green-300 border-green-500/30"
                              >
                                💳 {user.subscription_type === 'annual' ? 'Annual' : user.subscription_type === 'monthly' ? 'Monthly' : 'Active'}
                              </Badge>
                            )}
                            {user.roles.includes('admin') && (
                              <Badge variant="destructive">Admin</Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-destructive hover:text-destructive hover:bg-red-500/10 ml-2 h-10 w-10 p-0"
                              title="Delete user"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
                          <div>
                            <p className="text-foreground/50 mb-1">Joined</p>
                            <p className="text-foreground/90">
                              {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-foreground/50 mb-1">Onboarding</p>
                            <div className="flex items-center gap-1">
                              {user.has_completed_onboarding ? (
                                <>
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-foreground/90">Complete</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4 text-foreground/50" />
                                  <span className="text-foreground/90">Pending</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-foreground/50 mb-1">Safety Disclosure</p>
                            <div className="flex items-center gap-1">
                              {user.has_accepted_safety_disclosure ? (
                                <>
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-foreground/90">Accepted</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4 text-foreground/50" />
                                  <span className="text-foreground/90">Not Accepted</span>
                                </>
                              )}
                            </div>
                          </div>
                          {user.subscription_end && (
                            <div>
                              <p className="text-foreground/50 mb-1">Subscription End</p>
                              <p className="text-foreground/90">
                                {new Date(user.subscription_end).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              {filteredUsers.filter(u => u.subscription_status === 'active' || u.roles.length > 0).length === 0 && (
                <Card className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20">
                  <CardContent className="py-12 text-center">
                    <p className="text-foreground/70">No active users found</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Past Users Tab */}
            <TabsContent value="past" className="space-y-6">
              {/* Past Subscribers List - Only users who HAD a subscription */}
              <div className="grid gap-4">
                {filteredUsers
                  .filter(u => u.subscription_status && u.subscription_status !== 'active' && u.roles.length === 0)
                  .map((user) => (
                    <Card
                      key={user.id}
                      className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20 hover:border-[#E6DBC7]/40 transition-all opacity-70"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#E6DBC7]/10 flex items-center justify-center">
                              <User className="w-5 h-5 text-[#E6DBC7]" />
                            </div>
                            <div>
                              <CardTitle className="text-lg text-[#E6DBC7] font-normal">
                                {user.full_name || "No name"}
                              </CardTitle>
                              <p className="text-sm text-foreground/70">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 items-center">
                            {user.subscription_status && (
                              <Badge 
                                variant="secondary"
                                className="capitalize"
                              >
                                {user.subscription_status}
                              </Badge>
                            )}
                            {!user.subscription_status && (
                              <Badge variant="outline" className="text-foreground/50">
                                No Subscription
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-destructive hover:text-destructive hover:bg-red-500/10 ml-2 h-10 w-10 p-0"
                              title="Delete user"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-foreground/50 mb-1">Joined</p>
                            <p className="text-foreground/90">
                              {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {user.subscription_end && (
                            <div>
                              <p className="text-foreground/50 mb-1">Subscription Ended</p>
                              <p className="text-foreground/90">
                                {new Date(user.subscription_end).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              {filteredUsers.filter(u => u.subscription_status && u.subscription_status !== 'active' && u.roles.length === 0).length === 0 && (
                <Card className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20">
                  <CardContent className="py-12 text-center">
                    <p className="text-foreground/70">No past subscribers found</p>
                    <p className="text-xs text-foreground/50 mt-2">Only users who previously had paid subscriptions appear here</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Delete User Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-background border-[#E6DBC7]/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#E6DBC7]">Delete User</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to permanently delete {selectedUser?.full_name || selectedUser?.email}? 
              This will cancel their Stripe subscription and permanently remove all user data including progress and favorites. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUser(null)} className="border-white/20 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminUsers;

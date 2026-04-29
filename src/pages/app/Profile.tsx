import { User } from "@supabase/supabase-js";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, LogOut } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { FadeUp } from "@/components/FadeUp";
import { PrivacyModal, TermsModal } from "@/components/LegalModals";
import OnlineFooter from "@/components/OnlineFooter";
import {
  ChangeEmailDialog,
  ChangePasswordDialog,
  FeedbackDialog,
  ProfileMenuItem,
} from "@/components/profile";
import { SafetyModal } from "@/components/SafetyModal";
import { ProfileSkeleton } from "@/components/skeletons/ProfileSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useAccountSettings } from "@/hooks/useAccountSettings";
import { useDataExport } from "@/hooks/useDataExport";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  full_name: string | null;
}

interface StatsData {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  memberSince: string;
}

const defaultStats: StatsData = {
  totalSessions: 0,
  totalMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
  memberSince: "",
};

interface ProfileContentProps {
  userId: string;
  user: User;
  signOut: () => Promise<void>;
}

const ProfileContent = ({ userId, user, signOut }: ProfileContentProps) => {
  const navigate = useNavigate();
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  const { exportUserData, isExporting } = useDataExport();
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  const {
    isUpdating,
    isSubmittingFeedback,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    newEmail,
    setNewEmail,
    feedback,
    setFeedback,
    handlePasswordChange,
    handleEmailChange,
    handleFeedbackSubmit,
  } = useAccountSettings(user);

  const { data: userProfile } = useSuspenseQuery<ProfileData | null>({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .maybeSingle();
      return data as ProfileData | null;
    },
  });

  const { data: stats } = useSuspenseQuery<StatsData>({
    queryKey: ["profile-stats", userId],
    queryFn: async () => {
      const { data: progressData, error } = await supabase
        .from("user_progress")
        .select("completed_at, last_position_seconds, class_id")
        .eq("user_id", userId)
        .eq("completed", true)
        .order("completed_at", { ascending: true });

      const memberSince = user.created_at
        ? new Date(user.created_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "";

      if (error) {
        console.error("Error fetching progress:", error);
        return { ...defaultStats, memberSince };
      }

      if (!progressData || progressData.length === 0) {
        return { ...defaultStats, memberSince };
      }

      const totalSessions = progressData.length;

      const classIds = progressData.map((p) => p.class_id);
      const { data: classesData } = await supabase
        .from("classes")
        .select("id, duration_minutes")
        .in("id", classIds);

      const totalMinutes =
        classesData?.reduce((sum, cls) => sum + (cls.duration_minutes || 0), 0) || 0;

      const completedDates = progressData
        .map((p) => new Date(p.completed_at).toDateString())
        .filter((date, index, self) => self.indexOf(date) === index)
        .sort();

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 1;

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
              tempStreak++;
            } else {
              break;
            }
          }
        }
        currentStreak = tempStreak;
      }

      tempStreak = 1;
      for (let i = 1; i < completedDates.length; i++) {
        const currentDate = new Date(completedDates[i]);
        const previousDate = new Date(completedDates[i - 1]);
        const diffDays = Math.floor(
          (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, currentStreak, 1);

      return { totalSessions, totalMinutes, currentStreak, longestStreak, memberSince };
    },
  });

  const openCustomerPortal = async () => {
    if (isLoadingPortal) return;

    setIsLoadingPortal(true);
    try {
      console.log("Opening customer portal...");
      toast.loading("Opening subscription portal...");

      const { data, error } = await supabase.functions.invoke("customer-portal");
      console.log("Customer portal response:", { data, error });

      toast.dismiss();

      if (error) {
        console.error("Customer portal error:", error);
        toast.error(
          error.message ||
            "Failed to open customer portal. Please ensure you have an active subscription."
        );
        return;
      }

      if (data?.url) {
        console.log("Redirecting to:", data.url);
        window.open(data.url, "_blank");
        toast.success("Portal opened in new tab");
      } else {
        toast.error("No portal URL received. Please contact support.");
      }
    } catch (error: any) {
      console.error("Customer portal exception:", error);
      toast.dismiss();
      toast.error(error.message || "Failed to open customer portal. Please try again.");
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log("Starting sign out...");
      navigate("/online", { replace: true });
      await signOut();
      toast.success("Signed out successfully");
      setTimeout(() => window.scrollTo(0, 0), 100);
    } catch (error: any) {
      console.error("Sign out exception:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const firstName = userProfile?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "User";
  const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

  return (
    <>
      <SafetyModal open={showSafetyModal} onOpenChange={setShowSafetyModal} />
      <TermsModal open={showTermsModal} onOpenChange={setShowTermsModal} />
      <PrivacyModal open={showPrivacyModal} onOpenChange={setShowPrivacyModal} />

      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="px-6 pt-16 md:pt-24">
          {/* Welcome Message with Back Button */}
          <FadeUp>
            <div className="my-8 flex items-center justify-between">
              <h1 className="font-editorial text-3xl text-[#E6DBC7] md:text-4xl">
                Welcome {capitalizedFirstName}
              </h1>
              <Link
                to="/online"
                className="inline-flex shrink-0 items-center gap-2 text-sm tracking-wide text-[#E6DBC7]/70 transition-colors hover:text-[#E6DBC7] md:text-base"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Back</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </div>
          </FadeUp>

          {/* Progress Section */}
          <FadeUp delay={100}>
            <div className="my-12 mb-10 border-b border-[#E6DBC7]/10 pb-10">
              <h2 className="mb-6 text-sm font-light uppercase tracking-[0.2em] text-[#E6DBC7]/60 md:my-8">
                Your Progress
              </h2>
              <div className="mb-8 grid grid-cols-2 gap-x-6 gap-y-8 md:mb-10 md:gap-x-10 md:gap-y-10">
                <div>
                  <div className="mb-2 text-4xl font-light text-[#E6DBC7] md:mb-3 md:text-5xl lg:text-6xl">
                    {stats.currentStreak}
                  </div>
                  <div className="text-xs font-light uppercase tracking-wider text-[#E6DBC7]/60 md:text-sm">
                    Current Streak
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-4xl font-light text-[#E6DBC7] md:mb-3 md:text-5xl lg:text-6xl">
                    {stats.longestStreak}
                  </div>
                  <div className="text-xs font-light uppercase tracking-wider text-[#E6DBC7]/60 md:text-sm">
                    Best Streak
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-4xl font-light text-[#E6DBC7] md:mb-3 md:text-5xl lg:text-6xl">
                    {stats.totalSessions}
                  </div>
                  <div className="text-xs font-light uppercase tracking-wider text-[#E6DBC7]/60 md:text-sm">
                    Classes Taken
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-4xl font-light text-[#E6DBC7] md:mb-3 md:text-5xl lg:text-6xl">
                    {stats.totalMinutes}
                  </div>
                  <div className="text-xs font-light uppercase tracking-wider text-[#E6DBC7]/60 md:text-sm">
                    Minutes Practiced
                  </div>
                </div>
              </div>
              <div className="text-base font-light text-[#E6DBC7]/60 md:text-lg">
                Member Since: <span className="text-[#E6DBC7]">{stats.memberSince}</span>
              </div>
            </div>
          </FadeUp>

          {/* Account Section */}
          <FadeUp>
            <div className="mb-10 border-b border-[#E6DBC7]/10 pb-8 md:mb-12 md:pb-10">
              <h2 className="mb-6 text-sm font-light uppercase tracking-[0.2em] text-[#E6DBC7]/60 md:mb-8">
                Account
              </h2>
              <div className="space-y-2">
                <ProfileMenuItem
                  label={isLoadingPortal ? "Opening portal..." : "Manage Subscription"}
                  onClick={openCustomerPortal}
                  disabled={isLoadingPortal}
                />
                <ProfileMenuItem
                  label="Change Password"
                  onClick={() => setShowPasswordDialog(true)}
                />
                <ProfileMenuItem label="Change Email" onClick={() => setShowEmailDialog(true)} />
              </div>
            </div>
          </FadeUp>

          {/* Information Section */}
          <FadeUp>
            <div className="mb-10 border-b border-[#E6DBC7]/10 pb-8 md:mb-12 md:pb-10">
              <h2 className="mb-6 text-sm font-light uppercase tracking-[0.2em] text-[#E6DBC7]/60 md:mb-8">
                Information
              </h2>
              <div className="space-y-2">
                <ProfileMenuItem label="About the App" onClick={() => navigate("/online/about")} />
                <ProfileMenuItem
                  label="Leave Feedback / Make Suggestion"
                  onClick={() => setShowFeedbackDialog(true)}
                />
                <ProfileMenuItem
                  label="Contact Support"
                  onClick={() =>
                    (window.location.href =
                      "mailto:support@embersstudio.io?subject=Support Request")
                  }
                />
                <ProfileMenuItem
                  label="Safety Information"
                  onClick={() => setShowSafetyModal(true)}
                />
              </div>
            </div>
          </FadeUp>

          {/* Data & Privacy Section */}
          <FadeUp>
            <div className="mb-10 pb-8 md:mb-12 md:pb-10">
              <h2 className="mb-6 text-sm font-light uppercase tracking-[0.2em] text-[#E6DBC7]/60 md:mb-8">
                Data & Privacy
              </h2>
              <div className="space-y-2">
                <ProfileMenuItem label="Privacy Policy" onClick={() => setShowPrivacyModal(true)} />
                <ProfileMenuItem label="Terms of Use" onClick={() => setShowTermsModal(true)} />
                <ProfileMenuItem
                  label={isExporting ? "Exporting..." : "Download My Data"}
                  onClick={exportUserData}
                  disabled={isExporting}
                />
              </div>
            </div>
          </FadeUp>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-3 rounded-lg py-4 text-sm font-light text-[#E6DBC7]/90 transition-colors hover:bg-[#E6DBC7]/5 hover:text-[#E6DBC7] md:py-5 md:text-base"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>

          {/* Logged in as */}
          <div className="mt-4 text-center text-xs font-light text-[#E6DBC7]/60 md:mt-6 md:text-base">
            Logged in as {user.email}
          </div>

          <OnlineFooter />
        </div>

        {/* Shared Dialogs */}
        <ChangePasswordDialog
          open={showPasswordDialog}
          onOpenChange={setShowPasswordDialog}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          onSubmit={() => handlePasswordChange(() => setShowPasswordDialog(false))}
          isUpdating={isUpdating}
        />

        <ChangeEmailDialog
          open={showEmailDialog}
          onOpenChange={setShowEmailDialog}
          currentEmail={user.email || ""}
          newEmail={newEmail}
          setNewEmail={setNewEmail}
          onSubmit={() => handleEmailChange(() => setShowEmailDialog(false))}
          isUpdating={isUpdating}
        />

        <FeedbackDialog
          open={showFeedbackDialog}
          onOpenChange={setShowFeedbackDialog}
          feedback={feedback}
          setFeedback={setFeedback}
          onSubmit={() => handleFeedbackSubmit(() => setShowFeedbackDialog(false))}
          isSubmitting={isSubmittingFeedback}
        />
      </div>
    </>
  );
};

const Profile = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  if (authLoading || !user) return <ProfileSkeleton />;

  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent userId={user.id} user={user} signOut={signOut} />
    </Suspense>
  );
};

export default Profile;

import { PrivacyModal, TermsModal } from "@/components/LegalModals";
import { SubscriptionModal } from "@/components/modals/LazyModals";
import {
  ChangeEmailDialog,
  ChangePasswordDialog,
  DeleteAccountDialog,
  FeedbackDialog,
  ProfileMenuItem,
} from "@/components/profile";
import { SafetyModal } from "@/components/SafetyModal";
import { ProfileSkeleton } from "@/components/skeletons/ProfileSkeleton";
import { TermsMicrocopy } from "@/components/TermsMicrocopy";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useAccountSettings } from "@/hooks/useAccountSettings";
import { useDataDeletion } from "@/hooks/useDataDeletion";
import { useDataExport } from "@/hooks/useDataExport";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, LogOut } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Profile = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDeleteDataDialog, setShowDeleteDataDialog] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  const { exportUserData, isExporting } = useDataExport();
  const { deleteAccount, deleteMarchData, isDeleting } = useDataDeletion();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
    memberSince: ""
  });

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
    deleteConfirmText,
    setDeleteConfirmText,
    handlePasswordChange,
    handleEmailChange,
    handleFeedbackSubmit,
  } = useAccountSettings(user?.id);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setIsLoadingProfile(false);
        return;
      }
      
      setIsLoadingProfile(true);
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profile) setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    fetchProfile();
  }, [user?.id]);

  // Fetch user stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      try {
        // Fetch all completed sessions
        const { data: progressData, error } = await supabase
          .from('user_progress')
          .select('completed_at, last_position_seconds, class_id')
          .eq('user_id', user.id)
          .eq('completed', true)
          .order('completed_at', { ascending: true });

        if (error) {
          console.error('Error fetching progress:', error);
          return;
        }

        if (progressData && progressData.length > 0) {
          // Calculate total sessions
          const totalSessions = progressData.length;

          // Fetch class durations to calculate total minutes
          const classIds = progressData.map(p => p.class_id);
          const { data: classesData } = await supabase
            .from('classes')
            .select('id, duration_minutes')
            .in('id', classIds);

          const totalMinutes = classesData?.reduce((sum, cls) => sum + (cls.duration_minutes || 0), 0) || 0;

          // Calculate streaks
          const completedDates = progressData
            .map(p => new Date(p.completed_at).toDateString())
            .filter((date, index, self) => self.indexOf(date) === index)
            .sort();

          let currentStreak = 0;
          let longestStreak = 0;
          let tempStreak = 1;

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
                  tempStreak++;
                } else {
                  break;
                }
              }
            }
            currentStreak = tempStreak;
          }

          // Calculate longest streak
          tempStreak = 1;
          for (let i = 1; i < completedDates.length; i++) {
            const currentDate = new Date(completedDates[i]);
            const previousDate = new Date(completedDates[i - 1]);
            const diffDays = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
              tempStreak++;
              longestStreak = Math.max(longestStreak, tempStreak);
            } else {
              tempStreak = 1;
            }
          }
          longestStreak = Math.max(longestStreak, currentStreak, 1);

          setStats({
            totalSessions,
            totalMinutes,
            currentStreak,
            longestStreak,
            memberSince: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            }) : ''
          });
        } else {
          // No progress yet, just set member since
          setStats(prev => ({
            ...prev,
            memberSince: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            }) : ''
          }));
        }
      } catch (error) {
        console.error('Error calculating stats:', error);
      }
    };

    fetchStats();
  }, [user]);

  const openCustomerPortal = async () => {
    if (isLoadingPortal) return;
    
    setIsLoadingPortal(true);
    try {
      console.log('Opening customer portal...');
      toast.loading("Opening subscription portal...");
      
      const { data, error } = await supabase.functions.invoke("customer-portal");
      console.log('Customer portal response:', { data, error });
      
      toast.dismiss();
      
      if (error) {
        console.error('Customer portal error:', error);
        toast.error(error.message || "Failed to open customer portal. Please ensure you have an active subscription.");
        return;
      }
      
      if (data?.url) {
        console.log('Redirecting to:', data.url);
        window.open(data.url, "_blank");
        toast.success("Portal opened in new tab");
      } else {
        toast.error("No portal URL received. Please contact support.");
      }
    } catch (error: any) {
      console.error('Customer portal exception:', error);
      toast.dismiss();
      toast.error(error.message || "Failed to open customer portal. Please try again.");
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log("Starting sign out...");
      // Navigate FIRST to avoid ProtectedRoute redirect to /auth
      navigate('/online', { replace: true });
      // Then sign out
      await signOut();
      toast.success("Signed out successfully");
      // Scroll to top of library
      setTimeout(() => window.scrollTo(0, 0), 100);
    } catch (error: any) {
      console.error("Sign out exception:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText === "DELETE") {
      await deleteAccount();
      setShowDeleteAccountDialog(false);
      setDeleteConfirmText("");
    } else {
      toast.error("Please type DELETE to confirm");
    }
  };

  const firstName = userProfile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';
  const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

  if (isLoadingProfile) {
    return <ProfileSkeleton />;
  }

  return (
    <>
      <Suspense fallback={null}>
        <SubscriptionModal
          open={showSubscriptionModal && !user}
          onClose={() => {
            setShowSubscriptionModal(false);
            navigate('/online');
          }}
        />
      </Suspense>
      <SafetyModal open={showSafetyModal} onOpenChange={setShowSafetyModal} />
      <TermsModal open={showTermsModal} onOpenChange={setShowTermsModal} />
      <PrivacyModal open={showPrivacyModal} onOpenChange={setShowPrivacyModal} />
      
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <div className="px-6 pt-16 md:pt-24">
          {/* Welcome Message with Back Button */}
          <div className="flex items-center justify-between mb-12 md:mb-16">
            <h1 className="text-3xl md:text-4xl font-editorial text-[#E6DBC7]">
              Welcome {capitalizedFirstName}
            </h1>
            <Link 
              to='/online'
              className="inline-flex items-center gap-2 text-[#E6DBC7]/70 hover:text-[#E6DBC7] transition-colors text-sm md:text-base tracking-wide shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>

          {/* Progress Section */}
          <div className="mb-10 md:mb-12 pb-8 md:pb-10 border-b border-[#E6DBC7]/10">
            <h2 className="text-sm font-light text-[#E6DBC7]/60 uppercase tracking-[0.2em] mb-6 md:mb-8">Your Progress</h2>
            <div className="grid grid-cols-2 gap-x-6 md:gap-x-10 gap-y-8 md:gap-y-10 mb-8 md:mb-10">
              <div>
                <div className="text-4xl md:text-5xl lg:text-6xl font-light text-[#E6DBC7] mb-2 md:mb-3">{stats.currentStreak}</div>
                <div className="text-xs md:text-sm font-light text-[#E6DBC7]/60 uppercase tracking-wider">Current Streak</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl lg:text-6xl font-light text-[#E6DBC7] mb-2 md:mb-3">{stats.longestStreak}</div>
                <div className="text-xs md:text-sm font-light text-[#E6DBC7]/60 uppercase tracking-wider">Best Streak</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl lg:text-6xl font-light text-[#E6DBC7] mb-2 md:mb-3">{stats.totalSessions}</div>
                <div className="text-xs md:text-sm font-light text-[#E6DBC7]/60 uppercase tracking-wider">Classes Taken</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl lg:text-6xl font-light text-[#E6DBC7] mb-2 md:mb-3">{stats.totalMinutes}</div>
                <div className="text-xs md:text-sm font-light text-[#E6DBC7]/60 uppercase tracking-wider">Minutes Practiced</div>
              </div>
            </div>
            <div className="text-base md:text-lg font-light text-[#E6DBC7]/60">
              Member Since: <span className="text-[#E6DBC7]">{stats.memberSince}</span>
            </div>
          </div>

          {/* Account Section */}
          <div className="mb-10 md:mb-12 pb-8 md:pb-10 border-b border-[#E6DBC7]/10">
            <h2 className="text-sm font-light text-[#E6DBC7]/60 uppercase tracking-[0.2em] mb-6 md:mb-8">Account</h2>
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
              <ProfileMenuItem 
                label="Change Email" 
                onClick={() => setShowEmailDialog(true)} 
              />
            </div>
          </div>

          {/* Information Section */}
          <div className="mb-10 md:mb-12 pb-8 md:pb-10 border-b border-[#E6DBC7]/10">
            <h2 className="text-sm font-light text-[#E6DBC7]/60 uppercase tracking-[0.2em] mb-6 md:mb-8">Information</h2>
            <div className="space-y-2">
              <ProfileMenuItem 
                label="Leave Feedback / Make Suggestion" 
                onClick={() => setShowFeedbackDialog(true)} 
              />
              <ProfileMenuItem 
                label="Contact Support" 
                onClick={() => window.location.href = "mailto:march@marchrussell.com?subject=Support Request"} 
              />
              <ProfileMenuItem 
                label="Safety Information" 
                onClick={() => setShowSafetyModal(true)} 
              />
            </div>
          </div>

          {/* Data & Privacy Section */}
          <div className="mb-10 md:mb-12 pb-8 md:pb-10">
            <h2 className="text-sm font-light text-[#E6DBC7]/60 uppercase tracking-[0.2em] mb-6 md:mb-8">Data & Privacy</h2>
            <div className="space-y-2">
              <ProfileMenuItem 
                label="Privacy Policy" 
                onClick={() => setShowPrivacyModal(true)} 
              />
              <ProfileMenuItem 
                label="Terms of Use" 
                onClick={() => setShowTermsModal(true)} 
              />
              <ProfileMenuItem 
                label={isExporting ? "Exporting..." : "Download My Data"} 
                onClick={exportUserData}
                disabled={isExporting}
              />
              <ProfileMenuItem 
                label="Delete March Chat Data" 
                onClick={() => setShowDeleteDataDialog(true)} 
              />
              <ProfileMenuItem 
                label="Delete Account & All Data" 
                onClick={() => setShowDeleteAccountDialog(true)} 
              />
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full text-[#E6DBC7]/90 py-4 md:py-5 text-sm md:text-base font-light hover:text-[#E6DBC7] transition-colors flex items-center justify-center gap-3 hover:bg-[#E6DBC7]/5 rounded-lg"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
          
          {/* Logged in as */}
          <div className="text-center mt-4 md:mt-6 text-xs md:text-base text-[#E6DBC7]/60 font-light">
            Logged in as {user?.email}
          </div>

          {/* Terms Microcopy */}
          <TermsMicrocopy />
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
          currentEmail={user?.email || ""}
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

        <DeleteAccountDialog
          open={showDeleteAccountDialog}
          onOpenChange={setShowDeleteAccountDialog}
          confirmText={deleteConfirmText}
          setConfirmText={setDeleteConfirmText}
          onDelete={handleDeleteAccount}
          isDeleting={isDeleting}
          title="Delete Account & All Data"
          deleteItems={[
            "Your account and profile",
            "All March Chat conversations and preferences",
            "All session progress and history",
            "Mood logs and favorites",
            "All other personal data",
          ]}
        />

        {/* Delete March Data Dialog (unique to this page) */}
        <Dialog open={showDeleteDataDialog} onOpenChange={setShowDeleteDataDialog}>
          <DialogContent className="backdrop-blur-xl bg-black/50 border border-white/30 p-0 overflow-hidden rounded-xl max-w-md">
            <div className="p-8 md:p-10">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-white text-xl md:text-2xl font-editorial mb-3">Delete March Chat Data</DialogTitle>
                <DialogDescription className="text-white/60 font-light text-sm">
                  This will permanently delete:
                </DialogDescription>
              </DialogHeader>
              <ul className="list-disc pl-6 space-y-2 text-white/60 text-sm font-light">
                <li>All March Chat conversations and preferences</li>
                <li>Learned session recommendations</li>
                <li>Interaction history</li>
              </ul>
              <p className="mt-6 text-white/60 text-sm font-light">
                Your account, progress, and favorites will remain intact. This action cannot be undone.
              </p>
              <div className="flex gap-3 pt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDataDialog(false)}
                  className="flex-1 border-2 border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white/40 h-12 font-light"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    await deleteMarchData();
                    setShowDeleteDataDialog(false);
                  }}
                  className="flex-1 border-2 border-red-500 bg-red-500/10 text-red-400 hover:bg-red-500/20 h-12 font-light"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete March Chat Data"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Profile;

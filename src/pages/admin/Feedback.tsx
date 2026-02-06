import { AdminLayout, AdminStatsCard } from "@/components/admin";
import { AdminContentSkeleton } from "@/components/skeletons/AdminContentSkeleton";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { CheckCircle, Circle, Mail, MessageSquare, Trash2, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface FeedbackItem {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  user_email: string | null;
  user_name: string | null;
  actioned: boolean;
  actioned_at: string | null;
  actioned_by: string | null;
}

const AdminFeedback = () => {
  const navigate = useNavigate();
  const { isAdmin, loading, user } = useAuth();
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchFeedback();
    }
  }, [isAdmin]);

  const fetchFeedback = async () => {
    try {
      setLoadingFeedback(true);
      
      // Fetch feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select('id, user_id, message, created_at, actioned, actioned_at, actioned_by')
        .order('created_at', { ascending: false });

      if (feedbackError) throw feedbackError;

      if (!feedbackData || feedbackData.length === 0) {
        setFeedback([]);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(feedbackData.map(item => item.user_id))];

      // Fetch profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, first_name, last_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Create a map of user profiles
      const profilesMap = new Map(
        profilesData?.map(profile => [profile.id, profile]) || []
      );

      // Merge feedback with profile data
      const formattedFeedback = feedbackData.map(item => {
        const profile = profilesMap.get(item.user_id);
        return {
          id: item.id,
          user_id: item.user_id,
          message: item.message,
          created_at: item.created_at,
          user_email: profile?.email || null,
          user_name: profile?.full_name || 
                     (profile?.first_name && profile?.last_name 
                       ? `${profile.first_name} ${profile.last_name}` 
                       : null),
          actioned: item.actioned || false,
          actioned_at: item.actioned_at,
          actioned_by: item.actioned_by
        };
      });

      setFeedback(formattedFeedback);
    } catch (error: any) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleToggleActioned = async (feedbackId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({ 
          actioned: !currentStatus,
          actioned_at: !currentStatus ? new Date().toISOString() : null,
          actioned_by: !currentStatus ? user?.id : null
        })
        .eq('id', feedbackId);

      if (error) throw error;

      setFeedback(prev => prev.map(item => 
        item.id === feedbackId 
          ? { 
              ...item, 
              actioned: !currentStatus,
              actioned_at: !currentStatus ? new Date().toISOString() : null,
              actioned_by: !currentStatus ? user?.id || null : null
            }
          : item
      ));

      toast.success(!currentStatus ? 'Feedback marked as actioned' : 'Feedback marked as pending');
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error('Failed to update feedback status');
    }
  };

  const handleDeleteFeedback = async () => {
    if (!selectedFeedback) return;

    try {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', selectedFeedback.id);

      if (error) throw error;

      setFeedback(prev => prev.filter(item => item.id !== selectedFeedback.id));
      toast.success('Feedback deleted');
      setDeleteDialogOpen(false);
      setSelectedFeedback(null);
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error('Failed to delete feedback');
    }
  };

  const pendingFeedback = feedback.filter(f => !f.actioned);
  const actionedFeedback = feedback.filter(f => f.actioned);

  const renderFeedbackList = (items: FeedbackItem[]) => (
    items.length === 0 ? (
      <Card className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageSquare className="h-12 w-12 text-[#E6DBC7]/40 mb-4" />
          <p className="text-foreground/60 text-center">
            No feedback here.
          </p>
        </CardContent>
      </Card>
    ) : (
      <div className="grid gap-6">
        {items.map((item) => (
          <Card key={item.id} className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20 hover:border-[#E6DBC7]/40 transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 text-sm">
                    {item.user_name && (
                      <div className="flex items-center gap-1.5">
                        <UserIcon className="h-4 w-4 text-[#E6DBC7]/60" />
                        <span className="font-medium text-white">{item.user_name}</span>
                      </div>
                    )}
                    {item.user_email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-4 w-4 text-[#E6DBC7]/60" />
                        <span className="text-foreground/70">{item.user_email}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-foreground/60">
                    {format(new Date(item.created_at), 'PPpp')}
                  </p>
                  {item.actioned && item.actioned_at && (
                    <p className="text-xs text-green-400">
                      ✓ Actioned on {format(new Date(item.actioned_at), 'PP')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={item.actioned ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleToggleActioned(item.id, item.actioned)}
                    className={item.actioned 
                      ? "gap-2 bg-background/60 border-[#E6DBC7]/20 text-white hover:bg-background/80 hover:border-[#E6DBC7]/40" 
                      : "gap-2 bg-white/5 border-2 border-white text-white hover:bg-white/10"
                    }
                  >
                    {item.actioned ? (
                      <>
                        <Circle className="h-4 w-4" />
                        Mark Pending
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Mark Complete
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFeedback(item);
                      setDeleteDialogOpen(true);
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                {item.message}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  );
  
  return (
    <AdminLayout
      title="User Feedback"
      description="Review user feedback and suggestions"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <AdminStatsCard 
          title="Total Feedback" 
          value={feedback.length} 
          icon={MessageSquare}
        />
        <AdminStatsCard 
          title="Pending" 
          value={pendingFeedback.length} 
          icon={Circle}
          iconColor="#facc15"
          iconBgColor="rgba(250, 204, 21, 0.1)"
        />
        <AdminStatsCard 
          title="Completed" 
          value={actionedFeedback.length} 
          icon={CheckCircle}
          iconColor="#4ade80"
          iconBgColor="rgba(74, 222, 128, 0.1)"
        />
      </div>

      {loadingFeedback ? (
        <AdminContentSkeleton showStats={false} variant="list" />
      ) : feedback.length === 0 ? (
        <Card className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-[#E6DBC7]/40 mb-4" />
            <p className="text-foreground/60 text-center">
              No feedback submissions yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="pending">
              Pending ({pendingFeedback.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({actionedFeedback.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            {renderFeedbackList(pendingFeedback)}
          </TabsContent>
          <TabsContent value="completed">
            {renderFeedbackList(actionedFeedback)}
          </TabsContent>
        </Tabs>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-black/80 border border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Feedback</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Are you sure you want to delete this feedback? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedFeedback(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteFeedback}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};
export default AdminFeedback;

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Search, RefreshCw, Mail, Eye, ShoppingBag, CheckCircle } from "lucide-react";
import { AdminSkeleton } from "@/components/skeletons/AdminSkeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Purchase {
  id: string;
  user_id: string;
  course_id: string;
  purchased_at: string;
  status: string;
  stripe_payment_intent_id: string | null;
  stripe_session_id: string | null;
  course?: {
    title: string;
    slug: string;
  };
  profile?: {
    email: string;
    full_name: string | null;
  };
}

interface LessonProgress {
  id: string;
  lesson_id: string;
  completed: boolean;
  last_position_seconds: number | null;
  lesson?: {
    title: string;
    order_index: number;
  };
}

const AdminCoursePurchases = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [userProgress, setUserProgress] = useState<LessonProgress[]>([]);
  const [showProgressModal, setShowProgressModal] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    setRefreshing(true);
    
    const { data: purchasesData, error: purchasesError } = await supabase
      .from("user_course_purchases")
      .select(`
        *,
        course:courses(title, slug)
      `)
      .order("purchased_at", { ascending: false });
    
    if (purchasesError) {
      toast({ title: "Error fetching purchases", description: purchasesError.message, variant: "destructive" });
      setRefreshing(false);
      return;
    }

    const userIds = [...new Set(purchasesData?.map(p => p.user_id) || [])];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("id", userIds);

    const purchasesWithProfiles = purchasesData?.map(purchase => ({
      ...purchase,
      profile: profilesData?.find(p => p.id === purchase.user_id)
    })) || [];

    setPurchases(purchasesWithProfiles);
    setRefreshing(false);
  };

  const viewUserProgress = async (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    
    const { data: lessonsData } = await supabase
      .from("course_lessons")
      .select("id, title, order_index")
      .eq("course_id", purchase.course_id)
      .order("order_index");

    const { data: progressData } = await supabase
      .from("user_lesson_progress")
      .select("*")
      .eq("user_id", purchase.user_id)
      .in("lesson_id", lessonsData?.map(l => l.id) || []);

    const progressWithLessons = lessonsData?.map(lesson => ({
      id: lesson.id,
      lesson_id: lesson.id,
      completed: progressData?.find(p => p.lesson_id === lesson.id)?.completed || false,
      last_position_seconds: progressData?.find(p => p.lesson_id === lesson.id)?.last_position_seconds || null,
      lesson: {
        title: lesson.title,
        order_index: lesson.order_index
      }
    })) || [];

    setUserProgress(progressWithLessons);
    setShowProgressModal(true);
  };

  const filteredPurchases = purchases.filter(p =>
    p.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activePurchases = purchases.filter(p => p.status === 'active').length;

  if (loading) return <AdminSkeleton />;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-8 py-24">
        <div className="mb-8">
          <Link to="/admin/courses" className="inline-flex items-center text-[#E6DBC7]/70 hover:text-[#E6DBC7] transition-colors gap-2 text-base md:text-lg">
            <ArrowLeft className="h-5 w-5" />
            Back to Courses
          </Link>
        </div>
        
        <div className="mb-12">
          <h1 className="font-editorial text-5xl md:text-6xl text-[#E6DBC7] mb-3 font-light">Course Purchases</h1>
          <p className="text-base text-foreground/70">View all course purchases and user progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/60 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#E6DBC7]/20 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-[#E6DBC7]" />
                </div>
                Total Purchases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-white">{purchases.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/60 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                Active Purchases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-white">{activePurchases}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
            <Input
              placeholder="Search by email, name, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
            />
          </div>
          <Button 
            onClick={fetchPurchases} 
            disabled={refreshing} 
            variant="outline" 
            className="gap-2 border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Purchases Table */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-[#E6DBC7] text-xl">
              All Purchases ({filteredPurchases.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPurchases.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-[#E6DBC7]/40 mx-auto mb-4" />
                <p className="text-white/60">
                  {searchTerm ? "No purchases match your search" : "No purchases yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-white/60">User</TableHead>
                      <TableHead className="text-white/60">Course</TableHead>
                      <TableHead className="text-white/60">Purchased</TableHead>
                      <TableHead className="text-white/60">Status</TableHead>
                      <TableHead className="text-white/60">Stripe ID</TableHead>
                      <TableHead className="text-white/60">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPurchases.map((purchase) => (
                      <TableRow key={purchase.id} className="border-white/10 hover:bg-white/5">
                        <TableCell>
                          <div>
                            <p className="font-medium text-white">{purchase.profile?.full_name || 'Unknown'}</p>
                            <p className="text-sm text-white/60">{purchase.profile?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-white">{purchase.course?.title || 'Unknown Course'}</TableCell>
                        <TableCell className="text-white/80">
                          {purchase.purchased_at 
                            ? format(new Date(purchase.purchased_at), 'MMM d, yyyy h:mm a')
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={purchase.status === 'active' ? 'default' : 'secondary'}
                            className={purchase.status === 'active' 
                              ? 'bg-green-500/20 text-green-300' 
                              : 'bg-white/10 text-white/60'
                            }
                          >
                            {purchase.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-white/60">
                          {purchase.stripe_payment_intent_id 
                            ? `${purchase.stripe_payment_intent_id.slice(0, 15)}...`
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => viewUserProgress(purchase)}
                              title="View Progress"
                              className="text-white/60 hover:text-white hover:bg-white/10"
                            >
                              <Eye className="h-5 w-5" />
                            </Button>
                            {purchase.profile?.email && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => window.open(`mailto:${purchase.profile?.email}`, '_blank')}
                                title="Email User"
                                className="text-white/60 hover:text-white hover:bg-white/10"
                              >
                                <Mail className="h-5 w-5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Modal */}
        <Dialog open={showProgressModal} onOpenChange={setShowProgressModal}>
          <DialogContent className="max-w-lg bg-black/80 backdrop-blur-xl border-white/20">
            <DialogHeader>
              <DialogTitle className="text-[#E6DBC7] text-xl">User Progress</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-white/70 space-y-1">
                <p><strong className="text-white">User:</strong> {selectedPurchase?.profile?.full_name || selectedPurchase?.profile?.email}</p>
                <p><strong className="text-white">Course:</strong> {selectedPurchase?.course?.title}</p>
              </div>
              
              <div className="space-y-3">
                <p className="font-medium text-[#E6DBC7]">Lesson Progress:</p>
                {userProgress.length === 0 ? (
                  <p className="text-sm text-white/60">No lessons in this course</p>
                ) : (
                  <div className="space-y-2">
                    {userProgress.map((progress, index) => (
                      <div key={progress.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div className="flex items-center gap-3">
                          <span className="text-white/50 w-6">{index + 1}.</span>
                          <span className="text-white">{progress.lesson?.title}</span>
                        </div>
                        <Badge 
                          variant={progress.completed ? 'default' : 'outline'}
                          className={progress.completed 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'border-white/20 text-white/60'
                          }
                        >
                          {progress.completed ? 'Completed' : progress.last_position_seconds ? 'In Progress' : 'Not Started'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminCoursePurchases;
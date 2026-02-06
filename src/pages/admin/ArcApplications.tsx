import {
  AdminLayout,
  AdminStatsCard,
} from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Calendar, ChevronDown, ChevronUp, Mail, User } from "lucide-react";
import { useEffect, useState } from "react";

interface ArcApplication {
  id: string;
  full_name: string;
  email: string;
  challenges: string[];
  internal_experience: string | null;
  statements: string[];
  tried_options: string[];
  tried_note: string | null;
  needs: string[];
  desired_shift: string | null;
  awareness: string | null;
  where_are_you: string | null;
  final_checkin: string | null;
  final_comment: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

const ArcApplications = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<ArcApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isAdmin) {
      fetchApplications();
    }
  }, [isAdmin]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('arc_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('arc_applications')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      setApplications(prev => 
        prev.map(app => app.id === id ? { ...app, status: newStatus } : app)
      );
      
      toast({
        title: "Status updated",
        description: `Application marked as ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const saveNotes = async (id: string) => {
    try {
      const { error } = await supabase
        .from('arc_applications')
        .update({ notes: editingNotes[id] || null })
        .eq('id', id);

      if (error) throw error;
      
      setApplications(prev => 
        prev.map(app => app.id === id ? { ...app, notes: editingNotes[id] || null } : app)
      );
      
      toast({
        title: "Notes saved",
        description: "Your notes have been saved",
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'reviewed': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'contacted': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'converted': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'declined': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  if (isLoading) {
    return (
      <AdminLayout
        title="ARC Applications"
        description="Review and manage Rise ARC Method applications"
      >
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-white/5 rounded-xl" />
            ))}
          </div>
          <div className="h-32 bg-white/5 rounded-xl" />
          <div className="h-32 bg-white/5 rounded-xl" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="ARC Applications"
      description="Review and manage Rise ARC Method applications"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AdminStatsCard
          title="Total Applications"
          value={applications.length}
          icon={User}
          iconColor="#E6DBC7"
          iconBgColor="#E6DBC720"
        />
        <AdminStatsCard
          title="New"
          value={applications.filter(a => a.status === 'new').length}
          icon={Mail}
          iconColor="#3b82f6"
          iconBgColor="#3b82f620"
        />
        <AdminStatsCard
          title="Contacted"
          value={applications.filter(a => a.status === 'contacted').length}
          icon={Calendar}
          iconColor="#eab308"
          iconBgColor="#eab30820"
        />
        <AdminStatsCard
          title="Converted"
          value={applications.filter(a => a.status === 'converted').length}
          icon={User}
          iconColor="#22c55e"
          iconBgColor="#22c55e20"
        />
      </div>

      <div className="space-y-4">
        {applications.map((app) => (
          <Card key={app.id} className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20">
            <CardHeader 
              className="cursor-pointer"
              onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#E6DBC7]/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#E6DBC7]" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-[#E6DBC7] font-normal flex items-center gap-2">
                      {app.full_name}
                      <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-foreground/60 mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {app.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(app.created_at), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>
                {expandedId === app.id ? (
                  <ChevronUp className="w-5 h-5 text-foreground/50" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-foreground/50" />
                )}
              </div>
            </CardHeader>

            {expandedId === app.id && (
              <CardContent className="pt-0 space-y-6">
                {/* Status Actions */}
                <div className="flex flex-wrap gap-2 pb-4 border-b border-white/10">
                  {['new', 'reviewed', 'contacted', 'converted', 'declined'].map((status) => (
                    <Button
                      key={status}
                      variant={app.status === status ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateStatus(app.id, status);
                      }}
                      className={app.status === status ? "bg-[#E6DBC7] text-black" : ""}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>

                {/* Challenges */}
                {app.challenges.length > 0 && (
                  <div>
                    <h4 className="text-sm font-normal text-[#E6DBC7] mb-2">Challenges</h4>
                    <div className="flex flex-wrap gap-2">
                      {app.challenges.map((c, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{c}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Internal Experience */}
                {app.internal_experience && (
                  <div>
                    <h4 className="text-sm font-normal text-[#E6DBC7] mb-2">Internal Experience</h4>
                    <p className="text-foreground/70 text-sm whitespace-pre-wrap">{app.internal_experience}</p>
                  </div>
                )}

                {/* Statements */}
                {app.statements.length > 0 && (
                  <div>
                    <h4 className="text-sm font-normal text-[#E6DBC7] mb-2">Statements That Resonate</h4>
                    <ul className="text-foreground/70 text-sm space-y-1">
                      {app.statements.map((s, i) => (
                        <li key={i} className="italic">• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* What They've Tried */}
                {app.tried_options.length > 0 && (
                  <div>
                    <h4 className="text-sm font-normal text-[#E6DBC7] mb-2">What They've Tried</h4>
                    <div className="flex flex-wrap gap-2">
                      {app.tried_options.map((t, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                    {app.tried_note && (
                      <p className="text-foreground/60 text-sm mt-2 italic">{app.tried_note}</p>
                    )}
                  </div>
                )}

                {/* Needs */}
                {app.needs.length > 0 && (
                  <div>
                    <h4 className="text-sm font-normal text-[#E6DBC7] mb-2">What They Need</h4>
                    <div className="flex flex-wrap gap-2">
                      {app.needs.map((n, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{n}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Desired Shift */}
                {app.desired_shift && (
                  <div>
                    <h4 className="text-sm font-normal text-[#E6DBC7] mb-2">What They Want To Feel</h4>
                    <p className="text-foreground/70 text-sm whitespace-pre-wrap">{app.desired_shift}</p>
                  </div>
                )}

                {/* Awareness */}
                {app.awareness && (
                  <div>
                    <h4 className="text-sm font-normal text-[#E6DBC7] mb-2">Things To Be Aware Of</h4>
                    <p className="text-foreground/70 text-sm whitespace-pre-wrap">{app.awareness}</p>
                  </div>
                )}

                {/* Where They Are */}
                {app.where_are_you && (
                  <div>
                    <h4 className="text-sm font-normal text-[#E6DBC7] mb-2">Where They Are</h4>
                    <p className="text-foreground/70 text-sm">{app.where_are_you}</p>
                  </div>
                )}

                {/* Final Check-in */}
                {app.final_checkin && (
                  <div>
                    <h4 className="text-sm font-normal text-[#E6DBC7] mb-2">Final Check-in</h4>
                    <p className="text-foreground/70 text-sm">{app.final_checkin}</p>
                    {app.final_comment && (
                      <p className="text-foreground/60 text-sm mt-1 italic">{app.final_comment}</p>
                    )}
                  </div>
                )}

                {/* Admin Notes */}
                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-sm font-normal text-[#E6DBC7] mb-2">Your Notes</h4>
                  <Textarea
                    value={editingNotes[app.id] ?? app.notes ?? ''}
                    onChange={(e) => setEditingNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                    placeholder="Add notes about this application..."
                    className="min-h-[100px] bg-white/5 border-white/20 text-white text-sm"
                  />
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      saveNotes(app.id);
                    }}
                    size="sm"
                    className="mt-2 bg-[#E6DBC7] text-black hover:bg-[#E6DBC7]/90"
                  >
                    Save Notes
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}

        {applications.length === 0 && (
          <div className="text-center py-16 text-foreground/50">
            No applications yet
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ArcApplications;

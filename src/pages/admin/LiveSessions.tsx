import { AdminLayout } from "@/components/admin";
import { AdminContentSkeleton } from "@/components/skeletons/AdminContentSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getFunctionUrl } from "@/lib/supabaseConfig";
import { format } from "date-fns";
import {
  Copy,
  Link2,
  Loader2,
  Play,
  Plus,
  RefreshCw,
  Square,
  Trash2,
  Users,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface LiveSession {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  status: string;
  daily_room_name: string | null;
  daily_room_url: string | null;
  guest_token: string | null;
  guest_link_expires_at: string | null;
  recording_enabled: boolean;
  attendee_count: number;
  created_at: string;
}

const AdminLiveSessions = () => {
  const { user, isAdmin } = useAuth();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    recording_enabled: false,
  });

  // Check if form has any data filled in
  const isFormDirty = formData.title || formData.description || formData.start_time || formData.end_time || formData.recording_enabled;

  // Handle attempt to close dialog with unsaved data
  const handleCloseAttempt = (e: Event) => {
    if (isFormDirty) {
      e.preventDefault();
      if (confirm("You have unsaved changes. Are you sure you want to close?")) {
        setShowCreateDialog(false);
        setFormData({
          title: "",
          description: "",
          start_time: "",
          end_time: "",
          recording_enabled: false,
        });
      }
    }
  };

  // Fetch sessions
  useEffect(() => {
    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from("live_sessions")
        .select("*")
        .order("start_time", { ascending: false });

      if (error) {
        console.error("Error fetching sessions:", error);
        toast.error("Failed to load sessions");
      } else {
        setSessions(data || []);
      }
      setIsLoading(false);
    };

    if (isAdmin) {
      fetchSessions();
    }
  }, [isAdmin]);

  // Create session
  const handleCreate = async () => {
    if (!formData.title || !formData.start_time) {
      toast.error("Title and start time are required");
      return;
    }

    setIsCreating(true);

    try {
      const { data: newSession, error } = await supabase
        .from("live_sessions")
        .insert({
          title: formData.title,
          description: formData.description || null,
          start_time: formData.start_time,
          end_time: formData.end_time || null,
          recording_enabled: formData.recording_enabled,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Create Daily room
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await fetch(
        getFunctionUrl('daily-create-room'),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionData.session?.access_token}`,
          },
          body: JSON.stringify({
            sessionId: newSession.id,
            title: formData.title,
            startTime: formData.start_time,
            endTime: formData.end_time,
            recordingEnabled: formData.recording_enabled,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create room");
      }

      toast.success("Session created");
      setShowCreateDialog(false);
      setFormData({
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        recording_enabled: false,
      });

      // Refresh sessions
      const { data } = await supabase
        .from("live_sessions")
        .select("*")
        .order("start_time", { ascending: false });
      setSessions(data || []);
    } catch (err) {
      console.error("Error creating session:", err);
      toast.error(err instanceof Error ? err.message : "Failed to create session");
    } finally {
      setIsCreating(false);
    }
  };

  // Start/End session
  const handleStatusChange = async (session: LiveSession, newStatus: string) => {
    setActionLoading(session.id);

    try {
      const { error } = await supabase
        .from("live_sessions")
        .update({ status: newStatus })
        .eq("id", session.id);

      if (error) throw error;

      setSessions((prev) =>
        prev.map((s) => (s.id === session.id ? { ...s, status: newStatus } : s))
      );

      toast.success(`Session ${newStatus === "live" ? "started" : "ended"}`);
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update session status");
    } finally {
      setActionLoading(null);
    }
  };

  // Generate guest link
  const handleGenerateGuestLink = async (session: LiveSession) => {
    setActionLoading(session.id);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await fetch(
        getFunctionUrl('daily-generate-guest-link'),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionData.session?.access_token}`,
          },
          body: JSON.stringify({ sessionId: session.id }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Copy to clipboard
      await navigator.clipboard.writeText(data.guestJoinUrl);
      toast.success("Guest link copied to clipboard");

      // Refresh sessions
      const { data: updated } = await supabase
        .from("live_sessions")
        .select("*")
        .order("start_time", { ascending: false });
      setSessions(updated || []);
    } catch (err) {
      console.error("Error generating guest link:", err);
      toast.error("Failed to generate guest link");
    } finally {
      setActionLoading(null);
    }
  };

  // Copy host link
  const handleCopyHostLink = async (session: LiveSession) => {
    const hostUrl = `${window.location.origin}/live/${session.id}?role=host`;
    await navigator.clipboard.writeText(hostUrl);
    toast.success("Host link copied");
  };

  // Delete session
  const handleDelete = async (session: LiveSession) => {
    if (!confirm("Are you sure you want to delete this session?")) return;

    try {
      const { error } = await supabase
        .from("live_sessions")
        .delete()
        .eq("id", session.id);

      if (error) throw error;

      setSessions((prev) => prev.filter((s) => s.id !== session.id));
      toast.success("Session deleted");
    } catch (err) {
      console.error("Error deleting session:", err);
      toast.error("Failed to delete session");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return <Badge className="bg-red-500 text-white animate-pulse">Live</Badge>;
      case "ended":
        return <Badge variant="secondary">Ended</Badge>;
      default:
        return <Badge variant="outline">Scheduled</Badge>;
    }
  };

  const newSessionDialog = (
    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-6 w-6" />
          New Session
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-md"
        onInteractOutside={handleCloseAttempt}
        onEscapeKeyDown={handleCloseAttempt}
      >
        <DialogHeader>
          <DialogTitle>Create Live Session</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Weekly Reset"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="A calming breathwork session..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_time">Start Time</Label>
            <Input
              id="start_time"
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, start_time: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_time">End Time (optional)</Label>
            <Input
              id="end_time"
              type="datetime-local"
              value={formData.end_time}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, end_time: e.target.value }))
              }
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="recording"
              checked={formData.recording_enabled}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, recording_enabled: checked }))
              }
            />
            <Label htmlFor="recording">Enable Recording</Label>
          </div>
          <Button
            onClick={handleCreate}
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Session"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <AdminLayout
      title="Live Sessions"
      description="Manage live streaming sessions with Daily.co"
      actions={newSessionDialog}
    >
      {/* Sessions Table */}
      {isLoading ? (
        <AdminContentSkeleton showStats={false} variant="table" />
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No live sessions yet. Create your first one!
        </div>
      ) : (
        <div className="border border-[#E6DBC7]/20 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Attendees</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Guest Link</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{session.title}</p>
                      {session.description && (
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {session.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(session.status)}</TableCell>
                  <TableCell>
                    {format(new Date(session.start_time), "MMM d, yyyy h:mm a")}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <Users className="w-6 h-6" />
                      {session.attendee_count}
                    </span>
                  </TableCell>
                  <TableCell>
                    {session.daily_room_name ? (
                      <Badge variant="outline" className="font-mono text-xs">
                        {session.daily_room_name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        Not created
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {session.guest_token ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                        <Button
                          variant="ghost"
                          size="default"
                          onClick={() => handleGenerateGuestLink(session)}
                          disabled={actionLoading === session.id}
                        >
                          <RefreshCw className="w-6 h-6" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="default"
                        onClick={() => handleGenerateGuestLink(session)}
                        disabled={actionLoading === session.id}
                      >
                        <Link2 className="w-6 h-6 mr-1" />
                        Generate
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/* Start/End Session */}
                      {session.status === "scheduled" && (
                        <Button
                          variant="default"
                          size="default"
                          onClick={() => handleStatusChange(session, "live")}
                          disabled={actionLoading === session.id}
                          title="Start session - participants can join once live"
                        >
                          <Play className="w-6 h-6 mr-1" />
                          Go Live
                        </Button>
                      )}
                      {session.status === "live" && (
                        <Button
                          variant="destructive"
                          size="default"
                          onClick={() => handleStatusChange(session, "ended")}
                          disabled={actionLoading === session.id}
                        >
                          <Square className="w-6 h-6 mr-1" />
                          End
                        </Button>
                      )}
                      
                      {/* Join as Host - can test privately before going live */}
                      <Button
                        variant="outline"
                        size="default"
                        onClick={() =>
                          window.open(`/live/${session.id}?role=host`, "_blank")
                        }
                        title={session.status === "scheduled" 
                          ? "Test your setup privately (participants cannot see you)" 
                          : "Join live session as host"}
                      >
                        <Video className="w-6 h-6 mr-1" />
                        {session.status === "scheduled" ? "Test" : "Join"}
                      </Button>
                      
                      {/* Copy host link */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyHostLink(session)}
                        title="Copy host link"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      
                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(session)}
                        className="text-destructive hover:text-destructive"
                        title="Delete session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminLiveSessions;

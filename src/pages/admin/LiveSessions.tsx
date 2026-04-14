import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  ImageIcon,
  Link2,
  Loader2,
  Minus,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Square,
  Trash2,
  Users,
  Video,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import {
  AdminLayout,
  AdminTable,
  adminTableCellClass,
  adminTableRowClass,
} from "@/components/admin";
import { AdminContentSkeleton } from "@/components/skeletons/AdminContentSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useStorageUpload } from "@/hooks/useStorageUpload";
import { supabase } from "@/integrations/supabase/client";

import { NTH_LABELS, WEEKDAY_LABELS } from "./adminScheduleUtils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

type SessionType = string;

interface LiveSession {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  status: string;
  session_type: SessionType | null;
  daily_room_name: string | null;
  daily_room_url: string | null;
  guest_token: string | null;
  guest_link_expires_at: string | null;
  recording_enabled: boolean;
  attendee_count: number;
  created_at: string;
}

interface LiveSessionDetails {
  id: string;
  linked_session_id: string;
  session_title: string | null;
  short_description: string | null;
  photo_url: string | null;
  what_to_expect: string[];
  name: string | null;
  title: string | null;
  guest_join_url: string | null;
  is_active: boolean;
}

interface LiveSessionConfig {
  id: string;
  session_type: SessionType;
  title: string;
  subtitle: string | null;
  recurrence_type: "weekly" | "nthWeekday" | null;
  weekdays: number[] | null;
  weekday: number | null;
  nth: number | null;
  time: string | null;
  timezone: string;
  duration: string | null;
  recurrence_label: string | null;
  cta_label: string | null;
  event_type: string | null;
  format: string | null;
  is_active: boolean;
}

const SESSION_TYPE_COLORS: Record<string, string> = {
  "weekly-reset": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "monthly-presence": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "guest-session": "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

const getTypeColor = (type: string) =>
  SESSION_TYPE_COLORS[type] ?? "bg-muted text-muted-foreground border-border";

const DEFAULT_WHAT_TO_EXPECT = [
  "A guided, voice-led practice",
  "You can sit, lie down, or simply listen",
  "Camera and microphone are not used",
  "You're welcome to arrive late or leave early",
];

// ────────────────────────────────────────────────────────
// Config Edit Dialog
// ────────────────────────────────────────────────────────

interface ConfigEditDialogProps {
  config: LiveSessionConfig;
  onSaved: (updated: LiveSessionConfig) => void;
}

const ConfigEditDialog = ({ config, onSaved }: ConfigEditDialogProps) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Omit<LiveSessionConfig, "id">>({
    session_type: config.session_type,
    title: config.title,
    subtitle: config.subtitle ?? "",
    recurrence_type: config.recurrence_type,
    weekdays: config.weekdays ?? [],
    weekday: config.weekday,
    nth: config.nth,
    time: config.time ?? "",
    timezone: config.timezone,
    duration: config.duration ?? "",
    recurrence_label: config.recurrence_label ?? "",
    cta_label: config.cta_label ?? "",
    event_type: config.event_type ?? "online-member",
    format: config.format ?? "",
    is_active: config.is_active,
  });

  const toggleWeekday = (day: number) => {
    const current = form.weekdays ?? [];
    setForm((prev) => ({
      ...prev,
      weekdays: current.includes(day) ? current.filter((d) => d !== day) : [...current, day],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        subtitle: form.subtitle || null,
        recurrence_type: form.recurrence_type,
        weekdays: form.recurrence_type === "weekly" ? form.weekdays : null,
        weekday: form.recurrence_type === "nthWeekday" ? form.weekday : null,
        nth: form.recurrence_type === "nthWeekday" ? form.nth : null,
        time: form.time || null,
        timezone: form.timezone || "GMT",
        duration: form.duration || null,
        recurrence_label: form.recurrence_label || null,
        cta_label: form.cta_label || null,
        event_type: form.event_type || null,
        format: form.format || null,
        is_active: form.is_active,
      };

      const { error } = await db
        .from("live_session_configs")
        .update(payload)
        .eq("session_type", config.session_type);

      if (error) throw error;

      onSaved({ ...config, ...payload });
      setOpen(false);
      toast.success("Session type config saved");
    } catch (err) {
      console.error("Error saving config:", err);
      toast.error(err instanceof Error ? err.message : "Failed to save config");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {config.title} Config</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Textarea
              value={form.subtitle ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Time (HH:MM)</Label>
              <Input
                type="time"
                value={form.time ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Input
                value={form.timezone}
                onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Input
                placeholder="30 mins"
                value={form.duration ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
              />
            </div>
          </div>

          {/* Recurrence */}
          <div className="space-y-6 rounded-lg border border-border p-6">
            <div className="space-y-6">
              <Label>Recurrence Type</Label>
              <Select
                value={form.recurrence_type ?? "none"}
                onValueChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    recurrence_type: v === "none" ? null : (v as "weekly" | "nthWeekday"),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No fixed recurrence</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="nthWeekday">Nth Weekday of month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.recurrence_type === "weekly" && (
              <div className="space-y-2">
                <Label>Weekdays</Label>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAY_LABELS.map((label, i) => (
                    <label key={i} className="flex cursor-pointer items-center gap-1.5 text-sm">
                      <Checkbox
                        checked={(form.weekdays ?? []).includes(i)}
                        onCheckedChange={() => toggleWeekday(i)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {form.recurrence_type === "nthWeekday" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Occurrence</Label>
                  <Select
                    value={String(form.nth ?? 1)}
                    onValueChange={(v) => setForm((p) => ({ ...p, nth: Number(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {NTH_LABELS[n]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Weekday</Label>
                  <Select
                    value={String(form.weekday ?? 0)}
                    onValueChange={(v) => setForm((p) => ({ ...p, weekday: Number(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WEEKDAY_LABELS.map((label, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Recurrence Label</Label>
              <Input
                placeholder="e.g. Every Tuesday"
                value={form.recurrence_label ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, recurrence_label: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>CTA Label</Label>
              <Input
                placeholder="Enter Space"
                value={form.cta_label ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, cta_label: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select
                value={form.event_type ?? "online-member"}
                onValueChange={(v) => setForm((p) => ({ ...p, event_type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="online-member">Online Member</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Format</Label>
            <Input
              placeholder="For Online Members"
              value={form.format ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, format: e.target.value }))}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => setForm((p) => ({ ...p, is_active: v }))}
            />
            <Label>Active</Label>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ────────────────────────────────────────────────────────
// Create Config Dialog
// ────────────────────────────────────────────────────────

interface CreateConfigDialogProps {
  onCreated: (config: LiveSessionConfig) => void;
}

const CreateConfigDialog = ({ onCreated }: CreateConfigDialogProps) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    session_type: "",
    title: "",
    subtitle: "",
    recurrence_type: null as "weekly" | "nthWeekday" | null,
    weekdays: [] as number[],
    weekday: null as number | null,
    nth: null as number | null,
    time: "",
    timezone: "GMT",
    duration: "",
    recurrence_label: "",
    cta_label: "Enter Space",
    event_type: "studio-member",
    format: "For Studio Members",
    is_active: true,
  });

  const toggleWeekday = (day: number) => {
    setForm((prev) => ({
      ...prev,
      weekdays: prev.weekdays.includes(day)
        ? prev.weekdays.filter((d) => d !== day)
        : [...prev.weekdays, day],
    }));
  };

  const handleCreate = async () => {
    if (!form.session_type.trim() || !form.title.trim()) {
      toast.error("Session type key and title are required");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(form.session_type)) {
      toast.error("Key must be lowercase letters, numbers, and hyphens only");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        session_type: form.session_type,
        title: form.title,
        subtitle: form.subtitle || null,
        recurrence_type: form.recurrence_type,
        weekdays: form.recurrence_type === "weekly" ? form.weekdays : null,
        weekday: form.recurrence_type === "nthWeekday" ? form.weekday : null,
        nth: form.recurrence_type === "nthWeekday" ? form.nth : null,
        time: form.time || null,
        timezone: form.timezone || "GMT",
        duration: form.duration || null,
        recurrence_label: form.recurrence_label || null,
        cta_label: form.cta_label || null,
        event_type: form.event_type || null,
        format: form.format || null,
        is_active: form.is_active,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("live_session_configs")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      onCreated(data as LiveSessionConfig);
      setOpen(false);
      setForm({
        session_type: "",
        title: "",
        subtitle: "",
        recurrence_type: null,
        weekdays: [],
        weekday: null,
        nth: null,
        time: "",
        timezone: "GMT",
        duration: "",
        recurrence_label: "",
        cta_label: "Enter Space",
        event_type: "studio-member",
        format: "For Studio Members",
        is_active: true,
      });
      toast.success("Session type created");
    } catch (err) {
      console.error("Error creating config:", err);
      toast.error(err instanceof Error ? err.message : "Failed to create session type");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Session Type
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Session Type</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <Label>
              Key <span className="text-muted-foreground">(unique slug, cannot be changed)</span>
            </Label>
            <Input
              placeholder="e.g. morning-breathwork"
              value={form.session_type}
              onChange={(e) =>
                setForm((p) => ({ ...p, session_type: e.target.value.toLowerCase() }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              placeholder="e.g. Morning Breathwork"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Textarea
              value={form.subtitle}
              onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Time (HH:MM)</Label>
              <Input
                type="time"
                value={form.time}
                onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Input
                value={form.timezone}
                onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Input
                placeholder="30 mins"
                value={form.duration}
                onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-6 rounded-lg border border-border p-6">
            <div className="space-y-2">
              <Label>Recurrence Type</Label>
              <Select
                value={form.recurrence_type ?? "none"}
                onValueChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    recurrence_type: v === "none" ? null : (v as "weekly" | "nthWeekday"),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No fixed recurrence</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="nthWeekday">Nth Weekday of month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.recurrence_type === "weekly" && (
              <div className="space-y-2">
                <Label>Weekdays</Label>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAY_LABELS.map((label, i) => (
                    <label key={i} className="flex cursor-pointer items-center gap-1.5 text-sm">
                      <Checkbox
                        checked={form.weekdays.includes(i)}
                        onCheckedChange={() => toggleWeekday(i)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {form.recurrence_type === "nthWeekday" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Occurrence</Label>
                  <Select
                    value={String(form.nth ?? 1)}
                    onValueChange={(v) => setForm((p) => ({ ...p, nth: Number(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {NTH_LABELS[n]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Weekday</Label>
                  <Select
                    value={String(form.weekday ?? 0)}
                    onValueChange={(v) => setForm((p) => ({ ...p, weekday: Number(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WEEKDAY_LABELS.map((label, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Recurrence Label</Label>
              <Input
                placeholder="e.g. Every Tuesday"
                value={form.recurrence_label}
                onChange={(e) => setForm((p) => ({ ...p, recurrence_label: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>CTA Label</Label>
              <Input
                placeholder="Enter Space"
                value={form.cta_label}
                onChange={(e) => setForm((p) => ({ ...p, cta_label: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select
                value={form.event_type}
                onValueChange={(v) => setForm((p) => ({ ...p, event_type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="studio-member">Studio Member</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Format</Label>
            <Input
              placeholder="For Studio Members"
              value={form.format}
              onChange={(e) => setForm((p) => ({ ...p, format: e.target.value }))}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => setForm((p) => ({ ...p, is_active: v }))}
            />
            <Label>Active</Label>
          </div>

          <Button onClick={handleCreate} disabled={saving} className="w-full">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create Session Type
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ────────────────────────────────────────────────────────
// Main Page Component
// ────────────────────────────────────────────────────────

const AdminLiveSessions = () => {
  const { user, isAdmin } = useAuth();

  const queryClient = useQueryClient();

  // Instances state
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<SessionType | "all">("all");

  // Session configs
  const { data: configs = [], isLoading: configsLoading } = useQuery<LiveSessionConfig[]>({
    queryKey: ["admin-live-session-configs"],
    queryFn: async (): Promise<LiveSessionConfig[]> => {
      const { data, error } = await db
        .from("live_session_configs")
        .select("*")
        .order("session_type");
      if (error) throw error;
      return (data as unknown as LiveSessionConfig[]) ?? [];
    },
    enabled: !!isAdmin,
  });

  // Sessions + details
  const { data: sessionsData = { sessions: [], sessionDetails: new Map() }, isLoading } = useQuery<{
    sessions: LiveSession[];
    sessionDetails: Map<string, LiveSessionDetails>;
  }>({
    queryKey: ["admin-live-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_sessions")
        .select("*")
        .order("start_time", { ascending: false });
      if (error) throw error;
      const sessionList = (data ?? []) as unknown as LiveSession[];
      const detailsMap = new Map<string, LiveSessionDetails>();
      if (sessionList.length > 0) {
        const { data: detailsData } = await db
          .from("live_session_details")
          .select("*")
          .in(
            "linked_session_id",
            sessionList.map((s) => s.id)
          );
        ((detailsData ?? []) as LiveSessionDetails[]).forEach((d) => {
          detailsMap.set(d.linked_session_id, d);
        });
      }
      return { sessions: sessionList, sessionDetails: detailsMap };
    },
    enabled: !!isAdmin,
  });

  const sessions = sessionsData.sessions;
  const sessionDetails = sessionsData.sessionDetails;

  // Instance form state
  const emptyForm = {
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    session_type: "" as SessionType | "",
    recording_enabled: false,
  };
  const [sessionForm, setSessionForm] = useState(emptyForm);

  // Session details form state (optional section in create/edit dialog)
  const [showDetails, setShowDetails] = useState(false);
  const { upload, uploading, cancelUpload } = useStorageUpload("class-images");
  const emptyDetails = {
    session_title: "",
    short_description: "",
    photo_url: "",
    what_to_expect: DEFAULT_WHAT_TO_EXPECT,
    name: "",
    title: "",
  };
  const [detailsForm, setDetailsForm] = useState(emptyDetails);

  const photoInputRef = useRef<HTMLInputElement>(null);

  const isFormDirty =
    sessionForm.title ||
    sessionForm.description ||
    sessionForm.start_time ||
    sessionForm.end_time ||
    sessionForm.recording_enabled;

  const handleCloseAttempt = (e: Event) => {
    if (isFormDirty) {
      e.preventDefault();
      if (confirm("You have unsaved changes. Are you sure you want to close?")) {
        resetDialog();
      }
    }
  };

  const resetDialog = () => {
    setShowCreateDialog(false);
    setEditingSession(null);
    setSessionForm(emptyForm);
    setDetailsForm(emptyDetails);
    setShowDetails(false);
  };

  const openEditDialog = (session: LiveSession) => {
    setEditingSession(session);
    setSessionForm({
      title: session.title,
      description: session.description ?? "",
      start_time: session.start_time.slice(0, 16),
      end_time: session.end_time ? session.end_time.slice(0, 16) : "",
      session_type: session.session_type ?? "",
      recording_enabled: session.recording_enabled,
    });
    const details = sessionDetails.get(session.id);
    if (details) {
      setDetailsForm({
        session_title: details.session_title ?? "",
        short_description: details.short_description ?? "",
        photo_url: details.photo_url ?? "",
        what_to_expect: details.what_to_expect ?? DEFAULT_WHAT_TO_EXPECT,
        name: details.name ?? "",
        title: details.title ?? "",
      });
      setShowDetails(true);
    }
    setShowCreateDialog(true);
  };

  // Photo upload for session details
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `live-session-${Date.now()}.${fileExt}`;
      const publicUrl = await upload(file, filePath);
      if (publicUrl) {
        setDetailsForm((p) => ({ ...p, photo_url: publicUrl }));
        toast.success("Photo uploaded");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("Photo upload error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to upload photo");
    }
  };

  // Create or update session
  const handleSave = async () => {
    if (!sessionForm.title || !sessionForm.start_time || !sessionForm.session_type) {
      toast.error("Title, start time, and session type are required");
      return;
    }

    setIsCreating(true);
    try {
      let sessionId: string;

      if (editingSession) {
        const { error } = await supabase
          .from("live_sessions")
          .update({
            title: sessionForm.title,
            description: sessionForm.description || null,
            start_time: sessionForm.start_time,
            end_time: sessionForm.end_time || null,
            session_type: sessionForm.session_type,
            recording_enabled: sessionForm.recording_enabled,
          })
          .eq("id", editingSession.id);
        if (error) throw error;
        sessionId = editingSession.id;
        toast.success("Session updated");
      } else {
        const { data: newSession, error } = await supabase
          .from("live_sessions")
          .insert({
            title: sessionForm.title,
            description: sessionForm.description || null,
            start_time: sessionForm.start_time,
            end_time: sessionForm.end_time || null,
            session_type: sessionForm.session_type,
            recording_enabled: sessionForm.recording_enabled,
            created_by: user?.id,
          })
          .select()
          .single();
        if (error) throw error;
        sessionId = newSession.id;

        toast.success("Session created");

        // Create Daily.co room — fire-and-forget so it doesn't block the dialog
        supabase.functions
          .invoke("daily-create-room", {
            body: {
              sessionId,
              title: sessionForm.title,
              startTime: sessionForm.start_time,
              endTime: sessionForm.end_time,
              recordingEnabled: sessionForm.recording_enabled,
            },
          })
          .then(({ error: roomError }) => {
            if (roomError) {
              console.error("Daily.co room creation failed:", roomError);
              toast.error("Room creation failed — session was saved but may need a room retry");
            }
          });
      }

      // Save session details if shown and has content
      const hasDetails =
        showDetails &&
        (detailsForm.session_title ||
          detailsForm.short_description ||
          detailsForm.photo_url ||
          detailsForm.name ||
          detailsForm.title ||
          detailsForm.what_to_expect.some((item) => item.trim()));

      if (hasDetails) {
        const existingDetails = sessionDetails.get(sessionId);
        const detailsPayload = {
          linked_session_id: sessionId,
          session_title: detailsForm.session_title || null,
          short_description: detailsForm.short_description || null,
          photo_url: detailsForm.photo_url || null,
          what_to_expect: detailsForm.what_to_expect.filter((item) => item.trim()),
          name: detailsForm.name || null,
          title: detailsForm.title || null,
        };

        if (existingDetails) {
          await db.from("live_session_details").update(detailsPayload).eq("id", existingDetails.id);
        } else {
          await db.from("live_session_details").insert(detailsPayload);
        }
      }

      resetDialog();
      await queryClient.invalidateQueries({ queryKey: ["admin-live-sessions"] });
    } catch (err) {
      console.error("Error saving session:", err);
      toast.error(err instanceof Error ? err.message : "Failed to save session");
    } finally {
      setIsCreating(false);
    }
  };

  // Status change
  const handleStatusChange = async (session: LiveSession, newStatus: string) => {
    setActionLoading(session.id);
    try {
      const { error } = await supabase
        .from("live_sessions")
        .update({ status: newStatus })
        .eq("id", session.id);
      if (error) throw error;
      queryClient.setQueryData<{
        sessions: LiveSession[];
        sessionDetails: Map<string, LiveSessionDetails>;
      }>(["admin-live-sessions"], (prev) =>
        prev
          ? {
              ...prev,
              sessions: prev.sessions.map((s) =>
                s.id === session.id ? { ...s, status: newStatus } : s
              ),
            }
          : prev
      );
      toast.success(`Session ${newStatus === "live" ? "started" : "ended"}`);
    } catch (err) {
      toast.error("Failed to update session status");
    } finally {
      setActionLoading(null);
    }
  };

  // Generate guest link
  const handleGenerateGuestLink = async (session: LiveSession) => {
    setActionLoading(session.id);
    try {
      const { data, error: linkError } = await supabase.functions.invoke(
        "daily-generate-guest-link",
        { body: { sessionId: session.id } }
      );
      if (linkError) throw linkError;
      await navigator.clipboard.writeText(data.guestJoinUrl);
      toast.success("Guest link copied to clipboard");
      await queryClient.invalidateQueries({ queryKey: ["admin-live-sessions"] });
    } catch (err) {
      toast.error("Failed to generate guest link");
    } finally {
      setActionLoading(null);
    }
  };

  // Copy host link
  const handleCopyHostLink = async (session: LiveSession) => {
    await navigator.clipboard.writeText(`${window.location.origin}/live/${session.id}?role=host`);
    toast.success("Host link copied");
  };

  // Delete session
  const handleDelete = async (session: LiveSession) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    try {
      const { error } = await supabase.from("live_sessions").delete().eq("id", session.id);
      if (error) throw error;
      queryClient.setQueryData<{
        sessions: LiveSession[];
        sessionDetails: Map<string, LiveSessionDetails>;
      }>(["admin-live-sessions"], (prev) => {
        if (!prev) return prev;
        const next = new Map(prev.sessionDetails);
        next.delete(session.id);
        return { sessions: prev.sessions.filter((s) => s.id !== session.id), sessionDetails: next };
      });
      toast.success("Session deleted");
    } catch (err) {
      toast.error("Failed to delete session");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return <Badge className="animate-pulse bg-red-500 text-white">Live</Badge>;
      case "ended":
        return <Badge variant="secondary">Ended</Badge>;
      default:
        return <Badge variant="outline">Scheduled</Badge>;
    }
  };

  const getTypeLabel = (type: string) =>
    configs.find((c) => c.session_type === type)?.title ?? type;

  const getTypeBadge = (type: SessionType | null) => {
    if (!type) return null;
    return (
      <Badge variant="outline" className={`text-xs ${getTypeColor(type)}`}>
        {getTypeLabel(type)}
      </Badge>
    );
  };

  const filteredSessions =
    typeFilter === "all" ? sessions : sessions.filter((s) => s.session_type === typeFilter);

  // ── Create/Edit Session Dialog ──
  const sessionDialog = (
    <Dialog
      open={showCreateDialog}
      onOpenChange={(open) => {
        if (!open) resetDialog();
        else setShowCreateDialog(true);
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Session
        </Button>
      </DialogTrigger>
      <DialogContent
        className={
          showDetails
            ? "max-h-[90vh] max-w-7xl overflow-y-auto"
            : "max-h-[90vh] max-w-3xl overflow-y-auto"
        }
        onInteractOutside={handleCloseAttempt}
        onEscapeKeyDown={handleCloseAttempt}
      >
        <DialogHeader>
          <DialogTitle>{editingSession ? "Edit Session" : "Create Live Session"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-6">
          <div className={showDetails ? "grid grid-cols-2 items-start gap-6" : "space-y-6"}>
            {/* ── Left: core session fields ── */}
            <div className="space-y-6">
              {/* Session Type */}
              <div className="space-y-3">
                <Label>Session Type *</Label>
                <Select
                  value={sessionForm.session_type}
                  onValueChange={(v) =>
                    setSessionForm((p) => ({ ...p, session_type: v as SessionType }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {configs.map((c) => (
                      <SelectItem key={c.session_type} value={c.session_type}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Title *</Label>
                <Input
                  value={sessionForm.title}
                  onChange={(e) => setSessionForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Weekly Reset"
                />
              </div>

              <div className="space-y-3">
                <Label>Description</Label>
                <Textarea
                  value={sessionForm.description}
                  onChange={(e) => setSessionForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="A calming breathwork session..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-3">
                  <Label>Start Time *</Label>
                  <Input
                    type="datetime-local"
                    value={sessionForm.start_time}
                    onChange={(e) => setSessionForm((p) => ({ ...p, start_time: e.target.value }))}
                  />
                </div>
                <div className="space-y-3">
                  <Label>End Time</Label>
                  <Input
                    type="datetime-local"
                    value={sessionForm.end_time}
                    onChange={(e) => setSessionForm((p) => ({ ...p, end_time: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={sessionForm.recording_enabled}
                  onCheckedChange={(v) => setSessionForm((p) => ({ ...p, recording_enabled: v }))}
                />
                <Label>Enable Recording</Label>
              </div>

              {/* Details toggle */}
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg border border-border p-3 text-sm font-medium transition-colors hover:bg-muted/50"
                onClick={() => setShowDetails((v) => !v)}
              >
                <span>Session Details (optional)</span>
                {showDetails ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* ── Right: session details panel (visible when expanded) ── */}
            {showDetails && (
              <div className="space-y-6 rounded-lg border border-border p-6">
                {/* Photo */}
                <div className="space-y-3">
                  <Label>Session Image</Label>
                  {detailsForm.photo_url ? (
                    <div className="relative h-36 w-full overflow-hidden rounded-lg border border-border">
                      <img
                        src={detailsForm.photo_url}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-36 w-full items-center justify-center rounded-lg border border-dashed border-border">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      onClick={() => photoInputRef.current?.click()}
                    >
                      {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {uploading ? "Uploading…" : "Upload Image"}
                    </Button>
                    {uploading && (
                      <Button type="button" variant="ghost" size="sm" onClick={cancelUpload}>
                        Cancel
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="Or paste an image URL"
                    value={detailsForm.photo_url}
                    onChange={(e) => setDetailsForm((p) => ({ ...p, photo_url: e.target.value }))}
                  />
                </div>

                {/* Session Title */}
                <div className="space-y-2">
                  <Label>Session Title</Label>
                  <Input
                    placeholder="e.g. Weekly Reset: Softening Through the Week"
                    value={detailsForm.session_title}
                    onChange={(e) =>
                      setDetailsForm((p) => ({ ...p, session_title: e.target.value }))
                    }
                  />
                </div>

                {/* Short Description */}
                <div className="space-y-2">
                  <Label>Short Description</Label>
                  <Textarea
                    placeholder="A brief description for this session..."
                    value={detailsForm.short_description}
                    onChange={(e) =>
                      setDetailsForm((p) => ({ ...p, short_description: e.target.value }))
                    }
                  />
                </div>

                {/* Featured Person */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Featured Person Name</Label>
                    <Input
                      placeholder="e.g. Emily"
                      value={detailsForm.name}
                      onChange={(e) => setDetailsForm((p) => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Their Role / Title</Label>
                    <Input
                      placeholder="e.g. Breathwork Facilitator"
                      value={detailsForm.title}
                      onChange={(e) => setDetailsForm((p) => ({ ...p, title: e.target.value }))}
                    />
                  </div>
                </div>

                {/* What to Expect */}
                <div className="space-y-2">
                  <Label>What to Expect</Label>
                  <div className="space-y-2">
                    {detailsForm.what_to_expect.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          value={item}
                          onChange={(e) => {
                            const updated = [...detailsForm.what_to_expect];
                            updated[i] = e.target.value;
                            setDetailsForm((p) => ({ ...p, what_to_expect: updated }));
                          }}
                          placeholder="e.g. A guided, voice-led practice"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setDetailsForm((p) => ({
                              ...p,
                              what_to_expect: p.what_to_expect.filter((_, idx) => idx !== i),
                            }))
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      setDetailsForm((p) => ({
                        ...p,
                        what_to_expect: [...p.what_to_expect, ""],
                      }))
                    }
                  >
                    <Plus className="mr-1" />
                    Add item
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Button onClick={handleSave} disabled={isCreating} className="w-full">
            {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {editingSession ? "Save Changes" : "Create Session"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <AdminLayout
      title="Live Sessions"
      description="Manage all live session types and individual session instances"
    >
      <Tabs defaultValue="instances">
        <TabsList className="mb-6">
          <TabsTrigger value="instances">Daily Instances</TabsTrigger>
          <TabsTrigger value="session-types">Session Types</TabsTrigger>
        </TabsList>

        {/* ── Instances Tab ── */}
        <TabsContent value="instances">
          <div className="mb-4 flex items-center justify-between gap-4">
            {/* Filter tabs */}
            <div className="flex gap-2">
              {["all", ...configs.map((c) => c.session_type)].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    typeFilter === type
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type === "all" ? "All" : getTypeLabel(type)}
                </button>
              ))}
            </div>
            {sessionDialog}
          </div>

          {isLoading ? (
            <AdminContentSkeleton showStats={false} variant="table" />
          ) : filteredSessions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {typeFilter === "all"
                ? "No live sessions yet. Create your first one!"
                : `No ${getTypeLabel(typeFilter)} sessions yet.`}
            </div>
          ) : (
            <AdminTable
              headers={[
                "Session",
                "Type",
                "Status",
                "Start Time",
                "Attendees",
                "Room",
                "Guest Link",
                "Actions",
              ]}
            >
              {filteredSessions.map((session) => {
                const details = sessionDetails.get(session.id);
                return (
                  <TableRow key={session.id} className={adminTableRowClass}>
                    <TableCell className={adminTableCellClass}>
                      <div className="flex items-center gap-3">
                        {details?.photo_url && (
                          <img
                            src={details.photo_url}
                            alt=""
                            className="h-9 w-9 flex-shrink-0 rounded-md object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{session.title}</p>
                          {details?.name && (
                            <p className="text-xs text-muted-foreground">
                              {details.name}
                              {details.title ? ` · ${details.title}` : ""}
                            </p>
                          )}
                          {!details?.name && session.description && (
                            <p className="max-w-xs truncate text-xs text-muted-foreground">
                              {session.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className={adminTableCellClass}>
                      {getTypeBadge(session.session_type)}
                    </TableCell>
                    <TableCell className={adminTableCellClass}>
                      {getStatusBadge(session.status)}
                    </TableCell>
                    <TableCell className={adminTableCellClass}>
                      {format(new Date(session.start_time), "MMM d, yyyy h:mm a")}
                    </TableCell>
                    <TableCell className={adminTableCellClass}>
                      <span className="flex items-center gap-1">
                        <Users className="h-5 w-5" />
                        {session.attendee_count}
                      </span>
                    </TableCell>
                    <TableCell className={adminTableCellClass}>
                      {session.daily_room_name ? (
                        <Badge variant="outline" className="font-mono text-xs">
                          {session.daily_room_name}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not created</span>
                      )}
                    </TableCell>
                    <TableCell className={adminTableCellClass}>
                      {session.guest_token ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            Active
                          </Badge>
                          <Button
                            variant="ghost"
                            onClick={() => handleGenerateGuestLink(session)}
                            disabled={actionLoading === session.id}
                          >
                            <RefreshCw className="h-5 w-5" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          onClick={() => handleGenerateGuestLink(session)}
                          disabled={actionLoading === session.id}
                        >
                          <Link2 className="mr-1 h-5 w-5" />
                          Generate
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className={adminTableCellClass}>
                      <div className="flex items-center gap-1">
                        {session.status === "scheduled" && (
                          <Button
                            variant="default"
                            onClick={() => handleStatusChange(session, "live")}
                            disabled={actionLoading === session.id}
                          >
                            <Play className="mr-1 h-5 w-5" />
                            Go Live
                          </Button>
                        )}
                        {session.status === "live" && (
                          <Button
                            variant="destructive"
                            onClick={() => handleStatusChange(session, "ended")}
                            disabled={actionLoading === session.id}
                          >
                            <Square className="mr-1 h-5 w-5" />
                            End
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => window.open(`/live/${session.id}?role=host`, "_blank")}
                        >
                          <Video className="mr-1 h-5 w-5" />
                          {session.status === "scheduled" ? "Test" : "Join"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyHostLink(session)}
                        >
                          <Copy className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(session)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(session)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </AdminTable>
          )}
        </TabsContent>

        {/* ── Session Types Tab ── */}
        <TabsContent value="session-types">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Configure recurring session types. New types appear as options when creating
              instances.
            </p>
            <CreateConfigDialog
              onCreated={(config) =>
                queryClient.setQueryData<LiveSessionConfig[]>(
                  ["admin-live-session-configs"],
                  (prev) => [...(prev ?? []), config]
                )
              }
            />
          </div>
          {configsLoading ? (
            <AdminContentSkeleton showStats={false} variant="cards" />
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {configs.map((config) => (
                <Card key={config.session_type} className="border-[#E6DBC7]/10 bg-background/40">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge
                          variant="outline"
                          className={`mb-2 text-xs ${getTypeColor(config.session_type)}`}
                        >
                          {config.session_type}
                        </Badge>
                        <CardTitle className="text-lg font-normal text-[#E6DBC7]">
                          {config.title}
                        </CardTitle>
                      </div>
                      <ConfigEditDialog
                        config={config}
                        onSaved={(updated) =>
                          queryClient.setQueryData<LiveSessionConfig[]>(
                            ["admin-live-session-configs"],
                            (prev) =>
                              (prev ?? []).map((c) =>
                                c.session_type === updated.session_type ? updated : c
                              )
                          )
                        }
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm text-muted-foreground">
                    {config.subtitle && <p className="line-clamp-2 text-xs">{config.subtitle}</p>}
                    {config.recurrence_label && (
                      <p>
                        <span className="font-medium text-foreground/70">Recurrence:</span>{" "}
                        {config.recurrence_label}
                      </p>
                    )}
                    {config.time && (
                      <p>
                        <span className="font-medium text-foreground/70">Time:</span> {config.time}{" "}
                        {config.timezone}
                        {config.duration ? ` · ${config.duration}` : ""}
                      </p>
                    )}
                    {config.event_type && (
                      <p>
                        <span className="font-medium text-foreground/70">Type:</span>{" "}
                        {config.event_type}
                      </p>
                    )}
                    {!config.is_active && (
                      <Badge variant="secondary" className="mt-1">
                        Inactive
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminLiveSessions;

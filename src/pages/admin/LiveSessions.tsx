import { useQueryClient } from "@tanstack/react-query";
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
import { useAdminLiveSessionConfigs } from "./hooks/useAdminLiveSessionConfigs";
import { type SaveSessionInput, useAdminLiveSessions } from "./hooks/useAdminLiveSessions";
import { LiveSession, LiveSessionConfig, SessionType } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

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
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<SessionType | "all">("all");

  const { data: configs = [], isLoading: configsLoading } = useAdminLiveSessionConfigs();
  const {
    sessionsData,
    isLoading,
    fetchRecordingMutation,
    deleteSessionMutation,
    statusChangeMutation,
    saveSessionMutation,
  } = useAdminLiveSessions();

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
    recording_url: "",
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
      recording_url: session.recording_url ?? "",
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
  const handleSave = () => {
    const hasDetails =
      showDetails &&
      (detailsForm.session_title ||
        detailsForm.short_description ||
        detailsForm.photo_url ||
        detailsForm.name ||
        detailsForm.title ||
        detailsForm.what_to_expect.some((item) => item.trim()));

    const existingDetails = editingSession ? sessionDetails.get(editingSession.id) : undefined;

    const input: SaveSessionInput = {
      form: {
        title: sessionForm.title,
        description: sessionForm.description,
        start_time: sessionForm.start_time,
        end_time: sessionForm.end_time,
        session_type: sessionForm.session_type,
        recording_enabled: sessionForm.recording_enabled,
        recording_url: sessionForm.recording_url,
      },
      editingSessionId: editingSession?.id ?? null,
      createdBy: user?.id,
      detailsPayload: hasDetails
        ? {
            session_title: detailsForm.session_title || null,
            short_description: detailsForm.short_description || null,
            photo_url: detailsForm.photo_url || null,
            what_to_expect: detailsForm.what_to_expect.filter((item) => item.trim()),
            name: detailsForm.name || null,
            title: detailsForm.title || null,
          }
        : null,
      existingDetailsId: existingDetails?.id,
    };

    saveSessionMutation.mutate(input, { onSuccess: resetDialog });
  };

  // Status change
  const handleStatusChange = (session: LiveSession, newStatus: string) => {
    setActionLoading(session.id);
    statusChangeMutation.mutate(
      { sessionId: session.id, newStatus: newStatus as "scheduled" | "live" | "ended" },
      { onSettled: () => setActionLoading(null) }
    );
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

  // Copy guest link (reconstructs URL from persisted guest_token — no edge function call)
  const handleCopyGuestLink = async (session: LiveSession) => {
    if (!session.guest_token) return;
    const url = `${window.location.origin}/live/${session.id}?role=guest&token=${session.guest_token}`;
    await navigator.clipboard.writeText(url);
    toast.success("Guest link copied");
  };

  // Copy host link
  const handleCopyHostLink = async (session: LiveSession) => {
    await navigator.clipboard.writeText(`${window.location.origin}/live/${session.id}?role=host`);
    toast.success("Host link copied");
  };

  // Delete session
  const handleDelete = (session: LiveSession) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    deleteSessionMutation.mutate(session.id);
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
                  onValueChange={(v) => {
                    const selected = configs.find((c) => c.session_type === v);
                    setSessionForm((p) => {
                      const update: typeof p = { ...p, session_type: v as SessionType };
                      if (selected?.time) {
                        const date = p.start_time
                          ? p.start_time.slice(0, 10)
                          : new Date().toISOString().slice(0, 10);
                        const time = selected.time.replace(".", ":");
                        update.start_time = `${date}T${time}`;
                      }
                      return update;
                    });
                  }}
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

              {!editingSession ? (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={sessionForm.recording_enabled}
                    onCheckedChange={(v) => setSessionForm((p) => ({ ...p, recording_enabled: v }))}
                  />
                  <Label>Enable Recording</Label>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Recording is configured at room creation and cannot be changed after.
                </p>
              )}

              {editingSession && (
                <div className="space-y-2">
                  <Label>Recording URL (optional)</Label>
                  <Input
                    placeholder="Paste recording URL to make replay available"
                    value={sessionForm.recording_url}
                    onChange={(e) =>
                      setSessionForm((p) => ({ ...p, recording_url: e.target.value }))
                    }
                  />
                </div>
              )}

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

          <Button onClick={handleSave} disabled={saveSessionMutation.isPending} className="w-full">
            {saveSessionMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
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
          <div className="mb-6 flex items-center justify-between gap-4">
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
                "Status",
                "Start Time",
                "Room",
                "Recording",
                "Guest Link",
                "Host Actions",
              ]}
            >
              {filteredSessions.map((session) => {
                const details = sessionDetails.get(session.id);
                const isFetchingThis =
                  fetchRecordingMutation.isPending &&
                  fetchRecordingMutation.variables?.sessionId === session.id;
                return (
                  <TableRow key={session.id} className={adminTableRowClass}>
                    {/* Session — title + type badge + attendee count */}
                    <TableCell className={adminTableCellClass}>
                      <div className="flex items-center gap-6">
                        {details?.photo_url && (
                          <img
                            src={details.photo_url}
                            alt=""
                            className="h-12 w-12 flex-shrink-0 rounded-md object-cover"
                          />
                        )}
                        <div className="space-y-2">
                          <p className="font-medium">{session.title}</p>
                          <div className="flex items-center gap-2">
                            {getTypeBadge(session.session_type)}
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="h-3 w-3" />
                              {session.attendee_count}
                            </span>
                          </div>
                          {details?.name && (
                            <p className="text-xs text-muted-foreground">
                              {details.name}
                              {details.title ? ` · ${details.title}` : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className={adminTableCellClass}>
                      {getStatusBadge(session.status)}
                    </TableCell>

                    {/* Start Time — parsed without timezone offset to display the UTC value as entered */}
                    <TableCell className={adminTableCellClass}>
                      <span className="text-sm">
                        {format(
                          new Date(session.start_time.slice(0, 16).replace(" ", "T")),
                          "MMM d, yyyy"
                        )}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {format(
                          new Date(session.start_time.slice(0, 16).replace(" ", "T")),
                          "h:mm a"
                        )}
                      </p>
                    </TableCell>

                    {/* Room */}
                    <TableCell className={adminTableCellClass}>
                      {session.daily_room_name ? (
                        <Badge variant="outline" className="font-mono text-xs">
                          {session.daily_room_name}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not created</span>
                      )}
                    </TableCell>

                    {/* Recording */}
                    <TableCell className={adminTableCellClass}>
                      {session.recording_url ? (
                        <a
                          href={session.recording_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400 hover:bg-green-500/20"
                        >
                          <Video className="h-3.5 w-3.5" />
                          Ready
                        </a>
                      ) : session.recording_enabled && session.daily_room_name ? (
                        <Button
                          variant="ghost"
                          className="h-7 px-2"
                          onClick={() =>
                            fetchRecordingMutation.mutate({
                              sessionId: session.id,
                              roomName: session.daily_room_name!,
                              sessionType: session.session_type,
                            })
                          }
                          disabled={isFetchingThis || session.status !== "ended"}
                          title={
                            session.status !== "ended"
                              ? "Available after session ends"
                              : "Fetch from Daily.co"
                          }
                        >
                          {isFetchingThis ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3.5 w-3.5" />
                          )}
                          Fetch
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Guest Link */}
                    <TableCell className={adminTableCellClass}>
                      {session.guest_token ? (
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-xs">
                            Active
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Regenerate link"
                            onClick={() => handleGenerateGuestLink(session)}
                            disabled={actionLoading === session.id}
                          >
                            {actionLoading === session.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Copy guest link"
                            onClick={() => handleCopyGuestLink(session)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          onClick={() => handleGenerateGuestLink(session)}
                          disabled={actionLoading === session.id}
                        >
                          {actionLoading === session.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Link2 className="h-3.5 w-3.5" />
                          )}
                          Generate
                        </Button>
                      )}
                    </TableCell>

                    {/* Actions — stacked vertically */}
                    <TableCell className={adminTableCellClass}>
                      <div className="flex flex-col gap-5">
                        {/* Row 1: live status + test/join */}
                        <div className="flex items-center gap-3">
                          {session.status === "scheduled" && (
                            <Button
                              className="h-9 px-3 text-xs"
                              onClick={() => handleStatusChange(session, "live")}
                              disabled={actionLoading === session.id}
                            >
                              <Play className="h-3.5 w-3.5" />
                              Go Live
                            </Button>
                          )}
                          {session.status === "live" && (
                            <Button
                              variant="destructive"
                              className="h-9 px-3 text-xs"
                              onClick={() => handleStatusChange(session, "ended")}
                              disabled={actionLoading === session.id}
                            >
                              <Square className="h-3.5 w-3.5" />
                              End
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            className="h-9 px-3 text-xs"
                            onClick={() => window.open(`/live/${session.id}?role=host`, "_blank")}
                          >
                            <Video className="h-3.5 w-3.5" />
                            {session.status === "scheduled" ? "Test" : "Join"}
                          </Button>
                        </div>
                        {/* Row 2: copy host / edit / delete */}
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Copy host link"
                            onClick={() => handleCopyHostLink(session)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Edit session"
                            onClick={() => openEditDialog(session)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            title="Delete session"
                            onClick={() => handleDelete(session)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
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

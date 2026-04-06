import { Calendar, CalendarDays, Loader2, MapPin, Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminLayout, AdminStatsCard, AdminTable, adminTableCellClass, adminTableRowClass } from "@/components/admin";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

import { NTH_LABELS, WEEKDAY_LABELS } from "./adminScheduleUtils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

interface ExperienceConfig {
  id: string;
  experience_type: string;
  title: string;
  subtitle: string | null;
  recurrence_type: "nthWeekday" | "weekly" | "nthDay" | null;
  weekday: number | null;
  nth: number | null;
  weekdays: number[] | null;
  nth_day: number | null;
  time: string | null;
  timezone: string;
  duration: string | null;
  recurrence_label: string | null;
  cta_label: string | null;
  cta_link: string | null;
  event_type: string | null;
  format: string | null;
  location: string | null;
  venue: string | null;
  price: string | null;
  image_url: string | null;
  is_active: boolean;
  max_capacity: number;
}

interface ExperienceDate {
  id: string;
  experience_type: string;
  experience_config_id: string | null;
  date: string; // YYYY-MM-DD
  time: string | null;
  is_cancelled: boolean;
  notes: string | null;
  max_capacity: number;
}

type ExperienceFormState = Omit<ExperienceConfig, "id">;


const emptyForm: ExperienceFormState = {
  experience_type: "",
  title: "",
  subtitle: "",
  recurrence_type: "nthWeekday",
  weekday: 3,
  nth: 1,
  weekdays: [],
  nth_day: null,
  time: "20:00",
  timezone: "GMT",
  duration: "90 mins",
  recurrence_label: "",
  cta_label: "Book",
  cta_link: "",
  event_type: "paid",
  format: "In-Person",
  location: "Soho",
  venue: "",
  price: "",
  image_url: "",
  is_active: true,
  max_capacity: 15,
};

// ────────────────────────────────────────────────────────
// Utility: format an ISO date string for display
// ────────────────────────────────────────────────────────

function formatDate(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ────────────────────────────────────────────────────────
// Utility: generate ISO date strings from a recurrence rule
// ────────────────────────────────────────────────────────

function getNthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): Date {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  let dayOfMonth = 1 + ((weekday - firstWeekday + 7) % 7);
  dayOfMonth += (nth - 1) * 7;
  return new Date(year, month, dayOfMonth);
}

function generateDateRange(config: ExperienceConfig, from: Date, to: Date): string[] {
  const fromISO = from.toISOString().split("T")[0];
  const toISO = to.toISOString().split("T")[0];
  const dates: string[] = [];

  if (config.recurrence_type === "nthWeekday" && config.weekday != null && config.nth != null) {
    let year = from.getFullYear();
    let month = from.getMonth();
    const endYear = to.getFullYear();
    const endMonth = to.getMonth();

    while (year < endYear || (year === endYear && month <= endMonth)) {
      const date = getNthWeekdayOfMonth(year, month, config.weekday, config.nth);
      const iso = date.toISOString().split("T")[0];
      if (iso >= fromISO && iso <= toISO) dates.push(iso);
      month++;
      if (month > 11) { month = 0; year++; }
    }
  } else if (config.recurrence_type === "weekly" && config.weekdays?.length) {
    const d = new Date(from);
    while (d <= to) {
      if (config.weekdays.includes(d.getDay())) {
        dates.push(d.toISOString().split("T")[0]);
      }
      d.setDate(d.getDate() + 1);
    }
  } else if (config.recurrence_type === "nthDay" && config.nth_day != null) {
    let year = from.getFullYear();
    let month = from.getMonth();
    const endYear = to.getFullYear();
    const endMonth = to.getMonth();

    while (year < endYear || (year === endYear && month <= endMonth)) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const day = Math.min(config.nth_day, daysInMonth);
      const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      if (iso >= fromISO && iso <= toISO) dates.push(iso);
      month++;
      if (month > 11) { month = 0; year++; }
    }
  }

  return dates;
}

// ────────────────────────────────────────────────────────
// Shared form fields
// ────────────────────────────────────────────────────────

interface ExperienceFormFieldsProps {
  form: ExperienceFormState;
  setForm: React.Dispatch<React.SetStateAction<ExperienceFormState>>;
  mode: "create" | "edit";
}

const ExperienceFormFields = ({ form, setForm, mode }: ExperienceFormFieldsProps) => {
  const toggleWeekday = (day: number) => {
    const current = form.weekdays ?? [];
    setForm((prev) => ({
      ...prev,
      weekdays: current.includes(day) ? current.filter((d) => d !== day) : [...current, day],
    }));
  };

  return (
    <div className="space-y-6 py-6">
      {mode === "create" && (
        <div className="space-y-2">
          <Label>Experience Type (slug)</Label>
          <Input
            placeholder="e.g. breathwork-to-dub"
            value={form.experience_type}
            onChange={(e) => setForm((p) => ({ ...p, experience_type: e.target.value }))}
          />
          <p className="text-xs text-foreground/50">
            Lowercase letters, numbers, and hyphens only. Cannot be changed after creation.
          </p>
        </div>
      )}

      {mode === "edit" && (
        <div className="space-y-2">
          <Label>Experience Type (slug)</Label>
          <p className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-sm text-foreground/60">
            {form.experience_type}
          </p>
        </div>
      )}

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
            placeholder="90 mins"
            value={form.duration ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
          />
        </div>
      </div>

      {/* Recurrence */}
      <div className="space-y-6 rounded-lg border border-border p-6">
        <div className="space-y-3">
          <Label>Recurrence Type</Label>
          <Select
            value={form.recurrence_type ?? "nthWeekday"}
            onValueChange={(v) =>
              setForm((p) => ({
                ...p,
                recurrence_type: v as "nthWeekday" | "weekly" | "nthDay",
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nthWeekday">Nth Weekday of month</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="nthDay">Nth Day of month</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
                value={String(form.weekday ?? 3)}
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

        {form.recurrence_type === "nthDay" && (
          <div className="space-y-2">
            <Label>Day of month</Label>
            <Input
              type="number"
              min={1}
              max={31}
              value={form.nth_day ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, nth_day: e.target.value ? Number(e.target.value) : null }))
              }
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Recurrence Label</Label>
          <Input
            placeholder="e.g. Every 3rd Wednesday"
            value={form.recurrence_label ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, recurrence_label: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>CTA Label</Label>
          <Input
            placeholder="Book"
            value={form.cta_label ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, cta_label: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>CTA Link (Calendly URL)</Label>
          <Input
            placeholder="https://calendly.com/..."
            value={form.cta_link ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, cta_link: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Price</Label>
          <Input
            placeholder="£20"
            value={form.price ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Location</Label>
          <Input
            placeholder="Soho"
            value={form.location ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Venue (full address)</Label>
        <Input
          placeholder="AUFI, 20 Eastcastle St, London W1W 8DB"
          value={form.venue ?? ""}
          onChange={(e) => setForm((p) => ({ ...p, venue: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label>Max Capacity per date</Label>
        <Input
          type="number"
          min={1}
          value={form.max_capacity}
          onChange={(e) =>
            setForm((p) => ({ ...p, max_capacity: e.target.value ? Number(e.target.value) : 15 }))
          }
        />
        <p className="text-xs text-foreground/50">
          Used as the default when generating dates. Can be overridden per date.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input
          placeholder="https://..."
          value={form.image_url ?? ""}
          onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))}
        />
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="is_active"
          checked={form.is_active}
          onCheckedChange={(checked) => setForm((p) => ({ ...p, is_active: checked }))}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────
// Create dialog
// ────────────────────────────────────────────────────────

interface CreateExperienceDialogProps {
  onCreated: (config: ExperienceConfig) => void;
}

const CreateExperienceDialog = ({ onCreated }: CreateExperienceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ExperienceFormState>({ ...emptyForm });

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.experience_type.trim()) {
      toast.error("Experience type slug is required");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(form.experience_type)) {
      toast.error("Slug must contain only lowercase letters, numbers, and hyphens");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        experience_type: form.experience_type,
        title: form.title,
        subtitle: form.subtitle || null,
        recurrence_type: form.recurrence_type,
        weekday: form.recurrence_type === "nthWeekday" ? form.weekday : null,
        nth: form.recurrence_type === "nthWeekday" ? form.nth : null,
        weekdays: form.recurrence_type === "weekly" ? form.weekdays : null,
        nth_day: form.recurrence_type === "nthDay" ? form.nth_day : null,
        time: form.time || null,
        timezone: form.timezone || "GMT",
        duration: form.duration || null,
        recurrence_label: form.recurrence_label || null,
        cta_label: form.cta_label || null,
        cta_link: form.cta_link || null,
        event_type: form.event_type || null,
        format: form.format || null,
        location: form.location || null,
        venue: form.venue || null,
        price: form.price || null,
        image_url: form.image_url || null,
        is_active: form.is_active,
        max_capacity: form.max_capacity,
      };

      const { data, error } = await db
        .from("experience_configs")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      onCreated(data as ExperienceConfig);
      setOpen(false);
      setForm({ ...emptyForm });
      toast.success("Experience created");
    } catch (err) {
      console.error("Error creating experience:", err);
      toast.error(err instanceof Error ? err.message : "Failed to create experience");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Experience
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New In-Person Experience</DialogTitle>
        </DialogHeader>
        <ExperienceFormFields form={form} setForm={setForm} mode="create" />
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Create Experience"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ────────────────────────────────────────────────────────
// Edit dialog
// ────────────────────────────────────────────────────────

interface EditExperienceDialogProps {
  config: ExperienceConfig;
  onSaved: (updated: ExperienceConfig) => void;
}

const EditExperienceDialog = ({ config, onSaved }: EditExperienceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ExperienceFormState>({
    experience_type: config.experience_type,
    title: config.title,
    subtitle: config.subtitle ?? "",
    recurrence_type: config.recurrence_type,
    weekday: config.weekday,
    nth: config.nth,
    weekdays: config.weekdays ?? [],
    nth_day: config.nth_day,
    time: config.time ?? "",
    timezone: config.timezone,
    duration: config.duration ?? "",
    recurrence_label: config.recurrence_label ?? "",
    cta_label: config.cta_label ?? "",
    cta_link: config.cta_link ?? "",
    event_type: config.event_type ?? "paid",
    format: config.format ?? "In-Person",
    location: config.location ?? "",
    venue: config.venue ?? "",
    price: config.price ?? "",
    image_url: config.image_url ?? "",
    is_active: config.is_active,
    max_capacity: config.max_capacity,
  });

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        subtitle: form.subtitle || null,
        recurrence_type: form.recurrence_type,
        weekday: form.recurrence_type === "nthWeekday" ? form.weekday : null,
        nth: form.recurrence_type === "nthWeekday" ? form.nth : null,
        weekdays: form.recurrence_type === "weekly" ? form.weekdays : null,
        nth_day: form.recurrence_type === "nthDay" ? form.nth_day : null,
        time: form.time || null,
        timezone: form.timezone || "GMT",
        duration: form.duration || null,
        recurrence_label: form.recurrence_label || null,
        cta_label: form.cta_label || null,
        cta_link: form.cta_link || null,
        event_type: form.event_type || null,
        format: form.format || null,
        location: form.location || null,
        venue: form.venue || null,
        price: form.price || null,
        image_url: form.image_url || null,
        is_active: form.is_active,
        max_capacity: form.max_capacity,
      };

      const { error } = await db
        .from("experience_configs")
        .update(payload)
        .eq("id", config.id);

      if (error) throw error;

      onSaved({ ...config, ...payload });
      setOpen(false);
      toast.success("Experience saved");
    } catch (err) {
      console.error("Error saving experience:", err);
      toast.error(err instanceof Error ? err.message : "Failed to save experience");
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
          <DialogTitle>Edit {config.title}</DialogTitle>
        </DialogHeader>
        <ExperienceFormFields form={form} setForm={setForm} mode="edit" />
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ────────────────────────────────────────────────────────
// Manage Dates dialog
// ────────────────────────────────────────────────────────

interface ManageDatesDialogProps {
  config: ExperienceConfig;
}

const ManageDatesDialog = ({ config }: ManageDatesDialogProps) => {
  const [open, setOpen] = useState(false);
  const [dates, setDates] = useState<ExperienceDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [addDate, setAddDate] = useState("");
  const [addTime, setAddTime] = useState("");
  const [addNotes, setAddNotes] = useState("");
  const [addCapacity, setAddCapacity] = useState<number>(config.max_capacity);
  const [adding, setAdding] = useState(false);

  const fetchDates = async () => {
    setLoading(true);
    try {
      const { data, error } = await db
        .from("experience_dates")
        .select("*")
        .eq("experience_type", config.experience_type)
        .order("date", { ascending: true });
      if (error) throw error;
      setDates((data ?? []) as ExperienceDate[]);
    } catch (err) {
      toast.error("Failed to load dates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchDates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleToggleCancel = async (date: ExperienceDate) => {
    try {
      const { error } = await db
        .from("experience_dates")
        .update({ is_cancelled: !date.is_cancelled })
        .eq("id", date.id);
      if (error) throw error;
      setDates((prev) =>
        prev.map((d) => (d.id === date.id ? { ...d, is_cancelled: !d.is_cancelled } : d))
      );
      toast.success(date.is_cancelled ? "Date reinstated" : "Date cancelled");
    } catch {
      toast.error("Failed to update date");
    }
  };

  const handleDeleteDate = async (id: string) => {
    try {
      const { error } = await db.from("experience_dates").delete().eq("id", id);
      if (error) throw error;
      setDates((prev) => prev.filter((d) => d.id !== id));
      toast.success("Date removed");
    } catch {
      toast.error("Failed to remove date");
    }
  };

  const handleAddDate = async () => {
    if (!addDate) {
      toast.error("Date is required");
      return;
    }
    setAdding(true);
    try {
      const { data, error } = await db
        .from("experience_dates")
        .insert({
          experience_type: config.experience_type,
          experience_config_id: config.id,
          date: addDate,
          time: addTime || null,
          notes: addNotes || null,
          max_capacity: addCapacity,
        })
        .select()
        .single();
      if (error) throw error;
      setDates((prev) =>
        [...prev, data as ExperienceDate].sort((a, b) => a.date.localeCompare(b.date))
      );
      setAddDate("");
      setAddTime("");
      setAddNotes("");
      setAddCapacity(config.max_capacity);
      toast.success("Date added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add date");
    } finally {
      setAdding(false);
    }
  };

  const handleGenerate = async () => {
    if (!config.recurrence_type) {
      toast.error("No recurrence type set on this experience");
      return;
    }
    setGenerating(true);
    try {
      const from = new Date();
      const to = new Date();
      to.setMonth(to.getMonth() + 6);

      const isoDates = generateDateRange(config, from, to);
      if (!isoDates.length) {
        toast.info("No dates generated — check recurrence settings");
        return;
      }

      const rows = isoDates.map((d) => ({
        experience_type: config.experience_type,
        experience_config_id: config.id,
        date: d,
        time: null,
        max_capacity: config.max_capacity,
      }));

      const { error } = await db
        .from("experience_dates")
        .upsert(rows, { onConflict: "experience_type,date", ignoreDuplicates: true });

      if (error) throw error;

      await fetchDates();
      toast.success(`Generated ${isoDates.length} dates (skipped existing)`);
    } catch (err) {
      console.error("Error generating dates:", err);
      toast.error(err instanceof Error ? err.message : "Failed to generate dates");
    } finally {
      setGenerating(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const upcoming = dates.filter((d) => d.date >= today && !d.is_cancelled).length;
  const cancelled = dates.filter((d) => d.is_cancelled).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          Dates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Dates — {config.title}</DialogTitle>
        </DialogHeader>

        {/* Summary + generate */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex gap-6 text-sm text-foreground/60">
            <span>
              <span className="font-medium text-[#E6DBC7]">{dates.length}</span> total
            </span>
            <span>
              <span className="font-medium text-green-400">{upcoming}</span> upcoming
            </span>
            <span>
              <span className="font-medium text-red-400">{cancelled}</span> cancelled
            </span>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <RefreshCw className="h-6 w-6" />
            )}
            Generate next 6 months
          </Button>
        </div>

        {/* Date list */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-foreground/40" />
          </div>
        ) : dates.length === 0 ? (
          <p className="py-8 text-center text-sm text-foreground/50">
            No dates yet. Use "Generate next 6 months" or add dates manually below.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/10">
                  <TableHead className="text-white/60">Date</TableHead>
                  <TableHead className="text-white/60">Time</TableHead>
                  <TableHead className="text-white/60">Capacity</TableHead>
                  <TableHead className="text-white/60">Notes</TableHead>
                  <TableHead className="text-white/60">Status</TableHead>
                  <TableHead className="text-white/60">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dates.map((d) => (
                  <TableRow
                    key={d.id}
                    className={`border-b border-white/10 ${d.date < today ? "opacity-40" : ""}`}
                  >
                    <TableCell
                      className={`py-3 text-sm ${d.is_cancelled ? "line-through text-foreground/40" : "text-[#E6DBC7]"}`}
                    >
                      {formatDate(d.date)}
                    </TableCell>
                    <TableCell className="py-3 text-sm text-foreground/70">
                      {d.time ?? (
                        <span className="text-foreground/40">
                          {config.time ?? "—"} <span className="text-xs">(default)</span>
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-3 text-sm text-foreground/70">
                      {d.max_capacity}
                    </TableCell>
                    <TableCell className="py-3 text-sm text-foreground/60">
                      {d.notes ?? "—"}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        className={
                          d.is_cancelled
                            ? "border-red-500/30 bg-red-500/20 text-red-300"
                            : "border-green-500/30 bg-green-500/20 text-green-300"
                        }
                      >
                        {d.is_cancelled ? "Cancelled" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleCancel(d)}
                          className={
                            d.is_cancelled
                              ? "text-green-400 hover:text-green-300"
                              : "text-amber-400 hover:text-amber-300"
                          }
                        >
                          {d.is_cancelled ? "Reinstate" : "Cancel"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => handleDeleteDate(d.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Add single date */}
        <div className="space-y-3 rounded-lg border border-border bg-muted/10 p-6">
          <p className="font-medium text-[#E6DBC7]">Add a date manually</p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="space-y-1">
              <Label className="text-xs text-foreground/60">Date</Label>
              <Input
                type="date"
                value={addDate}
                onChange={(e) => setAddDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-foreground/60">Time override</Label>
              <Input
                type="time"
                value={addTime}
                placeholder={config.time ?? ""}
                onChange={(e) => setAddTime(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-foreground/60">Capacity</Label>
              <Input
                type="number"
                min={1}
                value={addCapacity}
                onChange={(e) => setAddCapacity(e.target.value ? Number(e.target.value) : config.max_capacity)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-foreground/60">Notes</Label>
              <Input
                placeholder="Optional note"
                value={addNotes}
                onChange={(e) => setAddNotes(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleAddDate} disabled={adding} className="gap-2">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add Date
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ────────────────────────────────────────────────────────
// Main page
// ────────────────────────────────────────────────────────

const AdminExperiences = () => {
  const { isAdmin } = useAuth();
  const [configs, setConfigs] = useState<ExperienceConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    db.from("experience_configs")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data, error }: { data: ExperienceConfig[] | null; error: unknown }) => {
        if (error) toast.error("Failed to load experiences");
        else setConfigs(data ?? []);
        setLoading(false);
      });
  }, [isAdmin]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await db.from("experience_configs").delete().eq("id", id);
      if (error) throw error;
      setConfigs((prev) => prev.filter((c) => c.id !== id));
      toast.success("Experience deleted");
    } catch (err) {
      console.error("Error deleting experience:", err);
      toast.error("Failed to delete experience");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout
      title="In-Person Experiences"
      description="Manage recurring in-person experience configurations"
      actions={
        <CreateExperienceDialog onCreated={(c) => setConfigs((prev) => [...prev, c])} />
      }
    >
      {/* Stats */}
      <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        <AdminStatsCard title="Total Experiences" value={configs.length} icon={MapPin} />
        <AdminStatsCard
          title="Active"
          value={configs.filter((c) => c.is_active).length}
          icon={Calendar}
          iconColor="#4ade80"
          iconBgColor="rgba(74, 222, 128, 0.1)"
        />
        <AdminStatsCard
          title="Inactive"
          value={configs.filter((c) => !c.is_active).length}
          icon={MapPin}
          iconColor="#f87171"
          iconBgColor="rgba(248, 113, 113, 0.1)"
        />
      </div>

      {/* Table */}
      <AdminTable
        headers={["Experience", "Schedule", "Time", "Capacity", "Price", "Status", "Actions"]}
        isLoading={loading}
        emptyState="No in-person experiences yet. Create one to get started."
      >
        {configs.map((config) => (
          <TableRow key={config.id} className={adminTableRowClass}>
            <TableCell className={adminTableCellClass}>
              <div>
                <p className="font-medium text-[#E6DBC7]">{config.title}</p>
                <p className="font-mono text-xs text-foreground/50">{config.experience_type}</p>
              </div>
            </TableCell>
            <TableCell className={adminTableCellClass}>
              {config.recurrence_label ?? "—"}
            </TableCell>
            <TableCell className={adminTableCellClass}>
              {config.time ?? "—"} {config.timezone}
            </TableCell>
            <TableCell className={adminTableCellClass}>{config.max_capacity}</TableCell>
            <TableCell className={adminTableCellClass}>{config.price ?? "—"}</TableCell>
            <TableCell className={adminTableCellClass}>
              <Badge
                className={
                  config.is_active
                    ? "border-green-500/30 bg-green-500/20 text-green-300"
                    : "border-border bg-muted text-muted-foreground"
                }
              >
                {config.is_active ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell className={adminTableCellClass}>
              <div className="flex items-center gap-2">
                <ManageDatesDialog config={config} />
                <EditExperienceDialog
                  config={config}
                  onSaved={(updated) =>
                    setConfigs((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
                  }
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-400 hover:text-red-300"
                  onClick={() => setDeletingId(config.id)}
                >
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </AdminTable>

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete experience?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this experience configuration and all its dates. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => deletingId && handleDelete(deletingId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminExperiences;

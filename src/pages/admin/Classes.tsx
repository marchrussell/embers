import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Pencil, Plus, Star, Trash2, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AdminLayout, AdminStatsCard } from "@/components/admin";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Class {
  id: string;
  created_at: string;
  title: string;
  teacher_name: string | null;
  description: string | null;
  audio_url: string | null;
  video_url: string | null;
  image_url: string | null;
  duration_minutes: number | null;
  program_id: string | null;
  is_published: boolean;
  requires_subscription: boolean;
  order_index: number | null;
  category_id: string | null;
  short_description: string | null;
  safety_note: string | null;
  show_safety_reminder: boolean;
  intensity: string | null;
  technique: string | null;
  start_here_position: number | null;
  is_quick_reset: boolean;
  categories?: { id: string; name: string }[];
}

interface Category {
  id: string;
  name: string;
}

interface Program {
  id: string;
  title: string;
}

const AdminClasses = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    teacher_name: "",
    description: "",
    short_description: "",
    audio_url: "",
    video_url: "",
    image_url: "",
    duration_minutes: "",
    category_ids: [] as string[],
    technique: "",
    is_published: false,
    requires_subscription: false,
    safety_note: "",
    show_safety_reminder: false,
    intensity: "",
    start_here_position: "none" as "none" | "1" | "2",
    is_quick_reset: false,
    order_index: "",
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  const { data: classes = [] } = useQuery<Class[]>({
    queryKey: ["admin-classes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select(`*, class_categories(category_id, categories(id, name))`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((c: any) => ({
        ...c,
        categories: (c.class_categories || []).map((cc: any) => cc.categories).filter(Boolean),
      }));
    },
    enabled: !!isAdmin,
  });

  const { data: categories = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("id, name").order("name");
      return data || [];
    },
    enabled: !!isAdmin,
  });

  const featuredClassId = classes.find((c: Class) => (c as any).is_featured)?.id ?? null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 50MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Show upload indicator
      toast({ title: "Uploading image...", duration: Infinity });

      const { error: uploadError } = await supabase.storage
        .from("class-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("class-images").getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      toast({ title: "Image uploaded successfully" });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".wav") && !file.name.endsWith(".mp3")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .wav or .mp3 file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an audio file smaller than 2GB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Show upload indicator
      toast({ title: "Uploading audio...", duration: Infinity });

      const { error: uploadError } = await supabase.storage
        .from("class-audio")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("class-audio").getPublicUrl(filePath);

      setFormData({ ...formData, audio_url: publicUrl });
      toast({ title: "Audio uploaded successfully" });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExts = [".mp4", ".mov", ".webm"];
    if (!validExts.some((ext) => file.name.toLowerCase().endsWith(ext))) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .mp4, .mov, or .webm file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a video file smaller than 2GB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      toast({ title: "Uploading video...", duration: Infinity });

      const { error: uploadError } = await supabase.storage
        .from("class-video")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("class-video").getPublicUrl(filePath);

      setFormData({ ...formData, video_url: publicUrl });
      toast({ title: "Video uploaded successfully" });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      (!formData.audio_url && !formData.video_url) ||
      !formData.image_url ||
      !formData.duration_minutes ||
      formData.category_ids.length === 0
    ) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields including at least one category",
        variant: "destructive",
      });
      return;
    }

    const wordCount = formData.description.trim().split(/\s+/).length;
    if (wordCount > 250) {
      toast({
        title: "Description too long",
        description: "Long description must be 250 words or less",
        variant: "destructive",
      });
      return;
    }

    // First category is used as the legacy primary category_id for backward compat
    const newStartHerePosition =
      formData.start_here_position !== "none" ? parseInt(formData.start_here_position) : null;

    const classData = {
      title: formData.title,
      teacher_name: formData.teacher_name || null,
      description: formData.description || null,
      short_description: formData.short_description || null,
      audio_url: formData.audio_url || null,
      video_url: formData.video_url || null,
      image_url: formData.image_url || null,
      duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
      category_id: formData.category_ids[0] || null,
      is_published: formData.is_published,
      requires_subscription: formData.requires_subscription,
      safety_note: formData.safety_note || null,
      show_safety_reminder: formData.show_safety_reminder,
      intensity: formData.intensity || null,
      technique: formData.technique || null,
      start_here_position: newStartHerePosition,
      is_quick_reset: formData.is_quick_reset,
      order_index: formData.order_index ? parseInt(formData.order_index) : null,
    };

    // If assigning a start here position, clear it from any other class first
    if (newStartHerePosition !== null) {
      const clearQuery = supabase
        .from("classes")
        .update({ start_here_position: null })
        .eq("start_here_position", newStartHerePosition);
      if (editingClass) {
        clearQuery.neq("id", editingClass.id);
      }
      await clearQuery;
    }

    const syncCategories = async (classId: string) => {
      // Remove existing junction rows then insert the new set
      await supabase.from("class_categories").delete().eq("class_id", classId);
      if (formData.category_ids.length > 0) {
        const rows = formData.category_ids.map((catId) => ({
          class_id: classId,
          category_id: catId,
        }));
        const { error } = await supabase.from("class_categories").insert(rows);
        if (error) throw error;
      }
    };

    if (editingClass) {
      const { error } = await supabase.from("classes").update(classData).eq("id", editingClass.id);

      if (error) {
        toast({
          title: "Error updating class",
          description: error.message,
          variant: "destructive",
        });
      } else {
        try {
          await syncCategories(editingClass.id);
          toast({ title: "Class updated successfully" });
          queryClient.invalidateQueries({ queryKey: ["admin-classes"] });
          resetForm();
        } catch (err: any) {
          toast({
            title: "Class saved but categories failed to sync",
            description: err.message,
            variant: "destructive",
          });
        }
      }
    } else {
      const { data: inserted, error } = await supabase
        .from("classes")
        .insert(classData)
        .select("id")
        .single();

      if (error || !inserted) {
        toast({
          title: "Error creating class",
          description: error?.message,
          variant: "destructive",
        });
      } else {
        try {
          await syncCategories(inserted.id);
          toast({ title: "Class created successfully" });
          queryClient.invalidateQueries({ queryKey: ["admin-classes"] });
          resetForm();
        } catch (err: any) {
          toast({
            title: "Class saved but categories failed to sync",
            description: err.message,
            variant: "destructive",
          });
        }
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return;

    const { error } = await supabase.from("classes").delete().eq("id", id);

    if (error) {
      toast({ title: "Error deleting class", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Class deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["admin-classes"] });
    }
  };

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem);
    setFormData({
      title: classItem.title,
      teacher_name: classItem.teacher_name || "",
      description: classItem.description || "",
      short_description: classItem.short_description || "",
      audio_url: classItem.audio_url || "",
      video_url: classItem.video_url || "",
      image_url: classItem.image_url || "",
      duration_minutes: classItem.duration_minutes?.toString() || "",
      category_ids:
        classItem.categories?.map((c) => c.id) ||
        (classItem.category_id ? [classItem.category_id] : []),
      technique: classItem.technique || "",
      is_published: classItem.is_published,
      requires_subscription: classItem.requires_subscription,
      safety_note: classItem.safety_note || "",
      show_safety_reminder: classItem.show_safety_reminder || false,
      intensity: classItem.intensity || "",
      start_here_position: (classItem.start_here_position?.toString() || "none") as
        | "none"
        | "1"
        | "2",
      is_quick_reset: classItem.is_quick_reset || false,
      order_index: classItem.order_index?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const togglePublish = async (classItem: Class) => {
    const { error } = await supabase
      .from("classes")
      .update({ is_published: !classItem.is_published })
      .eq("id", classItem.id);

    if (error) {
      toast({ title: "Error updating class", description: error.message, variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["admin-classes"] });
    }
  };

  const setAsFeatured = async (classItem: Class) => {
    const isCurrentlyFeatured = featuredClassId === classItem.id;

    try {
      if (isCurrentlyFeatured) {
        const { error } = await supabase
          .from("classes")
          .update({ is_featured: false })
          .eq("id", classItem.id);

        if (error) throw error;

        toast({
          title: "Featured class removed",
          description: `${classItem.title} is no longer featured`,
        });
      } else {
        // Unfeature any currently featured class
        const { error: clearError } = await supabase
          .from("classes")
          .update({ is_featured: false })
          .eq("is_featured", true);

        if (clearError) throw clearError;

        // Set this class as featured
        const { error: setError } = await supabase
          .from("classes")
          .update({ is_featured: true })
          .eq("id", classItem.id);

        if (setError) throw setError;

        toast({
          title: "Featured class updated",
          description: `${classItem.title} is now the featured class`,
        });
      }

      await queryClient.invalidateQueries({ queryKey: ["admin-classes"] });
    } catch (error: any) {
      console.error("Error in setAsFeatured:", error);
      toast({
        title: "Error updating featured class",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  const toggleQuickReset = async (classItem: Class) => {
    const { error } = await supabase
      .from("classes")
      .update({ is_quick_reset: !classItem.is_quick_reset })
      .eq("id", classItem.id);

    if (error) {
      toast({ title: "Error updating class", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: classItem.is_quick_reset ? "Removed from Quick Resets" : "Added to Quick Resets",
        description: classItem.title,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-classes"] });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      teacher_name: "",
      description: "",
      short_description: "",
      audio_url: "",
      video_url: "",
      image_url: "",
      duration_minutes: "",
      category_ids: [],
      technique: "",
      is_published: false,
      requires_subscription: false,
      safety_note: "",
      show_safety_reminder: false,
      intensity: "",
      start_here_position: "none",
      is_quick_reset: false,
      order_index: "",
    });
    setEditingClass(null);
    setIsDialogOpen(false);
  };

  const filteredClasses = classes.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || c.categories?.some((cc) => cc.id === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const newClassDialog = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => resetForm()} className="gap-2">
          <Plus className="h-5 w-5" /> New Class
        </Button>
      </DialogTrigger>
      <DialogContent
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-xl border border-white/20 bg-black/60 backdrop-blur-xl"
        hideClose
      >
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#E6DBC7]">
            {editingClass ? "Edit Class" : "Create New Class"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white/80">
              Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              maxLength={100}
              className="border-white/20 bg-white/5 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher_name" className="text-white/80">
              Teacher Name
            </Label>
            <Input
              id="teacher_name"
              value={formData.teacher_name}
              onChange={(e) => setFormData({ ...formData, teacher_name: e.target.value })}
              placeholder="Name of the teacher"
              className="border-white/20 bg-white/5 text-white placeholder:text-white/40"
            />
          </div>

          <div>
            <Label htmlFor="image">Class Image *</Label>
            <div className="space-y-2">
              {formData.image_url && (
                <div className="relative h-48 w-full overflow-hidden rounded-md border border-border">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground">
                Upload an image for this class (max 50MB)
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="description">
              Description (for class details page) -{" "}
              {(formData.description || "").split(/\s+/).filter((w) => w).length}/250 words
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Detailed description shown on class page (max 250 words)"
              className="placeholder:text-gray-400"
              required
            />
          </div>

          <div>
            <Label htmlFor="short_description">
              Short Description (for category cards) - {(formData.short_description || "").length}
              /120 characters
            </Label>
            <Input
              id="short_description"
              value={formData.short_description}
              onChange={(e) =>
                setFormData({ ...formData, short_description: e.target.value.slice(0, 120) })
              }
              placeholder="Brief description shown on category pages"
              maxLength={120}
              className="border-white/20 bg-white/5 text-white placeholder:text-white/40"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              This appears on session cards in the Library
            </p>
          </div>

          <div>
            <Label htmlFor="audio">Class Audio (WAV or MP3)</Label>
            <div className="space-y-2">
              {formData.audio_url && (
                <audio controls className="w-full" preload="metadata">
                  <source src={formData.audio_url} />
                </audio>
              )}
              <Input
                id="audio"
                type="file"
                accept=".wav,.mp3"
                onChange={handleAudioUpload}
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground">
                Upload audio file (max 2GB, .wav or .mp3)
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="video">Class Video (MP4, MOV, or WebM)</Label>
            <div className="space-y-2">
              {formData.video_url && (
                <video controls className="w-full rounded-md" preload="metadata">
                  <source src={formData.video_url} />
                </video>
              )}
              <Input
                id="video"
                type="file"
                accept=".mp4,.mov,.webm"
                onChange={handleVideoUpload}
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground">
                Upload video file (max 2GB, .mp4/.mov/.webm). Either audio or video is required.
              </p>
            </div>
          </div>
          <div>
            <Label className="text-white/80">
              Categories *{" "}
              {formData.category_ids.length > 0 && (
                <span className="font-normal text-white/50">(first selected = primary)</span>
              )}
            </Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {categories.map((cat) => {
                const checked = formData.category_ids.includes(cat.id);
                return (
                  <label
                    key={cat.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
                      checked
                        ? "border-white/50 bg-white/10 text-white"
                        : "border-white/15 bg-white/5 text-white/60 hover:border-white/30"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="accent-white"
                      checked={checked}
                      onChange={() => {
                        const next = checked
                          ? formData.category_ids.filter((id) => id !== cat.id)
                          : [...formData.category_ids, cat.id];
                        setFormData({ ...formData, category_ids: next });
                      }}
                    />
                    <span className="text-sm">{cat.name}</span>
                  </label>
                );
              })}
            </div>
            {formData.category_ids.length === 0 && (
              <p className="mt-1 text-xs text-red-400/80">Please select at least one category</p>
            )}
          </div>

          <div>
            <Label htmlFor="duration">Duration (minutes) *</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="order_index">Order Index</Label>
            <Input
              id="order_index"
              type="number"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
              placeholder="e.g. 1, 2, 3…"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Controls display order within a category (lower = first). Leave blank to sort last.
            </p>
          </div>

          <div>
            <Label htmlFor="technique">Technique (1-2 words)</Label>
            <Input
              id="technique"
              value={formData.technique || ""}
              onChange={(e) => setFormData({ ...formData, technique: e.target.value })}
              placeholder="e.g., Box Breathing, Wim Hof"
              maxLength={30}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Short description of the breathing technique used
            </p>
          </div>

          <div>
            <Label htmlFor="intensity">Intensity</Label>
            <Select
              value={formData.intensity}
              onValueChange={(val) => setFormData({ ...formData, intensity: val })}
            >
              <SelectTrigger id="intensity" className="mt-1 border-white/20 bg-white/5 text-white">
                <SelectValue placeholder="Select intensity" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Gentle",
                  "Gentle–Moderate",
                  "Moderate",
                  "Moderate–Strong",
                  "Strong",
                  "Very Strong",
                ].map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_here_position" className="text-white/80">
              Start Here Page
            </Label>
            <Select
              value={formData.start_here_position}
              onValueChange={(val) =>
                setFormData({ ...formData, start_here_position: val as "none" | "1" | "2" })
              }
            >
              <SelectTrigger
                id="start_here_position"
                className="border-white/20 bg-white/5 text-white"
              >
                <SelectValue placeholder="Not shown on Start Here" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not shown</SelectItem>
                <SelectItem value="1">Position 1 (first card)</SelectItem>
                <SelectItem value="2">Position 2 (second card)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Show this class on the Start Here page. Only one class per position.
            </p>
          </div>

          <div className="space-y-4 border-t border-border pt-6">
            <h3 className="text-lg font-semibold">Safety Note</h3>
            <div>
              <Label htmlFor="safety_note">Custom Safety Note (Optional)</Label>
              <Textarea
                id="safety_note"
                value={formData.safety_note}
                onChange={(e) => setFormData({ ...formData, safety_note: e.target.value })}
                rows={4}
                placeholder="Add a custom safety note for this session (e.g., 'This session involves breath holds. Do not practice while driving or in water.')"
                className="placeholder:text-gray-400"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                This safety note will appear in a popup when users start this session (if enabled
                below)
              </p>
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="show_safety_reminder"
                checked={formData.show_safety_reminder}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, show_safety_reminder: checked })
                }
              />
              <Label htmlFor="show_safety_reminder" className="mb-0">
                Show Safety Reminder Popup for this session
              </Label>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={formData.is_published}
              onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
            />
            <Label htmlFor="published" className="mb-0">
              Publish
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_quick_reset"
              checked={formData.is_quick_reset}
              onCheckedChange={(checked) => setFormData({ ...formData, is_quick_reset: checked })}
            />
            <Label htmlFor="is_quick_reset" className="mb-0">
              Quick Reset (show in Quick Resets section on Home)
            </Label>
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-white text-black hover:bg-white/90"
              disabled={uploading}
            >
              {editingClass ? "Update" : "Create"} Class
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <AdminLayout
      title="Manage Classes"
      description="Upload and manage breathwork video classes"
      actions={newClassDialog}
    >
      {/* Stats */}
      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <AdminStatsCard title="Total Classes" value={classes.length} icon={BookOpen} />
      </div>

      {/* Search */}
      <div className="mb-8">
        <Input
          placeholder="Search classes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm border-white/20 bg-white/5 text-white placeholder:text-white/40"
        />
      </div>

      {/* Category Tabs */}
      <div className="my-6 flex flex-wrap gap-6">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`rounded-full px-6 py-1.5 text-sm font-medium transition-colors ${
            selectedCategory === "all"
              ? "bg-[#E6DBC7] text-black"
              : "bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          All <span className="ml-1 opacity-60">{classes.length}</span>
        </button>
        {categories.map((cat) => {
          const count = classes.filter((c) => c.categories?.some((cc) => cc.id === cat.id)).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedCategory === cat.id
                  ? "bg-[#E6DBC7] text-black"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {cat.name} <span className="ml-1 opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#E6DBC7]/20 bg-background/40 backdrop-blur-xl">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#E6DBC7]/10 hover:bg-transparent">
              <TableHead className="p-6 text-sm font-normal text-[#E6DBC7]">Title</TableHead>
              <TableHead className="p-6 text-sm font-normal text-[#E6DBC7]">Category</TableHead>
              <TableHead className="p-6 text-sm font-normal text-[#E6DBC7]">Duration</TableHead>
              <TableHead className="p-6 text-sm font-normal text-[#E6DBC7]">Intensity</TableHead>
              <TableHead className="p-6 text-sm font-normal text-[#E6DBC7]">Status</TableHead>
              <TableHead className="p-6 text-sm font-normal text-[#E6DBC7]">Access</TableHead>
              <TableHead className="p-6 text-right text-sm font-normal text-[#E6DBC7]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClasses.map((classItem) => (
              <TableRow
                key={classItem.id}
                className="border-b border-[#E6DBC7]/10 hover:bg-white/5"
              >
                <TableCell className="py-4 font-medium text-white">
                  <div className="flex items-center gap-2">
                    {classItem.title}
                    {classItem.start_here_position && (
                      <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-medium text-blue-300">
                        Start {classItem.start_here_position}
                      </span>
                    )}
                    {featuredClassId === classItem.id && (
                      <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-medium text-purple-300">
                        Featured
                      </span>
                    )}
                    {classItem.is_quick_reset && (
                      <span className="rounded bg-yellow-500/20 px-1.5 py-0.5 text-[10px] font-medium text-yellow-300">
                        Quick Reset
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4 text-foreground/70">
                  {classItem.categories?.map((c) => c.name).join(", ") || "-"}
                </TableCell>
                <TableCell className="py-4 text-foreground/70">
                  {classItem.duration_minutes ? `${classItem.duration_minutes} min` : "-"}
                </TableCell>
                <TableCell className="py-4 text-foreground/70">
                  {classItem.intensity || "-"}
                </TableCell>
                <TableCell className="py-4">
                  <button
                    onClick={() => togglePublish(classItem)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      classItem.is_published
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-300"
                    }`}
                  >
                    {classItem.is_published ? "Published" : "Draft"}
                  </button>
                </TableCell>
                <TableCell className="py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      classItem.requires_subscription
                        ? "bg-orange-500/20 text-orange-400"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {classItem.requires_subscription ? "Locked" : "Free"}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="default"
                      onClick={() => toggleQuickReset(classItem)}
                      title="Toggle Quick Reset"
                      className="hover:bg-white/10"
                    >
                      <Zap
                        className={`h-5 w-5 ${classItem.is_quick_reset ? "fill-yellow-400 text-yellow-400" : "text-yellow-400"}`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="default"
                      onClick={() => setAsFeatured(classItem)}
                      title="Set as featured class"
                      className="hover:bg-white/10"
                    >
                      <Star
                        className={`h-5 w-5 ${featuredClassId === classItem.id ? "fill-[#E8C547] text-[#E8C547]" : "text-[#E8C547]"}`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="default"
                      onClick={() => handleEdit(classItem)}
                      className="hover:bg-white/10"
                    >
                      <Pencil className="h-5 w-5 text-[#E6DBC7]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="default"
                      onClick={() => handleDelete(classItem.id)}
                      className="hover:bg-red-500/10"
                    >
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
};

export default AdminClasses;

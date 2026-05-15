import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Eye, EyeOff, GripVertical, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AdminLayout, AdminStatsCard } from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Program {
  id: string;
  title: string;
  slug: string | null;
  short_description: string | null;
  description: string | null;
  teacher_name: string | null;
  image_url: string | null;
  is_published: boolean;
  category_id: string | null;
  lesson_count: number | null;
  duration_days: number | null;
}

interface SectionFormItem {
  localId: string;
  dbId?: string;
  title: string;
  description: string;
  classIds: string[];
}

interface Class {
  id: string;
  title: string;
  duration_minutes: number | null;
}

// Courses references Programs table in Supabase, but we call it Courses in the UI for clarity to admins creating courses. Each course can have multiple classes (sessions).

const AdminPrograms = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Program | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [sections, setSections] = useState<SectionFormItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [classSearchQuery, setClassSearchQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    short_description: "",
    description: "",
    teacher_name: "March Russell",
    image_url: "",
    is_published: false,
    duration_days: "",
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  const { data: courses = [] } = useQuery<Program[]>({
    queryKey: ["admin-programs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!isAdmin,
  });

  const { data: classes = [] } = useQuery<Class[]>({
    queryKey: ["admin-classes-list"],
    queryFn: async () => {
      const { data } = await supabase
        .from("classes")
        .select("id, title, duration_minutes")
        .order("title");
      return data || [];
    },
    enabled: !!isAdmin,
  });

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

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("program-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("program-images").getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      toast({ title: "Image uploaded successfully" });
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
      !formData.short_description ||
      !formData.description ||
      !formData.teacher_name ||
      !formData.image_url
    ) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const wordCount = formData.description.split(/\s+/).filter((w) => w).length;
    if (wordCount > 250) {
      toast({
        title: "Description too long",
        description: "Please limit description to 250 words",
        variant: "destructive",
      });
      return;
    }

    const programData = {
      title: formData.title,
      slug: formData.slug || null,
      short_description: formData.short_description,
      description: formData.description,
      teacher_name: formData.teacher_name,
      image_url: formData.image_url,
      category_id: null,
      is_published: formData.is_published,
      duration_days: formData.duration_days ? parseInt(formData.duration_days) : null,
    };

    if (editingCourse) {
      const { error } = await supabase
        .from("programs")
        .update(programData)
        .eq("id", editingCourse.id);

      if (error) {
        toast({
          title: "Error updating program",
          description: error.message,
          variant: "destructive",
        });
      } else {
        await updateCourseClasses(editingCourse.id);
        try {
          await updateCourseSections(editingCourse.id);
        } catch (e) {
          toast({
            title: "Error saving sections",
            description: (e as Error).message,
            variant: "destructive",
          });
          return;
        }
        toast({ title: "Program updated successfully" });
        queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
        resetForm();
      }
    } else {
      const { data, error } = await supabase.from("programs").insert(programData).select().single();

      if (error) {
        toast({
          title: "Error creating program",
          description: error.message,
          variant: "destructive",
        });
      } else {
        if (data) {
          await updateCourseClasses(data.id);
          try {
            await updateCourseSections(data.id);
          } catch (e) {
            toast({
              title: "Error saving sections",
              description: (e as Error).message,
              variant: "destructive",
            });
            return;
          }
        }
        toast({ title: "Program created successfully" });
        queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
        resetForm();
      }
    }
  };

  const updateCourseClasses = async (programId: string) => {
    await supabase.from("classes").update({ program_id: null }).eq("program_id", programId);

    for (let i = 0; i < selectedClasses.length; i++) {
      await supabase
        .from("classes")
        .update({ program_id: programId, order_index: i })
        .eq("id", selectedClasses[i]);
    }
  };

  const updateCourseSections = async (programId: string) => {
    const { error: clearAllError } = await supabase
      .from("classes")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ program_section_id: null } as any)
      .eq("program_id", programId);
    if (clearAllError) throw clearAllError;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const { data: existing, error: fetchError } = await db
      .from("program_sections")
      .select("id")
      .eq("program_id", programId);
    if (fetchError) throw fetchError;

    const existingDbIds = sections.filter((s) => s.dbId).map((s) => s.dbId as string);
    const toDelete = (existing ?? [])
      .map((r: { id: string }) => r.id)
      .filter((id: string) => !existingDbIds.includes(id));
    if (toDelete.length > 0) {
      const { error: deleteError } = await db.from("program_sections").delete().in("id", toDelete);
      if (deleteError) throw deleteError;
    }

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      let sectionId = section.dbId;

      if (sectionId) {
        const { error: updateError } = await db
          .from("program_sections")
          .update({
            title: section.title,
            description: section.description || null,
            order_index: i,
          })
          .eq("id", sectionId);
        if (updateError) throw updateError;
      } else {
        const { data: inserted, error: insertError } = await db
          .from("program_sections")
          .insert({
            program_id: programId,
            title: section.title,
            description: section.description || null,
            order_index: i,
          })
          .select("id")
          .single();
        if (insertError) throw insertError;
        sectionId = inserted?.id;
      }

      if (sectionId) {
        for (const classId of section.classIds) {
          const { error: assignError } = await supabase
            .from("classes")
            .update({ program_section_id: sectionId } as any)
            .eq("id", classId);
          if (assignError) throw assignError;
        }
      }
    }

  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    const { error } = await supabase.from("programs").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error deleting course",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Course deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
    }
  };

  const handleEdit = async (course: Program) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      slug: course.slug || "",
      short_description: course.short_description || "",
      description: course.description || "",
      teacher_name: course.teacher_name || "March Russell",
      image_url: course.image_url || "",
      is_published: course.is_published,
      duration_days: course.duration_days?.toString() || "",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const [classResult, sectionResult] = await Promise.all([
      db
        .from("classes")
        .select("id, program_section_id")
        .eq("program_id", course.id)
        .order("order_index"),
      db
        .from("program_sections")
        .select("id, title, description, order_index")
        .eq("program_id", course.id)
        .order("order_index"),
    ]);

    if (classResult.error) {
      toast({
        title: "Error loading course classes",
        description: classResult.error.message,
        variant: "destructive",
      });
      return;
    }
    if (sectionResult.error) {
      toast({
        title: "Error loading course sections",
        description: sectionResult.error.message,
        variant: "destructive",
      });
      return;
    }

    const classData = (classResult.data ?? []) as { id: string; program_section_id: string | null }[];
    const sectionData = sectionResult.data;

    setSelectedClasses(classData.map((c) => c.id));

    const loadedSections: SectionFormItem[] = (sectionData ?? []).map(
      (s: { id: string; title: string; description: string | null; order_index: number }) => ({
        localId: s.id,
        dbId: s.id,
        title: s.title,
        description: s.description || "",
        classIds: classData
          .filter((c) => c.program_section_id === s.id)
          .map((c) => c.id),
      })
    );
    setSections(loadedSections);
    setIsDialogOpen(true);
  };

  const togglePublish = async (course: Program) => {
    const { error } = await supabase
      .from("programs")
      .update({ is_published: !course.is_published })
      .eq("id", course.id);

    if (error) {
      toast({
        title: "Error updating course",
        description: error.message,
        variant: "destructive",
      });
    } else {
      queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      short_description: "",
      description: "",
      teacher_name: "March Russell",
      image_url: "",
      is_published: false,
      duration_days: "",
    });
    setSelectedClasses([]);
    setSections([]);
    setClassSearchQuery("");
    setEditingCourse(null);
    setIsDialogOpen(false);
  };

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      { localId: crypto.randomUUID(), title: "", description: "", classIds: [] },
    ]);
  };

  const updateSection = (localId: string, patch: Partial<SectionFormItem>) => {
    setSections((prev) => prev.map((s) => (s.localId === localId ? { ...s, ...patch } : s)));
  };

  const removeSection = (localId: string) => {
    setSections((prev) => prev.filter((s) => s.localId !== localId));
  };

  const toggleSectionClass = (localId: string, classId: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.localId !== localId) return s;
        return {
          ...s,
          classIds: s.classIds.includes(classId)
            ? s.classIds.filter((id) => id !== classId)
            : [...s.classIds, classId],
        };
      })
    );
  };

  const toggleClass = (classId: string) => {
    setSelectedClasses((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    dragIndexRef.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = () => {
    const from = dragIndexRef.current;
    const to = dragOverIndex;
    if (from === null || to === null || from === to) {
      setDragOverIndex(null);
      return;
    }
    const reordered = [...selectedClasses];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setSelectedClasses(reordered);
    dragIndexRef.current = null;
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragOverIndex(null);
    dragIndexRef.current = null;
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.teacher_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const newCourseDialog = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => resetForm()} className="gap-2">
          <Plus className="h-5 w-5" /> New Course
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-xl border border-white/20 bg-black/60 backdrop-blur-xl"
        hideClose
      >
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#E6DBC7]">
            {editingCourse ? "Edit Course" : "Create New Course"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-6 space-y-6 pb-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white/80">
              Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="border-white/20 bg-white/5 text-white"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-white/80">
                Slug
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="border-white/20 bg-white/5 text-white"
                placeholder="e.g. anxiety-reset"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_days" className="text-white/80">
                Duration (days)
              </Label>
              <Input
                id="duration_days"
                type="number"
                min="1"
                value={formData.duration_days}
                onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                className="border-white/20 bg-white/5 text-white"
                placeholder="e.g. 7"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="short_description" className="text-white/80">
              Short Description *
            </Label>
            <Textarea
              id="short_description"
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              rows={2}
              className="border-white/20 bg-white/5 text-white placeholder:text-white/40"
              placeholder="Brief description for library page"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white/80">
              Long Description * -{" "}
              {(formData.description || "").split(/\s+/).filter((w) => w).length}/250 words
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
              className="border-white/20 bg-white/5 text-white placeholder:text-white/40"
              placeholder="Detailed program description (max 250 words)"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="teacher" className="text-white/80">
              Teacher Name *
            </Label>
            <Input
              id="teacher"
              value={formData.teacher_name}
              onChange={(e) => setFormData({ ...formData, teacher_name: e.target.value })}
              className="border-white/20 bg-white/5 text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image" className="text-white/80">
              Course Image *
            </Label>
            <div className="space-y-2">
              {formData.image_url && (
                <div className="relative h-48 w-full overflow-hidden rounded-md border border-white/20">
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
                className="border-white/20 bg-white/5 text-white"
                required={!formData.image_url}
              />
              <p className="text-xs text-white/50">Upload an image for this course (max 5MB)</p>
            </div>
          </div>

          <div className="space-y-4 rounded-lg border border-white/20 p-5">
            <div>
              <Label className="text-white/80">Course Classes ({selectedClasses.length})</Label>
              <p className="mt-1 text-sm text-white/50">Select and order classes for this course</p>
            </div>

            <Input
              placeholder="Search classes..."
              value={classSearchQuery}
              onChange={(e) => setClassSearchQuery(e.target.value)}
              className="border-white/20 bg-white/5 text-white placeholder:text-white/40"
            />

            {selectedClasses.length > 0 && (
              <div className="rounded-md bg-white/5 p-3">
                <p className="mb-2 text-sm font-medium text-white/80">Selected Classes Order:</p>
                <div className="space-y-1">
                  {selectedClasses.map((classId, index) => {
                    const classItem = classes.find((c) => c.id === classId);
                    return (
                      <div
                        key={classId}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={handleDrop}
                        onDragEnd={handleDragEnd}
                        style={{ cursor: "grab" }}
                        className={`flex items-center gap-2 rounded p-2 transition-colors ${
                          dragOverIndex === index
                            ? "border border-[#E6DBC7]/60 bg-[#E6DBC7]/10"
                            : "bg-white/5"
                        }`}
                      >
                        <GripVertical className="h-5 w-5 flex-shrink-0 text-white/40" />
                        <span className="w-6 text-xs text-white/50">{index + 1}.</span>
                        <span className="flex-1 text-sm text-white">{classItem?.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="max-h-60 space-y-2 overflow-y-auto">
              {classes
                .filter((classItem) =>
                  classItem.title.toLowerCase().includes(classSearchQuery.toLowerCase())
                )
                .map((classItem) => (
                  <div
                    key={classItem.id}
                    className="flex items-center gap-2 rounded p-2 hover:bg-white/5"
                  >
                    <input
                      type="checkbox"
                      checked={selectedClasses.includes(classItem.id)}
                      onChange={() => toggleClass(classItem.id)}
                      className="h-6 w-6"
                    />
                    <span className="flex-1 text-white">{classItem.title}</span>
                    <span className="text-sm text-white/50">
                      {classItem.duration_minutes ? `${classItem.duration_minutes}min` : ""}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Course Sections */}
          <div className="space-y-6 rounded-lg border border-white/20 p-5">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white/80">Course Sections ({sections.length})</Label>
                <p className="mt-1 text-sm text-white/50">
                  Group classes under subtitles shown in the course detail view
                </p>
              </div>
              <Button type="button" variant="outline" onClick={addSection}>
                <Plus className="mr-1 h-5 w-5" /> Add Section
              </Button>
            </div>

            {sections.map((section, idx) => (
              <div
                key={section.localId}
                className="space-y-6 rounded-md border border-white/10 bg-white/5 p-6"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-white/40">Section {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeSection(section.localId)}
                    className="text-red-400 hover:text-red-300"
                    aria-label="Remove section"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Title *</Label>
                  <Input
                    value={section.title}
                    onChange={(e) => updateSection(section.localId, { title: e.target.value })}
                    className="border-white/20 bg-white/5 text-white"
                    placeholder="e.g. Stabilise / Regulate / Restore"
                    required={false}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Description</Label>
                  <Textarea
                    value={section.description}
                    onChange={(e) =>
                      updateSection(section.localId, { description: e.target.value })
                    }
                    rows={2}
                    className="border-white/20 bg-white/5 text-white placeholder:text-white/40"
                    placeholder="Optional description shown below the subtitle"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">
                    Classes in this section ({section.classIds.length})
                  </Label>
                  <div className="max-h-48 space-y-1 overflow-y-auto">
                    {selectedClasses.map((classId) => {
                      const classItem = classes.find((c) => c.id === classId);
                      if (!classItem) return null;
                      return (
                        <div
                          key={classId}
                          className="flex items-center gap-2 rounded p-2 hover:bg-white/5"
                        >
                          <input
                            type="checkbox"
                            checked={section.classIds.includes(classId)}
                            onChange={() => toggleSectionClass(section.localId, classId)}
                            className="h-5 w-5"
                          />
                          <span className="flex-1 text-sm text-white">{classItem.title}</span>
                          <span className="text-xs text-white/40">
                            {classItem.duration_minutes ? `${classItem.duration_minutes}min` : ""}
                          </span>
                        </div>
                      );
                    })}
                    {selectedClasses.length === 0 && (
                      <p className="text-xs text-white/40">Add classes to the course above first</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={formData.is_published}
              onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
            />
            <Label htmlFor="published" className="mb-0 text-white/80">
              Publish
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingCourse ? "Update" : "Create"} Course
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
      title="Manage Courses"
      description="Create and organize multi-session courses"
      actions={newCourseDialog}
    >
      {/* Stats Cards */}
      <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        <AdminStatsCard title="Total Courses" value={courses.length} icon={BookOpen} />
        <AdminStatsCard
          title="Published"
          value={courses.filter((c) => c.is_published).length}
          icon={Eye}
          iconColor="#4ade80"
          iconBgColor="rgba(74, 222, 128, 0.1)"
        />
        <AdminStatsCard
          title="Drafts"
          value={courses.filter((c) => !c.is_published).length}
          icon={EyeOff}
          iconColor="#facc15"
          iconBgColor="rgba(250, 204, 21, 0.1)"
        />
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-white/40" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-white/20 bg-white/5 pl-10 text-white placeholder:text-white/40"
          />
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid gap-6">
        {filteredCourses.length === 0 ? (
          <Card className="border-[#E6DBC7]/20 bg-background/40 backdrop-blur-xl">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="mb-4 h-12 w-12 text-[#E6DBC7]/40" />
              <p className="text-center text-white/60">
                {searchQuery
                  ? "No courses match your search"
                  : "No courses yet. Create your first course!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="border-[#E6DBC7]/20 bg-background/40 backdrop-blur-xl transition-all hover:border-[#E6DBC7]/40"
            >
              <CardContent className="p-6">
                <div className="flex flex-col gap-6 md:flex-row">
                  {course.image_url && (
                    <div className="h-32 w-full flex-shrink-0 overflow-hidden rounded-lg md:w-48">
                      <img
                        src={course.image_url}
                        alt={course.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="mb-1 text-xl font-medium text-white">{course.title}</h3>
                        <p className="text-sm text-white/60">by {course.teacher_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={course.is_published ? "default" : "secondary"}
                          className={
                            course.is_published
                              ? "bg-green-500/20 text-green-300"
                              : "bg-yellow-500/20 text-yellow-300"
                          }
                        >
                          {course.is_published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </div>
                    <p className="mb-4 line-clamp-2 text-sm text-white/70">
                      {course.short_description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/50">
                        {course.lesson_count || 0} classes
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="default"
                          onClick={() => togglePublish(course)}
                          className="h-10 w-10 p-0 text-white/60 hover:bg-white/10 hover:text-white"
                        >
                          {course.is_published ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="default"
                          onClick={() => handleEdit(course)}
                          className="h-10 w-10 p-0 text-[#E6DBC7] hover:bg-white/10 hover:text-white"
                        >
                          <Pencil className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="default"
                          onClick={() => handleDelete(course.id)}
                          className="h-10 w-10 p-0 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPrograms;

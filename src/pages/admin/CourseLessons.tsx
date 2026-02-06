import { AdminSkeleton } from "@/components/skeletons/AdminSkeleton";
import { UploadingSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  content_type: string;
  media_url: string;
  duration_minutes: number | null;
  order_index: number;
  is_published: boolean;
  created_at: string;
}

interface Course {
  id: string;
  title: string;
  slug: string;
}

const AdminCourseLessons = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content_type: "video",
    media_url: "",
    duration_minutes: "",
    order_index: "0",
    is_published: true,
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchLessons();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("id, title, slug")
      .eq("id", courseId)
      .single();
    
    if (error) {
      toast({ title: "Error fetching course", description: error.message, variant: "destructive" });
    } else {
      setCourse(data);
    }
  };

  const fetchLessons = async () => {
    const { data, error } = await supabase
      .from("course_lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("order_index", { ascending: true });
    
    if (error) {
      toast({ title: "Error fetching lessons", description: error.message, variant: "destructive" });
    } else {
      setLessons(data || []);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isAudio = file.type.startsWith('audio/');
    
    if (!isVideo && !isAudio) {
      toast({ title: "Invalid file type", description: "Please upload a video or audio file", variant: "destructive" });
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload a file smaller than 500MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    toast({ title: "Uploading media...", duration: Infinity });

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const bucket = isVideo ? 'videos' : 'class-audio';

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      setFormData({ 
        ...formData, 
        media_url: publicUrl,
        content_type: isVideo ? 'video' : 'audio'
      });
      toast({ title: "Media uploaded successfully" });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.media_url) {
      toast({ title: "Missing required fields", description: "Please fill in title and media URL", variant: "destructive" });
      return;
    }

    const lessonData = {
      course_id: courseId,
      title: formData.title,
      description: formData.description || null,
      content_type: formData.content_type,
      media_url: formData.media_url,
      duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
      order_index: parseInt(formData.order_index) || 0,
      is_published: formData.is_published,
    };

    if (editingLesson) {
      const { error } = await supabase
        .from("course_lessons")
        .update(lessonData)
        .eq("id", editingLesson.id);
      
      if (error) {
        toast({ title: "Error updating lesson", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Lesson updated successfully" });
        fetchLessons();
        resetForm();
      }
    } else {
      const { error } = await supabase.from("course_lessons").insert(lessonData);
      
      if (error) {
        toast({ title: "Error creating lesson", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Lesson created successfully" });
        fetchLessons();
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    
    const { error } = await supabase.from("course_lessons").delete().eq("id", id);
    
    if (error) {
      toast({ title: "Error deleting lesson", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Lesson deleted successfully" });
      fetchLessons();
    }
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description || "",
      content_type: lesson.content_type,
      media_url: lesson.media_url,
      duration_minutes: lesson.duration_minutes?.toString() || "",
      order_index: lesson.order_index?.toString() || "0",
      is_published: lesson.is_published,
    });
    setIsDialogOpen(true);
  };

  const togglePublish = async (lesson: Lesson) => {
    const { error } = await supabase
      .from("course_lessons")
      .update({ is_published: !lesson.is_published })
      .eq("id", lesson.id);
    
    if (error) {
      toast({ title: "Error updating lesson", description: error.message, variant: "destructive" });
    } else {
      fetchLessons();
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      content_type: "video",
      media_url: "",
      duration_minutes: "",
      order_index: lessons.length.toString(),
      is_published: true,
    });
    setEditingLesson(null);
    setIsDialogOpen(false);
  };

  if (loading) return <AdminSkeleton />;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/admin/courses")} className="gap-2">
            <ArrowLeft className="h-5 w-5" />
            Back to Courses
          </Button>
        </div>
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Manage Lessons</h1>
            {course && <p className="text-muted-foreground mt-2">{course.title}</p>}
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" /> Add Lesson
              </Button>
            </DialogTrigger>
            <DialogContent className="backdrop-blur-xl bg-black/30 border border-white/30 max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl" hideClose>
              <DialogHeader>
                <DialogTitle>{editingLesson ? "Edit Lesson" : "Add New Lesson"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Lesson intro text shown before the content"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="content_type">Content Type</Label>
                    <Select
                      value={formData.content_type}
                      onValueChange={(value) => setFormData({ ...formData, content_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                    <Input
                      id="duration_minutes"
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Upload Media</Label>
                  <Input
                    type="file"
                    accept="video/*,audio/*"
                    onChange={handleMediaUpload}
                    disabled={uploading}
                    className="cursor-pointer"
                  />
                  {uploading && <UploadingSkeleton text="Uploading media..." className="mt-1" />}
                </div>

                <div>
                  <Label htmlFor="media_url">Media URL</Label>
                  <Input
                    id="media_url"
                    value={formData.media_url}
                    onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                    placeholder="Or paste URL directly"
                  />
                </div>

                <div>
                  <Label htmlFor="order_index">Order Index</Label>
                  <Input
                    id="order_index"
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <Label htmlFor="is_published">Published</Label>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button type="submit" disabled={uploading}>{editingLesson ? "Update" : "Add"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {lessons.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No lessons yet. Add your first lesson to get started.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lessons.map((lesson, index) => (
                <TableRow key={lesson.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium">{lesson.title}</TableCell>
                  <TableCell className="capitalize">{lesson.content_type}</TableCell>
                  <TableCell>{lesson.duration_minutes ? `${lesson.duration_minutes} min` : '-'}</TableCell>
                  <TableCell>
                    <Switch
                      checked={lesson.is_published}
                      onCheckedChange={() => togglePublish(lesson)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(lesson)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(lesson.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default AdminCourseLessons;

import { AdminLayout, AdminStatsCard, AdminTable, adminTableCellClass, adminTableRowClass } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { BookOpen, GraduationCap, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  duration_days: number;
  price_cents: number;
  currency: string;
  stripe_price_id: string | null;
  image_url: string | null;
  is_published: boolean;
  order_index: number | null;
  created_at: string;
}

const AdminCourses = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    short_description: "",
    duration_days: "7",
    price_cents: "4700",
    currency: "gbp",
    stripe_price_id: "",
    image_url: "",
    is_published: false,
    order_index: "0",
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("order_index", { ascending: true });
    
    if (error) {
      toast({ title: "Error fetching courses", description: error.message, variant: "destructive" });
    } else {
      setCourses(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.slug) {
      toast({ title: "Missing required fields", description: "Please fill in title and slug", variant: "destructive" });
      return;
    }

    const courseData = {
      title: formData.title,
      slug: formData.slug,
      description: formData.description || null,
      short_description: formData.short_description || null,
      duration_days: parseInt(formData.duration_days) || 7,
      price_cents: parseInt(formData.price_cents) || 4700,
      currency: formData.currency || "gbp",
      stripe_price_id: formData.stripe_price_id || null,
      image_url: formData.image_url || null,
      is_published: formData.is_published,
      order_index: parseInt(formData.order_index) || 0,
    };

    if (editingCourse) {
      const { error } = await supabase
        .from("courses")
        .update(courseData)
        .eq("id", editingCourse.id);
      
      if (error) {
        toast({ title: "Error updating course", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Course updated successfully" });
        fetchCourses();
        resetForm();
      }
    } else {
      const { error } = await supabase.from("courses").insert(courseData);
      
      if (error) {
        toast({ title: "Error creating course", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Course created successfully" });
        fetchCourses();
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course? This will also delete all lessons.")) return;
    
    const { error } = await supabase.from("courses").delete().eq("id", id);
    
    if (error) {
      toast({ title: "Error deleting course", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Course deleted successfully" });
      fetchCourses();
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      slug: course.slug,
      description: course.description || "",
      short_description: course.short_description || "",
      duration_days: course.duration_days?.toString() || "7",
      price_cents: course.price_cents?.toString() || "4700",
      currency: course.currency || "gbp",
      stripe_price_id: course.stripe_price_id || "",
      image_url: course.image_url || "",
      is_published: course.is_published || false,
      order_index: course.order_index?.toString() || "0",
    });
    setIsDialogOpen(true);
  };

  const togglePublish = async (course: Course) => {
    const { error } = await supabase
      .from("courses")
      .update({ is_published: !course.is_published })
      .eq("id", course.id);
    
    if (error) {
      toast({ title: "Error updating course", description: error.message, variant: "destructive" });
    } else {
      fetchCourses();
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      description: "",
      short_description: "",
      duration_days: "7",
      price_cents: "4700",
      currency: "gbp",
      stripe_price_id: "",
      image_url: "",
      is_published: false,
      order_index: "0",
    });
    setEditingCourse(null);
    setIsDialogOpen(false);
  };

  const formatPrice = (cents: number, currency: string) => {
    const amount = cents / 100;
    if (currency === 'gbp') return `£${amount}`;
    if (currency === 'usd') return `$${amount}`;
    return `${amount} ${currency.toUpperCase()}`;
  };

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const newCourseDialog = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => resetForm()} className="gap-2">
          <Plus className="h-5 w-5" /> New Course
        </Button>
      </DialogTrigger>
      <DialogContent className="backdrop-blur-xl bg-black/60 border border-white/20 max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl" hideClose>
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#E6DBC7]">
            {editingCourse ? "Edit Course" : "Create New Course"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white/80">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-white/80">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="breathwork-anxiety-reset"
                required
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="short_description" className="text-white/80">Short Description</Label>
            <Input
              id="short_description"
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              placeholder="Brief tagline for the course"
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white/80">Full Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration_days" className="text-white/80">Duration (Days)</Label>
              <Input
                id="duration_days"
                type="number"
                value={formData.duration_days}
                onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_cents" className="text-white/80">Price (Pence/Cents)</Label>
              <Input
                id="price_cents"
                type="number"
                value={formData.price_cents}
                onChange={(e) => setFormData({ ...formData, price_cents: e.target.value })}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-white/80">Currency</Label>
              <Input
                id="currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                placeholder="gbp"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stripe_price_id" className="text-white/80">Stripe Price ID</Label>
            <Input
              id="stripe_price_id"
              value={formData.stripe_price_id}
              onChange={(e) => setFormData({ ...formData, stripe_price_id: e.target.value })}
              placeholder="price_xxx"
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url" className="text-white/80">Image URL</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="bg-white/5 border-white/20 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order_index" className="text-white/80">Display Order</Label>
            <Input
              id="order_index"
              type="number"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
              className="bg-white/5 border-white/20 text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="is_published"
              checked={formData.is_published}
              onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
            />
            <Label htmlFor="is_published" className="text-white/80 mb-0">Published</Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingCourse ? "Update" : "Create"} Course
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <AdminLayout
      title="Manage Courses"
      description="Manage short courses and view purchases"
      actions={
        <>
          <Button variant="outline" onClick={() => navigate("/admin/course-purchases")} className="gap-2">
            <Users className="h-5 w-5" />
            View Purchases
          </Button>
          {newCourseDialog}
        </>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <AdminStatsCard 
          title="Total Courses" 
          value={courses.length} 
          icon={GraduationCap}
        />
      </div>

      {/* Search */}
      <div className="mb-8">
        <Input
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm bg-white/5 border-white/20 text-white placeholder:text-white/40"
        />
      </div>

      {/* Table */}
      <AdminTable 
        headers={[
          "Title",
          "Slug", 
          "Duration",
          "Price",
          "Status",
          { label: "Actions", width: "140px" }
        ]}
        emptyState={filteredCourses.length === 0 ? "No courses found" : undefined}
      >
        {filteredCourses.map((course) => (
          <TableRow key={course.id} className={adminTableRowClass}>
            <TableCell className={cn(adminTableCellClass, "font-medium text-white")}>{course.title}</TableCell>
            <TableCell className={cn(adminTableCellClass, "text-foreground/70")}>{course.slug}</TableCell>
            <TableCell className={cn(adminTableCellClass, "text-foreground/70")}>{course.duration_days} days</TableCell>
            <TableCell className={cn(adminTableCellClass, "text-foreground/70")}>{formatPrice(course.price_cents, course.currency)}</TableCell>
            <TableCell className={adminTableCellClass}>
              <button
                onClick={() => togglePublish(course)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  course.is_published
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-300"
                }`}
              >
                {course.is_published ? "Published" : "Draft"}
              </button>
            </TableCell>
            <TableCell className={adminTableCellClass}>
              <div className="flex gap-2">
                <Button variant="ghost" size="default" onClick={() => navigate(`/admin/course-lessons/${course.id}`)} className="hover:bg-white/10">
                  <BookOpen className="h-5 w-5 text-[#E6DBC7]" />
                </Button>
                <Button variant="ghost" size="default" onClick={() => handleEdit(course)} className="hover:bg-white/10">
                  <Pencil className="h-5 w-5 text-[#E6DBC7]" />
                </Button>
                <Button variant="ghost" size="default" onClick={() => handleDelete(course.id)} className="hover:bg-red-500/10">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </AdminTable>
    </AdminLayout>
  );
};

export default AdminCourses;

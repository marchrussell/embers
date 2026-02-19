import { AdminLayout, AdminStatsCard } from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Eye, EyeOff, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Program {
  id: string;
  title: string;
  short_description: string | null;
  description: string | null;
  teacher_name: string | null;
  image_url: string | null;
  is_published: boolean;
  category_id: string | null;
  lesson_count: number | null;
}

interface Class {
  id: string;
  title: string;
  duration_minutes: number | null;
}

interface Category {
  id: string;
  name: string;
}

const AdminPrograms = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [classSearchQuery, setClassSearchQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    short_description: "",
    description: "",
    teacher_name: "March Russell",
    image_url: "",
    is_published: false,
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    fetchPrograms();
    fetchCategories();
    fetchClasses();
  }, []);

  const fetchPrograms = async () => {
    const { data, error } = await supabase
      .from("programs")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      toast({ title: "Error fetching programs", description: error.message, variant: "destructive" });
    } else {
      setPrograms(data || []);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("id, name").order("name");
    setCategories(data || []);
  };

  const fetchClasses = async () => {
    const { data } = await supabase.from("classes").select("id, title, duration_minutes").order("title");
    setClasses(data || []);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid file type", description: "Please upload an image file", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload an image smaller than 5MB", variant: "destructive" });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('program-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('program-images')
        .getPublicUrl(filePath);

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

    if (!formData.title || !formData.short_description || !formData.description || !formData.teacher_name || !formData.image_url) {
      toast({ title: "Missing required fields", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const wordCount = formData.description.split(/\s+/).filter(w => w).length;
    if (wordCount > 250) {
      toast({ title: "Description too long", description: "Please limit description to 250 words", variant: "destructive" });
      return;
    }
    
    const programData = {
      title: formData.title,
      short_description: formData.short_description,
      description: formData.description,
      teacher_name: formData.teacher_name,
      image_url: formData.image_url,
      category_id: null,
      is_published: formData.is_published,
      lesson_count: selectedClasses.length,
    };

    if (editingProgram) {
      const { error } = await supabase
        .from("programs")
        .update(programData)
        .eq("id", editingProgram.id);
      
      if (error) {
        toast({ title: "Error updating program", description: error.message, variant: "destructive" });
      } else {
        await updateProgramClasses(editingProgram.id);
        toast({ title: "Program updated successfully" });
        fetchPrograms();
        resetForm();
      }
    } else {
      const { data, error } = await supabase.from("programs").insert(programData).select().single();
      
      if (error) {
        toast({ title: "Error creating program", description: error.message, variant: "destructive" });
      } else {
        if (data) await updateProgramClasses(data.id);
        toast({ title: "Program created successfully" });
        fetchPrograms();
        resetForm();
      }
    }
  };

  const updateProgramClasses = async (programId: string) => {
    await supabase
      .from("classes")
      .update({ program_id: null })
      .eq("program_id", programId);

    for (let i = 0; i < selectedClasses.length; i++) {
      await supabase
        .from("classes")
        .update({ program_id: programId, order_index: i })
        .eq("id", selectedClasses[i]);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this program?")) return;
    
    const { error } = await supabase.from("programs").delete().eq("id", id);
    
    if (error) {
      toast({ title: "Error deleting program", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Program deleted successfully" });
      fetchPrograms();
    }
  };

  const handleEdit = async (program: Program) => {
    setEditingProgram(program);
    setFormData({
      title: program.title,
      short_description: program.short_description || "",
      description: program.description || "",
      teacher_name: program.teacher_name || "March Russell",
      image_url: program.image_url || "",
      is_published: program.is_published,
    });

    const { data } = await supabase
      .from("classes")
      .select("id")
      .eq("program_id", program.id)
      .order("order_index");
    
    setSelectedClasses(data?.map(c => c.id) || []);
    setIsDialogOpen(true);
  };

  const togglePublish = async (program: Program) => {
    const { error } = await supabase
      .from("programs")
      .update({ is_published: !program.is_published })
      .eq("id", program.id);
    
    if (error) {
      toast({ title: "Error updating program", description: error.message, variant: "destructive" });
    } else {
      fetchPrograms();
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      short_description: "",
      description: "",
      teacher_name: "March Russell",
      image_url: "",
      is_published: false,
    });
    setSelectedClasses([]);
    setClassSearchQuery("");
    setEditingProgram(null);
    setIsDialogOpen(false);
  };

  const toggleClass = (classId: string) => {
    setSelectedClasses(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const moveClass = (index: number, direction: 'up' | 'down') => {
    const newSelectedClasses = [...selectedClasses];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newSelectedClasses.length) return;
    
    [newSelectedClasses[index], newSelectedClasses[newIndex]] = 
      [newSelectedClasses[newIndex], newSelectedClasses[index]];
    
    setSelectedClasses(newSelectedClasses);
  };

  const filteredPrograms = programs.filter(program =>
    program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    program.teacher_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const newProgramDialog = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => resetForm()} className="gap-2">
          <Plus className="h-5 w-5" /> New Program
        </Button>
      </DialogTrigger>
            <DialogContent className="backdrop-blur-xl bg-black/60 border border-white/20 max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl" hideClose>
              <DialogHeader>
                <DialogTitle className="text-2xl text-[#E6DBC7]">
                  {editingProgram ? "Edit Program" : "Create New Program"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-4 pb-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white/80">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="short_description" className="text-white/80">Short Description *</Label>
                  <Textarea
                    id="short_description"
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    rows={2}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    placeholder="Brief description for library page"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white/80">
                    Long Description * - {(formData.description || "").split(/\s+/).filter(w => w).length}/250 words
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    placeholder="Detailed program description (max 250 words)"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher" className="text-white/80">Teacher Name *</Label>
                  <Input
                    id="teacher"
                    value={formData.teacher_name}
                    onChange={(e) => setFormData({ ...formData, teacher_name: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image" className="text-white/80">Program Image *</Label>
                  <div className="space-y-2">
                    {formData.image_url && (
                      <div className="relative w-full h-48 rounded-md overflow-hidden border border-white/20">
                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    )}
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="bg-white/5 border-white/20 text-white"
                      required={!formData.image_url}
                    />
                    <p className="text-xs text-white/50">Upload an image for this program (max 5MB)</p>
                  </div>
                </div>
                
                <div className="border border-white/20 rounded-lg p-5 space-y-4">
                  <div>
                    <Label className="text-white/80">Program Classes ({selectedClasses.length})</Label>
                    <p className="text-sm text-white/50 mt-1">Select and order classes for this program</p>
                  </div>
                  
                  <Input
                    placeholder="Search classes..."
                    value={classSearchQuery}
                    onChange={(e) => setClassSearchQuery(e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                  
                  {selectedClasses.length > 0 && (
                    <div className="p-3 bg-white/5 rounded-md">
                      <p className="text-sm font-medium mb-2 text-white/80">Selected Classes Order:</p>
                      <div className="space-y-1">
                        {selectedClasses.map((classId, index) => {
                          const classItem = classes.find(c => c.id === classId);
                          return (
                            <div key={classId} className="flex items-center gap-2 p-2 bg-white/5 rounded">
                              <span className="text-xs text-white/50 w-6">{index + 1}.</span>
                              <span className="flex-1 text-sm text-white">{classItem?.title}</span>
                              <div className="flex gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveClass(index, 'up')}
                                  disabled={index === 0}
                                  className="h-7 w-7 p-0 text-white/60 hover:text-white"
                                >
                                  ↑
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveClass(index, 'down')}
                                  disabled={index === selectedClasses.length - 1}
                                  className="h-7 w-7 p-0 text-white/60 hover:text-white"
                                >
                                  ↓
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {classes
                      .filter((classItem) => 
                        classItem.title.toLowerCase().includes(classSearchQuery.toLowerCase())
                      )
                      .map((classItem) => (
                      <div key={classItem.id} className="flex items-center gap-2 p-2 rounded hover:bg-white/5">
                        <input
                          type="checkbox"
                          checked={selectedClasses.includes(classItem.id)}
                          onChange={() => toggleClass(classItem.id)}
                          className="h-4 w-4"
                        />
                        <span className="flex-1 text-white">{classItem.title}</span>
                        <span className="text-sm text-white/50">
                          {classItem.duration_minutes ? `${classItem.duration_minutes}min` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <Label htmlFor="published" className="text-white/80 mb-0">Publish</Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingProgram ? "Update" : "Create"} Program
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                </div>
              </form>
            </DialogContent>
    </Dialog>
  );

  return (
    <AdminLayout
      title="Manage Programs"
      description="Create and organize multi-session programs"
      actions={newProgramDialog}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <AdminStatsCard 
          title="Total Programs" 
          value={programs.length} 
          icon={BookOpen}
        />
        <AdminStatsCard 
          title="Published" 
          value={programs.filter(p => p.is_published).length} 
          icon={Eye}
          iconColor="#4ade80"
          iconBgColor="rgba(74, 222, 128, 0.1)"
        />
        <AdminStatsCard 
          title="Drafts" 
          value={programs.filter(p => !p.is_published).length} 
          icon={EyeOff}
          iconColor="#facc15"
          iconBgColor="rgba(250, 204, 21, 0.1)"
        />
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
          <Input
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
          />
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid gap-6">
        {filteredPrograms.length === 0 ? (
          <Card className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="h-12 w-12 text-[#E6DBC7]/40 mb-4" />
              <p className="text-white/60 text-center">
                {searchQuery ? "No programs match your search" : "No programs yet. Create your first program!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPrograms.map((program) => (
            <Card key={program.id} className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20 hover:border-[#E6DBC7]/40 transition-all">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {program.image_url && (
                    <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={program.image_url} 
                        alt={program.title} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-xl font-medium text-white mb-1">{program.title}</h3>
                        <p className="text-sm text-white/60">by {program.teacher_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={program.is_published ? "default" : "secondary"}
                          className={program.is_published ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}
                        >
                          {program.is_published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-white/70 line-clamp-2 mb-4">
                      {program.short_description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/50">
                        {program.lesson_count || 0} classes
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="default" 
                          onClick={() => togglePublish(program)}
                          className="text-white/60 hover:text-white hover:bg-white/10 h-10 w-10 p-0"
                        >
                          {program.is_published ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="default" 
                          onClick={() => handleEdit(program)}
                          className="text-[#E6DBC7] hover:text-white hover:bg-white/10 h-10 w-10 p-0"
                        >
                          <Pencil className="h-5 w-5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="default" 
                          onClick={() => handleDelete(program.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-10 w-10 p-0"
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
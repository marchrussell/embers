import { AdminLayout, AdminStatsCard, AdminTable, adminTableCellClass, adminTableRowClass } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableCell, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { FolderOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

const AdminCategories = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    
    if (error) {
      toast({ title: "Error fetching categories", description: error.message, variant: "destructive" });
    } else {
      setCategories(data || []);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let imageUrl = editingCategory?.image_url || null;

    // Upload image if a new one was selected
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('category-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        toast({ title: "Error uploading image", description: uploadError.message, variant: "destructive" });
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('category-images')
        .getPublicUrl(filePath);

      imageUrl = publicUrl;
    }
    
    const categoryData = {
      name: formData.name,
      description: formData.description || null,
      image_url: imageUrl,
    };

    if (editingCategory) {
      const { error } = await supabase
        .from("categories")
        .update(categoryData)
        .eq("id", editingCategory.id);
      
      if (error) {
        toast({ title: "Error updating category", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Category updated successfully" });
        fetchCategories();
        resetForm();
      }
    } else {
      const { error } = await supabase.from("categories").insert(categoryData);
      
      if (error) {
        toast({ title: "Error creating category", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Category created successfully" });
        fetchCategories();
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    
    const { error } = await supabase.from("categories").delete().eq("id", id);
    
    if (error) {
      toast({ title: "Error deleting category", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Category deleted successfully" });
      fetchCategories();
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setImagePreview(category.image_url);
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
    });
    setEditingCategory(null);
    setImageFile(null);
    setImagePreview(null);
    setIsDialogOpen(false);
  };

  const newCategoryDialog = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => resetForm()} className="gap-2">
          <Plus className="h-5 w-5" /> New Category
        </Button>
      </DialogTrigger>
      <DialogContent className="backdrop-blur-xl bg-black/60 border border-white/20 max-w-md rounded-xl" hideClose>
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#E6DBC7]">
            {editingCategory ? "Edit Category" : "Create New Category"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/80">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-white/5 border-white/20 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white/80">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Category description"
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image" className="text-white/80">Category Image</Label>
            {imagePreview && (
              <div className="mb-2">
                <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-md border border-white/20" loading="lazy" />
              </div>
            )}
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="bg-white/5 border-white/20 text-white"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingCategory ? "Update" : "Create"} Category
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <AdminLayout
      title="Manage Categories"
      description="Organize breathwork sessions by category"
      actions={newCategoryDialog}
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <AdminStatsCard 
          title="Total Categories" 
          value={categories.length} 
          icon={FolderOpen}
        />
      </div>

      {/* Table */}
      <AdminTable 
        headers={[
          "Image",
          "Name", 
          "Description",
          { label: "Actions", width: "120px" }
        ]}
        emptyState={categories.length === 0 ? "No categories yet. Create your first category!" : undefined}
      >
        {categories.map((category) => (
          <TableRow key={category.id} className={adminTableRowClass}>
            <TableCell className={adminTableCellClass}>
              {category.image_url ? (
                <img src={category.image_url} alt={category.name} className="w-16 h-16 object-cover rounded-lg" loading="lazy" />
              ) : (
                <div className="w-16 h-16 bg-[#E6DBC7]/10 rounded-lg flex items-center justify-center text-xs text-foreground/50">No image</div>
              )}
            </TableCell>
            <TableCell className={cn(adminTableCellClass, "font-medium text-white")}>{category.name}</TableCell>
            <TableCell className={cn(adminTableCellClass, "text-foreground/70")}>{category.description || "-"}</TableCell>
            <TableCell className={adminTableCellClass}>
              <div className="flex gap-2">
                <Button variant="ghost" size="default" onClick={() => handleEdit(category)} className="hover:bg-white/10 h-10 w-10 p-0">
                  <Pencil className="h-5 w-5 text-[#E6DBC7]" />
                </Button>
                <Button variant="ghost" size="default" onClick={() => handleDelete(category.id)} className="hover:bg-red-500/10 h-10 w-10 p-0">
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

export default AdminCategories;

import { AdminLayout, AdminStatsCard } from "@/components/admin";
import { AdminContentSkeleton } from "@/components/skeletons/AdminContentSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Calendar, Check, Copy, ExternalLink, ImageIcon, Link2, Pencil, Plus, Trash2, User, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface GuestTeacher {
  id: string;
  name: string;
  title: string;
  short_description: string | null;
  photo_url: string | null;
  session_date: string;
  session_title: string;
  what_to_expect: string[];
  is_active: boolean;
  created_at: string;
  guest_join_url?: string | null;
  linked_session_id?: string | null;
}

const AdminGuestTeachers = () => {
  const { isAdmin, loading, session } = useAuth();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<GuestTeacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<GuestTeacher | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generatingLink, setGeneratingLink] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    short_description: "",
    photo_url: "",
    session_date: "",
    session_title: "",
    what_to_expect: ["A guided, voice-led practice", "You can sit, lie down, or simply listen", "Camera and microphone are not used", "You're welcome to arrive late or leave early"],
    is_active: true,
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchTeachers();
    }
  }, [isAdmin]);

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('guest_teachers')
        .select('*')
        .order('session_date', { ascending: true });

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching guest teachers:', error);
      toast.error("Failed to load guest teachers");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `guest-teacher-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('class-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('class-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, photo_url: publicUrl }));
      toast.success("Photo uploaded successfully");
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      title: "",
      short_description: "",
      photo_url: "",
      session_date: "",
      session_title: "",
      what_to_expect: ["A guided, voice-led practice", "You can sit, lie down, or simply listen", "Camera and microphone are not used", "You're welcome to arrive late or leave early"],
      is_active: true,
    });
    setEditingTeacher(null);
  };

  const handleEdit = (teacher: GuestTeacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      title: teacher.title,
      short_description: teacher.short_description || "",
      photo_url: teacher.photo_url || "",
      session_date: teacher.session_date.slice(0, 16), // Format for datetime-local input
      session_title: teacher.session_title,
      what_to_expect: teacher.what_to_expect || [],
      is_active: teacher.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        name: formData.name,
        title: formData.title,
        short_description: formData.short_description || null,
        photo_url: formData.photo_url || null,
        session_date: new Date(formData.session_date).toISOString(),
        session_title: formData.session_title,
        what_to_expect: formData.what_to_expect.filter(item => item.trim() !== ""),
        is_active: formData.is_active,
      };

      if (editingTeacher) {
        const { error } = await supabase
          .from('guest_teachers')
          .update(payload)
          .eq('id', editingTeacher.id);

        if (error) throw error;
        toast.success("Guest teacher updated successfully");
      } else {
        const { error } = await supabase
          .from('guest_teachers')
          .insert(payload);

        if (error) throw error;
        toast.success("Guest teacher added successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchTeachers();
    } catch (error) {
      console.error('Error saving guest teacher:', error);
      toast.error("Failed to save guest teacher");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this guest teacher?")) return;

    try {
      const { error } = await supabase
        .from('guest_teachers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Guest teacher deleted successfully");
      fetchTeachers();
    } catch (error) {
      console.error('Error deleting guest teacher:', error);
      toast.error("Failed to delete guest teacher");
    }
  };

  const handleWhatToExpectChange = (index: number, value: string) => {
    const updated = [...formData.what_to_expect];
    updated[index] = value;
    setFormData(prev => ({ ...prev, what_to_expect: updated }));
  };

  const addWhatToExpectItem = () => {
    setFormData(prev => ({ ...prev, what_to_expect: [...prev.what_to_expect, ""] }));
  };

  const removeWhatToExpectItem = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      what_to_expect: prev.what_to_expect.filter((_, i) => i !== index) 
    }));
  };

  const generateGuestLink = async (teacher: GuestTeacher) => {
    setGeneratingLink(teacher.id);
    try {
      // First, check if there's a live session for this date or create one
      let liveSessionId = teacher.linked_session_id;
      
      if (!liveSessionId) {
        // Create a live session for this guest teacher
        const { data: newSession, error: createError } = await supabase
          .from('live_sessions')
          .insert({
            title: teacher.session_title,
            description: teacher.short_description || `Guest session with ${teacher.name}`,
            start_time: teacher.session_date,
            status: 'scheduled',
            access_level: 'members',
          })
          .select()
          .single();

        if (createError) throw createError;
        liveSessionId = newSession.id;

        // Link the session to the guest teacher
        await supabase
          .from('guest_teachers')
          .update({ linked_session_id: liveSessionId })
          .eq('id', teacher.id);
      }

      // Now generate the guest link via edge function
      const { data, error } = await supabase.functions.invoke('daily-generate-guest-link', {
        body: { sessionId: liveSessionId },
      });

      if (error) throw error;

      // Update the teacher with the guest join URL
      await supabase
        .from('guest_teachers')
        .update({ guest_join_url: data.guestJoinUrl })
        .eq('id', teacher.id);

      toast.success("Guest link generated successfully!");
      fetchTeachers();
    } catch (error) {
      console.error('Error generating guest link:', error);
      toast.error("Failed to generate guest link");
    } finally {
      setGeneratingLink(null);
    }
  };

  const copyGuestLink = async (url: string, teacherId: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(teacherId);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const upcomingTeachers = teachers.filter(t => new Date(t.session_date) >= new Date());
  const pastTeachers = teachers.filter(t => new Date(t.session_date) < new Date());

  const newTeacherDialog = (
    <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-5 w-5" />
          Add Guest Teacher
        </Button>
      </DialogTrigger>
      <DialogContent className="backdrop-blur-xl bg-black/60 border border-white/20 max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl" hideClose>
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#E6DBC7]">
            {editingTeacher ? "Edit Guest Teacher" : "Add Guest Teacher"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Photo Upload */}
          <div className="space-y-2">
            <Label className="text-white/80">Photo</Label>
            <div className="flex items-center gap-4">
              {formData.photo_url ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/20">
                  <img src={formData.photo_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg border border-dashed border-white/30 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-white/30" />
                </div>
              )}
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="bg-white/5 border-white/20 text-white"
                />
                <p className="text-xs text-white/50 mt-1">Or paste a URL below</p>
              </div>
            </div>
            <Input
              placeholder="Or enter photo URL directly"
              value={formData.photo_url}
              onChange={(e) => setFormData(prev => ({ ...prev, photo_url: e.target.value }))}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
            />
          </div>

          {/* Name & Title */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/80">Name *</Label>
              <Input
                required
                placeholder="e.g., Sarah Johnson"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80">Title *</Label>
              <Input
                required
                placeholder="e.g., Breathwork Facilitator"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
          </div>

          {/* Session Title */}
          <div className="space-y-2">
            <Label className="text-white/80">Session Title *</Label>
            <Input
              required
              placeholder="e.g., Awakening Through Breath"
              value={formData.session_title}
              onChange={(e) => setFormData(prev => ({ ...prev, session_title: e.target.value }))}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
            />
          </div>

          {/* Session Date */}
          <div className="space-y-2">
            <Label className="text-white/80">Session Date & Time *</Label>
            <Input
              type="datetime-local"
              required
              value={formData.session_date}
              onChange={(e) => setFormData(prev => ({ ...prev, session_date: e.target.value }))}
              className="bg-white/5 border-white/20 text-white"
            />
            <p className="text-xs text-white/50">
              Click the calendar icon to select date & time. Usually 3rd Thursday of the month at 7:30 PM GMT.
            </p>
          </div>

          {/* Short Description */}
          <div className="space-y-2">
            <Label className="text-white/80">Short Description</Label>
            <Textarea
              placeholder="A brief description of this teacher and their session..."
              value={formData.short_description}
              onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40 min-h-[80px]"
            />
          </div>

          {/* What to Expect */}
          <div className="space-y-2">
            <Label className="text-white/80">What to Expect</Label>
            {formData.what_to_expect.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={item}
                  onChange={(e) => handleWhatToExpectChange(index, e.target.value)}
                  placeholder="e.g., A guided, voice-led practice"
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeWhatToExpectItem(index)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addWhatToExpectItem}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white/80">Active</Label>
              <p className="text-xs text-white/50">Show this teacher on the live section</p>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingTeacher ? "Save Changes" : "Add Guest Teacher"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <AdminLayout
      title="Guest Teachers"
      description="Manage upcoming guest session teachers"
      actions={newTeacherDialog}
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <AdminStatsCard 
          title="Total Teachers" 
          value={teachers.length} 
          icon={Users}
        />
        <AdminStatsCard 
          title="Upcoming Sessions" 
          value={upcomingTeachers.length} 
          icon={Calendar}
          iconColor="#4ade80"
          iconBgColor="rgba(74, 222, 128, 0.1)"
        />
        <AdminStatsCard 
          title="Past Sessions" 
          value={pastTeachers.length} 
          icon={User}
          iconColor="#94a3b8"
          iconBgColor="rgba(148, 163, 184, 0.1)"
        />
      </div>

      {isLoading ? (
        <AdminContentSkeleton showStats={false} variant="cards" />
      ) : teachers.length === 0 ? (
        <Card className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20">
          <CardContent className="py-12 text-center">
            <User className="w-12 h-12 text-[#E6DBC7]/30 mx-auto mb-4" />
            <p className="text-foreground/60">No guest teachers scheduled yet</p>
            <p className="text-sm text-foreground/40 mt-2">Add your first guest teacher to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {/* Upcoming Teachers */}
          {upcomingTeachers.length > 0 && (
            <div>
              <h2 className="text-xl font-medium text-[#E6DBC7] mb-6">Upcoming Sessions</h2>
              <div className="grid gap-6">
                {upcomingTeachers.map((teacher) => (
                  <Card key={teacher.id} className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20 hover:border-[#E6DBC7]/40 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-6">
                        {teacher.photo_url ? (
                          <img src={teacher.photo_url} alt={teacher.name} className="w-20 h-20 rounded-lg object-cover" />
                        ) : (
                          <div className="w-20 h-20 rounded-lg bg-white/5 flex items-center justify-center">
                            <User className="w-8 h-8 text-[#E6DBC7]/30" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-white">{teacher.name}</h3>
                              <p className="text-sm text-[#D4A574]">{teacher.title}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {!teacher.is_active && (
                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">Inactive</span>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(teacher)}
                                className="hover:bg-white/10 h-10 w-10 p-0"
                              >
                                <Pencil className="h-5 w-5 text-[#E6DBC7]" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(teacher.id)}
                                className="hover:bg-red-500/10 h-10 w-10 p-0"
                              >
                                <Trash2 className="h-5 w-5 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-[#E6DBC7] font-editorial text-lg mt-2">{teacher.session_title}</p>
                          <div className="flex items-center gap-2 mt-2 text-sm text-foreground/60">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(teacher.session_date), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                          </div>
                          {teacher.short_description && (
                            <p className="text-sm text-foreground/50 mt-2 line-clamp-2">{teacher.short_description}</p>
                          )}
                          
                          {/* Guest Link Section */}
                          <div className="mt-4 pt-4 border-t border-[#E6DBC7]/10">
                            <div className="flex items-center gap-3">
                              <Link2 className="w-4 h-4 text-[#D4A574]" />
                              <span className="text-sm text-foreground/60">Guest Join Link:</span>
                              {teacher.guest_join_url ? (
                                <div className="flex items-center gap-2 flex-1">
                                  <code className="text-xs text-foreground/40 bg-white/5 px-2 py-1 rounded truncate max-w-[200px]">
                                    {teacher.guest_join_url}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyGuestLink(teacher.guest_join_url!, teacher.id)}
                                    className="text-[#D4A574] hover:text-[#D4A574]/80"
                                  >
                                    {copiedId === teacher.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(teacher.guest_join_url!, '_blank')}
                                    className="text-foreground/60 hover:text-white"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => generateGuestLink(teacher)}
                                  disabled={generatingLink === teacher.id}
                                  className="gap-2"
                                >
                                  {generatingLink === teacher.id ? (
                                    "Generating..."
                                  ) : (
                                    <>
                                      <Link2 className="w-3 h-3" />
                                      Generate Link
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Past Teachers */}
          {pastTeachers.length > 0 && (
            <div>
              <h2 className="text-xl font-medium text-foreground/60 mb-6">Past Sessions</h2>
              <div className="grid gap-4 opacity-60">
                {pastTeachers.map((teacher) => (
                  <Card key={teacher.id} className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/10">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {teacher.photo_url ? (
                          <img src={teacher.photo_url} alt={teacher.name} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                            <User className="w-5 h-5 text-[#E6DBC7]/30" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-white font-medium">{teacher.name}</p>
                          <p className="text-sm text-foreground/50">{teacher.session_title} • {format(new Date(teacher.session_date), "MMM d, yyyy")}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(teacher.id)}
                          className="hover:bg-red-500/10 h-10 w-10 p-0"
                        >
                          <Trash2 className="h-5 w-5 text-destructive/60" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminGuestTeachers;
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, ArrowLeft, Clock, Calendar } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { AdminSkeleton } from "@/components/skeletons/AdminSkeleton";

interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const AdminAvailability = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [newSlot, setNewSlot] = useState({
    day_of_week: 1,
    start_time: "09:00",
    end_time: "17:00",
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    const { data, error } = await supabase
      .from("availability_slots")
      .select("*")
      .order("day_of_week")
      .order("start_time");

    if (error) {
      toast({ title: "Error fetching availability", variant: "destructive" });
    } else {
      setSlots(data || []);
    }
  };

  const handleAddSlot = async () => {
    const { error } = await supabase
      .from("availability_slots")
      .insert([newSlot]);

    if (error) {
      toast({ title: "Error adding slot", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Availability slot added" });
      fetchSlots();
      setNewSlot({ day_of_week: 1, start_time: "09:00", end_time: "17:00" });
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("availability_slots")
      .update({ is_active: !isActive })
      .eq("id", id);

    if (error) {
      toast({ title: "Error updating slot", variant: "destructive" });
    } else {
      fetchSlots();
    }
  };

  const handleDeleteSlot = async (id: string) => {
    const { error } = await supabase
      .from("availability_slots")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error deleting slot", variant: "destructive" });
    } else {
      toast({ title: "Slot deleted" });
      fetchSlots();
    }
  };

  if (loading) {
    return <AdminSkeleton />;
  }

  if (!isAdmin) {
    return null;
  }

  const activeSlots = slots.filter(s => s.is_active).length;
  const totalSlots = slots.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-8 py-24">
        <div className="mb-8">
          <Link to="/admin" className="inline-flex items-center text-[#E6DBC7]/70 hover:text-[#E6DBC7] transition-colors gap-2 text-base md:text-lg">
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-12">
          <h1 className="font-editorial text-5xl md:text-6xl text-[#E6DBC7] mb-3 font-light">Manage Availability</h1>
          <p className="text-base text-foreground/70">Set your available time slots for bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/60 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#E6DBC7]/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#E6DBC7]" />
                </div>
                Total Slots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-white">{totalSlots}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white/60 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-400" />
                </div>
                Active Slots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-white">{activeSlots}</p>
            </CardContent>
          </Card>
        </div>

        {/* Add New Slot */}
        <Card className="mb-10 bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-[#E6DBC7] text-xl">Add Availability Window</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="day" className="text-white/80">Day</Label>
                <select
                  id="day"
                  className="w-full h-10 px-3 rounded-md border border-white/20 bg-white/5 text-white"
                  value={newSlot.day_of_week}
                  onChange={(e) => setNewSlot({ ...newSlot, day_of_week: parseInt(e.target.value) })}
                >
                  {DAYS.map((day, index) => (
                    <option key={index} value={index} className="bg-[#1A1A1A]">{day}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start" className="text-white/80">Start Time</Label>
                <Input
                  id="start"
                  type="time"
                  value={newSlot.start_time}
                  onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end" className="text-white/80">End Time</Label>
                <Input
                  id="end"
                  type="time"
                  value={newSlot.end_time}
                  onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddSlot} className="w-full gap-2">
                  <Plus className="h-5 w-5" />
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Existing Slots */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-[#E6DBC7] text-xl">Current Availability</CardTitle>
          </CardHeader>
          <CardContent>
            {slots.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-[#E6DBC7]/40 mx-auto mb-4" />
                <p className="text-white/60">
                  No availability slots set. Add your first slot above.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {DAYS.map((day, dayIndex) => {
                  const daySlots = slots.filter(s => s.day_of_week === dayIndex);
                  if (daySlots.length === 0) return null;

                  return (
                    <div key={dayIndex} className="border-b border-white/10 pb-6 last:border-0">
                      <h3 className="font-medium mb-3 text-[#E6DBC7]">{day}</h3>
                      <div className="space-y-2">
                        {daySlots.map((slot) => (
                          <div key={slot.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-4">
                              <span className="font-mono text-white">
                                {slot.start_time} - {slot.end_time}
                              </span>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={slot.is_active}
                                  onCheckedChange={() => handleToggleActive(slot.id, slot.is_active)}
                                />
                                <span className={`text-sm ${slot.is_active ? 'text-green-400' : 'text-white/50'}`}>
                                  {slot.is_active ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAvailability;

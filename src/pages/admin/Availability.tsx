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
    const { error } = await supabase.from("availability_slots").insert([newSlot]);

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
    const { error } = await supabase.from("availability_slots").delete().eq("id", id);

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

  const activeSlots = slots.filter((s) => s.is_active).length;
  const totalSlots = slots.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-8 py-24">
        <div className="mb-8">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-base text-[#E6DBC7]/70 transition-colors hover:text-[#E6DBC7] md:text-lg"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-12">
          <h1 className="mb-3 font-editorial text-5xl font-light text-[#E6DBC7] md:text-6xl">
            Manage Availability
          </h1>
          <p className="text-base text-foreground/70">Set your available time slots for bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="border-white/10 bg-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-white/60">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E6DBC7]/20">
                  <Clock className="h-5 w-5 text-[#E6DBC7]" />
                </div>
                Total Slots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-white">{totalSlots}</p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-white/60">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20">
                  <Calendar className="h-5 w-5 text-green-400" />
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
        <Card className="mb-10 border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-xl text-[#E6DBC7]">Add Availability Window</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="day" className="text-white/80">
                  Day
                </Label>
                <select
                  id="day"
                  className="h-10 w-full rounded-md border border-white/20 bg-white/5 px-3 text-white"
                  value={newSlot.day_of_week}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, day_of_week: parseInt(e.target.value) })
                  }
                >
                  {DAYS.map((day, index) => (
                    <option key={index} value={index} className="bg-[#1A1A1A]">
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start" className="text-white/80">
                  Start Time
                </Label>
                <Input
                  id="start"
                  type="time"
                  value={newSlot.start_time}
                  onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                  className="border-white/20 bg-white/5 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end" className="text-white/80">
                  End Time
                </Label>
                <Input
                  id="end"
                  type="time"
                  value={newSlot.end_time}
                  onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                  className="border-white/20 bg-white/5 text-white"
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
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-xl text-[#E6DBC7]">Current Availability</CardTitle>
          </CardHeader>
          <CardContent>
            {slots.length === 0 ? (
              <div className="py-12 text-center">
                <Clock className="mx-auto mb-4 h-12 w-12 text-[#E6DBC7]/40" />
                <p className="text-white/60">
                  No availability slots set. Add your first slot above.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {DAYS.map((day, dayIndex) => {
                  const daySlots = slots.filter((s) => s.day_of_week === dayIndex);
                  if (daySlots.length === 0) return null;

                  return (
                    <div key={dayIndex} className="border-b border-white/10 pb-6 last:border-0">
                      <h3 className="mb-3 font-medium text-[#E6DBC7]">{day}</h3>
                      <div className="space-y-2">
                        {daySlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="flex items-center justify-between rounded-lg bg-white/5 p-4 transition-colors hover:bg-white/10"
                          >
                            <div className="flex items-center gap-4">
                              <span className="font-mono text-white">
                                {slot.start_time} - {slot.end_time}
                              </span>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={slot.is_active}
                                  onCheckedChange={() =>
                                    handleToggleActive(slot.id, slot.is_active)
                                  }
                                />
                                <span
                                  className={`text-sm ${slot.is_active ? "text-green-400" : "text-white/50"}`}
                                >
                                  {slot.is_active ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
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

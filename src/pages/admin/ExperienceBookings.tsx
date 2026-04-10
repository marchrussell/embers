import { Calendar, Download, RefreshCw, Ticket, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminLayout, AdminStatsCard } from "@/components/admin";
import { TableRowSkeleton } from "@/components/skeletons/TableRowSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

interface ExperienceBooking {
  id: string;
  experience_type: string | null;
  experience_date: string | null;
  attendee_name: string;
  attendee_email: string;
  quantity: number;
  total_amount: number;
  payment_status: string;
  stripe_payment_intent_id: string | null;
  created_at: string;
}

interface DateStats {
  date: string;
  displayDate: string;
  totalBookings: number;
  totalTickets: number;
}

const EVENT_TITLES: Record<string, string> = {
  "breath-presence-online": "Breath, Presence & Heart Connection (Online)",
  "breath-presence-inperson": "Breath, Presence & Heart Connection (In-Person)",
  "breathwork-to-dub": "Breathwork to Dub",
  "unwind-rest": "Unwind & Rest (IG Live)",
};

const ExperienceBookings = () => {
  const [bookings, setBookings] = useState<ExperienceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const [dateStats, setDateStats] = useState<DateStats[]>([]);
  const [uniqueEventTypes, setUniqueEventTypes] = useState<string[]>([]);
  const [uniqueDates, setUniqueDates] = useState<string[]>([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("experiences_bookings")
        .select("*")
        .eq("payment_status", "paid")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const bookingsData = (data || []) as ExperienceBooking[];
      setBookings(bookingsData);

      const eventTypes = [
        ...new Set(bookingsData.map((b) => b.experience_type).filter(Boolean)),
      ] as string[];
      const dates = [
        ...new Set(bookingsData.map((b) => b.experience_date).filter(Boolean)),
      ] as string[];

      setUniqueEventTypes(eventTypes);
      setUniqueDates(dates.sort());

      const stats: Record<string, DateStats> = {};
      bookingsData.forEach((booking) => {
        if (booking.experience_date) {
          if (!stats[booking.experience_date]) {
            stats[booking.experience_date] = {
              date: booking.experience_date,
              displayDate: formatDateDisplay(booking.experience_date),
              totalBookings: 0,
              totalTickets: 0,
            };
          }
          stats[booking.experience_date].totalBookings += 1;
          stats[booking.experience_date].totalTickets += booking.quantity;
        }
      });
      setDateStats(Object.values(stats).sort((a, b) => a.date.localeCompare(b.date)));
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const formatDateDisplay = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (selectedEventType !== "all" && booking.experience_type !== selectedEventType) return false;
    if (selectedDate !== "all" && booking.experience_date !== selectedDate) return false;
    return true;
  });

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Event",
      "Date",
      "Tickets",
      "Amount",
      "Stripe ID",
      "Booked At",
    ];
    const rows = filteredBookings.map((b) => [
      b.attendee_name,
      b.attendee_email,
      EVENT_TITLES[b.experience_type || ""] || b.experience_type || "Unknown",
      b.experience_date || "N/A",
      b.quantity.toString(),
      `£${(b.total_amount / 100).toFixed(2)}`,
      b.stripe_payment_intent_id || "N/A",
      new Date(b.created_at).toLocaleString("en-GB"),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `experience-bookings-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
  };

  return (
    <AdminLayout
      title="Experience Bookings"
      description="View and manage experience attendee bookings"
    >
      {/* Stats Cards */}
      <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        <AdminStatsCard title="Total Bookings" value={bookings.length} icon={Users} />
        <AdminStatsCard
          title="Upcoming Dates"
          value={dateStats.filter((d) => d.date >= new Date().toISOString().split("T")[0]).length}
          icon={Calendar}
          iconColor="#60a5fa"
          iconBgColor="rgba(96, 165, 250, 0.1)"
        />
        <AdminStatsCard
          title="Total Tickets Sold"
          value={bookings.reduce((sum, b) => sum + b.quantity, 0)}
          icon={Ticket}
          iconColor="#4ade80"
          iconBgColor="rgba(74, 222, 128, 0.1)"
        />
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <Select value={selectedEventType} onValueChange={setSelectedEventType}>
          <SelectTrigger className="w-[280px] border-white/20 bg-white/5 text-white">
            <SelectValue placeholder="Filter by event type" />
          </SelectTrigger>
          <SelectContent className="border-white/20 bg-[#1A1A1A]">
            <SelectItem value="all" className="text-white">
              All Events
            </SelectItem>
            {uniqueEventTypes.map((type) => (
              <SelectItem key={type} value={type} className="text-white">
                {EVENT_TITLES[type] || type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedDate} onValueChange={setSelectedDate}>
          <SelectTrigger className="w-[200px] border-white/20 bg-white/5 text-white">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent className="border-white/20 bg-[#1A1A1A]">
            <SelectItem value="all" className="text-white">
              All Dates
            </SelectItem>
            {uniqueDates.map((date) => (
              <SelectItem key={date} value={date} className="text-white">
                {formatDateDisplay(date)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={exportToCSV}
          variant="outline"
          className="gap-2 border-white/20 text-white hover:bg-white/10"
        >
          <Download className="h-5 w-5" />
          Export CSV
        </Button>

        <Button
          onClick={fetchBookings}
          variant="outline"
          className="gap-2 border-white/20 text-white hover:bg-white/10"
          disabled={loading}
        >
          <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Upcoming Dates Summary */}
      {dateStats.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-4 text-xl font-medium text-[#E6DBC7]">Upcoming Dates</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {dateStats
              .filter((d) => d.date >= new Date().toISOString().split("T")[0])
              .slice(0, 8)
              .map((stat) => (
                <Card
                  key={stat.date}
                  className="border-[#E6DBC7]/20 bg-background/40 backdrop-blur-xl"
                >
                  <CardContent className="p-4">
                    <p className="text-sm text-white/60">{stat.displayDate}</p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {stat.totalTickets} {stat.totalTickets === 1 ? "ticket" : "tickets"}
                    </p>
                    <p className="text-xs text-white/50">
                      {stat.totalBookings} {stat.totalBookings === 1 ? "booking" : "bookings"}
                    </p>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Bookings Table */}
      <Card className="border-[#E6DBC7]/20 bg-background/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-xl text-[#E6DBC7]">
            Attendee List ({filteredBookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-white/60">Name</TableHead>
                    <TableHead className="text-white/60">Email</TableHead>
                    <TableHead className="text-white/60">Event</TableHead>
                    <TableHead className="text-white/60">Date</TableHead>
                    <TableHead className="text-white/60">Tickets</TableHead>
                    <TableHead className="text-white/60">Amount</TableHead>
                    <TableHead className="text-white/60">Stripe ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRowSkeleton columns={7} rows={5} />
                </TableBody>
              </Table>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-12 text-center text-white/60">No bookings found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-white/60">Name</TableHead>
                    <TableHead className="text-white/60">Email</TableHead>
                    <TableHead className="text-white/60">Event</TableHead>
                    <TableHead className="text-white/60">Date</TableHead>
                    <TableHead className="text-white/60">Tickets</TableHead>
                    <TableHead className="text-white/60">Amount</TableHead>
                    <TableHead className="text-white/60">Stripe ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-medium text-white">
                        {booking.attendee_name}
                      </TableCell>
                      <TableCell className="text-white/80">{booking.attendee_email}</TableCell>
                      <TableCell className="text-sm text-white/80">
                        {EVENT_TITLES[booking.experience_type || ""] ||
                          booking.experience_type ||
                          "Unknown"}
                      </TableCell>
                      <TableCell className="text-white/80">
                        {booking.experience_date
                          ? formatDateDisplay(booking.experience_date)
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-white">{booking.quantity}</TableCell>
                      <TableCell className="text-white">
                        £{(booking.total_amount / 100).toFixed(2)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-white/60">
                        {booking.stripe_payment_intent_id
                          ? booking.stripe_payment_intent_id.substring(0, 15) + "..."
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default ExperienceBookings;

import { AdminLayout, AdminStatsCard } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableRowSkeleton } from "@/components/skeletons/TableRowSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Download, RefreshCw, Ticket, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EventBooking {
  id: string;
  event_type: string | null;
  event_date: string | null;
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
  'breath-presence-online': 'Breath, Presence & Heart Connection (Online)',
  'breath-presence-inperson': 'Breath, Presence & Heart Connection (In-Person)',
  'breathwork-to-dub': 'Breathwork to Dub',
  'unwind-rest': 'Unwind & Rest (IG Live)',
};

const EventBookings = () => {
  const [bookings, setBookings] = useState<EventBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [dateStats, setDateStats] = useState<DateStats[]>([]);
  const [uniqueEventTypes, setUniqueEventTypes] = useState<string[]>([]);
  const [uniqueDates, setUniqueDates] = useState<string[]>([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('event_bookings')
        .select('*')
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const bookingsData = (data || []) as EventBooking[];
      setBookings(bookingsData);

      const eventTypes = [...new Set(bookingsData.map(b => b.event_type).filter(Boolean))] as string[];
      const dates = [...new Set(bookingsData.map(b => b.event_date).filter(Boolean))] as string[];
      
      setUniqueEventTypes(eventTypes);
      setUniqueDates(dates.sort());

      const stats: Record<string, DateStats> = {};
      bookingsData.forEach(booking => {
        if (booking.event_date) {
          if (!stats[booking.event_date]) {
            stats[booking.event_date] = {
              date: booking.event_date,
              displayDate: formatDateDisplay(booking.event_date),
              totalBookings: 0,
              totalTickets: 0,
            };
          }
          stats[booking.event_date].totalBookings += 1;
          stats[booking.event_date].totalTickets += booking.quantity;
        }
      });
      setDateStats(Object.values(stats).sort((a, b) => a.date.localeCompare(b.date)));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const formatDateDisplay = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (selectedEventType !== 'all' && booking.event_type !== selectedEventType) return false;
    if (selectedDate !== 'all' && booking.event_date !== selectedDate) return false;
    return true;
  });

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Event', 'Date', 'Tickets', 'Amount', 'Stripe ID', 'Booked At'];
    const rows = filteredBookings.map(b => [
      b.attendee_name,
      b.attendee_email,
      EVENT_TITLES[b.event_type || ''] || b.event_type || 'Unknown',
      b.event_date || 'N/A',
      b.quantity.toString(),
      `£${(b.total_amount / 100).toFixed(2)}`,
      b.stripe_payment_intent_id || 'N/A',
      new Date(b.created_at).toLocaleString('en-GB'),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `event-bookings-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  return (
    <AdminLayout
      title="Event Bookings"
      description="View and manage event attendee bookings"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <AdminStatsCard 
          title="Total Bookings" 
          value={bookings.length} 
          icon={Users}
        />
        <AdminStatsCard 
          title="Upcoming Dates" 
          value={dateStats.filter(d => d.date >= new Date().toISOString().split('T')[0]).length} 
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
        <div className="flex flex-wrap gap-4 mb-8 items-center">
          <Select value={selectedEventType} onValueChange={setSelectedEventType}>
            <SelectTrigger className="w-[280px] bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="Filter by event type" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-white/20">
              <SelectItem value="all" className="text-white">All Events</SelectItem>
              {uniqueEventTypes.map(type => (
                <SelectItem key={type} value={type} className="text-white">
                  {EVENT_TITLES[type] || type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="w-[200px] bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-white/20">
              <SelectItem value="all" className="text-white">All Dates</SelectItem>
              {uniqueDates.map(date => (
                <SelectItem key={date} value={date} className="text-white">
                  {formatDateDisplay(date)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={exportToCSV} 
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10 gap-2"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </Button>

          <Button 
            onClick={fetchBookings} 
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10 gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Upcoming Dates Summary */}
        {dateStats.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-medium text-[#E6DBC7] mb-4">Upcoming Dates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dateStats
                .filter(d => d.date >= new Date().toISOString().split('T')[0])
                .slice(0, 8)
                .map(stat => (
                  <Card key={stat.date} className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20">
                    <CardContent className="p-4">
                      <p className="text-sm text-white/60">{stat.displayDate}</p>
                      <p className="text-lg font-semibold text-white mt-1">
                        {stat.totalTickets} {stat.totalTickets === 1 ? 'ticket' : 'tickets'}
                      </p>
                      <p className="text-xs text-white/50">
                        {stat.totalBookings} {stat.totalBookings === 1 ? 'booking' : 'bookings'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Bookings Table */}
        <Card className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20">
          <CardHeader>
            <CardTitle className="text-[#E6DBC7] text-xl">
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
              <div className="text-center py-12 text-white/60">No bookings found</div>
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
                        <TableCell className="text-white font-medium">{booking.attendee_name}</TableCell>
                        <TableCell className="text-white/80">{booking.attendee_email}</TableCell>
                        <TableCell className="text-white/80 text-sm">
                          {EVENT_TITLES[booking.event_type || ''] || booking.event_type || 'Unknown'}
                        </TableCell>
                        <TableCell className="text-white/80">
                          {booking.event_date ? formatDateDisplay(booking.event_date) : 'N/A'}
                        </TableCell>
                        <TableCell className="text-white">{booking.quantity}</TableCell>
                        <TableCell className="text-white">
                          £{(booking.total_amount / 100).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-white/60 text-xs font-mono">
                          {booking.stripe_payment_intent_id ?
                            booking.stripe_payment_intent_id.substring(0, 15) + '...' :
                            'N/A'}
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

export default EventBookings;
import {
  AdminLayout,
  AdminStatsCard,
  AdminTable,
  adminTableCellClass,
  adminTableRowClass,
} from "@/components/admin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Download, Mail, Search, UserCheck, Users, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  subscribed_at: string;
  active: boolean;
}

const NewsletterSubscribers = () => {
  const { isAdmin } = useAuth();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchSubscribers();
    }
  }, [isAdmin]);

  useEffect(() => {
    filterSubscribers();
  }, [searchQuery, activeFilter, subscribers]);

  const fetchSubscribers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error: any) {
      console.error("Error fetching subscribers:", error);
      toast.error("Failed to load subscribers");
    } finally {
      setIsLoading(false);
    }
  };

  const filterSubscribers = () => {
    let filtered = subscribers;

    // Filter by active status
    if (activeFilter === "active") {
      filtered = filtered.filter(sub => sub.active);
    } else if (activeFilter === "inactive") {
      filtered = filtered.filter(sub => !sub.active);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (sub) =>
          sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sub.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredSubscribers(filtered);
  };

  const handleDeactivate = async (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber);
    setDeactivateDialogOpen(true);
  };

  const confirmDeactivate = async () => {
    if (!selectedSubscriber) return;

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ active: false })
        .eq("id", selectedSubscriber.id);

      if (error) throw error;

      toast.success("Subscriber deactivated successfully");
      fetchSubscribers();
    } catch (error: any) {
      console.error("Error deactivating subscriber:", error);
      toast.error("Failed to deactivate subscriber");
    } finally {
      setDeactivateDialogOpen(false);
      setSelectedSubscriber(null);
    }
  };

  const handleReactivate = async (subscriber: Subscriber) => {
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ active: true })
        .eq("id", subscriber.id);

      if (error) throw error;

      toast.success("Subscriber reactivated successfully");
      fetchSubscribers();
    } catch (error: any) {
      console.error("Error reactivating subscriber:", error);
      toast.error("Failed to reactivate subscriber");
    }
  };

  const exportToCSV = () => {
    if (filteredSubscribers.length === 0) return;
    
    const csvData = filteredSubscribers.map(sub => ({
      Email: sub.email,
      Name: sub.name || "",
      "Subscribed Date": new Date(sub.subscribed_at).toLocaleDateString(),
      Status: sub.active ? "Active" : "Inactive"
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => 
        headers.map(header => `"${row[header as keyof typeof row]}"`).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Subscribers exported to CSV");
  };

  const activeCount = subscribers.filter(s => s.active).length;
  const inactiveCount = subscribers.filter(s => !s.active).length;

  return (
    <AdminLayout
      title="Newsletter Subscribers"
      description="Manage your newsletter subscriber list"
      actions={
        <Button 
          onClick={exportToCSV} 
          disabled={filteredSubscribers.length === 0}
          className="gap-2"
        >
          <Download className="h-5 w-5" />
          Export CSV
        </Button>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AdminStatsCard
          title="Total Subscribers"
          value={subscribers.length}
          icon={Users}
          iconColor="#E6DBC7"
          iconBgColor="#E6DBC720"
        />
        <AdminStatsCard
          title="Active Subscribers"
          value={activeCount}
          icon={UserCheck}
          iconColor="#22c55e"
          iconBgColor="#22c55e20"
        />
        <AdminStatsCard
          title="Inactive Subscribers"
          value={inactiveCount}
          icon={UserX}
          iconColor="#f97316"
          iconBgColor="#f9731620"
        />
        <AdminStatsCard
          title="Filtered Results"
          value={filteredSubscribers.length}
          icon={Mail}
          iconColor="#E6DBC7"
          iconBgColor="#E6DBC720"
        />
      </div>

      {/* Search and Filter */}
      <Card className="bg-background/40 backdrop-blur-xl border-[#E6DBC7]/20 mb-6">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full bg-white/5 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as typeof activeFilter)} className="w-full md:w-auto">
              <TabsList className="bg-white/5 border border-white/10 grid w-full md:w-auto grid-cols-3">
                <TabsTrigger value="all" className="data-[state=active]:bg-white/10 text-white/70 data-[state=active]:text-white">All</TabsTrigger>
                <TabsTrigger value="active" className="data-[state=active]:bg-white/10 text-white/70 data-[state=active]:text-white">Active</TabsTrigger>
                <TabsTrigger value="inactive" className="data-[state=active]:bg-white/10 text-white/70 data-[state=active]:text-white">Inactive</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
      </Card>

      {/* Subscribers Table */}
      <AdminTable
        headers={[
          "Email",
          "Name",
          "Subscribed Date",
          "Status",
          { label: "Actions", width: "120px", align: "right" },
        ]}
        emptyState="No subscribers found"
        isLoading={isLoading}
      >
        {filteredSubscribers.map((subscriber) => (
          <TableRow key={subscriber.id} className={adminTableRowClass}>
            <TableCell className={cn(adminTableCellClass, "font-medium text-white")}>
              {subscriber.email}
            </TableCell>
            <TableCell className={cn(adminTableCellClass, "text-foreground/70")}>
              {subscriber.name || "-"}
            </TableCell>
            <TableCell className={cn(adminTableCellClass, "text-foreground/70")}>
              {new Date(subscriber.subscribed_at).toLocaleDateString()}
            </TableCell>
            <TableCell className={adminTableCellClass}>
              {subscriber.active ? (
                <Badge className="bg-green-500/20 text-green-400 border-0">Active</Badge>
              ) : (
                <Badge className="bg-orange-500/20 text-orange-400 border-0">Inactive</Badge>
              )}
            </TableCell>
            <TableCell className={cn(adminTableCellClass, "text-right")}>
              {subscriber.active ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeactivate(subscriber)}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  Deactivate
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReactivate(subscriber)}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  Reactivate
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </AdminTable>

      {/* Deactivate Dialog */}
      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent className="bg-background border-[#E6DBC7]/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#E6DBC7]">Deactivate Subscriber</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to deactivate {selectedSubscriber?.email}? They will stop receiving newsletter emails.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeactivate} className="bg-red-500/20 text-red-400 hover:bg-red-500/30">
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default NewsletterSubscribers;

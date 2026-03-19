import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface AdminStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
}

export const AdminStatsCard = ({
  title,
  value,
  icon: Icon,
  iconColor = "#E6DBC7",
  iconBgColor = "rgba(230, 219, 199, 0.1)",
}: AdminStatsCardProps) => {
  return (
    <Card className="border-[#E6DBC7]/20 bg-background/40 backdrop-blur-xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-3 text-sm text-foreground/60">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: iconBgColor }}
          >
            <Icon className="h-5 w-5" style={{ color: iconColor }} />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-light text-[#E6DBC7]">{value}</p>
      </CardContent>
    </Card>
  );
};

export default AdminStatsCard;

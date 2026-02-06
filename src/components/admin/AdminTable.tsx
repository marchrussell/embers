import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { TableRowSkeleton } from "@/components/skeletons/TableRowSkeleton";

export interface AdminTableHeader {
  label: string;
  align?: "left" | "center" | "right";
  width?: string;
  className?: string;
}

interface AdminTableProps {
  children: ReactNode;
  headers: (string | AdminTableHeader)[];
  emptyState?: ReactNode;
  isLoading?: boolean;
}

export const AdminTable = ({ 
  children, 
  headers, 
  emptyState,
  isLoading 
}: AdminTableProps) => {
  const normalizedHeaders: AdminTableHeader[] = headers.map((header) =>
    typeof header === "string" ? { label: header } : header
  );

  return (
    <div className="bg-background/40 backdrop-blur-xl border border-[#E6DBC7]/20 rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-[#E6DBC7]/10 hover:bg-transparent">
            {normalizedHeaders.map((header, index) => (
              <TableHead
                key={index}
                className={cn(
                  "text-[#E6DBC7] font-normal text-sm py-4",
                  header.align === "right" && "text-right",
                  header.align === "center" && "text-center",
                  header.width,
                  header.className
                )}
                style={header.width ? { width: header.width } : undefined}
              >
                {header.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRowSkeleton columns={headers.length} rows={5} />
          ) : emptyState ? (
            <TableRow>
              <td 
                colSpan={headers.length} 
                className="py-12 text-center text-foreground/60"
              >
                {emptyState}
              </td>
            </TableRow>
          ) : (
            children
          )}
        </TableBody>
      </Table>
    </div>
  );
};

// Consistent row styling helper
export const adminTableRowClass = "border-b border-[#E6DBC7]/10 hover:bg-white/5";
export const adminTableCellClass = "py-4";

export default AdminTable;


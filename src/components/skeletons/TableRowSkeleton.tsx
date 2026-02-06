import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface TableRowSkeletonProps {
  /** Number of columns to span */
  columns: number;
  /** Number of skeleton rows to render */
  rows?: number;
}

export const TableRowSkeleton = ({ columns, rows = 5 }: TableRowSkeletonProps) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex} className="border-b border-[#E6DBC7]/10">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex} className="py-4">
              <Skeleton 
                className="h-4 bg-[#E6DBC7]/10" 
                style={{ 
                  width: colIndex === 0 ? '70%' : colIndex === columns - 1 ? '60px' : '80%' 
                }} 
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};

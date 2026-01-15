// components/ui/data-table-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableSkeletonProps {
  columns?: number;
  rows?: number;
  showHeader?: boolean;
  showPagination?: boolean;
}

export function DataTableSkeleton({
  columns = 5,
  rows = 10,
  showHeader = true,
  showPagination = true,
}: DataTableSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <Skeleton className="h-10 w-62.5" />
          <Skeleton className="h-10 w-25" />
          <Skeleton className="h-10 w-20" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-25" />
          <Skeleton className="h-10 w-30" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          {showHeader && (
            <TableHeader>
              <TableRow>
                {Array.from({ length: columns }).map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-25" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
          )}
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton className="h-4 w-full max-w-25" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-50" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-9 w-20" />
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-9" />
              ))}
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      )}
    </div>
  );
}

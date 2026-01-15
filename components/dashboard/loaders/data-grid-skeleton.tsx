// components/ui/data-grid-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

interface DataGridSkeletonProps {
  items?: number;
  columns?: number;
}

export function DataGridSkeleton({
  items = 12,
  columns = 4,
}: DataGridSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-50" />
          <Skeleton className="h-10 w-30" />
          <Skeleton className="h-10 w-22.5" />
        </div>
        <Skeleton className="h-10 w-37.5" />
      </div>

      {/* Grid */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns} gap-4`}
      >
        {Array.from({ length: items }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="p-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
              <Skeleton className="h-9 w-20" />
              <div className="flex space-x-2">
                <Skeleton className="h-9 w-9" />
                <Skeleton className="h-9 w-9" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center space-x-2 pt-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-9" />
        ))}
      </div>
    </div>
  );
}

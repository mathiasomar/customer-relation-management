// app/components/ui/scrollable-table.tsx
"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface ScrollableTableProps<T> {
  data: T[];
  columns: {
    header: string;
    accessorKey: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
  }[];
  className?: string;
  maxHeight?: string;
  description?: string;
}

export function ScrollableTable<T>({
  data,
  columns,
  className,
  maxHeight = "400px",
  description = "Table View",
}: ScrollableTableProps<T>) {
  return (
    <div className={cn("rounded-md border", className)}>
      <div className="relative overflow-auto" style={{ maxHeight }}>
        <Table>
          <TableCaption>{description}</TableCaption>
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={String(column.accessorKey)}
                  className={cn(
                    "font-semibold text-gray-700",
                    column.className
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <TableCell
                    key={String(column.accessorKey)}
                    className={column.className}
                  >
                    {column.cell
                      ? column.cell(item)
                      : String(item[column.accessorKey])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

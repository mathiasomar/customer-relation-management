"use client";

// import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
// import { MoreHorizontal } from "lucide-react";
import { differenceInDays } from "date-fns";

// import { Button } from "@/components/ui/button";

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import Link from "next/link";
import { DataTableColumnHeader } from "@/components/dashboard/data-table-column-header";
// import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { Tenant } from "@/types/tenant";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

export const columns: ColumnDef<Tenant>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "logo",
    header: "Logo",
    cell: ({ row }) => {
      const tenant = row.original;

      return (
        <>
          {tenant.logo ? (
            <Image src={tenant.logo} alt="Logo" width={20} height={20} />
          ) : (
            <p className="w-max px-1 bg-orange-500 text-white text-xs rounded-full">
              No Logo
            </p>
          )}
        </>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "slug",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Slug" />
    ),
  },
  {
    accessorKey: "memberCount",
    header: "Member Count",
  },
  {
    accessorKey: "plan",
    header: "Plan",
  },
  {
    accessorKey: "subscriptionStatus",
    header: "Subscription Status",
    cell: ({ row }) => {
      const tenant = row.original;
      return (
        <div className="flex items-center gap-2">
          <span className="font-semibold">{tenant.subscriptionStatus}</span>
          <span>{}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "trialEndsAt",
    header: "Trial Expires",
    cell: ({ row }) => {
      const tenant = row.original;

      if (!tenant.trialEndsAt) {
        return <span className="text-gray-400">No trial</span>;
      }

      const trialEndDate = new Date(tenant.trialEndsAt);
      const now = new Date();
      const daysRemaining = differenceInDays(trialEndDate, now);

      // Determine color based on days remaining
      let bgColor = "bg-green-100 text-green-800"; // Green for > 7 days
      if (daysRemaining <= 7 && daysRemaining > 3) {
        bgColor = "bg-yellow-100 text-yellow-800"; // Yellow for 4-7 days
      } else if (daysRemaining <= 3 && daysRemaining > 0) {
        bgColor = "bg-orange-100 text-orange-800"; // Orange for 1-3 days
      } else if (daysRemaining <= 0) {
        bgColor = "bg-red-100 text-red-800"; // Red for expired
      }

      const statusText =
        daysRemaining > 0
          ? `${daysRemaining} days left`
          : daysRemaining === 0
            ? "Expires today"
            : "Expired";

      return (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${bgColor}`}
        >
          {statusText}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      const tenant = row.original;
      const createdAtDate = new Date(tenant.createdAt);
      return (
        <span>
          {createdAtDate.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Active Status",
    cell: ({ row }) => {
      const tenant = row.original;
      return tenant.isActive ? (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          Active
        </span>
      ) : (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          Inactive
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const tenant = row.original;

      return (
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(tenant.id)}
              >
                Copy tenant ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={`/dashboard/organizations/view`}>
                  View organization
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

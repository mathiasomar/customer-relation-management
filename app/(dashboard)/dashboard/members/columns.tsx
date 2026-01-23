"use client";

// import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTableColumnHeader } from "@/components/dashboard/data-table-column-header";
import { Member } from "@/types/member";
import { authClient } from "@/lib/auth-client";
import EditMemberRole from "@/components/dashboard/edit-member-role";
import ViewMemberPermission from "@/components/dashboard/view-member-permission";
import DeleteMember from "@/components/dashboard/delete-member";

export const columns: ColumnDef<Member>[] = [
  {
    accessorKey: "user.image",
    header: "Image",
    cell: ({ row }) => {
      const member = row.original;

      return (
        <Avatar>
          <AvatarImage src={member.user.image || ""} />
          <AvatarFallback>
            {member.user.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      );
    },
  },
  {
    accessorKey: "user.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Full Name" />
    ),
  },
  {
    accessorKey: "user.email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const member = row.original;

      return (
        <div
          data-role={member.role}
          className="px-2 py-1 rounded-full w-max text-xs data-[role=ADMIN]:bg-red-100 data-[role=ADMIN]:text-red-800 data-[role=MANAGER]:bg-green-100 data-[role=MANAGER]:text-green-800 data-[role=MEMBER]:bg-blue-100 data-[role=MEMBER]:text-blue-800"
        >
          {member.role
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </div>
      );
    },
  },
  {
    accessorKey: "invitedBy",
    header: "Invited By",
    cell: ({ row }) => {
      const member = row.original;
      const { data: session, isPending } = authClient.useSession();
      const username = isPending ? (
        ""
      ) : member.invitedBy === session?.user.id ? (
        session.user.name
      ) : (
        <span className="text-xs w-max px-2 py-1 bg-green-100 text-green-800 rounded-full">
          You
        </span>
      );

      return username;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const member = row.original;

      return (
        <div className="flex items-center gap-2">
          <EditMemberRole member={member} />
          <DeleteMember member={member} />
          <ViewMemberPermission member={member} />
        </div>
      );
    },
  },
];

"use client";

import { DataTableSkeleton } from "@/components/dashboard/loaders/data-table-skeleton";
import { useUsers } from "@/hooks/use-user";
import { useSearchParams } from "next/navigation";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { User } from "@/generated/prisma/client";

const ViewDataTable = () => {
  const searchParams = useSearchParams();
  const filterParams = {
    search: searchParams.get("search") || undefined,
    role: searchParams.get("role") || undefined,
  };

  const { data: users, isLoading } = useUsers(filterParams);
  return (
    <div className="mt-4">
      {isLoading ? (
        <DataTableSkeleton />
      ) : (
        <DataTable columns={columns} data={users as User[]} />
      )}
    </div>
  );
};

export default ViewDataTable;

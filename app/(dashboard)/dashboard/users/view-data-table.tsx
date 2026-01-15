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
    search: searchParams.get("search")?.trim() ?? "",
  };

  const { data: users, isFetching } = useUsers(filterParams);
  return (
    <>
      {isFetching ? (
        <DataTableSkeleton />
      ) : (
        <DataTable columns={columns} data={users as User[]} />
      )}
    </>
  );
};

export default ViewDataTable;

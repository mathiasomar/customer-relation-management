"use client";

import { DataTableSkeleton } from "@/components/dashboard/loaders/data-table-skeleton";
// import { useSearchParams } from "next/navigation";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { useTenantMembers } from "@/hooks/use-tenant";
import { Member } from "@/types/member";

const ViewDataTable = () => {
  // const searchParams = useSearchParams();
  // const filterParams = {
  //   search: searchParams.get("search")?.trim() ?? "",
  // };

  const { data: members, isFetching } = useTenantMembers();
  return (
    <>
      {isFetching ? (
        <DataTableSkeleton />
      ) : (
        <DataTable columns={columns} data={members as Member[]} />
      )}
    </>
  );
};

export default ViewDataTable;

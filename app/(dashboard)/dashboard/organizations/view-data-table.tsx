"use client";

import { DataTableSkeleton } from "@/components/dashboard/loaders/data-table-skeleton";
import { useAllTenants } from "@/hooks/use-tenant";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Tenant } from "@/types/tenant";
import AddTenant from "@/components/dashboard/add-tenant";

const ViewDataTable = () => {
  const { data: tenants, isFetching } = useAllTenants();
  return (
    <>
      {isFetching ? (
        <DataTableSkeleton />
      ) : tenants?.length === 0 || !tenants ? (
        <div className="w-full h-50">
          <Card className="h-full shadow-none flex items-center justify-center border-dashed border-2">
            <CardContent className="flex flex-col items-center gap-2">
              <h1 className="text-sm text-muted-foreground">
                No Organizations
              </h1>
              <AddTenant type="empty" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <DataTable columns={columns} data={tenants as Tenant[]} />
      )}
    </>
  );
};

export default ViewDataTable;

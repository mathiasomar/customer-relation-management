"use client";

import { DataTableSkeleton } from "@/components/dashboard/loaders/data-table-skeleton";
import { useAdminTenants, useAllTenants } from "@/hooks/use-tenant";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Tenant } from "@/types/tenant";
import AddTenant from "@/components/dashboard/add-tenant";
import { authClient } from "@/lib/auth-client";

const ViewDataTable = () => {
  const { data: tenants, isFetching } = useAllTenants();
  const { data: adminTenants, isFetching: adminTenantsFetching } =
    useAdminTenants();

  const { data: session, isPending } = authClient.useSession();

  let tenantsData = [] as Tenant[];
  if (session?.user.role === "ADMIN") {
    tenantsData = adminTenants as Tenant[];
  } else {
    tenantsData = tenants as Tenant[];
  }
  return (
    <>
      {isFetching || isPending || adminTenantsFetching ? (
        <DataTableSkeleton />
      ) : tenantsData?.length === 0 || !tenantsData ? (
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
        <DataTable columns={columns} data={tenantsData as Tenant[]} />
      )}
    </>
  );
};

export default ViewDataTable;

"use client";

import { DataTableSkeleton } from "@/components/dashboard/loaders/data-table-skeleton";
import { useTenants } from "@/hooks/use-tenant";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Tenant } from "@/types/tenant";

const ViewDataTable = () => {
  const { data: tenants, isFetching } = useTenants();
  return (
    <>
      {tenants?.length}
      {isFetching ? (
        <DataTableSkeleton />
      ) : tenants?.length === 0 || !tenants ? (
        <div className="w-full h-50">
          <Card className="h-full shadow-none flex items-center justify-center border-dashed border-2">
            <CardContent className="flex flex-col items-center gap-2">
              <h1 className="text-sm text-muted-foreground">
                No Organizations
              </h1>
              <Button asChild>
                <Link href="/dashboard/organizations/new">
                  Create Organization
                </Link>
              </Button>
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

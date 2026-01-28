"use client";

import { DataTableSkeleton } from "@/components/dashboard/loaders/data-table-skeleton";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { authClient } from "@/lib/auth-client";
import { useSubscriptions } from "@/hooks/use-subscription";
import { Subscription } from "@/generated/prisma/client";

const ViewDataTable = () => {
  const { data: subscriptions, isFetching } = useSubscriptions();

  const { data: session, isPending } = authClient.useSession();

  return (
    <>
      {isFetching || isPending ? (
        <DataTableSkeleton />
      ) : (
        <div className="space-y-4">
          <div>The subscriptios goes here</div>
          {session?.user.role === "ADMIN" && (
            <DataTable
              columns={columns}
              data={subscriptions as Subscription[]}
            />
          )}
        </div>
      )}
    </>
  );
};

export default ViewDataTable;

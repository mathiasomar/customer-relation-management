"use client";

import StatCardSkeleton from "@/components/dashboard/loaders/stat-card-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useUserTenantCount } from "@/hooks/use-tenant";
import { Activity, Building2, Users2 } from "lucide-react";

const CardsStat = () => {
  const { data: stats, isFetching } = useUserTenantCount();
  return (
    <div className="w-full">
      {isFetching ? (
        <StatCardSkeleton />
      ) : (
        <div className="my-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-0 shadow-none rounded-md">
            <CardContent className="flex items-center justify-between p-4">
              <div className="space-y-4">
                <p className="font-semibold text-sm">Total Organizations</p>
                <h1 className="text-3xl font-bold">{stats?.tenants}</h1>
              </div>
              {/* Icon */}
              <div className="w-15 h-15 bg-orange-100 dark:bg-transparent rounded-full flex items-center justify-center">
                <Building2 className="w-8 h-8 dark:text-neutral-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="p-0 shadow-none rounded-md">
            <CardContent className="flex items-center justify-between p-4">
              <div className="space-y-4">
                <p className="font-semibold text-sm">Total Members</p>
                <h1 className="text-3xl font-bold">{stats?.members}</h1>
              </div>
              {/* Icon */}
              <div className="w-15 h-15 bg-blue-100 dark:bg-transparent rounded-full flex items-center justify-center">
                <Users2 className="w-8 h-8 dark:text-neutral-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="p-0 shadow-none rounded-md">
            <CardContent className="flex items-center justify-between p-4">
              <div className="space-y-4">
                <p className="font-semibold text-sm">Active Organizations</p>
                <h1 className="text-3xl font-bold">{stats?.activeTenants}</h1>
              </div>
              {/* Icon */}
              <div className="w-15 h-15 bg-green-100 dark:bg-transparent rounded-full flex items-center justify-center">
                <Activity className="w-8 h-8 dark:text-neutral-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CardsStat;

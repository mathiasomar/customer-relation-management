"use client";

import StatCardSkeleton from "@/components/dashboard/loaders/stat-card-skeleton";
import { useContactStats } from "@/hooks/use-contact";

const StatCards = () => {
  const { data: stat, isFetching } = useContactStats();
  return (
    <div className="w-full">
      {isFetching ? (
        <StatCardSkeleton />
      ) : (
        <div className="my-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow space-y-2">
            <h3 className="text-sm text-gray-500">Total Contacts</h3>
            <p className="text-2xl font-bold">{stat?.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow space-y-2">
            <h3 className="text-sm text-gray-500">Active Contacts</h3>
            <p className="text-2xl font-bold">{stat?.active}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow space-y-2">
            <h3 className="text-sm text-gray-500">Inactive</h3>
            <p className="text-2xl font-bold">{stat?.inactive}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCards;

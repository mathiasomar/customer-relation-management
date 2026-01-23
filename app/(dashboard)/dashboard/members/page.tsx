"use client";

import InviteMember from "@/components/dashboard/invite-member";
import Search from "@/components/dashboard/search";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useTenant } from "@/hooks/use-tenant";
import ViewDataTable from "./view-data-table";

const MembersPage = () => {
  const { data, isFetching } = useTenant();
  return (
    <div className="w-full">
      <div className="w-full flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/organizations/view">
                {isFetching
                  ? "Loading..."
                  : data?.tenant?.slug || "Unknown Tenant"}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Members</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Buttons */}
        <div className="flex items-center-safe gap-2">
          {data?.userRole === "ADMIN" || data?.userRole === "MANAGER" ? (
            <InviteMember />
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semiboldnn">
          {isFetching ? "Loading..." : `${data?.tenant?.name} members`}
        </h1>
      </div>

      {/* Table here */}
      <div className="my-4">
        <Search />
      </div>
      <ViewDataTable />
    </div>
  );
};

export default MembersPage;

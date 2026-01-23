"use client";

import { DataGridSkeleton } from "@/components/dashboard/loaders/data-grid-skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { useTenant, useTenantUsage } from "@/hooks/use-tenant";
import {
  ActivityIcon,
  Contact2,
  Handshake,
  Lightbulb,
  Package2,
  Settings,
  Target,
  TrendingUpDownIcon,
  Users2,
  View,
} from "lucide-react";
import OrgDetails from "./details";
import { Tenant } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import InviteMember from "@/components/dashboard/invite-member";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const StatCard = ({
  icon,
  stat,
  desc,
  url,
}: {
  icon: React.ReactNode;
  stat: number;
  desc: string;
  url?: string;
}) => {
  return (
    <Link href={url || "#"} className="inline-block w-full">
      <Card className="p-0">
        <CardContent className="flex items-start justify-between gap-2 px-4 py-2">
          <span>{icon}</span>
          <div className="flex flex-col gap-2">
            <h1 className="font-bold text-2xl">{stat}</h1>
            <p className="text-xs italic text-muted-foreground">{desc}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const TenantPage = () => {
  const { data, isFetching } = useTenant();
  const { data: tenantUsage, isFetching: isFetchingUsage } = useTenantUsage();
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
              <BreadcrumbLink href="/dashboard/organizations">
                Organizations
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {isFetching
                  ? "Loading..."
                  : data?.tenant?.slug || "Unknown Tenant"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Buttons */}
        <div className="flex items-center-safe gap-2">
          {data?.userRole === "ADMIN" || data?.userRole === "MANAGER" ? (
            <InviteMember />
          ) : null}
          <Button size={"sm"} asChild>
            <Link href="/dashboard/members">
              <View className="w-4 h-4" />
              View Members
            </Link>
          </Button>
          <Button variant={"secondary"} size={"icon"} asChild>
            <Link href="/dashboard/settings" className="group">
              <Settings className="w-4 h-4 animate-spin group-hover:animate-none" />
            </Link>
          </Button>
        </div>
      </div>
      {isFetching ? (
        <DataGridSkeleton items={2} />
      ) : (
        <>
          {/* Stat grids */}
          <div className="grid grid-cols-5 gap-4 w-full">
            <div className="col-span-4 md:col-span-2 lg:col-span-1 xl:col-span-1">
              <StatCard
                icon={<Contact2 className="w-10 h-10 opacity-70" />}
                stat={data?.tenant?._count.contacts ?? 0}
                desc="Total Contacts"
                url="/dashboard/organizations/contacts"
              />
            </div>
            <div className="col-span-4 md:col-span-2 lg:col-span-1 xl:col-span-1">
              <StatCard
                icon={<Target className="w-10 h-10 opacity-70" />}
                stat={data?.tenant?._count.leads ?? 0}
                desc="Total Leads"
                url="/dashboard/organizations/leads"
              />
            </div>
            <div className="col-span-4 md:col-span-2 lg:col-span-1 xl:col-span-1">
              <StatCard
                icon={<Users2 className="w-10 h-10 opacity-70" />}
                stat={data?.tenant?._count.members ?? 0}
                desc="Total Members"
                url="/dashboard/organizations/view/members"
              />
            </div>
            <div className="col-span-4 md:col-span-2 lg:col-span-1 xl:col-span-1">
              <StatCard
                icon={<Handshake className="w-10 h-10 opacity-70" />}
                stat={data?.tenant?._count.deals ?? 0}
                desc="Total Deals"
                url="/dashboard/organizations/deals"
              />
            </div>
            <div className="col-span-4 md:col-span-2 lg:col-span-1 xl:col-span-1">
              {/* Total Opportunities */}
              <StatCard
                icon={<Lightbulb className="w-10 h-10 opacity-70" />}
                stat={data?.tenant?._count.opportunities ?? 0}
                desc="Total Opportunities"
                url="/dashboard/organizations/opportunities"
              />
            </div>
          </div>

          <div className="my-4 flex items-center gap-2">
            <span className="font-semibold text-sm">Membership:</span>
            <span
              className={cn(
                "px-2 py-1 rounded-sm text-xs font-medium",
                data?.userRole === "ADMIN"
                  ? "bg-red-100 text-red-800"
                  : data?.userRole === "MANAGER"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800",
              )}
            >
              {data?.userRole
                ?.toLowerCase()
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ") || "No Role Assigned"}
            </span>
          </div>

          {/* Details */}
          <div className="w-full mt-4">
            <OrgDetails tenant={data?.tenant as Tenant} />
          </div>

          {/* Organization Usage */}
          <div className="w-full p-4 border rounded-sm mt-4">
            <h1 className="font-semibold flex items-center gap-2 text-lg mb-4">
              Organization Usage{" "}
              <TrendingUpDownIcon className="w-4 h-4 text-green-500" />
            </h1>
            <div className="flex gap-4 flex-col items-center md:flex-row md:items-start">
              <div className="w-full md:w-1/2 lg:w-1/3 grid grid-cols-2 gap-4">
                <div className="border rounded-sm p-4">
                  <h2 className="font-medium">Storage</h2>
                  <p className="text-sm text-muted-foreground">1.2 GB / 5 GB</p>
                </div>
                <div className="border rounded-sm p-4">
                  <h2 className="font-medium">Users</h2>
                  <p className="text-sm text-muted-foreground">
                    {isFetchingUsage ? 0 : tenantUsage?.usage?.users}
                  </p>
                </div>
                <div className="border rounded-sm p-4">
                  <h2 className="font-medium">Contacts</h2>
                  <p className="text-sm text-muted-foreground">
                    {isFetchingUsage ? 0 : tenantUsage?.usage?.contacts}
                  </p>
                </div>
                <div className="border rounded-sm p-4">
                  <h2 className="font-medium">Leads</h2>
                  <p className="text-sm text-muted-foreground">
                    {isFetchingUsage ? 0 : tenantUsage?.usage?.leads}
                  </p>
                </div>
                <div className="border rounded-sm p-4">
                  <h2 className="font-medium">Opportunities</h2>
                  <p className="text-sm text-muted-foreground">
                    {isFetchingUsage ? 0 : tenantUsage?.usage?.opportunities}
                  </p>
                </div>
                <div className="border rounded-sm p-4">
                  <h2 className="font-medium">Deals</h2>
                  <p className="text-sm text-muted-foreground">
                    {isFetchingUsage ? 0 : tenantUsage?.usage?.deals}
                  </p>
                </div>
                <div className="border rounded-sm p-4">
                  <h2 className="font-medium">Activities</h2>
                  <p className="text-sm text-muted-foreground">
                    {isFetchingUsage ? 0 : tenantUsage?.usage?.activities}
                  </p>
                </div>
              </div>
              {/* Activity Table */}
              <div className="w-full md:w-1/2 lg:w-2/3">
                <h1 className="font-semibold flex items-center gap-2 text-sm mb-4">
                  Recent Activity
                  <ActivityIcon className="w-4 h-4 text-blue-500" />
                </h1>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Creator</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Contact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isFetchingUsage ? (
                      []
                    ) : tenantUsage?.recentActivities?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <div className="w-full my-2 mx-auto flex flex-col items-center">
                            <Package2 />
                            <span>No activity found</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      tenantUsage?.recentActivities?.map((activity) => (
                        <TableRow
                          key={activity.id}
                          className="hover:bg-gray-50"
                        >
                          <TableCell>{activity.creator.name}</TableCell>
                          <TableCell>{activity.type}</TableCell>
                          <TableCell>{activity.title}</TableCell>
                          <TableCell>{activity.priority}</TableCell>
                          <TableCell>{activity.status}</TableCell>
                          <TableCell>{`${activity.contact?.firstName} ${activity.contact?.lastName}`}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TenantPage;

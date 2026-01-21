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
import { useTenant } from "@/hooks/use-tenant";
import { Contact2, Handshake, Lightbulb, Target, Users2 } from "lucide-react";
import OrgDetails from "./details";
import { Tenant } from "@/generated/prisma/client";

const TenantPage = () => {
  const { data, isFetching } = useTenant();
  return (
    <div className="w-full">
      <Breadcrumb className="mb-8">
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
      {isFetching ? (
        <DataGridSkeleton items={2} />
      ) : (
        <>
          {/* Stat grids */}
          <div className="grid grid-cols-5 gap-4 w-full">
            <div className="col-span-4 md:col-span-2 lg:col-span-1 xl:col-span-1">
              <Card className="p-0">
                <CardContent className="flex items-start justify-between gap-2 px-4 py-2">
                  <span>
                    <Contact2 className="w-10 h-10 opacity-70" />
                  </span>
                  <div className="flex flex-col gap-2">
                    <h1 className="font-bold text-2xl">
                      {data?.tenant?._count.contacts}
                    </h1>
                    <p className="text-xs italic text-muted-foreground">
                      Total Contacts
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="col-span-4 md:col-span-2 lg:col-span-1 xl:col-span-1">
              <Card className="p-0">
                <CardContent className="flex items-start justify-between gap-2 px-4 py-2">
                  <span>
                    <Target className="w-10 h-10 opacity-70" />
                  </span>
                  <div className="flex flex-col gap-2">
                    <h1 className="font-bold text-2xl">
                      {data?.tenant?._count.leads}
                    </h1>
                    <p className="text-xs italic text-muted-foreground">
                      Total Leads
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="col-span-4 md:col-span-2 lg:col-span-1 xl:col-span-1">
              <Card className="p-0">
                <CardContent className="flex items-start justify-between gap-2 px-4 py-2">
                  <span>
                    <Users2 className="w-10 h-10 opacity-70" />
                  </span>
                  <div className="flex flex-col gap-2">
                    <h1 className="font-bold text-2xl">
                      {data?.tenant?._count.members}
                    </h1>
                    <p className="text-xs italic text-muted-foreground">
                      Total Members
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="col-span-4 md:col-span-2 lg:col-span-1 xl:col-span-1">
              <Card className="p-0">
                <CardContent className="flex items-start justify-between gap-2 px-4 py-2">
                  <span>
                    <Handshake className="w-10 h-10 opacity-70" />
                  </span>
                  <div className="flex flex-col gap-2">
                    <h1 className="font-bold text-2xl">
                      {data?.tenant?._count.deals}
                    </h1>
                    <p className="text-xs italic text-muted-foreground">
                      Total Deals
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="col-span-4 md:col-span-2 lg:col-span-1 xl:col-span-1">
              <Card className="p-0">
                <CardContent className="flex items-start justify-between gap-2 px-4 py-2">
                  <span>
                    <Lightbulb className="w-10 h-10 opacity-70" />
                  </span>
                  <div className="flex flex-col gap-2">
                    <h1 className="font-bold text-2xl">
                      {data?.tenant?._count.opportunities}
                    </h1>
                    <p className="text-xs italic text-muted-foreground">
                      Total Opportunities
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Details */}
          <div className="w-full mt-4">
            <OrgDetails tenant={data?.tenant as Tenant} />
          </div>
        </>
      )}
    </div>
  );
};

export default TenantPage;

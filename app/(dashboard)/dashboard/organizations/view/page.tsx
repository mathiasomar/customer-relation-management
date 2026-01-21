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
          <div className="grid grid-cols-12 gap-4 w-full">
            <div className="col-span-12 md:col-span-4 lg:col-span-3 xl:col-span-2">
              <Card className="p-0">
                <CardContent className="flex items-start justify-between gap-2 px-4 py-2">
                  <span>
                    <Contact2 className="w-15 h-15 opacity-70" />
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
            <div className="col-span-12 md:col-span-4 lg:col-span-3 xl:col-span-2">
              <Card className="p-0">
                <CardContent className="flex items-start justify-between gap-2 px-4 py-2">
                  <span>
                    <Target className="w-15 h-15 opacity-70" />
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
            <div className="col-span-12 md:col-span-4 lg:col-span-3 xl:col-span-2">
              <Card className="p-0">
                <CardContent className="flex items-start justify-between gap-2 px-4 py-2">
                  <span>
                    <Users2 className="w-15 h-15 opacity-70" />
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
            <div className="col-span-12 md:col-span-4 lg:col-span-3 xl:col-span-2">
              <Card className="p-0">
                <CardContent className="flex items-start justify-between gap-2 px-4 py-2">
                  <span>
                    <Handshake className="w-15 h-15 opacity-70" />
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
            <div className="col-span-12 md:col-span-4 lg:col-span-3 xl:col-span-2">
              <Card className="p-0">
                <CardContent className="flex items-start justify-between gap-2 px-4 py-2">
                  <span>
                    <Lightbulb className="w-15 h-15 opacity-70" />
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
        </>
      )}
    </div>
  );
};

export default TenantPage;

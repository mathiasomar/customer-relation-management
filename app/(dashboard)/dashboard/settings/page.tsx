"use client";

import LogoUpload from "@/components/dashboard/settings/logo-upload";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tenant } from "@/generated/prisma/client";
import { useTenant } from "@/hooks/use-tenant";
import GeneralForm from "./general-form";
import { DataGridSkeleton } from "@/components/dashboard/loaders/data-grid-skeleton";
import UpdateBillingEmail from "./update-billing-email";

const SettingPage = () => {
  const { data, isFetching } = useTenant();

  return (
    <div className="w-full">
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
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {isFetching ? (
        <div className="mt-4">
          <DataGridSkeleton items={2} />
        </div>
      ) : (
        <div className="mt-4">
          <Card className="shadow-none rounded-md">
            <CardHeader>
              <CardTitle>General</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <LogoUpload tenant={data?.tenant as Tenant} />
                </div>
                <div className="lg:col-span-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 border flex items-center gap-2 rounded-lg">
                        <span className="font-semibold text-sm text-gray-700">
                          Billing Email:
                        </span>
                        <span className="font-semibold text-sm text-gray-700">
                          {data?.tenant?.tenantSubscription?.billingEmail ??
                            "No billing email"}
                        </span>
                      </div>
                      <UpdateBillingEmail
                        email={
                          data?.tenant?.tenantSubscription?.billingEmail ?? ""
                        }
                      />
                    </div>
                    <GeneralForm tenant={data?.tenant as Tenant} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SettingPage;

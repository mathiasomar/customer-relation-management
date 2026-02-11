"use client";

import { AvatarGroup } from "@/components/avatar-group";
import AddTenant from "@/components/dashboard/add-tenant";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminTenants, useAllTenants } from "@/hooks/use-tenant";
import { authClient } from "@/lib/auth-client";
import { Tenant } from "@/types/tenant";
import { differenceInDays } from "date-fns";
import { Calendar, Clock, Users, Zap } from "lucide-react";
import Image from "next/image";
import MemberAvatar from "./member-avatar";
import CardListSkeleton from "@/components/dashboard/loaders/card-list-skeleton";

const ViewOrganizations = () => {
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

  const trialEndDate = (trialEndsAt: Date) => {
    const trialEndDate = new Date(trialEndsAt);
    const now = new Date();
    const daysRemaining = differenceInDays(trialEndDate, now);

    // Determine color based on days remaining
    let bgColor = "bg-green-100 text-green-800"; // Green for > 7 days
    if (daysRemaining <= 7 && daysRemaining > 3) {
      bgColor = "bg-yellow-100 text-yellow-800"; // Yellow for 4-7 days
    } else if (daysRemaining <= 3 && daysRemaining > 0) {
      bgColor = "bg-orange-100 text-orange-800"; // Orange for 1-3 days
    } else if (daysRemaining <= 0) {
      bgColor = "bg-red-100 text-red-800"; // Red for expired
    }

    const statusText =
      daysRemaining > 0
        ? `${daysRemaining} days left`
        : daysRemaining === 0
          ? "Expires today"
          : "Expired";
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${bgColor}`}
      >
        {statusText}
      </span>
    );
  };
  return (
    <>
      {isFetching || isPending || adminTenantsFetching ? (
        <CardListSkeleton columns={3} items={3} />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {tenantsData.map((tenant) => (
            <Card key={tenant.id} className="p-0 shadow-sm rounded-md">
              <CardContent className="p-4 flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="relative w-15 h-15">
                    <Image
                      src={tenant.logo || "/noimage.png"}
                      fill
                      alt={tenant.name}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h1 className="font-semibold text-sm">{tenant.name}</h1>
                    <span className="text-muted-foreground text-xs">
                      {tenant.slug}
                    </span>
                  </div>
                </div>
                <span className="font-semibold text-lg uppercase">
                  {tenant.plan ? tenant.plan : "Starter"} Plan
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-4 h-4" />
                    <span>Trial Expires: </span>
                    <span>
                      {trialEndDate(tenant.trialEndsAt ?? new Date())}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Users className="w-4 h-4" />
                    <span>
                      {tenant.memberCount}{" "}
                      {tenant.memberCount === 1 ? "Member" : "Members"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Zap className="w-4 h-4" />
                    <span>{tenant.subscriptionStatus}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="w-4 h-4" />
                    <span>Created At:</span>
                    <span>
                      {tenant.createdAt.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <AvatarGroup>
                      {tenant.members.map((member) => (
                        <MemberAvatar key={member.id} userId={member.userId} />
                      ))}
                    </AvatarGroup>
                  </div>
                  <div>
                    {tenant.isActive ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default ViewOrganizations;

"use client";

import { DataGridSkeleton } from "@/components/dashboard/loaders/data-grid-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSubscriptions } from "@/hooks/use-subscription";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { CheckCircle, Edit } from "lucide-react";

const ViewSubscription = () => {
  const { data: subscriptions, isFetching } = useSubscriptions();
  const serializedData = isFetching
    ? []
    : subscriptions?.map((subcr) => ({
        ...subcr,
        limits: subcr.limits as Record<string, number>,
      }));

  const { data: session, isPending } = authClient.useSession();
  return (
    <div className="mt-4">
      {isFetching || isPending ? (
        <DataGridSkeleton columns={3} items={3} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {serializedData?.map((subscription) => (
            <Card
              key={subscription.id}
              className={cn(
                "shadow-sm",
                subscription.popular && "shadow-green-200 border-green-500",
              )}
            >
              <CardContent className="flex flex-col gap-8 relative px-10">
                {subscription.popular && (
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs rounded-lg px-2 py-1">
                    Most Popular
                  </span>
                )}
                {/* Top */}
                <div className="flex flex-col gap-4 items-center">
                  <h1 className="font-bold">{subscription.plan}</h1>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      KES
                    </span>
                    <span className="font-bold text-3xl">
                      {subscription.amount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {subscription.description}
                  </p>
                </div>
                {/* Limits */}
                <div className="space-y-4 mx-auto w-max">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-semibold">
                      Upto {subscription.limits["maxMembers"]} member(s)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-semibold">
                      Upto {subscription.limits["maxContacts"]} contact(s)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-semibold">
                      Upto {subscription.limits["maxDeals"]} deal(s)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-semibold">
                      Upto {subscription.limits["customFields"]} customfield(s)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-semibold">
                      Get {subscription.limits["storageGB"]} GB storage
                    </span>
                  </div>
                </div>
                {/* Actions */}
                <div className="space-y-4">
                  <Button
                    variant={subscription.popular ? "default" : "outline"}
                    className="w-full self-end"
                  >
                    Select
                  </Button>
                  {session?.user.role === "ADMIN" && (
                    <div className="flex items-center gap-2 justify-center">
                      <Button variant={"secondary"}>
                        <Edit /> Edit
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewSubscription;

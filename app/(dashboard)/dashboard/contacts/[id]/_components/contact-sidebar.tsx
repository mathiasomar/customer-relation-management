"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
// import { authClient } from "@/lib/auth-client";
import { ContactType } from "@/types/contact";
import { Deal } from "@/generated/prisma/browser";
import {
  useContactActivities,
  useContactDeals,
  useContactNotes,
  useContactOpportunities,
  useContactTasks,
} from "@/hooks/use-contact";
import { Spinner } from "@/components/ui/spinner";

interface ContactSidebarProps {
  contact: ContactType;
  // opportunities: Opportunity[];
  // deals: Deal[];
}

export function ContactSidebar({
  contact,
  // opportunities,
  // deals,
}: ContactSidebarProps) {
  // const { data: session, isPending } = authClient.useSession();
  // const tenant = isPending ? "" : session?.session.tenantId;

  const { data: allDeals, isFetching: isFetchingAllDeals } = useContactDeals(
    contact.id,
  );
  const { data: someDeals, isFetching: isFetchingSomeDeals } = useContactDeals(
    contact.id,
    5,
  );
  const { data: allOpportunities, isFetching: isFetchingAllOpportunities } =
    useContactOpportunities(contact.id);
  const { data: someOpportunities, isFetching: isFetchingSomeOpportunities } =
    useContactOpportunities(contact.id, 5);
  const { data: activities, isFetching: isFetchingActivities } =
    useContactActivities(contact.id);
  const { data: notes, isFetching: isFetchingNotes } = useContactNotes(
    contact.id,
  );
  const { data: tasks, isFetching: isFetchingTasks } = useContactTasks(
    contact.id,
  );

  const totalValue =
    allDeals?.reduce((sum: number, deal: Deal) => sum + deal.amount, 0) || 0;
  const wonDeals =
    allDeals?.filter((deal: Deal) => deal.status === "COMPLETED").length || 0;
  const lostDeals =
    allDeals?.filter((deal: Deal) => deal.status === "CANCELLED").length || 0;

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Overview</CardTitle>
          <CardDescription>Key metrics and statistics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold">
                KES {totalValue.toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Win Rate</p>
              <p className="text-2xl font-bold">
                {isFetchingAllDeals
                  ? 0
                  : allDeals && allDeals.length > 0
                    ? Math.round((wonDeals / allDeals.length) * 100)
                    : 0}
                %
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Won</p>
              <p className="text-lg font-medium text-green-600">{wonDeals}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Lost</p>
              <p className="text-lg font-medium text-red-600">{lostDeals}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-bold">{contact._count?.leads || 0}</p>
              <p className="text-xs text-muted-foreground">Leads</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {isFetchingAllOpportunities ? 0 : allOpportunities?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Opps</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {isFetchingAllDeals ? 0 : allDeals?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground">Deals</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Opportunities */}
      {isFetchingSomeOpportunities ? (
        <div className="flex items-center justify-center flex-col gap-4 w-full h-10">
          <Spinner className="w-15 h-15" />
          <span className="text-sm text-muted-foreground">
            Loading opportunities...
          </span>
        </div>
      ) : (someOpportunities?.length ?? 0 > 0) ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Opportunities</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/dashboard/contacts/${contact.id}/opportunities`}>
                  View all
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {someOpportunities?.slice(0, 3).map((opp) => (
              <div key={opp.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{opp.name}</p>
                  <Badge variant="outline" className="text-xs">
                    {opp.stage}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>${opp.value?.toLocaleString()}</span>
                  <span>{opp.probability * 100}%</span>
                </div>
                <Progress value={opp.probability * 100} className="h-1" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <div className="w-full h-20 flex items-center justify-center flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            No opportunities found
          </p>
          <Button variant="outline" size="sm">
            Create Opportunity
          </Button>
        </div>
      )}

      {/* Recent Deals */}
      {isFetchingSomeDeals ? (
        <div className="flex items-center justify-center flex-col gap-4 w-full h-10">
          <Spinner className="w-15 h-15" />
          <span className="text-sm text-muted-foreground">
            Loading deals...
          </span>
        </div>
      ) : (someDeals?.length ?? 0 > 0) ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Deals</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/dashboard/contacts/${contact.id}/deals`}>
                  View all
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {someDeals?.slice(0, 3).map((deal) => (
              <div key={deal.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{deal.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ${deal.amount?.toLocaleString()}
                  </p>
                </div>
                <Badge
                  className={
                    deal.status === "COMPLETED"
                      ? "bg-green-100 text-green-700"
                      : deal.status === "CANCELLED"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                  }
                >
                  {deal.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <div className="w-full h-20 flex items-center justify-center flex-col gap-4">
          <p className="text-sm text-muted-foreground">No deals found</p>
          <Button variant="outline" size="sm">
            Create Deal
          </Button>
        </div>
      )}

      {/* Activity Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Activity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Contacted</span>
              <span className="text-sm font-medium">
                {contact.lastContactedAt
                  ? format(new Date(contact.lastContactedAt), "MMM d, yyyy")
                  : "Never"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Activities</span>
              <span className="text-sm font-medium">
                {isFetchingActivities ? 0 : activities?.length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Open Tasks</span>
              <span className="text-sm font-medium">
                {isFetchingTasks
                  ? 0
                  : tasks?.filter((t) => t.status !== "COMPLETED").length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Notes</span>
              <span className="text-sm font-medium">
                {isFetchingNotes ? 0 : notes?.length || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Item, ItemContent, ItemMedia } from "@/components/ui/item";
import { Tenant } from "@/generated/prisma/client";
import { differenceInDays, formatDistanceToNow } from "date-fns";
import {
  Banknote,
  Calendar,
  CalendarDays,
  CheckCircle,
  Clock,
  Factory,
  Globe,
  Languages,
  Layers,
  Link,
  Tag,
  UserCircle,
  X,
  Zap,
} from "lucide-react";

const OrgDetails = ({ tenant }: { tenant: Tenant }) => {
  const getTrialDaysLeft = () => {
    if (!tenant?.trialEndsAt) return null;
    const today = new Date();
    const trialEndsAt = new Date(tenant.trialEndsAt);
    return differenceInDays(trialEndsAt, today);
  };
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div>
        <h1 className="font-semibold text-sm lg:text-base lg:font-bold my-2">
          Details
        </h1>
        <Item variant={"default"} className="p-1">
          <ItemMedia variant={"icon"}>
            <UserCircle className="h-5 w-5" />
          </ItemMedia>
          <ItemContent>
            <span className="flex items-center gap-2">
              <span className="font-semibold text-xs">Name:</span>
              <span className="text-xs">{tenant?.name}</span>
            </span>
          </ItemContent>
        </Item>
        <Item variant={"default"} className="p-1">
          <ItemMedia variant={"icon"}>
            <Tag className="h-5 w-5" />
          </ItemMedia>
          <ItemContent>
            <span className="flex items-center gap-2">
              <span className="font-semibold text-xs">Slug:</span>
              <span className="text-xs">{tenant?.slug}</span>
            </span>
          </ItemContent>
        </Item>
        <Item variant={"default"} className="p-1">
          <ItemMedia variant={"icon"}>
            <Link className="h-5 w-5" />
          </ItemMedia>
          <ItemContent>
            <span className="flex items-center gap-2">
              <span className="font-semibold text-xs">Website:</span>
              <span className="text-xs">{tenant?.website || "No website"}</span>
            </span>
          </ItemContent>
        </Item>
        <Item variant={"default"} className="p-1">
          <ItemMedia variant={"icon"}>
            <Factory className="h-5 w-5" />
          </ItemMedia>
          <ItemContent>
            <span className="flex items-center gap-2">
              <span className="font-semibold text-xs">Industry:</span>
              <span className="text-xs">
                {tenant?.industry || "No industry specified"}
              </span>
            </span>
          </ItemContent>
        </Item>
      </div>
      <div>
        <h1 className="font-semibold text-sm lg:text-base lg:font-bold my-2">
          Subscription
        </h1>
        <Item variant={"default"} className="p-1">
          <ItemMedia variant={"icon"}>
            <Layers className="h-5 w-5" />
          </ItemMedia>
          <ItemContent>
            <span className="flex items-center gap-2">
              <span className="font-semibold text-xs">Plan:</span>
              <span className="text-xs">{tenant?.plan}</span>
            </span>
          </ItemContent>
        </Item>
        <Item variant={"default"} className="p-1">
          <ItemMedia variant={"icon"}>
            <Calendar className="h-5 w-5" />
          </ItemMedia>
          <ItemContent>
            <span className="flex items-center gap-2">
              <span className="font-semibold text-xs">Billing Interval:</span>
              <span className="text-xs">{tenant?.billingInterval}</span>
            </span>
          </ItemContent>
        </Item>
        <Item variant={"default"} className="p-1">
          <ItemMedia variant={"icon"}>
            <Zap className="h-5 w-5" />
          </ItemMedia>
          <ItemContent>
            <span className="flex items-center gap-2">
              <span className="font-semibold text-xs">
                Subscription Status:
              </span>
              <span className="text-xs">{tenant?.subscriptionStatus}</span>
            </span>
          </ItemContent>
        </Item>
        <Item variant={"default"} className="p-1">
          <ItemMedia variant={"icon"}>
            <Clock className="h-5 w-5" />
          </ItemMedia>
          <ItemContent>
            <span className="flex items-center gap-2">
              <span className="font-semibold text-xs">Trial Ends In:</span>
              <span className="text-xs">
                {getTrialDaysLeft() !== null
                  ? `${getTrialDaysLeft()} days left`
                  : "No trial"}
              </span>
            </span>
          </ItemContent>
        </Item>
        <Item variant={"default"} className="p-1">
          <ItemMedia variant={"icon"}>
            <Clock className="h-5 w-5" />
          </ItemMedia>
          <ItemContent>
            <span className="flex items-center gap-2">
              <span className="font-semibold text-xs">
                Current Period Ends:
              </span>
              <span className="text-xs">
                {formatDistanceToNow(
                  new Date(tenant?.currentPeriodEnds || ""),
                  {
                    addSuffix: true,
                  },
                )}
              </span>
            </span>
          </ItemContent>
        </Item>
      </div>
      <div>
        <h1 className="font-semibold text-sm lg:text-base lg:font-bold my-2">
          Settings
        </h1>
        <Item variant={"default"} className="p-1">
          <ItemMedia variant={"icon"}>
            <Globe className="h-5 w-5" />
          </ItemMedia>
          <ItemContent>
            <span className="flex items-center gap-2">
              <span className="font-semibold text-xs">Timezone:</span>
              <span className="text-xs">
                {tenant?.timezone || "No timezone specified"}
              </span>
            </span>
          </ItemContent>
        </Item>
        <Item variant={"default"} className="p-1">
          <ItemMedia variant={"icon"}>
            <Banknote className="h-5 w-5" />
          </ItemMedia>
          <ItemContent>
            <span className="flex items-center gap-2">
              <span className="font-semibold text-xs">Currency:</span>
              <span className="text-xs">
                {tenant?.currency || "No currency specified"}
              </span>
            </span>
          </ItemContent>
        </Item>
        <Item variant={"default"} className="p-1">
          <ItemMedia variant={"icon"}>
            <Languages className="h-5 w-5" />
          </ItemMedia>
          <ItemContent>
            <span className="flex items-center gap-2">
              <span className="font-semibold text-xs">Language:</span>
              <span className="text-xs">
                {tenant?.language || "No language specified"}
              </span>
            </span>
          </ItemContent>
        </Item>
      </div>
      <div>
        <h1 className="font-semibold text-sm lg:text-base lg:font-bold my-2">
          Metadata
        </h1>
        <Item variant={"default"} className="p-1">
          <ItemMedia variant={"icon"}>
            <CalendarDays className="h-5 w-5" />
          </ItemMedia>
          <ItemContent>
            <span className="flex items-center gap-2">
              <span className="font-semibold text-xs">Created At:</span>
              <span className="text-xs">
                {new Date(tenant?.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </span>
          </ItemContent>
        </Item>
        <Item variant={"default"} className="p-1">
          <ItemMedia variant={"icon"}>
            <CalendarDays className="h-5 w-5" />
          </ItemMedia>
          <ItemContent>
            <span className="flex items-center gap-2">
              <span className="font-semibold text-xs">Last Updated:</span>
              <span className="text-xs">
                {new Date(tenant?.updatedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </span>
          </ItemContent>
        </Item>
        <Item variant={"default"} className="p-1">
          <ItemMedia variant={"icon"}>
            {tenant?.isActive ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <X className="h-5 w-5 text-red-500" />
            )}
          </ItemMedia>
          <ItemContent>
            <span className="flex items-center gap-2">
              <span className="font-semibold text-xs">Is Active:</span>
              <span className="text-xs">{tenant?.isActive ? "Yes" : "No"}</span>
            </span>
          </ItemContent>
        </Item>
      </div>
    </div>
  );
};

export default OrgDetails;

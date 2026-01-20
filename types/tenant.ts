import { SubscriptionStatus, UserRole } from "@/generated/prisma/enums";

export type TenantPermissions = {
  [key: string]:
    | string
    | number
    | boolean
    | object
    | Array<string | number | boolean>
    | null;
};

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  plan: string;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt?: Date | null;
  currentPeriodEndsAt?: Date | null;
};

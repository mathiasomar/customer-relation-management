import { TenantMember } from "@/generated/prisma/client";
import { SubscriptionStatus } from "@/generated/prisma/enums";

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
  createdAt: Date;
  isActive: boolean;
  members: TenantMember[];
  memberCount: number;
};

export type ControlProps = {
  name: string;
  slug: string;
  timezone: string;
  currency: string;
  language: string;
  website?: string | undefined;
  industry?: string | undefined;
  billingEmail?: string | undefined;
};

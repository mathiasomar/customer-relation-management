import { TenantMemberRole, User } from "@/generated/prisma/client";
import { JsonValue } from "@prisma/client/runtime/client";

export type Member = {
  user: User;
  id: string;
  role: TenantMemberRole;
  tenantId: string;
  userId: string;
  permissions: JsonValue | null;
  joinedAt: Date;
  invitedBy: string | null;
};

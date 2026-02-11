import { User } from "@/generated/prisma/client";
import "better-auth/types";

declare module "better-auth/types" {
  interface Session {
    session: {
      id: string;
      expiresAt: Date;
      token: string;
      createdAt: Date;
      updatedAt: Date;
      ipAddress?: string;
      userAgent?: string;
      userId: string;
      tenantId?: string;
      impersonatedBy?: string;
    };
    user: User;
  }
}

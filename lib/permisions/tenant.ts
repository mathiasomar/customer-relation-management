"use server";

import { auth } from "../auth";
import { UserRole } from "@/generated/prisma/enums";
import { prisma } from "../prisma";

// export async function getCurrentTenant() {
//   const session = await auth();
//   if (!session?.user?.tenantId) {
//     throw new Error("Unauthorized: No tenant access");
//   }
//   return session.user.tenantId;
// }

export async function getCurrentUser() {
  const session = await auth.api.getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

// Verify user has permission in tenant with optional role requirements
export async function verifyTenantPermission(
  requiredRole?: UserRole[] | string[],
  tenantId?: string
) {
  const session = await auth.api.getSession();

  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in");
  }

  if (!tenantId) {
    throw new Error("Unauthorized: No tenant access");
  }

  const { role: tenantRole } = session.user;

  // Verify tenant exists and user is still a member
  const tenantMember = await prisma.tenantMember.findUnique({
    where: {
      userId_tenantId: {
        userId: session.user.id,
        tenantId: tenantId as string,
      },
    },
    include: {
      tenant: {
        select: {
          id: true,
          isActive: true,
          deletedAt: true,
          subscriptionStatus: true,
        },
      },
    },
  });

  if (!tenantMember) {
    throw new Error("Unauthorized: You are not a member of this workspace");
  }

  // Check if tenant is active
  if (tenantMember.tenant.deletedAt) {
    throw new Error("This workspace has been deleted");
  }

  if (!tenantMember.tenant.isActive) {
    throw new Error("This workspace is currently inactive");
  }

  // Check subscription status for certain features
  if (tenantMember.tenant.subscriptionStatus === "SUSPENDED") {
    throw new Error(
      "Workspace subscription is suspended. Please contact support."
    );
  }

  // Check if user is banned
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { banned: true, banExpires: true },
  });

  if (user?.banned) {
    if (user.banExpires && user.banExpires > new Date()) {
      throw new Error(
        `Your account is suspended until ${user.banExpires.toLocaleDateString()}`
      );
    } else if (!user.banExpires) {
      throw new Error("Your account has been permanently suspended");
    }
  }

  // Check role permissions if required
  if (requiredRole && requiredRole.length > 0) {
    const hasRequiredRole = requiredRole.includes(tenantRole as UserRole);

    if (!hasRequiredRole) {
      // Get role hierarchy for more detailed error
      const roleHierarchy: Record<UserRole, number> = {
        ADMIN: 4,
        MANAGER: 3,
        AGENT: 2,
        VIEWER: 1,
        MEMBER: 0,
      };

      const requiredRoleNames = requiredRole.join(" or ");
      throw new Error(
        `Insufficient permissions. Required role: ${requiredRoleNames}. Your role: ${tenantRole}`
      );
    }
  }

  return {
    tenantId,
    userId: session.user.id,
    userRole: tenantRole as UserRole,
    tenantMember,
  };
}

// Check specific permission from JSON permissions field
export async function verifySpecificPermission(permissionKey: string) {
  const { tenantMember } = await verifyTenantPermission();

  // If user is ADMIN, they have all permissions
  if (tenantMember.role === "ADMIN") {
    return true;
  }

  // Check specific permission in permissions JSON
  const permissions = tenantMember.permissions as Record<
    string,
    boolean
  > | null;

  if (!permissions || permissions[permissionKey] !== true) {
    throw new Error(`Missing permission: ${permissionKey}`);
  }

  return true;
}

// Get tenant context for API routes or server components
export async function getTenantContext() {
  try {
    const context = await verifyTenantPermission();
    return context;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// Get user's accessible tenants
export async function getUserTenants() {
  const session = await auth.api.getSession();

  if (!session?.user?.id) {
    return [];
  }

  const tenantMemberships = await prisma.tenantMember.findMany({
    where: {
      userId: session.user.id,
      tenant: {
        isActive: true,
        deletedAt: null,
      },
    },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          subscriptionStatus: true,
          plan: true,
        },
      },
    },
    orderBy: {
      joinedAt: "desc",
    },
  });

  return tenantMemberships.map((tm) => ({
    id: tm.tenant.id,
    name: tm.tenant.name,
    slug: tm.tenant.slug,
    logo: tm.tenant.logo,
    role: tm.role,
    joinedAt: tm.joinedAt,
    subscriptionStatus: tm.tenant.subscriptionStatus,
    plan: tm.tenant.plan,
  }));
}

// Switch tenant context (for multi-tenant users)
export async function switchTenant(tenantId: string) {
  const session = await auth.api.getSession();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify user is a member of the requested tenant
  const tenantMember = await prisma.tenantMember.findUnique({
    where: {
      userId_tenantId: {
        userId: session.user.id,
        tenantId,
      },
    },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          deletedAt: true,
        },
      },
    },
  });

  if (!tenantMember) {
    throw new Error("You are not a member of this workspace");
  }

  if (tenantMember.tenant.deletedAt) {
    throw new Error("This workspace has been deleted");
  }

  if (!tenantMember.tenant.isActive) {
    throw new Error("This workspace is currently inactive");
  }

  return {
    tenantId: tenantMember.tenant.id,
    tenantSlug: tenantMember.tenant.slug,
    tenantName: tenantMember.tenant.name,
    userRole: tenantMember.role,
    permissions: tenantMember.permissions,
  };
}

// Check if user can access a specific resource in tenant
export async function canAccessResource(
  resourceType: "contact" | "lead" | "opportunity" | "deal" | "activity",
  resourceId: string,
  requiredPermission: "read" | "write" | "delete" = "read"
) {
  const { tenantId, userRole } = await verifyTenantPermission();

  // ADMIN and MANAGER can access all resources
  if (["ADMIN", "MANAGER"].includes(userRole)) {
    return true;
  }

  // For other roles, check if they own/are assigned the resource
  let resource;

  switch (resourceType) {
    case "contact":
      resource = await prisma.contact.findFirst({
        where: {
          id: resourceId,
          tenantId,
          ...(requiredPermission === "write" && userRole === "AGENT"
            ? { assigneeId: (await getCurrentUser()).id }
            : {}),
        },
      });
      break;

    case "lead":
      resource = await prisma.lead.findFirst({
        where: {
          id: resourceId,
          tenantId,
          ...(requiredPermission === "write" && userRole === "AGENT"
            ? { assigneeId: (await getCurrentUser()).id }
            : {}),
        },
      });
      break;

    case "opportunity":
      resource = await prisma.opportunity.findFirst({
        where: {
          id: resourceId,
          tenantId,
          ...(requiredPermission === "write" && userRole === "AGENT"
            ? { assigneeId: (await getCurrentUser()).id }
            : {}),
        },
      });
      break;

    case "deal":
      resource = await prisma.deal.findFirst({
        where: {
          id: resourceId,
          tenantId,
          ...(requiredPermission === "write" && userRole === "AGENT"
            ? { assigneeId: (await getCurrentUser()).id }
            : {}),
        },
      });
      break;

    case "activity":
      resource = await prisma.activity.findFirst({
        where: {
          id: resourceId,
          tenantId,
          OR: [
            { assigneeId: (await getCurrentUser()).id },
            { creatorId: (await getCurrentUser()).id },
          ],
        },
      });
      break;
  }

  return !!resource;
}

// app/api/tenants/actions.ts
"use server";

import { revalidatePath } from "next/cache";
// import { randomUUID } from "crypto";
import { z } from "zod";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { SubscriptionStatus, TenantMemberRole } from "@/generated/prisma/enums";
import { Prisma } from "@/generated/prisma/client";
import { InputJsonValue } from "@prisma/client/runtime/client";
import { TenantPermissions } from "@/types/tenant";
import {
  getCurrentUser,
  verifyTenantPermission,
} from "@/lib/permisions/tenant";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Schema for tenant creation
const createTenantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters" })
    .max(50, { message: "Slug must be at most 50 characters" })
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  website: z.string().url().optional().or(z.literal("")),
  industry: z.string().optional(),
  timezone: z.string().default("UTC"),
  currency: z.string().default("USD"),
  language: z.string().default("en"),
});

// Get user's accessible tenants
export const getUserTenantsMembmership = async () => {
  const session = await getCurrentUser();

  try {
    const tenantMemberships = await prisma.tenantMember.findMany({
      where: {
        userId: session.id,
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
            tenantSubscription: {
              include: {
                subscription: {
                  select: {
                    plan: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: "desc",
      },
    });

    const tenants = tenantMemberships.map((tm) => ({
      id: tm.tenant.id,
      name: tm.tenant.name,
      slug: tm.tenant.slug,
      logo: tm.tenant.logo,
      role: tm.role,
      joinedAt: tm.joinedAt,
      subscriptionStatus: tm.tenant.tenantSubscription?.subscriptionStatus,
      plan: tm.tenant.tenantSubscription?.subscription?.plan,
    }));

    return { success: true, tenants };
  } catch (error) {
    console.error("Error fetching tenant:", error);
    return { success: false, error: "Failed to load workspace details" };
  }
};

// Get user all tenants
export const getAllUserTenants = async () => {
  const session = await getCurrentUser();

  try {
    const tenantMemberships = await prisma.tenantMember.findMany({
      where: {
        userId: session.id,
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            createdAt: true,
            isActive: true,
            members: true,
            tenantSubscription: {
              include: {
                subscription: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: "desc",
      },
    });

    const tenants = tenantMemberships.map((tm) => ({
      id: tm.tenant.id,
      name: tm.tenant.name,
      slug: tm.tenant.slug,
      logo: tm.tenant.logo,
      subscriptionStatus: tm.tenant.tenantSubscription?.subscriptionStatus,
      plan: tm.tenant.tenantSubscription?.subscription?.plan,
      trialEndsAt: tm.tenant.tenantSubscription?.trialEndsAt,
      currentPeriodEnds: tm.tenant.tenantSubscription?.currentPeriodEnds,
      createdAt: tm.tenant.createdAt,
      isActive: tm.tenant.isActive,
      memberCount: tm.tenant.members.length,
    }));

    return { success: true, tenants };
  } catch (error) {
    console.error("Error fetching tenant:", error);
    return { success: false, error: "Failed to load workspace details" };
  }
};

// Get all tenants in the database (admin only)
export const getAdminTenants = async () => {
  const session = await getCurrentUser();

  try {
    // Check if user is admin
    if (session.role !== "ADMIN") {
      return {
        success: false,
        error: "Only administrators can view all tenants",
      };
    }

    const tenantsFetch = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        createdAt: true,
        isActive: true,
        members: true,
        tenantSubscription: {
          include: {
            subscription: {
              select: {
                plan: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const tenants = tenantsFetch.map((tm) => ({
      id: tm.id,
      name: tm.name,
      slug: tm.slug,
      logo: tm.logo,
      subscriptionStatus: tm.tenantSubscription?.subscriptionStatus,
      plan: tm.tenantSubscription?.subscription?.plan,
      trialEndsAt: tm.tenantSubscription?.trialEndsAt,
      currentPeriodEnds: tm.tenantSubscription?.currentPeriodEnds,
      createdAt: tm.createdAt,
      isActive: tm.isActive,
      memberCount: tm.members.length,
    }));

    return { success: true, tenants };
  } catch (error) {
    console.error("Error fetching all tenants:", error);
    return { success: false, error: "Failed to load tenants" };
  }
};

// Switch tenant context (for multi-tenant users)
export async function switchTenant(newTenantId: string) {
  const session = await getCurrentUser();

  try {
    // Verify user is a member of the requested tenant
    const tenantMember = await prisma.tenantMember.findUnique({
      where: {
        userId_tenantId: {
          userId: session.id,
          tenantId: newTenantId,
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

    // Update the current session to set the new tenantId
    try {
      const headersList = await headers();
      const currentSession = await auth.api.getSession({
        headers: headersList,
      });
      if (currentSession?.session?.id) {
        // Update the session in the database with the new tenantId
        await prisma.session.update({
          where: {
            id: currentSession.session.id,
          },
          data: {
            tenantId: newTenantId,
          },
        });
      }
    } catch (sessionError) {
      console.error(
        "Error updating session after tenant switch:",
        sessionError,
      );
      // Don't fail the whole operation if session update fails
    }

    const tenant = {
      tenantId: tenantMember.tenant.id,
      tenantSlug: tenantMember.tenant.slug,
      tenantName: tenantMember.tenant.name,
      userRole: tenantMember.role,
      permissions: tenantMember.permissions,
    };

    revalidatePath(`/dashboard/${tenant.tenantSlug}`);

    return { success: true, tenant };
  } catch (error) {
    console.error("Error switching tenant:", error);
    return { success: false, error: "Failed to switch workspace" };
  }
}

// CREATE: Create a new organization/tenant
export const createTenant = async (
  data: z.infer<typeof createTenantSchema>,
) => {
  const session = await getCurrentUser();

  // Validate input data
  const validatedData = createTenantSchema.parse(data);

  try {
    // Generate slug if not provided
    let slug = validatedData.slug;
    if (!slug) {
      slug = slugify(validatedData.name, { lower: true, strict: true });
    }

    // Check if slug exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      return {
        success: false,
        error:
          "A workspace with this URL already exists. Please choose a different one.",
      };
    }

    const normalizeName = validatedData.name
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[^a-zA-Z\s'-]/g, "")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    // Create tenant with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: normalizeName,
          slug,
          website: validatedData.website || null,
          industry: validatedData.industry || null,
          timezone: validatedData.timezone,
          currency: validatedData.currency,
          language: validatedData.language,
        },
      });

      await tx.tenantSubscription.create({
        data: {
          tenantId: tenant.id,
          subscriptionStatus: SubscriptionStatus.TRIAL,
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
          currentPeriodEnds: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });

      // Add creator as admin member
      await tx.tenantMember.create({
        data: {
          userId: session.id,
          tenantId: tenant.id,
          role: "ADMIN",
          invitedBy: null,
          permissions: {
            canManageUsers: true,
            canManageSettings: true,
            canManageBilling: true,
            canManageIntegrations: true,
          },
        },
      });

      // Create default pipeline for the tenant
      await tx.pipeline.create({
        data: {
          name: "Sales Pipeline",
          description: "Default sales pipeline",
          isDefault: true,
          tenantId: tenant.id,
          stages: {
            create: [
              { name: "New", order: 1, probability: 0.0, tenantId: tenant.id },
              {
                name: "Qualified",
                order: 2,
                probability: 0.25,
                tenantId: tenant.id,
              },
              {
                name: "Proposal",
                order: 3,
                probability: 0.5,
                tenantId: tenant.id,
              },
              {
                name: "Negotiation",
                order: 4,
                probability: 0.75,
                tenantId: tenant.id,
              },
              {
                name: "Closed Won",
                order: 5,
                probability: 1.0,
                tenantId: tenant.id,
              },
              {
                name: "Closed Lost",
                order: 6,
                probability: 0.0,
                tenantId: tenant.id,
              },
            ],
          },
        },
      });

      // Create default email templates
      const defaultTemplates = [
        {
          name: "Welcome Email",
          subject: "Welcome to {{company_name}}",
          body: "<p>Hi {{contact_name}},</p><p>Welcome to our company!</p>",
          variables: ["company_name", "contact_name"],
          category: "onboarding",
          isSystem: true,
        },
        {
          name: "Follow-up Email",
          subject: "Following up on our conversation",
          body: "<p>Hi {{contact_name}},</p><p>Just following up on our recent conversation.</p>",
          variables: ["contact_name"],
          category: "follow-up",
          isSystem: true,
        },
      ];

      for (const template of defaultTemplates) {
        await tx.emailTemplate.create({
          data: {
            ...template,
            tenantId: tenant.id,
            createdById: session.id,
          },
        });
      }

      return tenant;
    });

    // Update the current session to set the new tenant as default
    try {
      const headersList = await headers();
      const currentSession = await auth.api.getSession({
        headers: headersList,
      });

      if (currentSession?.session?.id) {
        await prisma.session.update({
          where: {
            id: currentSession.session.id,
          },
          data: {
            tenantId: result.id,
          },
        });
      }
    } catch (sessionError) {
      console.error(
        "Error updating session after tenant creation:",
        sessionError,
      );
      // Don't fail the whole operation if session update fails
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/organizations");
    revalidatePath("/dashboard/settings");

    return {
      success: true,
      tenant: result,
      message: "Workspace created successfully!",
    };
  } catch (error) {
    console.error("Error creating tenant:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          success: false,
          error: "A workspace with this URL already exists.",
        };
      }
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create workspace",
    };
  }
};

// READ: Get current tenant details
export const getTenant = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.session.tenantId) {
    return { success: false, error: "Unauthorized: No tenant access" };
  }

  const { tenantId, userRole } = await verifyTenantPermission();
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: {
            members: true,
            contacts: true,
            leads: true,
            opportunities: true,
            deals: true,
          },
        },
        tenantSubscription: {
          include: {
            subscription: true,
          },
        },
      },
    });

    if (!tenant) {
      //   throw new Error("Tenant not found");
      return {
        success: false,
        error: "Tenant not found",
      };
    }

    return { success: true, tenant, userRole };
  } catch (error) {
    console.error("Error fetching tenant:", error);
    return { success: false, error: "Failed to load workspace details" };
  }
};

// UPDATE: Update tenant/organization settings
export const updateTenant = async (
  data: Partial<{
    name: string;
    website: string;
    industry: string;
    logo: string;
    timezone: string;
    currency: string;
    language: string;
  }>,
) => {
  try {
    const { userRole, tenantId } = await verifyTenantPermission([
      "ADMIN",
      "MANAGER",
    ]);

    // Only admins can update billing email
    if (userRole !== "ADMIN") {
      return {
        success: false,
        error: "Only administrators can update billing settings",
      };
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "Tenant",
        entityId: tenantId as string,
        tenantId: tenantId ?? "",
        userId: (await getCurrentUser()).id,
        changes: data,
      },
    });

    revalidatePath("/dashboard/organizations");
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/organizations/view");

    return {
      success: true,
      tenant: updatedTenant,
      message: "Workspace updated successfully",
    };
  } catch (error) {
    console.error("Error updating tenant:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update workspace",
    };
  }
};

export const updateTenantBillingEmail = async (
  data: Partial<{ billingEmail: string }>,
) => {
  try {
    const { userRole, tenantId } = await verifyTenantPermission([
      "ADMIN",
      "MANAGER",
    ]);

    // Only admins can update billing email
    if (userRole !== "ADMIN") {
      return {
        success: false,
        error: "Only administrators can update billing settings",
      };
    }

    const updatedTenantSubscription = await prisma.tenantSubscription.update({
      where: { tenantId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "Tenant Subscription",
        entityId: tenantId as string,
        tenantId: tenantId ?? "",
        userId: (await getCurrentUser()).id,
        changes: data,
      },
    });

    revalidatePath("/dashboard/organizations");
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/organizations/view");

    return {
      success: true,
      tenant: updatedTenantSubscription,
      message: "Workspace updated successfully",
    };
  } catch (error) {
    console.error("Error updating tenant subscription:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update workspace",
    };
  }
};

// CREATE: Create subscription plan
export const createTenantSubscription = async (data: {
  subscriptionId: string;
  tenantId: string;
}) => {
  try {
    const { tenantId } = await verifyTenantPermission(["ADMIN", "MANAGER"]);

    const subscription = await prisma.subscription.findUnique({
      where: { id: data.subscriptionId },
    });

    let currentPeriodEnds = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    if (subscription?.billingInterval === "ANNUAL") {
      currentPeriodEnds = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    } else if (subscription?.billingInterval === "MONTHLY") {
      currentPeriodEnds = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else if (subscription?.billingInterval === "QUARTERLY") {
      currentPeriodEnds = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    }

    const updatedTenant = await prisma.tenantSubscription.create({
      data: {
        tenantId: data.tenantId,
        subscriptionId: data.subscriptionId,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        currentPeriodEnds,
        updatedAt: new Date(),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "Tenant",
        entityId: tenantId ?? "",
        tenantId: tenantId ?? "",
        userId: (await getCurrentUser()).id,
        changes: data,
      },
    });

    revalidatePath("/dashboard/subscriptions");
    revalidatePath("/dashboard/organizations");

    return {
      success: true,
      tenant: updatedTenant,
      message: "Subscription updated successfully",
    };
  } catch (error) {
    console.error("Error updating subscription:", error);
    return {
      success: false,
      error: "Failed to update subscription",
    };
  }
};

// UPDATE: Update subscription plan
export const updateSubscription = async (data: { subscriptionId: string }) => {
  try {
    const { tenantId } = await verifyTenantPermission(["ADMIN", "MANAGER"]);

    const subscription = await prisma.subscription.findUnique({
      where: { id: data.subscriptionId },
    });

    let currentPeriodEnds = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    if (subscription?.billingInterval === "ANNUAL") {
      currentPeriodEnds = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    } else if (subscription?.billingInterval === "MONTHLY") {
      currentPeriodEnds = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else if (subscription?.billingInterval === "QUARTERLY") {
      currentPeriodEnds = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    }

    let status;
    if (subscription?.amount === 0) {
      status = SubscriptionStatus.ACTIVE;
    } else {
      status = SubscriptionStatus.TRIAL;
    }

    const updatedTenant = await prisma.tenantSubscription.update({
      where: { tenantId },
      data: {
        subscriptionId: data.subscriptionId,
        subscriptionStatus: status,
        currentPeriodEnds,
        updatedAt: new Date(),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "Tenant",
        entityId: tenantId ?? "",
        tenantId: tenantId ?? "",
        userId: (await getCurrentUser()).id,
        changes: data,
      },
    });

    revalidatePath("/dashboard/subscriptions");
    revalidatePath("/dashboard/organization");

    return {
      success: true,
      tenant: updatedTenant,
      message: "Subscription updated successfully",
    };
  } catch (error) {
    console.error("Error updating subscription:", error);
    return {
      success: false,
      error: "Failed to update subscription",
    };
  }
};

// READ: Get tenant members
export const getTenantMembers = async () => {
  try {
    const { tenantId } = await verifyTenantPermission();

    const members = await prisma.tenantMember.findMany({
      where: { tenantId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            createdAt: true,
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    return { success: true, members };
  } catch (error) {
    console.error("Error fetching tenant members:", error);
    return { success: false, error: "Failed to load team members" };
  }
};

// CREATE: Invite new member to tenant
export const inviteMember = async (data: {
  email: string;
  role: TenantMemberRole;
  permissions?: TenantPermissions;
}) => {
  try {
    const { tenantId, userId, userRole } = await verifyTenantPermission([
      "ADMIN",
      "MANAGER",
    ]);

    // Only admins can invite new members
    if (userRole !== "ADMIN" && userRole !== "MANAGER") {
      return {
        success: false,
        error: "Only administrators can invite new members",
      };
    }

    // Check if user already exists
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // If user doesn't exist, create them (they'll set password later)
    // if (!user) {
    //   user = await prisma.user.create({
    //     data: {
    //       id: randomUUID(),
    //       email: data.email,
    //       name: data.email.split("@")[0], // Default name from email
    //       emailVerified: false,
    //       role: "USER", // Default role until they accept invitation
    //     },
    //   });
    // }

    // do this later

    if (!user) {
      return {
        success: false,
        error: "User not found. Create the account first.",
      };
    }

    // Check if user is already a member
    const existingMember = await prisma.tenantMember.findUnique({
      where: {
        userId_tenantId: {
          userId: user.id,
          tenantId: tenantId ?? "",
        },
      },
    });

    if (existingMember) {
      return {
        success: false,
        error: "User is already a member of this workspace",
      };
    }

    // Add user as member
    const member = await prisma.tenantMember.create({
      data: {
        userId: user.id,
        tenantId: tenantId ?? "",
        role: data.role as TenantMemberRole,
        permissions: data.permissions as InputJsonValue | undefined,
        invitedBy: userId,
      },
    });

    // TODO: Send invitation email

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "INVITE",
        entityType: "TenantMember",
        entityId: member.id,
        tenantId: tenantId ?? "",
        userId: userId ?? "",
        changes: data,
      },
    });

    revalidatePath("/dashboard/organizations/view/members");
    revalidatePath("/dashboard/organizations/view");
    revalidatePath("/dashboard/organizations");

    return {
      success: true,
      member,
      message: "Invitation sent successfully",
    };
  } catch (error) {
    console.error("Error inviting member:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to send invitation",
    };
  }
};

// UPDATE: Update member role/permissions
export const updateMemberRole = async (
  memberId: string,
  data: {
    role: TenantMemberRole;
    permissions?: TenantPermissions;
  },
) => {
  try {
    const { tenantId, userId, userRole } = await verifyTenantPermission([
      "ADMIN",
    ]);

    // Only admins can update member roles
    if (userRole !== "ADMIN") {
      return {
        success: false,
        error: "Only administrators can update member roles",
      };
    }

    // Can't update your own role if you're the only admin
    const member = await prisma.tenantMember.findUnique({
      where: { id: memberId, tenantId },
      include: { user: true },
    });

    if (!member) {
      return { success: false, error: "Member not found" };
    }

    // Check if this is the last admin
    if (member.role === "ADMIN" && data.role !== "ADMIN") {
      const adminCount = await prisma.tenantMember.count({
        where: {
          tenantId,
          role: "ADMIN",
        },
      });

      if (adminCount <= 1) {
        return {
          success: false,
          error: "Cannot remove the last administrator from the workspace",
        };
      }
    }

    const updatedMember = await prisma.tenantMember.update({
      where: { id: memberId, tenantId },
      data: {
        role: data.role as TenantMemberRole,
        permissions: data.permissions,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entityType: "TenantMember",
        entityId: memberId,
        tenantId,
        userId,
        changes: data,
      },
    });

    revalidatePath("/settings/team");

    return {
      success: true,
      member: updatedMember,
      message: "Member role updated successfully",
    };
  } catch (error) {
    console.error("Error updating member role:", error);
    return {
      success: false,
      error: "Failed to update member role",
    };
  }
};

// DELETE: Remove member from tenant
export async function removeMember(memberId: string) {
  try {
    const { tenantId, userId, userRole } = await verifyTenantPermission([
      "ADMIN",
    ]);

    // Only admins can remove members
    if (userRole !== "ADMIN") {
      return {
        success: false,
        error: "Only administrators can remove members",
      };
    }

    const member = await prisma.tenantMember.findUnique({
      where: { id: memberId, tenantId },
      include: { user: true },
    });

    if (!member) {
      return { success: false, error: "Member not found" };
    }

    // Can't remove yourself
    if (member.userId === userId) {
      return {
        success: false,
        error: "You cannot remove yourself from the workspace",
      };
    }

    // Can't remove the last admin
    if (member.role === "ADMIN") {
      const adminCount = await prisma.tenantMember.count({
        where: {
          tenantId,
          role: "ADMIN",
        },
      });

      if (adminCount <= 1) {
        return {
          success: false,
          error: "Cannot remove the last administrator from the workspace",
        };
      }
    }

    const deletedMember = await prisma.tenantMember.delete({
      where: { id: memberId, tenantId },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "REMOVE",
        entityType: "TenantMember",
        entityId: memberId,
        tenantId,
        userId,
      },
    });

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/members");

    return {
      success: true,
      message: "Member removed successfully",
      deletedMember,
    };
  } catch (error) {
    console.error("Error removing member:", error);
    return {
      success: false,
      error: "Failed to remove member",
    };
  }
}

// READ: Get tenant usage statistics
export const getTenantUsage = async () => {
  try {
    const { tenantId } = await verifyTenantPermission();

    const [
      contactCount,
      leadCount,
      opportunityCount,
      dealCount,
      activityCount,
      userCount,
    ] = await Promise.all([
      prisma.contact.count({ where: { tenantId, isActive: true } }),
      prisma.lead.count({ where: { tenantId, deletedAt: null } }),
      prisma.opportunity.count({ where: { tenantId, deletedAt: null } }),
      prisma.deal.count({ where: { tenantId, deletedAt: null } }),
      prisma.activity.count({ where: { tenantId, deletedAt: null } }),
      prisma.tenantMember.count({ where: { tenantId } }),
    ]);

    // Get recent activities
    const recentActivities = await prisma.activity.findMany({
      where: { tenantId, deletedAt: null },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        creator: {
          select: { name: true, image: true },
        },
        contact: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    return {
      success: true,
      usage: {
        contacts: contactCount,
        leads: leadCount,
        opportunities: opportunityCount,
        deals: dealCount,
        activities: activityCount,
        users: userCount,
      },
      recentActivities,
    };
  } catch (error) {
    console.error("Error fetching tenant usage:", error);
    return {
      success: false,
      error: "Failed to load usage statistics",
    };
  }
};

export const uploadLogo = async (img: string) => {
  try {
    const { tenantId } = await verifyTenantPermission();
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      return { success: false, error: "Tenant not found" };
    }
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { logo: img },
    });

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/organizations");

    return { success: true, tenant: updatedTenant };
  } catch (error) {
    console.error("Error uploading logo:", error);
    return { success: false, error: "Failed to upload logo" };
  }
};

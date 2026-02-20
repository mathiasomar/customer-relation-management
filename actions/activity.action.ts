"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  getCurrentUser,
  verifyTenantPermission,
} from "@/lib/permisions/tenant";
import {
  ActivityType,
  ActivityStatus,
  Priority,
} from "@/generated/prisma/enums";

// Schema for logging an activity
const logActivitySchema = z.object({
  type: z.enum([
    "CALL",
    "EMAIL",
    "MEETING",
    "TASK",
    "NOTE",
    "DEMO",
    "FOLLOW_UP",
  ]),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  duration: z.number().int().positive().optional(),
  allDay: z.boolean().default(false),
  location: z.string().optional(),
  meetingUrl: z.string().url().optional(),
  assigneeId: z.string().optional(),
  reminderAt: z.date().optional(),
  outcome: z.string().optional(),
  notes: z.string().optional(),
});

export type LogActivityInput = z.infer<typeof logActivitySchema>;

export async function logContactActivity(
  contactId: string,
  data: LogActivityInput,
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const { tenantId } = await verifyTenantPermission();

    // Validate input
    const validatedData = logActivitySchema.parse(data);

    // Resolve assigneeId - it could be a TenantMember ID or User ID
    let finalAssigneeId = validatedData.assigneeId || session.id;

    if (validatedData.assigneeId && validatedData.assigneeId !== session.id) {
      // Check if it's a TenantMember ID and get the userId
      const tenantMember = await prisma.tenantMember.findUnique({
        where: { id: validatedData.assigneeId },
      });

      if (tenantMember && tenantMember.tenantId === tenantId) {
        finalAssigneeId = tenantMember.userId;
      } else {
        // If not a valid TenantMember, try to use it as a User ID directly
        finalAssigneeId = validatedData.assigneeId;
      }
    }

    // Create the activity
    const activity = await prisma.activity.create({
      data: {
        ...validatedData,
        type: validatedData.type as ActivityType,
        priority: validatedData.priority as Priority,
        status: ActivityStatus.SCHEDULED,
        tenantId: tenantId ?? "",
        creatorId: session.id,
        assigneeId: finalAssigneeId,
        contactId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entityType: "Activity",
        entityId: activity.id,
        tenantId: tenantId ?? "",
        userId: session.id,
        changes: { after: validatedData },
      },
    });

    // Update contact's lastActivityAt
    await prisma.contact.update({
      where: { id: contactId },
      data: { lastActivityAt: new Date() },
    });

    revalidatePath(`/dashboard/contacts/${contactId}`);

    return {
      success: true,
      activity,
      message: "Activity logged successfully!",
    };
  } catch (error) {
    console.error("Error logging activity:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to log activity",
    };
  }
}

export async function getContactActivityTypes() {
  return {
    success: true,
    types: Object.values(ActivityType).map((type) => ({
      value: type,
      label: type
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase()),
    })),
  };
}

export async function getTeamMembers() {
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
          },
        },
      },
    });

    return {
      success: true,
      members: members.map((m) => m.user),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch team members",
    };
  }
}

export async function getContactActivities(
  contactId: string,
  options?: {
    skip?: number;
    take?: number;
    orderBy?: "asc" | "desc";
  },
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return { success: false, error: "Unauthorized", activities: [] };
    }

    const { tenantId } = await verifyTenantPermission();

    const skip = options?.skip || 0;
    const take = options?.take || 10;
    const orderBy = options?.orderBy || "desc";

    const activities = await prisma.activity.findMany({
      where: {
        contactId,
        tenantId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: orderBy === "asc" ? "asc" : "desc",
      },
      skip,
      take,
    });

    const total = await prisma.activity.count({
      where: {
        contactId,
        tenantId,
      },
    });

    return {
      success: true,
      activities,
      total,
      skip,
      take,
    };
  } catch (error) {
    console.error("Error fetching contact activities:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch contact activities",
      activities: [],
    };
  }
}

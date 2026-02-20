"use server";

import { Prisma } from "@/generated/prisma/client";
import {
  getCurrentUser,
  verifyTenantPermission,
} from "@/lib/permisions/tenant";
import { prisma } from "@/lib/prisma";
import { ContactFilters, CreateContactInput } from "@/types/contact";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema for contact creation
const createContactSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email format").optional().nullable(),
  phone: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  jobTitle: z.string().max(100).optional().nullable(),
  department: z.string().max(100).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  avatar: z.string().optional().nullable(),
  timezone: z.string().optional().nullable(),

  // Address
  street: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),

  // Social
  linkedin: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (value) =>
        !value ||
        /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[A-Za-z0-9_-]+\/?$/.test(
          value,
        ),
      {
        message: "Invalid LinkedIn URL",
      },
    ),

  twitter: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (value) =>
        !value ||
        /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[A-Za-z0-9_]{1,15}\/?$/.test(
          value,
        ),
      {
        message: "Invalid Twitter/X URL",
      },
    ),

  facebook: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (value) =>
        !value || // allow undefined, null, empty string
        /^(https?:\/\/)?(www\.)?facebook\.com\/(profile\.php\?id=\d+|[A-Za-z0-9\.]{5,})\/?$/.test(
          value,
        ),
      {
        message: "Invalid Facebook URL",
      },
    ),

  // Metadata
  source: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),

  // Relations
  assigneeId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
});

// Schema for contact update
const updateContactSchema = createContactSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// GET: Get all contacts with filters
export const getContacts = async (filters: ContactFilters = {}) => {
  try {
    const { tenantId } = await verifyTenantPermission();

    const {
      search,
      assigneeId,
      tags,
      isActive = true,
      company,
      dateRange,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    // Build where clause
    const where: Prisma.ContactWhereInput = {
      tenantId,
      deletedAt: null,
    };

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    if (company) {
      where.company = { contains: company, mode: "insensitive" };
    }

    if (tags && tags.length > 0) {
      where.tags = {
        some: {
          tagId: { in: tags },
        },
      };
    }

    if (dateRange) {
      where.createdAt = {
        gte: dateRange.from,
        lte: dateRange.to,
      };
    }

    // Get total count
    const total = await prisma.contact.count({ where });

    // Get contacts
    const contacts = await prisma.contact.findMany({
      where,
      include: {
        _count: {
          select: {
            leads: true,
            opportunities: true,
            deals: true,
            activities: true,
            notesList: true,
            tasks: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      success: true,
      data: contacts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching contacts:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch contacts",
    };
  }
};

// GET: Get single contact by ID
export const getContact = async (contactId: string) => {
  try {
    const { tenantId } = await verifyTenantPermission();

    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        tenantId,
        deletedAt: null,
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
        tags: {
          include: {
            tag: true,
            assignedBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        leads: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        opportunities: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            pipeline: true,
          },
        },
        deals: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        activities: {
          where: { deletedAt: null },
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
          orderBy: { startTime: "desc" },
          take: 10,
        },
        notesList: {
          where: { deletedAt: null },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        tasks: {
          where: { deletedAt: null },
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { dueDate: "asc" },
          take: 10,
        },
        _count: {
          select: {
            leads: true,
            opportunities: true,
            deals: true,
            activities: true,
            notesList: true,
            tasks: true,
          },
        },
      },
    });

    if (!contact) {
      return {
        success: false,
        error: "Contact not found",
      };
    }

    return {
      success: true,
      contact,
    };
  } catch (error) {
    console.error("Error fetching contact:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch contact",
    };
  }
};

// CREATE: Create a new contact
export const createContact = async (data: CreateContactInput) => {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    const { tenantId } = await verifyTenantPermission();

    // Validate input data
    const validatedData = createContactSchema.parse(data);

    // Check for existing contact with same email in this tenant
    if (validatedData.email) {
      const existingContact = await prisma.contact.findFirst({
        where: {
          email: validatedData.email,
          tenantId,
          deletedAt: null,
        },
      });

      if (existingContact) {
        return {
          success: false,
          error: "Contact with this email already exists",
        };
      }
    }

    const { tags, ...contactData } = validatedData;

    // Create contact with transaction
    const contact = await prisma.$transaction(async (tx) => {
      // Create the contact
      const newContact = await tx.contact.create({
        data: {
          firstName: contactData.firstName,
          lastName: contactData.lastName,
          email: contactData.email,
          phone: contactData.phone,
          mobile: contactData.mobile,
          jobTitle: contactData.jobTitle,
          department: contactData.department,
          company: contactData.company,
          avatar: contactData.avatar,
          timezone: contactData.timezone,
          street: contactData.street,
          city: contactData.city,
          state: contactData.state,
          postalCode: contactData.postalCode,
          country: contactData.country,
          linkedin: contactData.linkedin,
          twitter: contactData.twitter,
          facebook: contactData.facebook,
          source: contactData.source,
          notes: contactData.notes,
          tenantId: tenantId ?? "",
          assigneeId: contactData.assigneeId || null,
          customFields: {},
        },
      });

      // // Handle tags if provided
      // if (validatedData.tags && validatedData.tags.length > 0) {
      //   await tx.tagAssignment.createMany({
      //     data: validatedData.tags.map((tagId) => ({
      //       tagId,
      //       contactId: newContact.id,
      //       entityType: "contact",
      //       assignedById: session.id,
      //     })),
      //   });
      // }

      if (tags && tags.length > 0) {
        await tx.tagAssignment.createMany({
          data: tags.map((tagId: string) => ({
            tagId,
            contactId: newContact.id,
            entityType: "contact",
            assignedById: session.id,
          })),
        });
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: "CREATE",
          entityType: "Contact",
          entityId: newContact.id,
          tenantId: tenantId ?? "",
          userId: session.id,
          changes: { after: validatedData },
        },
      });

      return newContact;
    });

    revalidatePath(`/dashboard/contacts`);

    return {
      success: true,
      contact,
      message: "Contact created successfully!",
    };
  } catch (error) {
    console.error("Error creating contact:", error);

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
          error: "Contact with this email already exists.",
        };
      }
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create contact",
    };
  }
};

// UPDATE: Update an existing contact
export const updateContact = async (
  contactId: string,
  data: z.infer<typeof updateContactSchema>,
) => {
  try {
    const session = await getCurrentUser();
    const { tenantId } = await verifyTenantPermission();

    // Validate input data
    const validatedData = updateContactSchema.parse(data);

    // Get existing contact
    const existingContact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        tenantId,
        deletedAt: null,
      },
      include: {
        tags: true,
      },
    });

    if (!existingContact) {
      return {
        success: false,
        error: "Contact not found",
      };
    }

    // Check email uniqueness if being updated
    if (validatedData.email && validatedData.email !== existingContact.email) {
      const duplicateContact = await prisma.contact.findFirst({
        where: {
          email: validatedData.email,
          tenantId,
          deletedAt: null,
          NOT: { id: contactId },
        },
      });

      if (duplicateContact) {
        return {
          success: false,
          error: "Contact with this email already exists",
        };
      }
    }

    // Update contact with transaction
    const contact = await prisma.$transaction(async (tx) => {
      // Update contact
      const updatedContact = await tx.contact.update({
        where: { id: contactId },
        data: {
          ...validatedData,
          tags: validatedData.tags as Prisma.TagAssignmentUncheckedCreateNestedManyWithoutContactInput,
          assigneeId: validatedData.assigneeId || null,
        },
      });

      // Handle tags if provided
      if (validatedData.tags) {
        // Remove existing tags
        await tx.tagAssignment.deleteMany({
          where: { contactId },
        });

        // Add new tags
        if (validatedData.tags.length > 0) {
          await tx.tagAssignment.createMany({
            data: validatedData.tags.map((tagId) => ({
              tagId,
              contactId,
              entityType: "contact",
              assignedById: session.id,
            })),
          });
        }
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: "UPDATE",
          entityType: "Contact",
          entityId: contactId,
          tenantId: tenantId ?? "",
          userId: session.id,
          changes: {
            before: existingContact,
            after: validatedData,
          },
        },
      });

      return updatedContact;
    });

    revalidatePath(`/dashboard/contacts`);
    revalidatePath(`/dashboard/contacts/${contactId}`);

    return {
      success: true,
      contact,
      message: "Contact updated successfully!",
    };
  } catch (error) {
    console.error("Error updating contact:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update contact",
    };
  }
};

// DELETE: Soft delete a contact
export const deleteContact = async (contactId: string) => {
  try {
    const session = await getCurrentUser();
    const { tenantId } = await verifyTenantPermission();

    // Check if contact exists
    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!contact) {
      return {
        success: false,
        error: "Contact not found",
      };
    }

    // Soft delete
    await prisma.$transaction([
      prisma.contact.update({
        where: { id: contactId },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      }),
      prisma.auditLog.create({
        data: {
          action: "DELETE",
          entityType: "Contact",
          entityId: contactId,
          tenantId: tenantId ?? "",
          userId: session.id,
          changes: { deleted: true },
        },
      }),
    ]);

    revalidatePath(`/dashboard/contacts`);

    return {
      success: true,
      message: "Contact deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting contact:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete contact",
    };
  }
};

// BULK DELETE: Delete multiple contacts
export const bulkDeleteContacts = async (contactIds: string[]) => {
  try {
    const session = await getCurrentUser();
    const { tenantId } = await verifyTenantPermission();

    await prisma.$transaction(async (tx) => {
      // Soft delete contacts
      await tx.contact.updateMany({
        where: {
          id: { in: contactIds },
          tenantId,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      });

      // Create audit logs
      await tx.auditLog.createMany({
        data: contactIds.map((id) => ({
          action: "DELETE",
          entityType: "Contact",
          entityId: id,
          tenantId: tenantId ?? "",
          userId: session.id,
          changes: { deleted: true, bulk: true },
        })),
      });
    });

    revalidatePath(`/dashboard/contacts`);

    return {
      success: true,
      message: `${contactIds.length} contacts deleted successfully`,
    };
  } catch (error) {
    console.error("Error bulk deleting contacts:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete contacts",
    };
  }
};

export const getContactTags = async (contactId: string) => {
  try {
    const { tenantId } = await verifyTenantPermission();

    const tags = await prisma.tagAssignment.findMany({
      where: {
        contactId,
        tag: {
          tenantId,
        },
      },
      include: {
        tag: true,
        assignedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      success: true,
      tags,
    };
  } catch (error) {
    console.error("Error fetching contact tags:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch tags",
    };
  }
};

// GET: Get contact activities
export const getContactActivities = async (
  contactId: string,
  limit: number = 10,
) => {
  try {
    const { tenantId } = await verifyTenantPermission();

    const activities = await prisma.activity.findMany({
      where: {
        contactId,
        tenantId,
        deletedAt: null,
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
            image: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
      take: limit,
    });

    return {
      success: true,
      activities,
    };
  } catch (error) {
    console.error("Error fetching contact activities:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch activities",
    };
  }
};

// GET: Get contact notes
export const getContactNotes = async (
  contactId: string,
  limit: number = 10,
) => {
  try {
    const { tenantId } = await verifyTenantPermission();

    const notes = await prisma.note.findMany({
      where: {
        contactId,
        tenantId,
        deletedAt: null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return {
      success: true,
      notes,
    };
  } catch (error) {
    console.error("Error fetching contact notes:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch notes",
    };
  }
};

// GET: Get contact tasks
export const getContactTasks = async (
  contactId: string,
  limit: number = 10,
) => {
  try {
    const { tenantId } = await verifyTenantPermission();

    const tasks = await prisma.task.findMany({
      where: {
        contactId,
        tenantId,
        deletedAt: null,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
      take: limit,
    });

    return {
      success: true,
      tasks,
    };
  } catch (error) {
    console.error("Error fetching contact tasks:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch tasks",
    };
  }
};

// GET: Get contact deals
export const getContactDeals = async (contactId: string, limit: number = 5) => {
  try {
    const { tenantId } = await verifyTenantPermission();

    const deals = await prisma.deal.findMany({
      where: {
        contactId,
        tenantId,
        deletedAt: null,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        opportunity: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return {
      success: true,
      deals,
    };
  } catch (error) {
    console.error("Error fetching contact deals:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch deals",
    };
  }
};

// GET: Get contact opportunities
export const getContactOpportunities = async (
  contactId: string,
  limit: number = 5,
) => {
  try {
    const { tenantId } = await verifyTenantPermission();

    const opportunities = await prisma.opportunity.findMany({
      where: {
        contactId,
        tenantId,
        deletedAt: null,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        pipeline: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return {
      success: true,
      opportunities,
    };
  } catch (error) {
    console.error("Error fetching contact opportunities:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch opportunities",
    };
  }
};

// EXPORT: Export contacts to CSV
export const exportContacts = async (filters: ContactFilters = {}) => {
  try {
    const { tenantId } = await verifyTenantPermission();

    const { search, assigneeId, tags, company } = filters;

    // Build where clause
    const where: Prisma.ContactWhereInput = {
      tenantId,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ];
    }

    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    if (company) {
      where.company = { contains: company, mode: "insensitive" };
    }

    if (tags && tags.length > 0) {
      where.tags = {
        some: {
          tagId: { in: tags },
        },
      };
    }

    const contacts = await prisma.contact.findMany({
      where,
      include: {
        assignee: {
          select: {
            name: true,
            email: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Transform data for CSV export
    const exportData = contacts.map((contact) => ({
      "First Name": contact.firstName,
      "Last Name": contact.lastName,
      Email: contact.email || "",
      Phone: contact.phone || "",
      Mobile: contact.mobile || "",
      "Job Title": contact.jobTitle || "",
      Department: contact.department || "",
      Company: contact.company || "",
      Street: contact.street || "",
      City: contact.city || "",
      State: contact.state || "",
      "Postal Code": contact.postalCode || "",
      Country: contact.country || "",
      Assignee: contact.assignee?.name || "",
      Tags: contact.tags.map((t) => t.tag.name).join(", "),
      Source: contact.source || "",
      Notes: contact.notes || "",
      "Created At": contact.createdAt.toISOString(),
      "Last Contacted": contact.lastContactedAt?.toISOString() || "",
      Timezone: contact.timezone || "",
      LinkedIn: contact.linkedin || "",
      Twitter: contact.twitter || "",
      Facebook: contact.facebook || "",
    }));

    return {
      success: true,
      data: exportData,
    };
  } catch (error) {
    console.error("Error exporting contacts:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to export contacts",
    };
  }
};

// GET: Get contact statistics
export const getContactStats = async () => {
  try {
    const { tenantId } = await verifyTenantPermission();

    const [
      totalContacts,
      activeContacts,
      contactsByAssignee,
      recentContacts,
      contactsBySource,
    ] = await Promise.all([
      prisma.contact.count({
        where: { tenantId, deletedAt: null },
      }),
      prisma.contact.count({
        where: { tenantId, deletedAt: null, isActive: true },
      }),
      prisma.contact.groupBy({
        by: ["assigneeId"],
        where: { tenantId, deletedAt: null },
        _count: true,
      }),
      prisma.contact.findMany({
        where: { tenantId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          company: true,
          createdAt: true,
        },
      }),
      prisma.contact.groupBy({
        by: ["source"],
        where: {
          tenantId,
          deletedAt: null,
          source: { not: null },
        },
        _count: true,
      }),
    ]);

    return {
      success: true,
      stats: {
        total: totalContacts,
        active: activeContacts,
        inactive: totalContacts - activeContacts,
        byAssignee: contactsByAssignee,
        recent: recentContacts,
        bySource: contactsBySource,
      },
    };
  } catch (error) {
    console.error("Error fetching contact stats:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch contact statistics",
    };
  }
};

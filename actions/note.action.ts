"use server";

import {
  getCurrentUser,
  verifyTenantPermission,
} from "@/lib/permisions/tenant";
import { prisma } from "@/lib/prisma";

export const createContactNote = async (contactId: string, note: string) => {
  try {
    const { tenantId } = await verifyTenantPermission();
    const session = await getCurrentUser();

    if (!session) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const createNote = await prisma.note.create({
      data: {
        contactId,
        authorId: session.id as string,
        content: note,
        tenantId: tenantId ?? "",
      },
    });

    return {
      success: true,
      data: createNote,
    };
  } catch (err) {
    console.error("Error creating contact note:", err);
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to create contact note",
    };
  }
};

export const getNotes = async () => {
  try {
    const { tenantId } = await verifyTenantPermission();
    const session = await getCurrentUser();

    if (!session) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const notes = await prisma.note.findMany({
      where: {
        tenantId,
        deletedAt: null,
      },
    });

    return {
      success: true,
      data: notes,
    };
  } catch (err) {
    console.error("Error getting notes:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to get notes",
    };
  }
};

"use server";

import {
  getCurrentUser,
  verifyTenantPermission,
} from "@/lib/permisions/tenant";
import { prisma } from "@/lib/prisma";
import { CreateTagInput } from "@/types/tag";

export const getTags = async () => {
  try {
    const tags = await prisma.tag.findMany();

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

export const createTag = async (data: CreateTagInput) => {
  const session = await getCurrentUser();
  const { tenantId } = await verifyTenantPermission();

  if (!session) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }
  try {
    const result = await prisma.tag.create({
      data: {
        ...data,
        createdById: session.id ?? "",
        tenantId: tenantId ?? "",
      },
    });
    return { success: true, tag: result };
  } catch (error) {
    console.error("Error creating tag:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create tag",
    };
  }
};

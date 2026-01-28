"use server";

import { Prisma } from "@/generated/prisma/client";
import {
  getCurrentUser,
  verifyTenantPermission,
} from "@/lib/permisions/tenant";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const getSubscriptions = async () => {
  const session = await getCurrentUser();

  if (session.role !== "ADMIN") {
    return {
      success: false,
      error: "Only administrators can view all tenants subscriptions",
    };
  }

  try {
    const subscriptions = await prisma.subscription.findMany({
      include: {
        tenantSubscriptions: {
          include: {
            tenant: true,
          },
        },
      },
    });

    return { success: true, subscriptions };
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return { success: false, error: "Failed to load subscriptions" };
  }
};

export const getSubscription = async (id: string) => {
  const session = await getCurrentUser();

  if (session.role !== "ADMIN") {
    return {
      success: false,
      error: "Only administrators can view all tenants subscriptions",
    };
  }

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: id as string },
      include: {
        tenantSubscriptions: {
          include: {
            tenant: true,
          },
        },
      },
    });

    return { success: true, subscription };
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return { success: false, error: "Failed to load subscriptions" };
  }
};

export const createSubscription = async (
  formData: Prisma.SubscriptionCreateInput,
) => {
  const session = await getCurrentUser();

  if (!session) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  if (session.role !== "ADMIN") {
    return {
      success: false,
      error: "Only administrators can view all tenants subscriptions",
    };
  }

  try {
    const subscription = await prisma.subscription.create({
      data: {
        plan: formData.plan || "starter",
        description: formData.description ?? "",
        amount: formData.amount || 0,
        popular: formData.popular || false,
      },
    });

    if (!subscription) {
      return { success: false, error: "Failed to create subscription" };
    }

    revalidatePath("/dashboard/subscriptions");

    return { success: true, subscription };
  } catch (error) {
    console.log("Failed to add subscription: ", error);
    return { success: false, error: "Failed to create subscription" };
  }
};

export const getTenantSubscription = async () => {
  const { tenantId } = await verifyTenantPermission();

  try {
    const tenantSubscription = await prisma.tenantSubscription.findUnique({
      where: { tenantId },
    });

    if (!tenantSubscription) {
      return { success: false, error: "No subscription found for tenant" };
    }

    return { success: true, tenant: tenantSubscription };
  } catch (error) {
    console.log("Failed to add subscription: ", error);
    return { success: false, error: "Failed to get subscription" };
  }
};

export const getTenantsSubscription = async (id: string) => {
  const session = await getCurrentUser();

  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  if (session.role !== "ADMIN") {
    return {
      success: false,
      error: "Only administrators can view all tenants subscriptions",
    };
  }

  try {
    const tenantSubscriptions = await prisma.tenantSubscription.findMany({
      where: {
        subscriptionId: id,
      },
      include: {
        subscription: true,
        tenant: true,
      },
    });

    if (!tenantSubscriptions) {
      return { success: false, error: "No subscription found for tenant" };
    }

    return { success: true, subscriptions: tenantSubscriptions };
  } catch (error) {
    console.log("Failed to add subscription: ", error);
    return { success: false, error: "Failed to get subscription" };
  }
};

export const updateSubscription = async (
  id: string,
  data: Prisma.SubscriptionUpdateInput,
) => {
  const session = await getCurrentUser();

  if (session.role !== "ADMIN") {
    return {
      success: false,
      error: "Only administrators can update subscription",
    };
  }

  try {
    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data,
    });

    return { success: true, subscription: updatedSubscription };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to update subscription" };
  }
};

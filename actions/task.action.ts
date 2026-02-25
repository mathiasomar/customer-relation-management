"use server";

import { TaskStatus } from "@/generated/prisma/enums";
import {
  getCurrentUser,
  verifyTenantPermission,
} from "@/lib/permisions/tenant";
import { prisma } from "@/lib/prisma";

export const createContactTask = async (
  contactId: string,
  data: { title: string; taskDate: Date },
) => {
  try {
    const { tenantId } = await verifyTenantPermission();
    const session = await getCurrentUser();

    if (!session) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const createTask = await prisma.task.create({
      data: {
        contactId,
        assigneeId: session.id as string,
        title: data.title,
        dueDate: data.taskDate,
        tenantId: tenantId ?? "",
      },
    });

    return {
      success: true,
      data: createTask,
    };
  } catch (err) {
    console.error("Error creating contact task:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create task",
    };
  }
};

export const updateTaskStatus = async (taskId: string, status: string) => {
  try {
    const session = await getCurrentUser();

    if (!session) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const updateTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: status as TaskStatus },
    });

    return {
      success: true,
      data: updateTask,
    };
  } catch (err) {
    console.error("Error updating task status:", err);
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to update task status",
    };
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    const session = await getCurrentUser();

    if (!session) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const deleteTask = await prisma.task.update({
      where: { id: taskId },
      data: { deletedAt: new Date() },
    });

    return {
      success: true,
      data: deleteTask,
    };
  } catch (err) {
    console.error("Error deleting task:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete task",
    };
  }
};

export const updateTask = async (
  taskId: string,
  data: { title?: string; dueDate?: Date },
) => {
  try {
    const session = await getCurrentUser();

    if (!session) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const updateTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: data.title,
        dueDate: data.dueDate,
      },
    });

    return {
      success: true,
      data: updateTask,
    };
  } catch (err) {
    console.error("Error updating task:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update task",
    };
  }
};

export const getTasks = async () => {
  try {
    const { tenantId } = await verifyTenantPermission();
    const session = await getCurrentUser();

    if (!session) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const tasks = await prisma.task.findMany({
      where: {
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
    });

    return {
      success: true,
      data: tasks,
    };
  } catch (err) {
    console.error("Error getting tasks:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to get tasks",
    };
  }
};

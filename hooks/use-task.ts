"use client";

import {
  createContactTask,
  deleteTask,
  getTasks,
  updateTask,
  updateTaskStatus,
} from "@/actions/task.action";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contactId,
      data,
    }: {
      contactId: string;
      data: { title: string; taskDate: Date };
    }) => {
      const result = await createContactTask(contactId, data);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate all contact-related queries to refresh data
      queryClient.setQueryData(["contact-tasks", variables.contactId], data);
      queryClient.invalidateQueries({
        queryKey: ["contact-tasks", variables.contactId],
      });
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
    onError: (error) => {
      console.error("Failed to create task:", error);
    },
  });
};

export const useTasks = () => {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const result = await getTasks();
      if (!result.success) throw new Error("Failed to fetch Tasks");
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      status,
    }: {
      taskId: string;
      status: string;
    }) => {
      const result = await updateTaskStatus(taskId, status);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate all contact-related queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["contact-tasks"],
      });
      queryClient.invalidateQueries({
        queryKey: ["tasks", variables.taskId],
      });
    },
    onError: (error) => {
      console.error("Failed to update task status:", error);
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const result = await deleteTask(taskId);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      // Invalidate all contact-related queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["contact-tasks"],
      });
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
    onError: (error) => {
      console.error("Failed to delete task:", error);
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      data,
    }: {
      taskId: string;
      data: { title: string; taskDate: Date };
    }) => {
      const result = await updateTask(taskId, data);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate all contact-related queries to refresh data
      queryClient.setQueryData(["contact-tasks", variables.taskId], data);
      queryClient.invalidateQueries({
        queryKey: ["contact-tasks", variables.taskId],
      });
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
    onError: (error) => {
      console.error("Failed to update task:", error);
    },
  });
};

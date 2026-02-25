"use client";

import { createContactTask, getTasks } from "@/actions/task.action";
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

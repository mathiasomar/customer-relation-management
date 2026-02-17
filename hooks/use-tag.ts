"use client";

import { createTag, getTags } from "@/actions/tag.action";
import { CreateTagInput } from "@/types/tag";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useTags = () => {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const result = await getTags();
      if (!result.success) throw new Error(result.error);
      return result.tags;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTagInput) => {
      const result = await createTag(data);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      // Invalidate all contact-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: (error) => {
      console.error("Failed to create tags:", error);
    },
  });
};

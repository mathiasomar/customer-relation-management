"use client";

import {
  getContactActivities,
  getContactActivityTypes,
  LogActivityInput,
  logContactActivity,
} from "@/actions/activity.action";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useLogContactActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contactId,
      data,
    }: {
      contactId: string;
      data: LogActivityInput;
    }) => {
      const result = await logContactActivity(contactId, data);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate all contact-related queries to refresh data
      queryClient.setQueryData(
        ["contact-activities", variables.contactId],
        data,
      );
      queryClient.invalidateQueries({
        queryKey: ["contact-activities", variables.contactId],
      });
    },
    onError: (error) => {
      console.error("Failed to log activity:", error);
    },
  });
};

export const useContactActivities = (contactId: string) => {
  return useQuery({
    queryKey: ["contact-activities", contactId],
    queryFn: async () => {
      const result = await getContactActivities(contactId);
      if (!result.success)
        throw new Error("Failed to fetch contact activities");
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useContactActivityTypes = () => {
  return useQuery({
    queryKey: ["actity-types"],
    queryFn: async () => {
      const result = await getContactActivityTypes();
      if (!result.success) throw new Error("Failed to fetch Types");
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

"use client";

import { createContactNote, getNotes } from "@/actions/note.action";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contactId,
      note,
    }: {
      contactId: string;
      note: string;
    }) => {
      const result = await createContactNote(contactId, note);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate all contact-related queries to refresh data
      queryClient.setQueryData(["contact-notes", variables.contactId], data);
      queryClient.invalidateQueries({
        queryKey: ["contact-notes", variables.contactId],
      });
      queryClient.invalidateQueries({
        queryKey: ["notes"],
      });
    },
    onError: (error) => {
      console.error("Failed to create note:", error);
    },
  });
};

export const useNotes = () => {
  return useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const result = await getNotes();
      if (!result.success) throw new Error("Failed to fetch Notes");
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

"use client";

import {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  bulkDeleteContacts,
  getContactTags,
  getContactActivities,
  getContactNotes,
  getContactTasks,
  getContactDeals,
  getContactOpportunities,
  exportContacts,
  getContactStats,
  getTags,
} from "@/actions/contact.action";
import { Prisma } from "@/generated/prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface ContactFilters {
  search?: string;
  assigneeId?: string;
  tags?: string[];
  isActive?: boolean;
  company?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateContactInput {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  company?: string | null;
  avatar?: string | null;
  timezone?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  facebook?: string | null;
  source?: string | null;
  notes?: string | null;
  assigneeId?: string | null;
  tags?: string[];
}

export interface UpdateContactInput extends Partial<CreateContactInput> {
  isActive?: boolean;
}

// Hook for getting contacts with filters
export const useContacts = (filters: ContactFilters = {}) => {
  return useQuery({
    queryKey: ["contacts", filters],
    queryFn: async () => {
      const result = await getContacts(filters);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for getting a single contact by ID
export const useContact = (contactId: string) => {
  return useQuery({
    queryKey: ["contact", contactId],
    queryFn: async () => {
      const result = await getContact(contactId);
      if (!result.success) throw new Error(result.error);
      return result.contact;
    },
    enabled: !!contactId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for creating a new contact
export const useCreateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Prisma.ContactCreateInput) => {
      const result = await createContact(data);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      // Invalidate all contact-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["contact-stats"] });
    },
    onError: (error) => {
      console.error("Failed to create contact:", error);
    },
  });
};

// Hook for updating a contact
export const useUpdateContact = (contactId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateContactInput) => {
      const result = await updateContact(contactId, data);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      // Invalidate contact queries
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["contact", contactId] });
      queryClient.invalidateQueries({ queryKey: ["contact-stats"] });
    },
    onError: (error) => {
      console.error("Failed to update contact:", error);
    },
  });
};

// Hook for deleting a contact
export const useDeleteContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactId: string) => {
      const result = await deleteContact(contactId);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      // Invalidate contact queries
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["contact-stats"] });
    },
    onError: (error) => {
      console.error("Failed to delete contact:", error);
    },
  });
};

// Hook for bulk deleting contacts
export const useBulkDeleteContacts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactIds: string[]) => {
      const result = await bulkDeleteContacts(contactIds);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      // Invalidate contact queries
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["contact-stats"] });
    },
    onError: (error) => {
      console.error("Failed to bulk delete contacts:", error);
    },
  });
};

// Hook for getting contact tags
export const useContactTags = (contactId: string) => {
  return useQuery({
    queryKey: ["contact-tags", contactId],
    queryFn: async () => {
      const result = await getContactTags(contactId);
      if (!result.success) throw new Error(result.error);
      return result.tags;
    },
    enabled: !!contactId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

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

// Hook for getting contact activities
export const useContactActivities = (contactId: string, limit?: number) => {
  return useQuery({
    queryKey: ["contact-activities", contactId, limit],
    queryFn: async () => {
      const result = await getContactActivities(contactId, limit);
      if (!result.success) throw new Error(result.error);
      return result.activities;
    },
    enabled: !!contactId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for getting contact notes
export const useContactNotes = (contactId: string, limit?: number) => {
  return useQuery({
    queryKey: ["contact-notes", contactId, limit],
    queryFn: async () => {
      const result = await getContactNotes(contactId, limit);
      if (!result.success) throw new Error(result.error);
      return result.notes;
    },
    enabled: !!contactId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for getting contact tasks
export const useContactTasks = (contactId: string, limit?: number) => {
  return useQuery({
    queryKey: ["contact-tasks", contactId, limit],
    queryFn: async () => {
      const result = await getContactTasks(contactId, limit);
      if (!result.success) throw new Error(result.error);
      return result.tasks;
    },
    enabled: !!contactId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for getting contact deals
export const useContactDeals = (contactId: string, limit?: number) => {
  return useQuery({
    queryKey: ["contact-deals", contactId, limit],
    queryFn: async () => {
      const result = await getContactDeals(contactId, limit);
      if (!result.success) throw new Error(result.error);
      return result.deals;
    },
    enabled: !!contactId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for getting contact opportunities
export const useContactOpportunities = (contactId: string, limit?: number) => {
  return useQuery({
    queryKey: ["contact-opportunities", contactId, limit],
    queryFn: async () => {
      const result = await getContactOpportunities(contactId, limit);
      if (!result.success) throw new Error(result.error);
      return result.opportunities;
    },
    enabled: !!contactId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for exporting contacts
export const useExportContacts = () => {
  return useMutation({
    mutationFn: async (filters?: ContactFilters) => {
      const result = await exportContacts(filters);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onError: (error) => {
      console.error("Failed to export contacts:", error);
    },
  });
};

// Hook for getting contact statistics
export const useContactStats = () => {
  return useQuery({
    queryKey: ["contact-stats"],
    queryFn: async () => {
      const result = await getContactStats();
      if (!result.success) throw new Error(result.error);
      return result.stats;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

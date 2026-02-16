"use client";

import {
  createTenant,
  getAdminTenants,
  getAllUserTenants,
  getTenant,
  getTenantMembers,
  getTenantUsage,
  getUserTenantsMembmership,
  getUserTenantsStats,
  inviteMember,
  removeMember,
  switchTenant,
  updateMemberRole,
  updateSubscription,
  updateTenant,
  updateTenantBillingEmail,
  uploadLogo,
} from "@/actions/tenant.action";
import { TenantMemberRole } from "@/generated/prisma/enums";
import { TenantPermissions } from "@/types/tenant";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface CreateTenantTypes {
  name: string;
  slug: string;
  timezone: string;
  currency: string;
  language: string;
  website?: string;
  industry?: string;
}

// Hook for getting current tenant
export const useTenant = () => {
  return useQuery({
    queryKey: ["tenant"],
    queryFn: async () => {
      const result = await getTenant();
      if (!result.success) throw new Error(result.error);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for getting all tenants
export const useAllTenants = () => {
  return useQuery({
    queryKey: ["all-tenants"],
    queryFn: async () => {
      const result = await getAllUserTenants();
      if (!result.success) throw new Error(result.error);
      return result.tenants;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAdminTenants = () => {
  return useQuery({
    queryKey: ["admin-tenants"],
    queryFn: async () => {
      const result = await getAdminTenants();
      if (!result.success) throw new Error(result.error);
      return result.tenants;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTenants = () => {
  return useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const result = await getUserTenantsMembmership();
      if (!result.success) throw new Error(result.error);
      return result.tenants;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for creating a new tenant
export const useCreateTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTenantTypes) => {
      const result = await createTenant(data);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      // Invalidate all tenant-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["tenant"] });
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["all-tenants"] });
      queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-members"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-usage"] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
      queryClient.invalidateQueries({ queryKey: ["user-tenant-count"] });
    },
    onError: (error) => {
      console.error("Failed to create tenant:", error);
    },
  });
};

export const useUploadImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (img: string) => {
      const result = await uploadLogo(img);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      // Invalidate all tenant-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["tenant"] });
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["all-tenants"] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error) => {
      console.error("Failed to create tenant:", error);
    },
  });
};

// Hook for updating tenant settings
export const useUpdateTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Partial<{
        name: string;
        website: string;
        industry: string;
        logo: string;
        timezone: string;
        currency: string;
        language: string;
      }>,
    ) => {
      const result = await updateTenant(data);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate tenant queries
        queryClient.invalidateQueries({ queryKey: ["tenant"] });
        queryClient.invalidateQueries({ queryKey: ["tenant-usage"] });
        queryClient.invalidateQueries({ queryKey: ["all-tenants"] });
        queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
        queryClient.invalidateQueries({ queryKey: ["user-tenant-count"] });
      }
    },
  });
};

export const useUpdateTenantSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Partial<{
        billingEmail: string;
      }>,
    ) => {
      const result = await updateTenantBillingEmail(data);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate tenant queries
        queryClient.invalidateQueries({ queryKey: ["tenant"] });
        queryClient.invalidateQueries({ queryKey: ["tenant-usage"] });
        queryClient.invalidateQueries({ queryKey: ["all-tenants"] });
        queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
        queryClient.invalidateQueries({ queryKey: ["tenant-subscription"] });
        queryClient.invalidateQueries({ queryKey: ["user-tenant-count"] });
      }
    },
  });
};

// Hook for updating subscription
export const useSelectTenantSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { subscriptionId: string }) => {
      const result = await updateSubscription(data);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["tenant"] });
        queryClient.invalidateQueries({ queryKey: ["tenant-usage"] });
        queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
        queryClient.invalidateQueries({ queryKey: ["tenant-subscription"] });
      }
    },
  });
};

// Hook for getting tenant members
export const useTenantMembers = () => {
  return useQuery({
    queryKey: ["tenant-members"],
    queryFn: async () => {
      const result = await getTenantMembers();
      if (!result.success) throw new Error(result.error);
      return result.members;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUserTenantCount = () => {
  return useQuery({
    queryKey: ["user-tenant-count"],
    queryFn: async () => {
      const result = await getUserTenantsStats();
      if (!result.success) throw new Error(result.error);
      return result.stats;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for inviting a new member
export const useInviteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      email: string;
      role: TenantMemberRole;
      permissions?: TenantPermissions;
    }) => {
      const result = await inviteMember(data);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["tenant-members"] });
        queryClient.invalidateQueries({ queryKey: ["tenant-usage"] });
        queryClient.invalidateQueries({ queryKey: ["session"] });
        queryClient.invalidateQueries({ queryKey: ["tenant"] });
        queryClient.invalidateQueries({ queryKey: ["user-tenant-count"] });
      }
    },
  });
};

// Hook for updating member role
export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      ...data
    }: {
      memberId: string;
      role: TenantMemberRole;
      permissions?: TenantPermissions;
    }) => updateMemberRole(memberId, data),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["tenant-members"] });
      }
    },
  });
};

// Hook for removing a member
export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const result = await removeMember(memberId);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["tenant-members"] });
        queryClient.invalidateQueries({ queryKey: ["user-tenant-count"] });
      }
    },
  });
};

// Hook for getting tenant usage statistics
export const useTenantUsage = () => {
  return useQuery({
    queryKey: ["tenant-usage"],
    queryFn: async () => {
      const result = await getTenantUsage();
      if (!result.success) throw new Error(result.error);
      return result;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for switching tenants
export const useSwitchTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tenantId: string) => {
      // Call the switch tenant action with tenantId
      const result = await switchTenant(tenantId);
      return result;
    },
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate all tenant-related queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["tenant"] });
        queryClient.invalidateQueries({ queryKey: ["tenants"] });
        queryClient.invalidateQueries({ queryKey: ["all-tenants"] });
        queryClient.invalidateQueries({ queryKey: ["tenant-members"] });
        queryClient.invalidateQueries({ queryKey: ["tenant-usage"] });
        queryClient.invalidateQueries({ queryKey: ["contact-stats"] });
        queryClient.invalidateQueries({ queryKey: ["contacts"] });

        // Clear session cache to ensure new tenant context is loaded
        queryClient.invalidateQueries({ queryKey: ["session"] });
      }
    },
    onError: (error) => {
      console.error("Failed to switch tenant:", error);
    },
  });
};

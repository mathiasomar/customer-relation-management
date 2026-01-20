"use client";

import {
  createTenant,
  getTenant,
  getTenantMembers,
  getTenantUsage,
  getUserTenantsMembmership,
  inviteMember,
  removeMember,
  switchTenant,
  updateMemberRole,
  updateSubscription,
  updateTenant,
} from "@/actions/tenant.action";
import { UserRole } from "@/generated/prisma/enums";
import { TenantPermissions } from "@/types/tenant";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Hook for getting current tenant
export const useTenant = () => {
  return useQuery({
    queryKey: ["tenant"],
    queryFn: async () => {
      const result = await getTenant();
      if (!result.success) throw new Error(result.error);
      return result.tenant;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for getting all tenants
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
    mutationFn: createTenant,
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate tenant queries
        queryClient.invalidateQueries({ queryKey: ["tenant"] });
        queryClient.invalidateQueries({ queryKey: ["user-tenants"] });
      }
    },
  });
};

// Hook for updating tenant settings
export const useUpdateTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTenant,
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate tenant queries
        queryClient.invalidateQueries({ queryKey: ["tenant"] });
        queryClient.invalidateQueries({ queryKey: ["tenant-usage"] });
      }
    },
  });
};

// Hook for updating subscription
export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSubscription,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["tenant"] });
        queryClient.invalidateQueries({ queryKey: ["tenant-usage"] });
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

// Hook for inviting a new member
export const useInviteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inviteMember,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["tenant-members"] });
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
      role: UserRole;
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
    mutationFn: removeMember,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["tenant-members"] });
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
        queryClient.invalidateQueries({ queryKey: ["tenant-members"] });
        queryClient.invalidateQueries({ queryKey: ["tenant-usage"] });

        // Clear session cache to ensure new tenant context is loaded
        queryClient.invalidateQueries({ queryKey: ["session"] });
      }
    },
  });
};

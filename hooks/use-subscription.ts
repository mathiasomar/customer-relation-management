"use client";

import {
  createSubscription,
  getSubscription,
  getSubscriptions,
  getTenantsSubscription,
  getTenantSubscription,
  updateSubscription,
} from "@/actions/subscription.action";
import { Prisma } from "@/generated/prisma/browser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useSubscriptions = () => {
  return useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const result = await getSubscriptions();
      if (!result.success) throw new Error(result.error);
      return result.subscriptions;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSubscription = (id: string) => {
  return useQuery({
    queryKey: ["subscription", id],
    queryFn: async () => {
      const result = await getSubscription(id);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateSubscrciption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Prisma.SubscriptionCreateInput) => {
      const result = await createSubscription(data);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      // Invalidate all tenant-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["all-tenants"] });
      queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-members"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-usage"] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error) => {
      console.error("Failed to create subscription:", error);
    },
  });
};

export const useTenantSubscription = () => {
  return useQuery({
    queryKey: ["tenant-subscription"],
    queryFn: async () => {
      const result = await getTenantSubscription();
      if (!result.success) throw new Error(result.error);
      return result.tenant;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTenantsSubscription = (id: string) => {
  return useQuery({
    queryKey: ["tenants-subscription"],
    queryFn: async () => {
      const result = await getTenantsSubscription(id);
      if (!result.success) throw new Error(result.error);
      return result.subscriptions;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Prisma.SubscriptionUpdateInput;
    }) => {
      const result = await updateSubscription(id, data);
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate tenant queries
        queryClient.invalidateQueries({
          queryKey: ["subscriptions"],
        });
      }
    },
  });
};

// export const useCreateFeature = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (data: { feature: string; subscriptionId: string }) => {
//       const result = await createFeature(data);
//       if (!result.success) throw new Error(result.error);
//       return result;
//     },
//     onSuccess: () => {
//       // Invalidate all tenant-related queries to refresh data
//       queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
//       queryClient.invalidateQueries({ queryKey: ["tenants"] });
//       queryClient.invalidateQueries({ queryKey: ["all-tenants"] });
//       queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
//       queryClient.invalidateQueries({ queryKey: ["tenant-members"] });
//       queryClient.invalidateQueries({ queryKey: ["tenant-usage"] });
//       queryClient.invalidateQueries({ queryKey: ["session"] });
//     },
//     onError: (error) => {
//       console.error("Failed to create feature:", error);
//     },
//   });
// };

"use client";

import { getUser, getUsers } from "@/actions/user.actions";
import { UserFilters } from "@/types/user";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useUsers = (filters: UserFilters = {}) => {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: async () => {
      const result = getUsers(filters as UserFilters);

      if (!result) {
        throw new Error("Failed to fetch users");
      }

      return result;
    },
    placeholderData: keepPreviousData,
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const result = getUser(id);

      if (!result) {
        throw new Error("Failed to fetch user");
      }

      return result;
    },
    placeholderData: keepPreviousData,
  });
};

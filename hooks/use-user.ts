import { getUsers } from "@/actions/user.actions";
import { UserFilters } from "@/types/user";
import { useQuery } from "@tanstack/react-query";

export const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: ["users", filters],
    queryFn: async () => {
      const result = getUsers(filters as UserFilters);

      if (!result) {
        throw new Error("Failed to fetch users");
      }

      return result;
    },
  });
};

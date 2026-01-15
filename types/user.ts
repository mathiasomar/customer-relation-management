import { UserRole } from "@/generated/prisma/enums";

export interface UserFilters {
  search?: string;
  role?: UserRole;
}

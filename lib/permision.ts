import { UserRole } from "@/generated/prisma/enums";
import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statements = {
  ...defaultStatements,
  contacts: ["create", "read", "update", "delete", "update:own", "delete:own"],
} as const;

export const ac = createAccessControl(statements);

export const roles = {
  [UserRole.AGENT]: ac.newRole({
    contacts: ["create", "read", "update:own", "delete:own"],
  }),
  [UserRole.VIEWER]: ac.newRole({
    contacts: ["read"],
  }),
  [UserRole.ADMIN]: ac.newRole({
    ...adminAc.statements,
    contacts: [
      "create",
      "read",
      "update",
      "delete",
      "update:own",
      "delete:own",
    ],
  }),
};

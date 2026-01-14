import { createAuthClient } from "better-auth/react";
import {
  lastLoginMethodClient,
  inferAdditionalFields,
  adminClient,
} from "better-auth/client/plugins";
import type { auth } from "./auth";
import { ac, roles } from "@/lib/permision";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    lastLoginMethodClient(),
    inferAdditionalFields<typeof auth>(),
    adminClient({ ac, roles }),
  ],
});

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { nextCookies } from "better-auth/next-js";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { normalizeName, VALID_DOMAINS } from "./utils";
import { lastLoginMethod, admin } from "better-auth/plugins";
import { UserRole } from "@/generated/prisma/enums";
import { ac, roles } from "@/lib/permision";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      clientId: String(process.env.GOOGLE_CLIENT_ID),
      clientSecret: String(process.env.GOOGLE_SECRET_KEY),
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_SECRET_KEY as string,
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 1, // 1 days
    updateAge: 60 * 60 * 24, // 24 hours
    additionalFields: {
      tenantId: {
        type: "string",
        input: false,
      },
    },
  },
  user: {
    additionalFields: {
      role: {
        type: [
          "AGENT",
          "ADMIN",
          "MANAGER",
          "VIEWER",
          "USER",
        ] as Array<UserRole>,
        input: false,
      },
    },
  },
  appName: "O-CRM",
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const email = String(ctx.body.email);
        const domain = email.split("@")[1];

        if (!VALID_DOMAINS().includes(domain)) {
          throw new APIError("BAD_REQUEST", {
            message: "Invalid domain. Please use a valid email.",
          });
        }

        const name = normalizeName(ctx.body.name);

        return {
          context: {
            ...ctx,
            body: {
              ...ctx.body,
              name,
            },
          },
        };
      }
    }),
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(";") ?? [];

          if (ADMIN_EMAILS.includes(user.email)) {
            return {
              data: {
                ...user,
                role: UserRole.ADMIN,
              },
            };
          }

          return { data: user };
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          // Get the user's current tenant membership
          const userMemberships = await prisma.tenantMember.findMany({
            where: { userId: session.userId },
            include: { tenant: true },
            orderBy: { joinedAt: "desc" },
          });

          if (userMemberships.length > 0) {
            // Set the tenantId to the user's first tenant (most recently joined)
            return {
              data: {
                ...session,
                tenantId: userMemberships[0].tenantId,
              },
            };
          }

          return { data: session };
        },
      },
      get: {
        after: async (session) => {
          // Always fetch the latest tenantId from the session record
          if (session && session.session?.id) {
            const sessionRecord = await prisma.session.findUnique({
              where: { id: session.session.id },
              select: { tenantId: true },
            });

            if (sessionRecord?.tenantId) {
              // Set tenantId on both session and user for flexibility
              session.session.tenantId = sessionRecord.tenantId;
              session.user.tenantId = sessionRecord.tenantId;
            }
          }

          return session;
        },
      },
    },
  },
  trustedOrigins:
    process.env.NODE_ENV === "production"
      ? [process.env.DORMAIN_URL!]
      : ["http://localhost:3000"],
  plugins: [
    nextCookies(),
    lastLoginMethod(),
    admin({
      defaultRole: UserRole.USER,
      adminRoles: [UserRole.ADMIN],
      ac,
      roles,
    }),
  ],
});

export type ErrorCode = keyof typeof auth.$ERROR_CODES | "UNKNOWN_ERROR";

"use server";

import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/permisions/tenant";
import { prisma } from "@/lib/prisma";
import { UserFilters } from "@/types/user";
import { headers } from "next/headers";

export const getUsers = async (filters: UserFilters = {}) => {
  //   const session = await auth.api.getSession({ headers: headerList });
  //   if (!session) {
  //     return {
  //       error: {
  //         message: "Unauthorized",
  //       },
  //     };
  //   }

  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session?.user) throw new Error("Unauthorized");

  const { search = "", role } = filters;

  const where: Prisma.UserWhereInput = {};

  if (search && search.trim().length >= 2) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (role) where.role = role;

  try {
    const users = await prisma.user.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return users;
  } catch (error) {
    console.log(error);
    return {
      error: {
        message: "Failed to fetch users",
      },
    };
  }
};

export const checkEmail = async (email: string) => {
  const session = getCurrentUser();

  if (!session) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: "Email not found" };
    }

    return { success: true, user };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to check email" };
  }
};

"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { signUpUserSchema } from "./schema";

export const signUpUser = actionClient
  .schema(signUpUserSchema)
  .action(async ({ parsedInput }) => {
    const existingUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, parsedInput.email.toLowerCase()),
    });

    if (existingUser) {
      throw new Error("E-mail já cadastrado.");
    }

    await auth.api.signUpEmail({
      body: parsedInput,
    });

    return { success: true };
  });

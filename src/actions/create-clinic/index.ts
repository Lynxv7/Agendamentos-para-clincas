"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

// 🔹 internos
import { db } from "@/db";
import { clinicsTable, usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

// Tipagem do erro do redirect do Next.js
type RedirectError = {
  digest?: string;
};

export const createClinic = async (name: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const [clinic] = await db.insert(clinicsTable).values({ name }).returning();

    if (!clinic) {
      throw new Error("Falha ao criar clínica");
    }

    await db.insert(usersToClinicsTable).values({
      userId: session.user.id,
      clinicId: clinic.id,
    });

    // 🚀 REDIRECT
    redirect("/dashboard");
  } catch (error: unknown) {
    // Se for redirect do Next.js, deixa passar
    if ((error as RedirectError)?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }

    if (error instanceof Error) {
      console.error("[CREATE_CLINIC_ERROR]", error.message);
    } else {
      console.error("[CREATE_CLINIC_ERROR]", error);
    }

    throw new Error("Erro ao criar clínica");
  }
};

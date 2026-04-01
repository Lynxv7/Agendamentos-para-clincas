"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

export const deletePatient = actionClient
  .schema(
    z.object({
      id: z.number(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    type UserWithClinic = {
      id: string;
      clinic?: {
        id: number;
      };
    };

    const user = session?.user as UserWithClinic;

    if (!user) {
      throw new Error("Unauthorized");
    }

    if (!user.clinic?.id) {
      throw new Error("Clinic not found");
    }

    const patient = await db.query.patientsTable.findFirst({
      where: eq(patientsTable.id, parsedInput.id),
    });

    if (!patient) {
      throw new Error("Paciente não encontrado");
    }

    if (patient.clinicId !== user.clinic.id) {
      throw new Error("Paciente não encontrado");
    }

    await db.delete(patientsTable).where(eq(patientsTable.id, parsedInput.id));

    revalidatePath("/patients");
  });

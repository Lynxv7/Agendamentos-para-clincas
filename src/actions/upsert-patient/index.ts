"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertPatientSchema } from "./schema";

export const upsertPatient = actionClient
  .schema(upsertPatientSchema)
  .action(async ({ parsedInput }) => {
    const { id, ...patientData } = parsedInput;

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

    await db
      .insert(patientsTable)
      .values({
        ...patientData,
        ...(id ? { id } : {}),
        clinicId: user.clinic.id,
      })
      .onConflictDoUpdate({
        target: [patientsTable.id],
        set: {
          ...patientData,
        },
      });

    revalidatePath("/patients");
  });

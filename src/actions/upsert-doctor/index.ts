"use server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertDoctorSchema } from "./schema";

dayjs.extend(utc);

export const upsertDoctor = actionClient
  .schema(upsertDoctorSchema)
  .action(async ({ parsedInput }) => {
    const { id, ...rest } = parsedInput;

    // ⏰ Converter horários
    const availableFromTimeUTC = dayjs()
      .set("hour", parseInt(rest.availableFromTime.split(":")[0]))
      .set("minute", parseInt(rest.availableFromTime.split(":")[1]))
      .set("second", parseInt(rest.availableFromTime.split(":")[2]))
      .utc();

    const availableToTimeUTC = dayjs()
      .set("hour", parseInt(rest.availableToTime.split(":")[0]))
      .set("minute", parseInt(rest.availableToTime.split(":")[1]))
      .set("second", parseInt(rest.availableToTime.split(":")[2]))
      .utc();

    // 🔐 Auth
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

    const clinicId = user.clinic.id;

    // 💾 UPSERT
    await db
      .insert(doctorsTable)
      .values({
        ...rest,
        ...(id ? { id } : {}), // ✅ só envia id se existir
        clinicId,
        availableFromTime: availableFromTimeUTC.format("HH:mm:ss"),
        availableToTime: availableToTimeUTC.format("HH:mm:ss"),
      })
      .onConflictDoUpdate({
        target: [doctorsTable.id],
        set: {
          ...rest,
          availableFromTime: availableFromTimeUTC.format("HH:mm:ss"),
          availableToTime: availableToTimeUTC.format("HH:mm:ss"),
        },
      });

    revalidatePath("/doctors");
  });

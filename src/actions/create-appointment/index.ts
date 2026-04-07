"use server";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { getAvailableTimes } from "../get-available-times";
import { createAppointmentSchema } from "./schema";

dayjs.extend(utc);
dayjs.extend(timezone);

// 🔥 mesmo timezone do sistema inteiro
const TZ = "America/Sao_Paulo";

type SessionUser = {
  clinic?: {
    id: number;
  };
};

export const createAppointment = actionClient
  .schema(createAppointmentSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const user = session.user as typeof session.user & SessionUser;

    if (!user.clinic?.id) {
      throw new Error("Clinic not found");
    }

    // ✅ interpretar como UTC (vem do frontend)
    const appointmentUTC = dayjs.utc(parsedInput.date);

    // ✅ converter para horário local (para validação)
    const appointmentLocal = appointmentUTC.tz(TZ);

    const formattedDate = appointmentLocal.format("YYYY-MM-DD");
    const formattedTime = appointmentLocal.format("HH:mm");

    // 🔍 valida disponibilidade
    const availableTimes = await getAvailableTimes({
      doctorId: String(parsedInput.doctorId),
      date: formattedDate,
    });

    if (!availableTimes?.data) {
      throw new Error("No available times");
    }

    const isTimeAvailable = availableTimes.data.some(
      (time) => time.value === formattedTime && time.available,
    );

    if (!isTimeAvailable) {
      throw new Error("Time not available");
    }

    // 💾 salvar em UTC (PERFEITO)
    await db.insert(appointmentsTable).values({
      patientId: Number(parsedInput.patientId),
      doctorId: Number(parsedInput.doctorId),
      clinicId: user.clinic.id,
      date: appointmentUTC.toDate(), // 🔥 UTC correto
      appointmentPriceInCents: Math.round(parsedInput.appointmentPrice * 100),
    });

    revalidatePath("/appointments");
    revalidatePath("/dashboard");
  });

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { appointmentsTable, doctorsTable } from "@/db/schema";
import { getAvailabilityTimeInTimezone } from "@/helpers/times";
import { auth } from "@/lib/auth";
import { dayjs } from "@/lib/dayjs";
import { actionClient } from "@/lib/next-safe-action";

import { createAppointmentSchema } from "./schema";

type SessionUser = {
  clinic?: {
    id: number;
  };
};

export const createAppointment = actionClient
  .schema(createAppointmentSchema)
  .action(async ({ parsedInput }) => {
    // Buscar sessão e médico em paralelo para reduzir latência
    const [session, doctor] = await Promise.all([
      auth.api.getSession({ headers: await headers() }),
      db.query.doctorsTable.findFirst({
        where: eq(doctorsTable.id, Number(parsedInput.doctorId)),
      }),
    ]);

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const user = session.user as typeof session.user & SessionUser;

    if (!user.clinic?.id) {
      throw new Error("Clinic not found");
    }

    const appointmentUTC = dayjs(parsedInput.date);

    if (!appointmentUTC.isValid()) {
      throw new Error("Invalid date");
    }

    if (!doctor || doctor.clinicId !== user.clinic.id) {
      throw new Error("Médico não encontrado");
    }

    const timeZone = parsedInput.timeZone;
    const formattedDate = appointmentUTC.tz(timeZone).format("YYYY-MM-DD");
    const formattedTime = appointmentUTC.tz(timeZone).format("HH:mm");

    const localFrom = getAvailabilityTimeInTimezone(
      doctor.availableFromTime,
      timeZone,
      formattedDate,
    );
    const localTo = getAvailabilityTimeInTimezone(
      doctor.availableToTime,
      timeZone,
      formattedDate,
    );

    const slot = dayjs.tz(`${formattedDate} ${formattedTime}`, timeZone);
    const from = dayjs.tz(`${formattedDate} ${localFrom}`, timeZone);
    const to = dayjs.tz(`${formattedDate} ${localTo}`, timeZone);

    if (slot.isBefore(from) || !slot.isBefore(to)) {
      throw new Error("Horário fora da disponibilidade do médico");
    }

    // Proteção contra duplo agendamento (race condition)
    const existing = await db.query.appointmentsTable.findFirst({
      where: and(
        eq(appointmentsTable.doctorId, Number(parsedInput.doctorId)),
        eq(appointmentsTable.date, appointmentUTC.toDate()),
      ),
    });

    if (existing) {
      throw new Error("Time already booked");
    }

    await db.insert(appointmentsTable).values({
      patientId: Number(parsedInput.patientId),
      doctorId: Number(parsedInput.doctorId),
      clinicId: user.clinic.id,
      date: appointmentUTC.toDate(), // ✅ UTC correto
      appointmentPriceInCents: Math.round(parsedInput.appointmentPrice * 100),
    });

    revalidatePath("/appointments");
    revalidatePath("/dashboard");
  });

"use server";

import { and, eq, gte, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { upsertAppointmentSchema } from "@/actions/upsert-appointments/schema";
import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { dayjs } from "@/lib/dayjs";
import { actionClient } from "@/lib/next-safe-action";

const upsertAppointment = actionClient
  .schema(upsertAppointmentSchema)
  .action(async ({ parsedInput }) => {
    const { id, ...rest } = parsedInput;

    const session = await auth.api.getSession({
      headers: await headers(), // ✅ corrigido
    });

    type UserWithClinic = {
      id: string;
      clinic?: { id: number };
    };

    const user = session?.user as UserWithClinic;

    if (!user) throw new Error("Unauthorized");
    if (!user.clinic?.id) throw new Error("Clinic not found");

    const patientId = Number(rest.patientId);
    const doctorId = Number(rest.doctorId);

    if (!patientId || !doctorId) {
      throw new Error("Paciente ou médico inválido.");
    }

    // ✅ JÁ VEM EM UTC DO FRONT
    const appointmentUTC = dayjs(rest.date);

    if (!appointmentUTC.isValid()) {
      throw new Error("Data inválida.");
    }

    // 🔥 range do dia em UTC (para query eficiente)
    const startOfDayUTC = appointmentUTC.startOf("day").toDate();
    const endOfDayUTC = appointmentUTC.endOf("day").toDate();

    // 🔥 busca apenas do mesmo dia
    const existingAppointments = await db.query.appointmentsTable.findMany({
      where: and(
        eq(appointmentsTable.doctorId, doctorId),
        gte(appointmentsTable.date, startOfDayUTC),
        lt(appointmentsTable.date, endOfDayUTC),
      ),
    });

    // 🔥 comparação por timestamp (muito mais seguro)
    const hasConflict = existingAppointments.some((appt) => {
      if (id && appt.id === id) return false;

      return dayjs(appt.date).isSame(appointmentUTC);
    });

    if (hasConflict) {
      throw new Error("Horário já está ocupado.");
    }

    // 🔍 validar paciente
    const patient = await db.query.patientsTable.findFirst({
      where: eq(patientsTable.id, patientId),
    });

    if (!patient || patient.clinicId !== user.clinic.id) {
      throw new Error("Paciente inválido.");
    }

    // 🔍 validar médico
    const doctor = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, doctorId),
    });

    if (!doctor || doctor.clinicId !== user.clinic.id) {
      throw new Error("Médico inválido.");
    }

    const appointmentPriceInCents = Math.round(rest.appointmentPrice * 100);

    // 🔥 PROTEÇÃO EXTRA (race condition)
    const alreadyExists = await db.query.appointmentsTable.findFirst({
      where: and(
        eq(appointmentsTable.doctorId, doctorId),
        eq(appointmentsTable.date, appointmentUTC.toDate()),
      ),
    });

    if (alreadyExists && (!id || alreadyExists.id !== id)) {
      throw new Error("Horário já foi reservado.");
    }

    await db
      .insert(appointmentsTable)
      .values({
        ...(id ? { id } : {}),
        patientId,
        doctorId,
        date: appointmentUTC.toDate(), // ✅ UTC
        appointmentPriceInCents,
        clinicId: user.clinic.id,
        description: rest.description ?? null,
      })
      .onConflictDoUpdate({
        target: [appointmentsTable.id],
        set: {
          patientId,
          doctorId,
          date: appointmentUTC.toDate(),
          appointmentPriceInCents,
          description: rest.description ?? null,
        },
      });

    revalidatePath("/appointments");
    revalidatePath("/dashboard");
  });

export default upsertAppointment;

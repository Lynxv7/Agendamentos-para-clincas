"use server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { createAppointmentSchema } from "./schema";

dayjs.extend(utc);

export const createAppointment = actionClient
  .schema(createAppointmentSchema)
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

    // Validar IDs
    const patientId = Number(parsedInput.patientId);
    const doctorId = Number(parsedInput.doctorId);

    if (!patientId || !doctorId) {
      throw new Error("Paciente ou médico inválido.");
    }

    // Validar data com UTC
    const appointmentDate = dayjs.utc(parsedInput.date);

    if (!appointmentDate.isValid()) {
      throw new Error("Data inválida.");
    }

    // Verificar se paciente pertence à clínica
    const patient = await db.query.patientsTable.findFirst({
      where: eq(patientsTable.id, patientId),
    });

    if (!patient || patient.clinicId !== user.clinic.id) {
      throw new Error("Paciente inválido.");
    }

    // Verificar se médico pertence à clínica
    const doctor = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, doctorId),
    });

    if (!doctor || doctor.clinicId !== user.clinic.id) {
      throw new Error("Médico inválido.");
    }

    const appointmentPriceInCents = Math.round(
      parsedInput.appointmentPrice * 100,
    );

    // Inserir
    await db.insert(appointmentsTable).values({
      patientId,
      doctorId,
      date: appointmentDate.toDate(),
      appointmentPriceInCents,
      clinicId: user.clinic.id,
    });

    revalidatePath("/appointments");
  });

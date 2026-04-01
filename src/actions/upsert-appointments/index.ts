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

import { upsertAppointmentSchema } from "./schema";

dayjs.extend(utc);

export const upsertAppointment = actionClient
  .schema(upsertAppointmentSchema)
  .action(async ({ parsedInput }) => {
    // Desestruturação para permitir criação e atualização
    const { id, ...rest } = parsedInput;

    // Autenticação do usuário via BetterAuth
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

    // Converte IDs de paciente e médico em número
    const patientId = Number(rest.patientId);
    const doctorId = Number(rest.doctorId);

    if (!patientId || !doctorId) {
      throw new Error("Paciente ou médico inválido.");
    }

    // Converte data para UTC e valida
    const appointmentDate = dayjs(rest.date).utc();

    if (!appointmentDate.isValid()) {
      throw new Error("Data inválida.");
    }

    // Verifica se o paciente existe e pertence à clínica do usuário
    const patient = await db.query.patientsTable.findFirst({
      where: eq(patientsTable.id, patientId),
    });

    if (!patient || patient.clinicId !== user.clinic.id) {
      throw new Error("Paciente inválido.");
    }

    // Verifica se o médico existe e pertence à clínica do usuário
    const doctor = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, doctorId),
    });

    if (!doctor || doctor.clinicId !== user.clinic.id) {
      throw new Error("Médico inválido.");
    }

    // Converte valor para centavos antes de salvar
    const appointmentPriceInCents = Math.round(rest.appointmentPrice * 100);

    // Inserção ou atualização do agendamento
    await db
      .insert(appointmentsTable)
      .values({
        ...(id ? { id } : {}),
        patientId,
        doctorId,
        date: appointmentDate.toDate(),
        appointmentPriceInCents,
        clinicId: user.clinic.id,
      })
      .onConflictDoUpdate({
        target: [appointmentsTable.id],
        set: {
          patientId,
          doctorId,
          date: appointmentDate.toDate(),
          appointmentPriceInCents,
        },
      });

    // Revalida a página para atualizar a lista de agendamentos
    revalidatePath("/appointments");
  });

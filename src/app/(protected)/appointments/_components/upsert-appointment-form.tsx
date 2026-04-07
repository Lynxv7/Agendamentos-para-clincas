"use server";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { upsertAppointmentSchema } from "@/actions/upsert-appointments/schema";
import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "America/Sao_Paulo";

 const upsertAppointment = actionClient
  .schema(upsertAppointmentSchema)
  .action(async ({ parsedInput }) => {
    const { id, ...rest } = parsedInput;

    const session = await auth.api.getSession({
      headers: await headers(),
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

    // 🔥 RECEBE UTC DO FRONT (correto)
    const appointmentUTC = dayjs.utc(rest.date);

    if (!appointmentUTC.isValid()) {
      throw new Error("Data inválida.");
    }

    // 🔥 CONVERTE PARA LOCAL (para validação)
    const appointmentLocal = appointmentUTC.tz(TZ);

    const formattedDate = appointmentLocal.format("YYYY-MM-DD");
    const formattedTime = appointmentLocal.format("HH:mm");

    // 🔥 VALIDAR CONFLITO
    const existingAppointments = await db.query.appointmentsTable.findMany({
      where: eq(appointmentsTable.doctorId, doctorId),
    });

    const hasConflict = existingAppointments.some((appt) => {
      if (id && appt.id === id) return false;

      const apptLocal = dayjs.utc(appt.date).tz(TZ);

      return (
        apptLocal.format("YYYY-MM-DD") === formattedDate &&
        apptLocal.format("HH:mm") === formattedTime
      );
    });

    if (hasConflict) {
      throw new Error("Horário já está ocupado.");
    }

    // 🔍 VALIDAR PACIENTE
    const patient = await db.query.patientsTable.findFirst({
      where: eq(patientsTable.id, patientId),
    });

    if (!patient || patient.clinicId !== user.clinic.id) {
      throw new Error("Paciente inválido.");
    }

    // 🔍 VALIDAR MÉDICO
    const doctor = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, doctorId),
    });

    if (!doctor || doctor.clinicId !== user.clinic.id) {
      throw new Error("Médico inválido.");
    }

    const appointmentPriceInCents = Math.round(rest.appointmentPrice * 100);

    // 💾 SALVAR EM UTC (correto)
    await db
      .insert(appointmentsTable)
      .values({
        ...(id ? { id } : {}),
        patientId,
        doctorId,
        date: appointmentUTC.toDate(),
        appointmentPriceInCents,
        clinicId: user.clinic.id,
      })
      .onConflictDoUpdate({
        target: [appointmentsTable.id],
        set: {
          patientId,
          doctorId,
          date: appointmentUTC.toDate(),
          appointmentPriceInCents,
        },
      });

    revalidatePath("/appointments");
    revalidatePath("/dashboard");
  });


  export default upsertAppointment;
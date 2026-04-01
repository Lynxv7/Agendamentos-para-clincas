"use server";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { and, eq, gte, lte } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable, doctorsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getAvailableTimes = actionClient
  .schema(
    z.object({
      doctorId: z.string(),
      date: z.string(), // YYYY-MM-DD
      timeZone: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { doctorId, date, timeZone } = parsedInput;
    const TZ = timeZone;

    // 🔐 sessão
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

    const doctorIdNumber = Number(doctorId);
    if (Number.isNaN(doctorIdNumber)) {
      throw new Error("Médico inválido");
    }

    // 👨‍⚕️ buscar médico
    const doctor = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, doctorIdNumber),
    });
    if (!doctor) throw new Error("Médico não encontrado");

    // 📅 DATA LOCAL
    const selectedDateLocal = dayjs.tz(date + " 00:00", TZ).startOf("day");
    const nowLocal = dayjs().tz(TZ);

    // ❌ bloquear dias passados
    if (selectedDateLocal.isBefore(nowLocal, "day")) {
      return [];
    }

    // 📅 validar dia da semana
    const selectedDay = selectedDateLocal.day();
    const isAvailableDay =
      selectedDay >= doctor.availableFromWeekDay &&
      selectedDay <= doctor.availableToWeekDay;
    if (!isAvailableDay) return [];

    // ⏰ horário do médico (LOCAL)
    const fromLocal = dayjs.tz(`${date} ${doctor.availableFromTime}`, TZ);
    const toLocal = dayjs.tz(`${date} ${doctor.availableToTime}`, TZ);

    // 📊 gerar slots de 30 em 30 minutos
    const timeSlots: string[] = [];
    let cursor = fromLocal;
    while (cursor.isBefore(toLocal) || cursor.isSame(toLocal)) {
      timeSlots.push(cursor.format("HH:mm"));
      cursor = cursor.add(30, "minute");
    }

    // ⛔ buscar agendamentos existentes (UTC → LOCAL)
    const startOfDayUTC = selectedDateLocal.startOf("day").utc().toDate();
    const endOfDayUTC = selectedDateLocal.endOf("day").utc().toDate();

    const appointments = await db.query.appointmentsTable.findMany({
      where: and(
        eq(appointmentsTable.doctorId, doctorIdNumber),
        gte(appointmentsTable.date, startOfDayUTC),
        lte(appointmentsTable.date, endOfDayUTC),
      ),
    });

    const busyTimes = new Set(
      appointments.map((appointment) =>
        dayjs.utc(appointment.date).tz(TZ).format("HH:mm"),
      ),
    );

    // 🔍 filtrar horários válidos
    const validSlots = timeSlots.filter((time) => {
      const slotTime = dayjs.tz(`${date} ${time}`, TZ);

      // ⏱️ horário futuro
      const isFutureTime = selectedDateLocal.isSame(nowLocal, "day")
        ? slotTime.isAfter(nowLocal)
        : true;

      // ✅ disponível e futuro
      return isFutureTime && !busyTimes.has(time);
    });

    // ✅ retorno final
    return validSlots.map((time) => ({
      value: time,
      available: !busyTimes.has(time),
    }));
  });

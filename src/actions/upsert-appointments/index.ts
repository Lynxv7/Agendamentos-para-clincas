"use server";

import { and, eq, gte, lt } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable, doctorsTable } from "@/db/schema";
import {
  generateTimeSlots,
  getAvailabilityTimeInTimezone,
} from "@/helpers/times";
import { auth } from "@/lib/auth";
import { dayjs } from "@/lib/dayjs"; // ✅ padrão global
import { actionClient } from "@/lib/next-safe-action";

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

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) throw new Error("Unauthorized");

    const doctor = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, Number(doctorId)),
    });

    if (!doctor) throw new Error("Médico não encontrado");

    // 🔥 DATA NO TIMEZONE DO USUÁRIO
    const selectedDate = dayjs.tz(date, timeZone);

    // 🔥 RANGE EM UTC (correto para DB)
    const startUTC = selectedDate.startOf("day").utc().toDate();
    const endUTC = selectedDate.endOf("day").utc().toDate();

    const appointments = await db.query.appointmentsTable.findMany({
      where: and(
        eq(appointmentsTable.doctorId, Number(doctorId)),
        gte(appointmentsTable.date, startUTC),
        lt(appointmentsTable.date, endUTC), // ✅ evita duplicação na borda
      ),
    });

    // 🔥 horários ocupados no timezone do usuário
    const busyTimes = new Set(
      appointments.map((a) => dayjs(a.date).tz(timeZone).format("HH:mm")),
    );

    const localAvailableFrom = getAvailabilityTimeInTimezone(
      doctor.availableFromTime,
      timeZone,
      date,
    );
    const localAvailableTo = getAvailabilityTimeInTimezone(
      doctor.availableToTime,
      timeZone,
      date,
    );

    const slots = generateTimeSlots(localAvailableFrom, localAvailableTo, 30);
    const now = dayjs().tz(timeZone);

    return slots.map((time) => {
      const slot = dayjs.tz(`${date} ${time}`, timeZone);

      const from = dayjs.tz(`${date} ${localAvailableFrom}`, timeZone);

      const to = dayjs.tz(`${date} ${localAvailableTo}`, timeZone);

      // ✅ não permitir slot exatamente no horário final
      const isWithin = !slot.isBefore(from) && slot.isBefore(to);

      // ✅ lógica de futuro corrigida
      const isFuture = slot.isAfter(now);

      return {
        value: time,
        available: isWithin && isFuture && !busyTimes.has(time),
      };
    });
  });

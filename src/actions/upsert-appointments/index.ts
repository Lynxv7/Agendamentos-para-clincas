"use server";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { and, eq, gte, lte } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable, doctorsTable } from "@/db/schema";
import { generateTimeSlots } from "@/helpers/times";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getAvailableTimes = actionClient
  .schema(
    z.object({
      doctorId: z.string(),
      date: z.string(),
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

    // ✅ DATA LOCAL CORRETA
    const selectedDate = dayjs.tz(`${date} 00:00`, timeZone);

    // ✅ RANGE EM UTC (para banco)
    const startUTC = selectedDate.startOf("day").utc().toDate();
    const endUTC = selectedDate.endOf("day").utc().toDate();

    const appointments = await db.query.appointmentsTable.findMany({
      where: and(
        eq(appointmentsTable.doctorId, Number(doctorId)),
        gte(appointmentsTable.date, startUTC),
        lte(appointmentsTable.date, endUTC),
      ),
    });

    // ✅ horários ocupados (LOCAL)
    const busyTimes = new Set(
      appointments.map((a) => dayjs.utc(a.date).tz(timeZone).format("HH:mm")),
    );

    const slots = generateTimeSlots();

    const now = dayjs().tz(timeZone);

    return slots.map((time) => {
      const slot = dayjs.tz(`${date} ${time}`, timeZone);

      const from = dayjs.tz(`${date} ${doctor.availableFromTime}`, timeZone);
      const to = dayjs.tz(`${date} ${doctor.availableToTime}`, timeZone);

      const isWithin = !slot.isBefore(from) && !slot.isAfter(to);

      const isFuture = selectedDate.isSame(now, "day")
        ? slot.isAfter(now)
        : true;

      return {
        value: time,
        available: isWithin && isFuture && !busyTimes.has(time),
      };
    });
  });

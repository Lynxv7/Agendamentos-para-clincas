"use server";

import { and, eq, gte, lt } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable, doctorsTable } from "@/db/schema";
import {
  generateTimeSlots,
  getAvailabilityTimeInTimezone,
} from "@/helpers/times";
import { dayjs } from "@/lib/dayjs";
import { actionClient } from "@/lib/next-safe-action";

export const getAvailableTimes = actionClient
  .schema(
    z.object({
      doctorId: z.string(),
      date: z.string(), // yyyy-MM-dd
      timeZone: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { doctorId, date, timeZone } = parsedInput;

    const doctor = await db.query.doctorsTable.findFirst({
      where: eq(doctorsTable.id, Number(doctorId)),
    });

    if (!doctor) return [];

    // Buscar agendamentos do médico no dia selecionado
    const selectedDate = dayjs.tz(`${date} 00:00`, timeZone);
    const startUTC = selectedDate.startOf("day").utc().toDate();
    const endUTC = selectedDate.endOf("day").utc().toDate();

    const appointments = await db.query.appointmentsTable.findMany({
      where: and(
        eq(appointmentsTable.doctorId, Number(doctorId)),
        gte(appointmentsTable.date, startUTC),
        lt(appointmentsTable.date, endUTC),
      ),
    });

    const bookedTimes = new Set(
      appointments.map((a) => dayjs(a.date).tz(timeZone).format("HH:mm")),
    );

    // Converter horário de disponibilidade do UTC para o fuso do usuário
    const localFrom = getAvailabilityTimeInTimezone(
      doctor.availableFromTime,
      timeZone,
      date,
    );
    const localTo = getAvailabilityTimeInTimezone(
      doctor.availableToTime,
      timeZone,
      date,
    );

    // Gerar slots a cada 30 minutos dentro da janela de disponibilidade
    const slots = generateTimeSlots(localFrom, localTo, 30);

    const now = dayjs().tz(timeZone);

    return slots.map((time, index) => {
      const slot = dayjs.tz(`${date} ${time}`, timeZone);
      const isPast = !slot.isAfter(now);
      const isBooked = bookedTimes.has(time);

      // Aviso: o slot imediatamente anterior (30 min antes) está ocupado
      const prevTime = index > 0 ? slots[index - 1] : null;
      const hasPreviousBooking =
        !isPast && !isBooked && prevTime !== null && bookedTimes.has(prevTime);

      return {
        value: time,
        available: !isPast && !isBooked,
        hasPreviousBooking,
      };
    });
  });

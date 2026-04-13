import { and, count, desc, eq, gte, lte, sql, sum } from "drizzle-orm";

import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { dayjs } from "@/lib/dayjs";

interface Params {
  from: string;
  to: string;
  clinicId: number;
}

export const getDashboard = async ({ from, to, clinicId }: Params) => {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  const chartStartDate = dayjs().subtract(10, "days").startOf("day").toDate();
  const chartEndDate = dayjs().add(10, "days").endOf("day").toDate();

  const todayStart = dayjs().startOf("day").toDate();
  const todayEnd = dayjs().endOf("day").toDate();

  const [
    totalRevenueResult,
    totalAppointmentsResult,
    totalPatientsResult,
    totalDoctorsResult,
    topDoctors,
    topSpecialties,
    dailyAppointments,
    todayAppointments,
  ] = await Promise.all([
    db
      .select({
        total: sum(appointmentsTable.appointmentPriceInCents),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, clinicId),
          gte(appointmentsTable.date, fromDate),
          lte(appointmentsTable.date, toDate),
        ),
      ),

    db
      .select({ total: count() })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, clinicId),
          gte(appointmentsTable.date, fromDate),
          lte(appointmentsTable.date, toDate),
        ),
      ),

    db
      .select({ total: count() })
      .from(patientsTable)
      .where(eq(patientsTable.clinicId, clinicId)),

    db
      .select({ total: count() })
      .from(doctorsTable)
      .where(eq(doctorsTable.clinicId, clinicId)),

    db
      .select({
        id: doctorsTable.id,
        name: doctorsTable.name,
        avatarImageUrl: doctorsTable.avatarImageUrl,
        specialty: doctorsTable.specialty,
        appointmentsCount: count(appointmentsTable.id),
      })
      .from(doctorsTable)
      .leftJoin(
        appointmentsTable,
        and(
          eq(appointmentsTable.doctorId, doctorsTable.id),
          gte(appointmentsTable.date, fromDate),
          lte(appointmentsTable.date, toDate),
        ),
      )
      .where(eq(doctorsTable.clinicId, clinicId))
      .groupBy(doctorsTable.id)
      .orderBy(desc(count(appointmentsTable.id)))
      .limit(10),

    db
      .select({
        specialty: doctorsTable.specialty,
        appointmentsCount: count(appointmentsTable.id),
      })
      .from(appointmentsTable)
      .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
      .where(
        and(
          eq(appointmentsTable.clinicId, clinicId),
          gte(appointmentsTable.date, fromDate),
          lte(appointmentsTable.date, toDate),
        ),
      )
      .groupBy(doctorsTable.specialty)
      .orderBy(desc(count(appointmentsTable.id))),

    db
      .select({
        date: sql<string>`DATE(${appointmentsTable.date})`,
        appointments: count(appointmentsTable.id),
        revenue: sum(appointmentsTable.appointmentPriceInCents),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, clinicId),
          gte(appointmentsTable.date, chartStartDate),
          lte(appointmentsTable.date, chartEndDate),
        ),
      )
      .groupBy(sql`DATE(${appointmentsTable.date})`)
      .orderBy(sql`DATE(${appointmentsTable.date})`),

    db
      .select({
        id: appointmentsTable.id,
        date: appointmentsTable.date,
        description: appointmentsTable.description,
        patient: {
          name: patientsTable.name,
        },
        doctor: {
          name: doctorsTable.name,
        },
      })
      .from(appointmentsTable)
      .innerJoin(
        patientsTable,
        eq(appointmentsTable.patientId, patientsTable.id),
      )
      .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
      .where(
        and(
          eq(appointmentsTable.clinicId, clinicId),
          gte(appointmentsTable.date, todayStart),
          lte(appointmentsTable.date, todayEnd),
        ),
      )
      .orderBy(appointmentsTable.date),
  ]);

  const totalRevenue = Number(totalRevenueResult[0]?.total ?? 0);
  const totalAppointments = Number(totalAppointmentsResult[0]?.total ?? 0);
  const totalPatients = Number(totalPatientsResult[0]?.total ?? 0);
  const totalDoctors = Number(totalDoctorsResult[0]?.total ?? 0);

  return {
    totalRevenue,
    totalAppointments,
    totalPatients,
    totalDoctors,
    topDoctors,
    topSpecialties,
    dailyAppointments,
    todayAppointments,
  };
};

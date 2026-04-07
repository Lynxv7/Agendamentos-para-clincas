"use server";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { AppointmentsTable } from "./_components/appoitments-table";
import NewAppointmentDialog from "./_components/new-appointment-dialog";

// 🔥 CONFIG TIMEZONE
dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "America/Sao_Paulo";

const AppointmentsPage = async () => {
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

  if (!session?.user) {
    redirect("/authentication");
  }

  if (!user.clinic?.id) {
    redirect("/clinic-form");
  }

  const clinicId = user.clinic.id;

  // 🚀 paralelismo
  const [patients, doctors, appointments] = await Promise.all([
    db.query.patientsTable.findMany({
      where: eq(patientsTable.clinicId, clinicId),
    }),
    db.query.doctorsTable.findMany({
      where: eq(doctorsTable.clinicId, clinicId),
    }),
    db.query.appointmentsTable.findMany({
      where: eq(appointmentsTable.clinicId, clinicId),
      with: {
        patient: true,
        doctor: true,
      },
      orderBy: asc(appointmentsTable.date),
    }),
  ]);

  // ✅ CORREÇÃO DE TIMEZONE AQUI
  const formattedAppointments = appointments.map((appointment) => ({
    ...appointment,
    date: dayjs.utc(appointment.date).tz(TZ).toDate(),
  }));

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Agendamentos</PageTitle>
          <PageDescription>Veja os agendamentos e crie novos.</PageDescription>
        </PageHeaderContent>

        <PageActions>
          <NewAppointmentDialog patients={patients} doctors={doctors} />
        </PageActions>
      </PageHeader>

      <PageContent>
        <AppointmentsTable
          data={formattedAppointments}
          patients={patients}
          doctors={doctors}
        />
      </PageContent>
    </PageContainer>
  );
};

export default AppointmentsPage;

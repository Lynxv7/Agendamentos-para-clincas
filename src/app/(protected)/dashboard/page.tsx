import { and, count, eq, gte, lte, sql, sum } from "drizzle-orm";
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
import { dayjs } from "@/lib/dayjs";

import { DatePicker } from "./_components/date-picker";
import { RevenueChart } from "./_components/revenue-charts";
import DashboardCards from "./_components/stats-cards";

interface DashboardPageProps {
  searchParams?: {
    from?: string;
    to?: string;
  };
}

type Clinic = {
  id: number;
  name: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  clinic?: Clinic;
};

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  const user: User = session.user;

  if (!user.clinic) {
    redirect("/clinic-form");
  }

  if (!searchParams?.from || !searchParams?.to) {
    redirect(
      `/dashboard?from=${dayjs().format("YYYY-MM-DD")}&to=${dayjs()
        .add(1, "month")
        .format("YYYY-MM-DD")}`,
    );
  }

  const fromDate = new Date(searchParams.from);
  const toDate = new Date(searchParams.to);
  const clinicId = user.clinic.id;

  // QUERIES
  const [
    totalRevenueResult,
    totalAppointmentsResult,
    totalPatientsResult,
    totalDoctorsResult,
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
  ]);

  const totalRevenue = Number(totalRevenueResult[0]?.total ?? 0);
  const totalAppointments = Number(totalAppointmentsResult[0]?.total ?? 0);
  const totalPatients = Number(totalPatientsResult[0]?.total ?? 0);
  const totalDoctors = Number(totalDoctorsResult[0]?.total ?? 0);

  // PERÍODO DO GRÁFICO — deve ser idêntico à janela renderizada pelo componente RevenuChart
  // O gráfico exibe dayjs().subtract(10, 'days') até dayjs().add(10, 'days') (21 dias)
  const chartStartDate = dayjs().subtract(10, "days").startOf("day").toDate();
  const chartEndDate = dayjs().add(10, "days").endOf("day").toDate();

  const daylyAppointments = await db
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
    .orderBy(sql`DATE(${appointmentsTable.date})`);

  return (
    <div className="bg-gray-100">
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Dashboard</PageTitle>
            <PageDescription>
              Gerencie os pacientes da sua clínica.
            </PageDescription>
          </PageHeaderContent>

          <PageActions>
            <DatePicker />
          </PageActions>
        </PageHeader>

        <PageContent>
          <DashboardCards
            totalRevenue={totalRevenue}
            totalAppointments={totalAppointments}
            totalPatients={totalPatients}
            totalDoctors={totalDoctors}
          />

          <div className="grid grid-cols-[2.25fr_1fr] gap-4">
            <RevenueChart
              daylyAppointmentsData={daylyAppointments.map((d) => ({
                ...d,
                revenue: Number(d.revenue ?? 0),
              }))}
            />
          </div>
        </PageContent>
      </PageContainer>
    </div>
  );
};

export default DashboardPage;

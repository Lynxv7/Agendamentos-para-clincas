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
import { getDashboard } from "@/data/get-dashboard";
import { auth } from "@/lib/auth";
import { dayjs } from "@/lib/dayjs";

import { DatePicker } from "./_components/date-picker";
import { TopDoctors } from "./_components/doctors-list";
import { RevenueChart } from "./_components/revenue-charts";
import { TopSpecialties } from "./_components/specialties-list";
import DashboardCards from "./_components/stats-cards";
import { TodayAppointments } from "./_components/today-appointments";

interface DashboardPageProps {
  searchParams?: {
    from?: string;
    to?: string;
  };
}

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  const clinicId = (session.user as { clinic?: { id: number }; plan?: string | null }).clinic?.id;
  const plan = (session.user as { plan?: string | null }).plan;

  if (!clinicId) {
    redirect("/clinic-form");
  }

  if (plan !== "essential") {
    redirect("/subscription-required");
  }

  if (!searchParams?.from || !searchParams?.to) {
    redirect(
      `/dashboard?from=${dayjs().format("YYYY-MM-DD")}&to=${dayjs()
        .add(1, "month")
        .format("YYYY-MM-DD")}`,
    );
  }

  const {
    totalRevenue,
    totalAppointments,
    totalPatients,
    totalDoctors,
    topDoctors,
    topSpecialties,
    dailyAppointments,
    todayAppointments,
  } = await getDashboard({
    from: searchParams.from,
    to: searchParams.to,
    clinicId,
  });

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
              daylyAppointmentsData={dailyAppointments.map((d) => ({
                ...d,
                revenue: Number(d.revenue ?? 0),
              }))}
            />
            <div className="flex flex-col gap-4">
              <TopDoctors doctors={topDoctors} />
              <TopSpecialties specialty={topSpecialties} />
            </div>
          </div>

          <TodayAppointments appointments={todayAppointments} />
        </PageContent>
      </PageContainer>
    </div>
  );
};

export default DashboardPage;

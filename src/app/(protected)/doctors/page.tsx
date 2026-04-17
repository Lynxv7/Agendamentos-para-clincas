import { eq } from "drizzle-orm";
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
import { doctorsTable } from "@/db/schema";
import { getDoctorLimitByPlan } from "@/helpers/plan";
import { auth } from "@/lib/auth";

import AddDoctorButton from "./_components/add-doctor-button";
import DoctorCard from "./_components/doctor-card";

const DoctorsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Tipagem correta
  type UserWithClinic = {
    id: string;
    plan?: string | null;
    clinic?: {
      id: number;
    };
  };

  const user = session?.user as UserWithClinic;

  if (!user) {
    redirect("/authentication");
  }

  if (!user.clinic?.id) {
    redirect("/clinic-form");
  }

  const plan = (session?.user as { plan?: string | null })?.plan;
  if (plan !== "essential") {
    redirect("/subscription-required");
  }

  const doctors = await db.query.doctorsTable.findMany({
    where: eq(doctorsTable.clinicId, user.clinic.id),
  });
  const doctorLimit = getDoctorLimitByPlan(plan);
  const hasReachedDoctorLimit = doctors.length >= doctorLimit;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Médicos</PageTitle>
          <PageDescription>
            Gerencie os médicos da sua clínica. {doctors.length}/{doctorLimit}{" "}
            vagas utilizadas no plano Essential.
            {hasReachedDoctorLimit
              ? " Limite de cadastro atingido para este plano."
              : " Ainda há vagas disponíveis para novos cadastros."}
          </PageDescription>
        </PageHeaderContent>

        <PageActions>
          <AddDoctorButton disabled={hasReachedDoctorLimit} />
        </PageActions>
      </PageHeader>

      <PageContent>
        <div className="grid grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default DoctorsPage;

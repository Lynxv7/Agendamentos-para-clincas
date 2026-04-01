import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { DataTable } from "@/components/ui/data-table";
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
import { patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import AddPatientButton from "./_components/add-patient-button";
import { columns } from "./_components/table-columns";

const PatientsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Tipagem correta
  type UserWithClinic = {
    id: string;
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

  // Buscar pacientes
  const patients = await db.query.patientsTable.findMany({
    where: eq(patientsTable.clinicId, user.clinic.id),
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Pacientes</PageTitle>
          <PageDescription>
            Gerencie os pacientes da sua clínica.
          </PageDescription>
        </PageHeaderContent>

        <PageActions>
          <AddPatientButton />
        </PageActions>
      </PageHeader>

      <PageContent>
        <DataTable columns={columns} data={patients} />
      </PageContent>
    </PageContainer>
  );
};

export default PatientsPage;

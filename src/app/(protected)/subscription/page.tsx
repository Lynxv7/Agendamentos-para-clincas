import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { auth } from "@/lib/auth";

import { PlanCard } from "./_components/subscripition-plan";

type SessionUser = {
  clinic?: { id: number; name: string | undefined };
  plan?: string | null;
};

const SubscriptionPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  const user = session.user as typeof session.user & SessionUser;

  if (!user.clinic) {
    redirect("/clinic-form");
  }

  const hasActivePlan = user.plan === "essential";

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Assinatura</PageTitle>
          <PageDescription>Gerencie a sua assinatura</PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <PlanCard active={hasActivePlan} 
        userEmail={session.user.email}/>
      </PageContent>
    </PageContainer>
  );
};

export default SubscriptionPage;

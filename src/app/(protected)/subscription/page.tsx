import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";

import { PlanCard } from "./_components/subscripition-plan";

const SubscriptionPage = () => {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Assinatura</PageTitle>
          <PageDescription>Gerencie a sua assinatura</PageDescription>
        </PageHeaderContent>

        <PageActions></PageActions>
      </PageHeader>

      <PageContent>
        <PlanCard/>
      </PageContent>
    </PageContainer>
  );
};

export default SubscriptionPage;

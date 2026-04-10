"use client";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { createStripeCheckout } from "@/actions/create-stripe-checkout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

interface PlanCardProps {
  active?: boolean;
  className?: string;
  userEmail?: string;
}

export function PlanCard({ active = false, userEmail }: PlanCardProps) {
  const router = useRouter();
  const createStripeCheckoutAction = useAction(createStripeCheckout, {
    onSuccess: ({
      data,
    }: {
      data?: { sessionId: string; url: string | null };
    }) => {
      if (!data?.url) {
        toast.error("Não foi possível iniciar o pagamento. Tente novamente.");
        return;
      }
      window.location.href = data.url;
    },
    onError: () => {
      toast.error("Erro ao criar sessão de pagamento. Tente novamente.");
    },
  });
  const features = [
    "Cadastro de até 3 médicos",
    "Agendamentos ilimitados",
    "Métricas básicas",
    "Cadastro de pacientes",
    "Confirmação manual",
    "Suporte via e-mail",
  ];

  const handleSubscribeClick = () => {
    createStripeCheckoutAction.execute();
  };

  const handleManagePlanClick = () => {
    router.push(
      `${process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL}?prefilled_email=${userEmail}`,
    );
  };

  return (
    <Card className="w-full max-w-sm rounded-2xl shadow-lg">
      <CardHeader className="space-y-2 pb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-foreground text-2xl font-bold">Essential</h2>
          {active && (
            <Badge className="bg-emerald-100 px-3 py-1 font-medium text-emerald-600 hover:bg-emerald-100">
              Atual
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground text-sm">
          Para profissionais autônomos ou pequenas clínicas
        </p>
        <div className="pt-2">
          <span className="text-foreground text-3xl font-bold">R$59,90</span>
          <span className="text-muted-foreground ml-1">/ mês</span>
        </div>
      </CardHeader>

      <CardContent className="border-t pt-6">
        <ul className="space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" />
              <span className="text-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-4">
        <Button
          variant="outline"
          className="border-foreground/20 hover:bg-muted w-full rounded-full py-6 text-base font-medium"
          onClick={active ? handleManagePlanClick: handleSubscribeClick}
          disabled={createStripeCheckoutAction.isExecuting}
        >
          {active ? "Gerenciar assinatura" : "Fazer assinatura"}
        </Button>
      </CardFooter>
    </Card>
  );
}

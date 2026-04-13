import { CalendarCheck, Clock, Shield, Star, Users } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { PlanCard } from "@/app/(protected)/subscription/_components/subscripition-plan";
import { auth } from "@/lib/auth";

type SessionUser = {
  clinic?: { id: number; name: string | undefined };
  plan?: string | null;
};

const benefits = [
  {
    icon: CalendarCheck,
    title: "Agendamentos ilimitados",
    description: "Gerencie todos os seus agendamentos sem restrições.",
  },
  {
    icon: Users,
    title: "Gestão de pacientes",
    description: "Cadastre e acompanhe o histórico de cada paciente.",
  },
  {
    icon: Star,
    title: "Métricas e relatórios",
    description: "Acompanhe o desempenho da sua clínica em tempo real.",
  },
  {
    icon: Clock,
    title: "Economia de tempo",
    description: "Automatize processos e foque no que importa: seus pacientes.",
  },
  {
    icon: Shield,
    title: "Dados seguros",
    description: "Seus dados e dos seus pacientes protegidos com segurança.",
  },
];

const SubscriptionRequiredPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  const user = session.user as typeof session.user & SessionUser;

  // Se já tem plano ativo, verifica se tem clínica
  if (user.plan === "essential") {
    if (!user.clinic) {
      redirect("/clinic-form");
    }
    redirect("/dashboard");
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* HEADER */}
      <header className="border-b px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-xl font-bold">Doutor Agenda</span>
          <span className="text-muted-foreground text-sm">
            Olá, {session.user.name}
          </span>
        </div>
      </header>

      {/* HERO */}
      <section className="from-primary/5 to-background flex flex-col items-center bg-gradient-to-b px-6 py-16 text-center">
        <div className="bg-primary/10 text-primary mb-4 rounded-full px-4 py-1.5 text-sm font-medium">
          Acesso restrito
        </div>
        <h1 className="text-foreground max-w-2xl text-4xl leading-tight font-bold">
          Ative seu plano e desbloqueie tudo que sua clínica precisa
        </h1>
        <p className="text-muted-foreground mt-4 max-w-xl text-lg">
          Você está a um passo de transformar a gestão da sua clínica. Assine o
          plano Essential e tenha acesso completo à plataforma.
        </p>
      </section>

      {/* MAIN CONTENT */}
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-start gap-12 px-6 py-12 md:flex-row md:items-start md:justify-between">
        {/* BENEFÍCIOS */}
        <div className="flex-1 space-y-6">
          <h2 className="text-foreground text-2xl font-semibold">
            O que você ganha com o Essential
          </h2>
          <div className="space-y-5">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex items-start gap-4">
                <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                  <benefit.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-foreground font-semibold">
                    {benefit.title}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PLANO */}
        <div className="flex w-full flex-col items-center gap-4 md:w-auto">
          <PlanCard active={false} userEmail={session.user.email} />
          <p className="text-muted-foreground text-center text-xs">
            Cancele quando quiser. Sem multas ou taxas ocultas.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t px-6 py-6 text-center">
        <p className="text-muted-foreground text-sm">
          Dúvidas? Entre em contato com o suporte.
        </p>
      </footer>
    </div>
  );
};

export default SubscriptionRequiredPage;

import {
  ArrowRight,
  CalendarCheck2,
  ChartColumn,
  Clock3,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Doutor Agenda | Gestão simples para clínicas",
  description:
    "Centralize agendamentos, médicos, pacientes e indicadores em uma única plataforma feita para clínicas.",
};

const valueCards = [
  {
    icon: CalendarCheck2,
    title: "Agenda sem conflito",
    description:
      "Organize consultas, horários disponíveis e encaixes sem depender de planilhas ou mensagens soltas.",
  },
  {
    icon: Users,
    title: "Pacientes e médicos no mesmo fluxo",
    description:
      "Cadastre equipe, pacientes e histórico operacional em poucos cliques, com visão centralizada da clínica.",
  },
  {
    icon: ChartColumn,
    title: "Decisão com números",
    description:
      "Acompanhe produtividade, ocupação e receita para crescer com mais previsibilidade e menos improviso.",
  },
];

const highlights = [
  "Implantação rápida, sem curva longa para a equipe.",
  "Plano Essential ideal para começar com até 3 médicos.",
  "Fluxo pensado para recepção, gestão e atendimento em um só lugar.",
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_34%),linear-gradient(180deg,#f8fbff_0%,#eef5ff_42%,#ffffff_100%)] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 lg:px-10">
        <header className="flex items-center justify-between rounded-full border border-white/60 bg-white/70 px-5 py-3 shadow-[0_10px_35px_rgba(15,23,42,0.08)] backdrop-blur">
          <div>
            <p className="text-lg font-extrabold tracking-tight">
              Doutor Agenda
            </p>
            <p className="text-xs text-slate-600">
              Gestão clínica com foco em agilidade operacional
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="border-slate-200 bg-white"
          >
            <Link href="/auth">Acessar App</Link>
          </Button>
        </header>

        <section className="relative grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.2fr_0.8fr] lg:py-20">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-800">
              <Clock3 className="h-4 w-4" />
              Comece hoje e reduza o caos operacional da clínica em minutos
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-4xl leading-tight font-black tracking-tight text-slate-950 md:text-5xl lg:text-6xl">
                Pare de perder tempo com agenda manual e centralize toda a sua
                clínica em um único painel.
              </h1>

              <p className="max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
                O Doutor Agenda organiza agendamentos, pacientes, equipe médica
                e indicadores para você operar com mais controle, menos
                retrabalho e uma experiência melhor para quem atende e para quem
                agenda.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full px-7 text-base shadow-[0_18px_45px_rgba(37,99,235,0.28)]"
              >
                <Link href="/auth">
                  Começar Agora
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-full border-slate-200 bg-white px-7 text-base"
              >
                <a href="#beneficios">Ver benefícios</a>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/70 bg-white/80 p-4 text-sm leading-6 text-slate-700 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -rotate-3 rounded-4xl bg-slate-900/5 blur-2xl" />
            <div className="relative overflow-hidden rounded-4xl border border-white/80 bg-slate-950 p-7 text-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-sky-200">
                    Visão operacional
                  </p>
                  <h2 className="text-2xl font-bold">Tudo no mesmo fluxo</h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80">
                  Facilidade imediata
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-white/6 p-5">
                  <div className="mb-2 flex items-center gap-2 text-sky-200">
                    <Stethoscope className="h-4 w-4" />
                    <span className="text-sm font-medium">Equipe médica</span>
                  </div>
                  <p className="text-sm leading-6 text-white/80">
                    Controle de profissionais, disponibilidade por dia e horário
                    e limite operacional alinhado ao plano para manter sua
                    estrutura previsível desde o início.
                  </p>
                </div>

                <div className="rounded-2xl bg-white/6 p-5">
                  <div className="mb-2 flex items-center gap-2 text-emerald-200">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Processo confiável
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-white/80">
                    Cadastro com autenticação, gestão por clínica e acesso
                    organizado para você ganhar clareza sem complicar o dia a
                    dia.
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-5">
                  <p className="text-xs font-semibold tracking-[0.2em] text-amber-200 uppercase">
                    Ação recomendada
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/85">
                    Se sua operação ainda depende de papel, WhatsApp e planilhas
                    separadas, este é o melhor momento para padronizar o fluxo
                    antes que o volume cresça.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="beneficios" className="space-y-8 py-6 lg:py-10">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm font-semibold tracking-[0.2em] text-sky-700 uppercase">
              Por que usar esta aplicação?
            </p>
            <h2 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
              Menos operação manual, mais tempo para fazer a clínica girar.
            </h2>
            <p className="text-base leading-7 text-slate-600 md:text-lg">
              Cada área da plataforma foi desenhada para reduzir atrito na
              rotina da clínica e facilitar a tomada de decisão com uma visão
              clara da operação.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {valueCards.map((card) => (
              <article
                key={card.title}
                className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
              >
                <div className="mb-4 inline-flex rounded-2xl bg-sky-100 p-3 text-sky-700">
                  <card.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-950">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="prova" className="py-8 lg:py-12">
          <div className="rounded-4xl border border-slate-200 bg-white px-6 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:px-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="space-y-3">
                <p className="text-sm font-semibold tracking-[0.2em] text-emerald-700 uppercase">
                  Confiança e autoridade
                </p>
                <h2 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
                  Feito para clínicas que precisam crescer com organização, não
                  com improviso.
                </h2>
                <p className="max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
                  Do cadastro do paciente ao acompanhamento dos indicadores, a
                  plataforma reúne o fluxo essencial para reduzir ruído
                  operacional e criar uma rotina mais previsível para a equipe.
                </p>
              </div>

              <Button
                asChild
                size="lg"
                className="h-12 rounded-full px-7 text-base"
              >
                <Link href="/auth">Acessar App</Link>
              </Button>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-4 border-t border-slate-200/80 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <p>
            © 2026 Doutor Agenda. Gestão clínica com foco em clareza e
            velocidade.
          </p>
          <nav className="flex flex-wrap items-center gap-5">
            <a href="#beneficios" className="hover:text-slate-950">
              Benefícios
            </a>
            <a href="#prova" className="hover:text-slate-950">
              Como funciona
            </a>
            <Link href="/authentication" className="hover:text-slate-950">
              Autenticação
            </Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}

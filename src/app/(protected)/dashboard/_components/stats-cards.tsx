"use client";

import { CalendarDays, DollarSign, Stethoscope,Users } from "lucide-react";

interface DashboardCardsProps {
  totalRevenue: number;
  totalAppointments: number;
  totalPatients: number;
  totalDoctors: number;
}

const DashboardCards = ({
  totalRevenue,
  totalAppointments,
  totalPatients,
  totalDoctors,
}: DashboardCardsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Faturamento */}
      <div className="flex items-center justify-between rounded-xl border bg-white p-5">
        <div>
          <p className="text-sm text-gray-500">Faturamento</p>
          <h3 className="gap-4text-2xl font-semibold">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(totalRevenue / 100)}
          </h3>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
          <DollarSign className="h-5 w-5 text-blue-600" />
        </div>
      </div>

      {/* Agendamentos */}
      <div className="flex items-center justify-between rounded-xl border bg-white p-5">
        <div>
          <p className="text-sm text-gray-500">Agendamentos</p>
          <h3 className="text-2xl font-semibold">{totalAppointments}</h3>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
          <CalendarDays className="h-5 w-5 text-blue-600" />
        </div>
      </div>

      {/* Pacientes */}
      <div className="flex items-center justify-between rounded-xl border bg-white p-5">
        <div>
          <p className="text-sm text-gray-500">Pacientes</p>
          <h3 className="text-2xl font-semibold">{totalPatients}</h3>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
          <Users className="h-5 w-5 text-blue-600" />
        </div>
      </div>

      {/* Médicos */}
      <div className="flex items-center justify-between rounded-xl border bg-white p-5">
        <div>
          <p className="text-sm text-gray-500">Médicos</p>
          <h3 className="text-2xl font-semibold">{totalDoctors}</h3>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
          <Stethoscope className="h-5 w-5 text-blue-600" />
        </div>
      </div>
    </div>
  );
};

export default DashboardCards;

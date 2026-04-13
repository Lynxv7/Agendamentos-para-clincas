"use client";

import { ColumnDef } from "@tanstack/react-table";

import { dayjs } from "@/lib/dayjs";

import AppointmentsTableActions from "./table-action";

export type Appointment = {
  id: number;
  date: Date;
  patientId: number;
  doctorId: number;
  appointmentPriceInCents: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  clinicId: number;
  patient: {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
    sex: "male" | "female";
  };
  doctor: {
    id: number;
    name: string;
    specialty: string;
  };
};

export const getColumns = (userTimezone: string): ColumnDef<Appointment>[] => [
  {
    id: "patient",
    header: "Paciente",
    accessorFn: (row) => row.patient?.name ?? "-",
    cell: (params) => params.row.original.patient?.name ?? "-",
  },
  {
    id: "doctor",
    header: "Médico",
    accessorFn: (row) => row.doctor?.name ?? "-",
    cell: (params) => params.row.original.doctor?.name ?? "-",
  },
  {
    id: "date",
    header: "Data",
    accessorFn: (row) => row.date,
    cell: (params) => {
      const date = params.row.original.date;

      // CORRETO: usa timezone do usuário
      return dayjs(date).tz(userTimezone).format("DD/MM/YYYY HH:mm");
    },
  },
  {
    id: "specialty",
    header: "Especialidade",
    accessorFn: (row) => row.doctor?.specialty ?? "-",
    cell: (params) => params.row.original.doctor?.specialty ?? "-",
  },
  {
    id: "description",
    header: "Descrição",
    accessorFn: (row) => row.description ?? "-",
    cell: (params) => (
      <span
        className="block max-w-50 truncate"
        title={params.row.original.description ?? ""}
      >
        {params.row.original.description || "-"}
      </span>
    ),
  },
  {
    id: "price",
    header: "Valor",
    accessorFn: (row) => row.appointmentPriceInCents,
    cell: (params) =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(params.row.original.appointmentPriceInCents / 100),
  },
  {
    id: "actions",
    cell: (params) => {
      const appointment = params.row.original;

      return <AppointmentsTableActions appointment={appointment} />;
    },
  },
];

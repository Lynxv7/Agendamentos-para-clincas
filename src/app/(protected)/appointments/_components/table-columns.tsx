"use client";

import { ColumnDef } from "@tanstack/react-table";

import { dayjs } from "@/lib/dayjs"; // ✅ padrão global

import AppointmentTableAction from "./table-action";
import type {
  UpsertAppointmentFormDoctor,
  UpsertAppointmentFormPatient,
} from "./upsert-appointment-form";

export type Appointment = {
  id: number;
  date: Date;
  patientId: number;
  doctorId: number;
  appointmentPriceInCents: number;
  serviceType?: string | null;
  description?: string | null;
  patient?: {
    name: string;
  } | null;
  doctor?: {
    name: string;
    specialty?: string | null;
  } | null;
};

type NewType = UpsertAppointmentFormDoctor;

export const getColumns = (
  patients: UpsertAppointmentFormPatient[],
  doctors: NewType[],
  userTimezone: string, // ✅ NOVO
): ColumnDef<Appointment>[] => [
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

      // ✅ CORRETO: usa timezone do usuário
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
        className="block max-w-[200px] truncate"
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

      return (
        <AppointmentTableAction
          appointment={appointment}
          patients={patients}
          doctors={doctors}
        />
      );
    },
  },
];

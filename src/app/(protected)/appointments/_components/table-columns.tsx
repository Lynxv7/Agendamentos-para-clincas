"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

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
  patient?: {
    name: string;
  } | null;
  doctor?: {
    name: string;
  } | null;
};

export const getColumns = (
  patients: UpsertAppointmentFormPatient[],
  doctors: UpsertAppointmentFormDoctor[],
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
    cell: (params) =>
      format(new Date(params.row.original.date), "dd/MM/yyyy HH:mm"),
  },
  {
    id: "doctor",
    header: "Especialidade",
    accessorKey: "doctor.specialty",
    cell: (params) => params.row.original.doctor?.specialty ?? "-",
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

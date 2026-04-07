"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";

import { type Appointment,getColumns } from "./table-columns";

interface Patient {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date | null;
  clinicId: number;
  phoneNumber: string;
  sex: "male" | "female";
}

interface Doctor {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date | null;
  clinicId: number;
  phoneNumber: string;
  sex: "male" | "female";
  avatarImageUrl: string | null;
  availableFromWeekDay: number;
  availableToWeekDay: number;
  availableFromTime: string;
  availableToTime: string;
  specialty: string;
  appointmentPriceInCents: number;
}

interface Props {
  data: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
}

export function AppointmentsTable({ data, patients, doctors }: Props) {
  const columns = getColumns(patients, doctors) as ColumnDef<
    Appointment,
    unknown
  >[];

  return <DataTable columns={columns} data={data} />;
}

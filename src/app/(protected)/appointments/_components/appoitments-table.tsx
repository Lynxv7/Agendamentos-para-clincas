"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";
import { dayjs } from "@/lib/dayjs"; // ✅ adicionar

import { type Appointment, getColumns } from "./table-columns";

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
  createdAt: Date;
  updatedAt: Date | null;
  clinicId: number;
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
  // timezone do usuário
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // normalizar datas antes de passar para tabela
  const normalizedData = data.map((appointment) => ({
    ...appointment,
    // cria campo formatado seguro
    localDate: dayjs(appointment.date).tz(userTimezone).format("DD/MM/YYYY"),
    localTime: dayjs(appointment.date).tz(userTimezone).format("HH:mm"),
  }));

  const columns = getColumns(
    patients,
    doctors,
    userTimezone, // 👈 importante passar
  ) as ColumnDef<Appointment, unknown>[];

  return <DataTable columns={columns} data={normalizedData} />;
}

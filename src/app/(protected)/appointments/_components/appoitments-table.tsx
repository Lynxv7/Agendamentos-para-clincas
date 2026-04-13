"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";

import { type Appointment, getColumns } from "./table-columns";

interface Props {
  data: Appointment[];
}

export function AppointmentsTable({ data }: Props) {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const columns = getColumns(userTimezone) as ColumnDef<Appointment, unknown>[];

  return <DataTable columns={columns} data={data} />;
}

"use client";

import { ColumnDef } from "@tanstack/react-table";

import { patientsTable } from "@/db/schema";

import PatientsTableAction from "./table-action";

export type Patient = typeof patientsTable.$inferSelect;

export const columns: ColumnDef<Patient>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Nome",
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "phoneNumber",
    accessorKey: "phoneNumber",
    header: "Telefone",
  },
  {
    id: "sex",
    accessorKey: "sex",
    header: "Sexo",
    cell: (params) => {
      const patient = params.row.original;
      return patient.sex === "male" ? "Masculino" : "Feminino";
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const patient = params.row.original;

      return <PatientsTableAction patient={patient} />;
    },
  },
];

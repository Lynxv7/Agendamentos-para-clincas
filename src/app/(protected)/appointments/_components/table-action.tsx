"use client";

import { EditIcon, MoreVerticalIcon, Trash2Icon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import React, { useState } from "react";
import { toast } from "sonner";

import { deleteAppointment } from "@/actions/delete-appointment";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Appointment } from "./table-columns";
import UpsertAppointmentForm, {
  UpsertAppointmentFormDoctor,
  UpsertAppointmentFormPatient,
} from "./upsert-appointment-form";

interface AppointmentTableActionProps {
  appointment: Appointment;
  patients: UpsertAppointmentFormPatient[];
  doctors: UpsertAppointmentFormDoctor[];
}

const AppointmentTableAction = ({
  appointment,
  patients,
  doctors,
}: AppointmentTableActionProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const deleteAppointmentAction = useAction(deleteAppointment, {
    onSuccess: () => {
      setDeleteDialogOpen(false);
      toast.success("Agendamento deletado com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao deletar agendamento.");
    },
  });

  const handleDeleteAppointmentClick = () => {
    deleteAppointmentAction.execute({ id: appointment.id });
  };

  const appointmentFormValues = {
    id: appointment.id,
    patientId: appointment.patientId.toString(),
    doctorId: appointment.doctorId.toString(),
    appointmentPrice: appointment.appointmentPriceInCents / 100,
    date:
      appointment.date instanceof Date
        ? appointment.date.toISOString()
        : appointment.date,
    serviceType: appointment.serviceType ?? "",
  };

  return (
    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVerticalIcon size={18} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{appointment.patient?.name ?? "Agendamento"}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
            <EditIcon className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-500"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2Icon className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Tem certeza que deseja deletar este agendamento?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser revertida. O agendamento será removido do banco de dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAppointmentClick}>
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UpsertAppointmentForm
        appointment={appointmentFormValues}
        patients={patients}
        doctors={doctors}
        onSuccess={() => setEditDialogOpen(false)}
      />
    </Dialog>
  );
};

export default AppointmentTableAction;

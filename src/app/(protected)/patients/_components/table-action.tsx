"use client";

import { EditIcon, MoreVerticalIcon, Trash2Icon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import React, { useState } from "react";
import { toast } from "sonner";

import { deletePatient } from "@/actions/delete-patient";
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

import { Patient } from "./table-columns";
import UpsertPatientForm from "./upsert-patient-form";

interface PatientsTableActionProps {
  patient: Patient;
}

const PatientsTableAction = ({ patient }: PatientsTableActionProps) => {
  const [upsertDialogOpen, setUpsertDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const deletePatientAction = useAction(deletePatient, {
    onSuccess: () => {
      setDeleteDialogOpen(false);
      toast.success("Paciente deletado com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao deletar paciente.");
    },
  });

  const handleDeletePatientClick = () => {
    if (!patient) return;
    deletePatientAction.execute({ id: patient.id });
  };

  return (
    <Dialog open={upsertDialogOpen} onOpenChange={setUpsertDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVerticalIcon size={18} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{patient.name}</DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setUpsertDialogOpen(true)}>
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
              Tem certeza que deseja deletar esse paciente?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser revertida. O paciente será removido do banco de dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePatientClick}>
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UpsertPatientForm
        patient={patient}
        onSuccess={() => setUpsertDialogOpen(false)}
      />
    </Dialog>
  );
};

export default PatientsTableAction;

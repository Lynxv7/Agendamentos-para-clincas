import { z } from "zod";

export const upsertAppointmentSchema = z.object({
  // ID opcional para permitir atualização de agendamentos existentes
  id: z.number().optional(),

  // Paciente selecionado para o agendamento
  patientId: z.string().trim().min(1, {
    message: "Paciente é obrigatório.",
  }),

  // Médico selecionado para o agendamento
  doctorId: z.string().trim().min(1, {
    message: "Médico é obrigatório.",
  }),

  // Valor da consulta em reais
  appointmentPrice: z.number().min(1, {
    message: "Valor da consulta é obrigatório.",
  }),

  // Data e horário do agendamento
  date: z.string().trim().min(1, {
    message: "Data é obrigatória.",
  }),

  // Tipo de serviço opcional
  serviceType: z.string().optional(),
});

export type UpsertAppointmentSchema = z.infer<typeof upsertAppointmentSchema>;

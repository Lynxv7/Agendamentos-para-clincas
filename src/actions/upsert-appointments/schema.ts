import { z } from "zod";

export const upsertAppointmentSchema = z.object({
  id: z.number().optional(),

  patientId: z.string().trim().min(1, {
    message: "Paciente é obrigatório.",
  }),

  doctorId: z.string().trim().min(1, {
    message: "Médico é obrigatório.",
  }),

  appointmentPrice: z.number().min(1, {
    message: "Valor da consulta é obrigatório.",
  }),

  // 🔥 valida ISO (UTC)
  date: z.string().datetime({
    message: "Data deve estar em formato ISO válido.",
  }),

  serviceType: z.string().optional(),

  description: z.string().optional(),
});

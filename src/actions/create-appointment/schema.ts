import { z } from "zod";

export const createAppointmentSchema = z.object({
  patientId: z.string().trim().min(1, {
    message: "Paciente é obrigatório.",
  }),
  doctorId: z.string().trim().min(1, {
    message: "Médico é obrigatório.",
  }),
  appointmentPrice: z.number().min(1, {
    message: "Valor da consulta é obrigatório.",
  }),
  date: z.string().trim().min(1, {
    message: "Data é obrigatória.",
  }),
  serviceType: z.string().optional(),
});



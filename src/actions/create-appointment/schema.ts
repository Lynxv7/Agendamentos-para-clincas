import dayjs from "dayjs";
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

  // 🔥 valida ISO string (UTC)
  date: z
    .string()
    .trim()
    .min(1, { message: "Data é obrigatória." })
    .refine((value) => dayjs(value).isValid(), {
      message: "Data inválida.",
    }),

  serviceType: z.string().optional(),
});

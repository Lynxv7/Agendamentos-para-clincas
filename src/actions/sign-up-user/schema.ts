import { z } from "zod";

export const passwordRequirementMessage =
  "A senha deve conter pelo menos 8 caracteres, 1 letra maiúscula e 1 número ou caractere especial.";

export const signUpUserSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  email: z
    .string()
    .trim()
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido"),
  password: z
    .string()
    .trim()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .regex(
      /^(?=.*[A-Z])(?=.*(?:\d|[^A-Za-z0-9])).+$/,
      passwordRequirementMessage,
    ),
});

export type SignUpUserInput = z.infer<typeof signUpUserSchema>;

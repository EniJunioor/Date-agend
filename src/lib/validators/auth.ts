import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter ao menos 2 caracteres")
    .max(100, "Nome muito longo"),
  email: z.string().email("E-mail inválido").toLowerCase(),
  password: z
    .string()
    .min(8, "Senha deve ter ao menos 8 caracteres")
    .regex(/[A-Z]/, "Senha deve conter ao menos uma letra maiúscula")
    .regex(/[0-9]/, "Senha deve conter ao menos um número"),
});

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido").toLowerCase(),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido").toLowerCase(),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Senha deve ter ao menos 8 caracteres")
      .regex(/[A-Z]/, "Senha deve conter ao menos uma letra maiúscula")
      .regex(/[0-9]/, "Senha deve conter ao menos um número"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

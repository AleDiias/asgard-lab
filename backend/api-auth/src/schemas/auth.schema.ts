import { z } from "zod";

const emailSchema = z.string().email("E-mail inválido").trim().toLowerCase();
const passwordSchema = z.string().min(8, "Senha deve ter no mínimo 8 caracteres");

/** Header X-Tenant-Domain é validado pelo middleware e repassado ao handler. */
export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
    type: z.enum(["forgot", "activation"]).optional().default("forgot"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Token é obrigatório").trim(),
    newPassword: passwordSchema,
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

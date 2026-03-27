import { z } from "zod";

export const dialerProviderSchema = z.enum(["vonix", "aspect", "3c", "custom"]);

export const integrationCreateBodySchema = z.object({
  provider: dialerProviderSchema,
  name: z.string().min(1, "Nome é obrigatório.").max(255),
  baseUrl: z.string().url("URL base inválida.").max(2048),
  credentials: z.object({
    apiKey: z.string().min(1, "API Key é obrigatória."),
  }),
  isActive: z.boolean().optional(),
});

export type IntegrationCreateBody = z.infer<typeof integrationCreateBodySchema>;

export const integrationIdParamSchema = z.object({
  id: z.string().uuid("ID de integração inválido."),
});

export const integrationUpdateBodySchema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório.").max(255).optional(),
    isActive: z.boolean().optional(),
    baseUrl: z.string().url("URL base inválida.").max(2048).optional(),
    credentials: z
      .object({
        apiKey: z.string().min(1, "API Key é obrigatória."),
      })
      .optional(),
  })
  .refine((b) => b.name !== undefined || b.isActive !== undefined || b.baseUrl !== undefined || b.credentials !== undefined, {
    message: "Nada a atualizar.",
  });

export type IntegrationUpdateBody = z.infer<typeof integrationUpdateBodySchema>;

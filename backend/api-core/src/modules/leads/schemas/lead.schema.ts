import { z } from "zod";

export const leadStatusSchema = z.enum(["novo", "em_atendimento", "finalizado"]);

export const createLeadBodySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório.").max(255),
  phone: z.string().min(1, "Telefone é obrigatório.").max(32),
  email: z.union([z.string().email("E-mail inválido."), z.literal("")]).optional(),
  status: leadStatusSchema.optional(),
});

export type CreateLeadBody = z.infer<typeof createLeadBodySchema>;

export const updateLeadBodySchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    phone: z.string().min(1).max(32).optional(),
    email: z.union([z.string().email("E-mail inválido."), z.literal("")]).optional(),
    status: leadStatusSchema.optional(),
  })
  .refine((o) => Object.keys(o).length > 0, {
    message: "Envie ao menos um campo para atualizar.",
  });

export type UpdateLeadBody = z.infer<typeof updateLeadBodySchema>;

export const listLeadsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  q: z.string().optional(),
  status: leadStatusSchema.optional(),
  importBatchId: z.string().uuid().optional(),
  sort: z
    .enum([
      "created_at_desc",
      "created_at_asc",
      "name_asc",
      "name_desc",
      "phone_asc",
      "phone_desc",
      "status_asc",
      "status_desc",
    ])
    .optional(),
});

export type ListLeadsQuery = z.infer<typeof listLeadsQuerySchema>;

export const importBatchesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export type ImportBatchesQuery = z.infer<typeof importBatchesQuerySchema>;

export const leadIdParamSchema = z.object({
  id: z.string().uuid("ID inválido."),
});

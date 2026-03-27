import { z } from "zod";

export const campaignCreateBodySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório.").max(255),
  integrationId: z.string().uuid().optional().nullable(),
  queueId: z.string().min(1).max(255).optional().nullable(),
});

export type CampaignCreateBody = z.infer<typeof campaignCreateBodySchema>;

export const campaignSyncLeadsBodySchema = z
  .object({
    leadIds: z.array(z.string().uuid()).optional(),
    importBatchId: z.string().uuid().optional(),
    importBatchIds: z.array(z.string().uuid()).optional(),
  })
  .refine(
    (b) =>
      (Array.isArray(b.leadIds) && b.leadIds.length > 0) ||
      Boolean(b.importBatchId?.trim()) ||
      (Array.isArray(b.importBatchIds) && b.importBatchIds.length > 0),
    { message: "Informe leadIds (pelo menos um), importBatchId ou importBatchIds." }
  );

export type CampaignSyncLeadsBody = z.infer<typeof campaignSyncLeadsBodySchema>;

export const campaignIdParamSchema = z.object({
  id: z.string().uuid("ID de campanha inválido."),
});

export const campaignUpdateBodySchema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório.").max(255).optional(),
    integrationId: z.string().uuid().optional().nullable(),
    queueId: z.string().min(1).max(255).optional().nullable(),
    status: z.enum(["draft", "syncing", "active", "paused", "completed"]).optional(),
  })
  .refine((b) => b.name !== undefined || b.integrationId !== undefined || b.queueId !== undefined || b.status !== undefined, {
    message: "Nada a atualizar.",
  });

export type CampaignUpdateBody = z.infer<typeof campaignUpdateBodySchema>;

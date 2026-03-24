import { z } from "zod";
import { COLUMN_MAP_NONE } from "@/components/screens/leads/import/types";

/** IDs estáveis alinhados ao `StepperProgressUI` e validação Zod no container. */
export const LEAD_IMPORT_STEP_IDS = ["file", "mapping", "import"] as const;
export type LeadImportStepId = (typeof LEAD_IMPORT_STEP_IDS)[number];

export const leadImportStepFileSchema = z.object({
  fileName: z.string().min(1, "Selecione um arquivo CSV."),
});

export const leadImportStepMappingSchema = z.object({
  nameColumn: z
    .string()
    .refine((v) => Boolean(v && v !== COLUMN_MAP_NONE), "Mapeie a coluna Nome."),
  phoneColumn: z
    .string()
    .refine((v) => Boolean(v && v !== COLUMN_MAP_NONE), "Mapeie a coluna Telefone."),
});

export type LeadImportStepFileValues = z.infer<typeof leadImportStepFileSchema>;
export type LeadImportStepMappingValues = z.infer<typeof leadImportStepMappingSchema>;

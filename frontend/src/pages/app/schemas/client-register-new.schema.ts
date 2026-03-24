import { z } from "zod";

import type { ClientFormFieldErrors } from "@/components/screens/client-register";

/** Campos comuns create/edit (validação na orquestração). */
export const clientRegisterFormFieldsSchema = z.object({
  companyName: z.string().min(1, "Informe o nome da empresa."),
  cnpj: z
    .string()
    .min(1, "Informe o CNPJ.")
    .refine((v) => v.replace(/\D/g, "").length === 14, "CNPJ inválido."),
  billingDate: z.string().min(1, "Selecione a data de vencimento."),
  ownerEmail: z.string().min(1, "Informe o e-mail.").email("E-mail inválido."),
  phone: z.string().min(1, "Informe o telefone."),
  domain: z
    .string()
    .min(1, "Informe o domínio (subdomínio).")
    .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, "Use apenas letras minúsculas, números e hífen."),
  moduleIds: z.array(z.string()).min(1, "Selecione ao menos um módulo."),
});

export const clientRegisterNewSchema = clientRegisterFormFieldsSchema;

export function mapZodErrorToClientFormFieldErrors(error: z.ZodError): ClientFormFieldErrors {
  const fieldErrors: ClientFormFieldErrors = {};
  const flat = error.flatten().fieldErrors;
  const keys = [
    "companyName",
    "cnpj",
    "billingDate",
    "ownerEmail",
    "phone",
    "domain",
    "moduleIds",
    "accountStatus",
  ] as const;
  for (const key of keys) {
    const msg = flat[key]?.[0];
    if (msg) {
      if (key === "moduleIds") {
        fieldErrors.modules = msg;
      } else {
        fieldErrors[key] = msg;
      }
    }
  }
  return fieldErrors;
}

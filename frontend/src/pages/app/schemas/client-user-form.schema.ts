import { z } from "zod";

import type { ClientUserFormFieldErrors } from "@/components/screens/client-users";

const base = z.object({
  name: z.string().min(1, "Informe o nome."),
  email: z.string().min(1, "Informe o e-mail.").email("E-mail inválido."),
  permissionIds: z.array(z.string()).min(1, "Selecione ao menos uma permissão."),
});

export const clientUserNewFormSchema = base;

export const clientUserEditFormSchema = base.extend({
  status: z.enum(["active", "inactive"]),
});

export function mapZodErrorToClientUserFormFieldErrors(
  error: z.ZodError
): ClientUserFormFieldErrors {
  const fieldErrors: ClientUserFormFieldErrors = {};
  const flat = error.flatten().fieldErrors;
  const keys = ["name", "email", "permissionIds", "status"] as const;
  for (const key of keys) {
    const msg = flat[key]?.[0];
    if (msg) {
      if (key === "permissionIds") {
        fieldErrors.permissions = msg;
      } else {
        fieldErrors[key] = msg;
      }
    }
  }
  return fieldErrors;
}

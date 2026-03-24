import { z } from "zod";

import type { AsgardUserFormFieldErrors } from "@/components/screens/asgard-users";

export const asgardUserFormSchema = z.object({
  name: z.string().min(1, "Informe o nome."),
  email: z.string().min(1, "Informe o e-mail.").email("E-mail inválido."),
});

export function mapZodErrorToAsgardUserFormFieldErrors(
  error: z.ZodError
): AsgardUserFormFieldErrors {
  const fieldErrors: AsgardUserFormFieldErrors = {};
  const flat = error.flatten().fieldErrors;
  if (flat.name?.[0]) fieldErrors.name = flat.name[0];
  if (flat.email?.[0]) fieldErrors.email = flat.email[0];
  return fieldErrors;
}

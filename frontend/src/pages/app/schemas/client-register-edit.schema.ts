import { z } from "zod";

import { clientRegisterFormFieldsSchema } from "@/pages/app/schemas/client-register-new.schema";

export const clientRegisterEditSchema = clientRegisterFormFieldsSchema.extend({
  accountStatus: z.enum(["active", "inactive"]),
});

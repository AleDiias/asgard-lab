import type { TenantDb } from "@/infra/database/tenant/connection-manager.js";
import type { AuthenticatedUser } from "./auth.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      tenantDb?: TenantDb;
      tenantContext?: {
        tenantId: string;
        domain: string;
        databaseName: string;
      };
    }
  }
}

export {};

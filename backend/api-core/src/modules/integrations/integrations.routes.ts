import { Router } from "express";
import {
  PERMISSION_INTEGRATIONS_READ,
  PERMISSION_INTEGRATIONS_WRITE,
} from "@/constants/permissions.js";
import { requireAuth } from "@/middlewares/require-auth.middleware.js";
import { requirePermission } from "@/middlewares/require-permission.middleware.js";
import { createResolveTenantDbMiddleware } from "@/middlewares/resolve-tenant-db.middleware.js";
import { tenantMasterRepository } from "@/shared/repositories/tenant-master.repository.drizzle.js";
import { IntegrationRepositoryDrizzle } from "./repositories/integration.repository.drizzle.js";
import { IntegrationService } from "./services/integration.service.js";
import { IntegrationController } from "./controllers/integration.controller.js";

const integrationRepository = new IntegrationRepositoryDrizzle();
const integrationService = new IntegrationService(integrationRepository);
const integrationController = new IntegrationController(integrationService);

const resolveTenantDb = createResolveTenantDbMiddleware(tenantMasterRepository);

export const integrationsRouter = Router();

integrationsRouter.use(requireAuth);
integrationsRouter.use(resolveTenantDb);

integrationsRouter.post(
  "/",
  requirePermission([PERMISSION_INTEGRATIONS_WRITE]),
  integrationController.create
);
integrationsRouter.get(
  "/",
  requirePermission([PERMISSION_INTEGRATIONS_READ]),
  integrationController.list
);
integrationsRouter.patch(
  "/:id",
  requirePermission([PERMISSION_INTEGRATIONS_WRITE]),
  integrationController.update
);

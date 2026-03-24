import { Router } from "express";
import { PERMISSION_LEADS_READ, PERMISSION_LEADS_WRITE } from "@/constants/permissions.js";
import { requireAuth } from "@/middlewares/require-auth.middleware.js";
import { requirePermission } from "@/middlewares/require-permission.middleware.js";
import { createResolveTenantDbMiddleware } from "@/middlewares/resolve-tenant-db.middleware.js";
import { tenantMasterRepository } from "@/shared/repositories/tenant-master.repository.drizzle.js";
import { LeadRepositoryDrizzle } from "./repositories/lead.repository.drizzle.js";
import { LeadService } from "./services/lead.service.js";
import { ImportLeadsService } from "./services/import-leads.service.js";
import { LeadController } from "./controllers/lead.controller.js";

const leadRepository = new LeadRepositoryDrizzle();
const leadService = new LeadService(leadRepository);
const importLeadsService = new ImportLeadsService(leadRepository);
const leadController = new LeadController(leadService, importLeadsService);

const resolveTenantDb = createResolveTenantDbMiddleware(tenantMasterRepository);

export const leadsRouter = Router();

leadsRouter.use(requireAuth);
leadsRouter.use(resolveTenantDb);

leadsRouter.post(
  "/bulk",
  requirePermission([PERMISSION_LEADS_WRITE]),
  leadController.bulkImport
);
leadsRouter.get(
  "/metrics",
  requirePermission([PERMISSION_LEADS_READ]),
  leadController.metrics
);
leadsRouter.get(
  "/import-batches",
  requirePermission([PERMISSION_LEADS_READ]),
  leadController.listImportBatches
);
leadsRouter.post(
  "/",
  requirePermission([PERMISSION_LEADS_WRITE]),
  leadController.create
);
leadsRouter.get(
  "/",
  requirePermission([PERMISSION_LEADS_READ]),
  leadController.list
);
leadsRouter.get(
  "/:id",
  requirePermission([PERMISSION_LEADS_READ]),
  leadController.getById
);
leadsRouter.put(
  "/:id",
  requirePermission([PERMISSION_LEADS_WRITE]),
  leadController.update
);

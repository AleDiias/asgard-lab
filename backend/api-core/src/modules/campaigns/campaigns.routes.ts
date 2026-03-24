import { Router } from "express";
import { PERMISSION_CAMPAIGNS_READ, PERMISSION_CAMPAIGNS_WRITE } from "@/constants/permissions.js";
import { requireAuth } from "@/middlewares/require-auth.middleware.js";
import { requirePermission } from "@/middlewares/require-permission.middleware.js";
import { createResolveTenantDbMiddleware } from "@/middlewares/resolve-tenant-db.middleware.js";
import { tenantMasterRepository } from "@/shared/repositories/tenant-master.repository.drizzle.js";
import { LeadRepositoryDrizzle } from "@/modules/leads/repositories/lead.repository.drizzle.js";
import { IntegrationRepositoryDrizzle } from "@/modules/integrations/repositories/integration.repository.drizzle.js";
import { CampaignRepositoryDrizzle } from "./repositories/campaign.repository.drizzle.js";
import { CampaignService } from "./services/campaign.service.js";
import { CampaignController } from "./controllers/campaign.controller.js";

const campaignRepository = new CampaignRepositoryDrizzle();
const integrationRepository = new IntegrationRepositoryDrizzle();
const leadRepository = new LeadRepositoryDrizzle();
const campaignService = new CampaignService(
  campaignRepository,
  integrationRepository,
  leadRepository
);
const campaignController = new CampaignController(campaignService);

const resolveTenantDb = createResolveTenantDbMiddleware(tenantMasterRepository);

export const campaignsRouter = Router();

campaignsRouter.use(requireAuth);
campaignsRouter.use(resolveTenantDb);

campaignsRouter.post(
  "/",
  requirePermission([PERMISSION_CAMPAIGNS_WRITE]),
  campaignController.create
);
campaignsRouter.get(
  "/",
  requirePermission([PERMISSION_CAMPAIGNS_READ]),
  campaignController.list
);
campaignsRouter.get(
  "/:id",
  requirePermission([PERMISSION_CAMPAIGNS_READ]),
  campaignController.getById
);
campaignsRouter.patch(
  "/:id",
  requirePermission([PERMISSION_CAMPAIGNS_WRITE]),
  campaignController.update
);
campaignsRouter.post(
  "/:id/leads/sync",
  requirePermission([PERMISSION_CAMPAIGNS_WRITE]),
  campaignController.syncLeads
);

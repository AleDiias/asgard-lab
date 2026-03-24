import { Router } from "express";
import { campaignsRouter } from "@/modules/campaigns/campaigns.routes.js";
import { integrationsRouter } from "@/modules/integrations/integrations.routes.js";
import { leadsRouter } from "@/modules/leads/leads.routes.js";

export const appRoutes = Router();

appRoutes.use("/api/v1/leads", leadsRouter);
appRoutes.use("/api/v1/integrations", integrationsRouter);
appRoutes.use("/api/v1/campaigns", campaignsRouter);

import type { Request, Response, NextFunction } from "express";
import { BadRequestError } from "@/errors/app-error.js";
import {
  campaignCreateBodySchema,
  campaignIdParamSchema,
  campaignSyncLeadsBodySchema,
  campaignUpdateBodySchema,
} from "../schemas/campaign.schema.js";
import type { CampaignService } from "../services/campaign.service.js";

function requireTenantDb(req: Request): NonNullable<Request["tenantDb"]> {
  const db = req.tenantDb;
  if (!db) {
    throw new BadRequestError("Conexão do tenant não resolvida.");
  }
  return db;
}

export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = campaignCreateBodySchema.parse(req.body);
      const db = requireTenantDb(req);
      const data = await this.campaignService.create(db, body);
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const db = requireTenantDb(req);
      const data = await this.campaignService.list(db);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = campaignIdParamSchema.parse(req.params);
      const db = requireTenantDb(req);
      const data = await this.campaignService.getById(db, id);
      if (!data) {
        res.status(404).json({
          success: false,
          error: { message: "Campanha não encontrada." },
        });
        return;
      }
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = campaignIdParamSchema.parse(req.params);
      const body = campaignUpdateBodySchema.parse(req.body);
      const db = requireTenantDb(req);
      const data = await this.campaignService.update(db, id, body);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  };

  syncLeads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = campaignIdParamSchema.parse(req.params);
      const body = campaignSyncLeadsBodySchema.parse(req.body);
      const db = requireTenantDb(req);
      const tenantDatabaseName = req.tenantContext?.databaseName;
      if (!tenantDatabaseName) {
        throw new BadRequestError("Contexto de tenant ausente.");
      }
      const data = await this.campaignService.syncLeads(db, id, body, tenantDatabaseName);
      res.status(202).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  };
}

import type { Request, Response, NextFunction } from "express";
import { BadRequestError } from "@/errors/app-error.js";
import {
  integrationCreateBodySchema,
  integrationIdParamSchema,
  integrationUpdateBodySchema,
} from "../schemas/integration.schema.js";
import type { IntegrationService } from "../services/integration.service.js";

function requireTenantDb(req: Request): NonNullable<Request["tenantDb"]> {
  const db = req.tenantDb;
  if (!db) {
    throw new BadRequestError("Conexão do tenant não resolvida.");
  }
  return db;
}

export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = integrationCreateBodySchema.parse(req.body);
      const db = requireTenantDb(req);
      const data = await this.integrationService.create(db, body);
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const db = requireTenantDb(req);
      const activeOnly = req.query.activeOnly === "true" || req.query.activeOnly === "1";
      const data = await this.integrationService.list(db, activeOnly);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = integrationIdParamSchema.parse(req.params);
      const body = integrationUpdateBodySchema.parse(req.body);
      const db = requireTenantDb(req);
      const data = await this.integrationService.update(db, id, body);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  };
}

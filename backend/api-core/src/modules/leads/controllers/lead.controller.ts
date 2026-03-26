import type { Request, Response, NextFunction } from "express";
import { BadRequestError } from "@/errors/app-error.js";
import {
  createLeadBodySchema,
  importBatchesQuerySchema,
  leadIdParamSchema,
  listLeadsQuerySchema,
  updateLeadBodySchema,
} from "../schemas/lead.schema.js";
import { bulkImportBodySchema } from "../schemas/import-leads.schema.js";
import type { LeadService } from "../services/lead.service.js";
import type { ImportLeadsService } from "../services/import-leads.service.js";

function requireTenantDb(req: Request): NonNullable<Request["tenantDb"]> {
  const db = req.tenantDb;
  if (!db) {
    throw new BadRequestError("Conexão do tenant não resolvida.");
  }
  return db;
}

export class LeadController {
  constructor(
    private readonly leadService: LeadService,
    private readonly importLeadsService: ImportLeadsService
  ) {}

  bulkImport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = bulkImportBodySchema.parse(req.body);
      const db = requireTenantDb(req);
      const data = await this.importLeadsService.execute(db, {
        leads: body.leads,
        fileName: body.fileName,
      });
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  };

  metrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const db = requireTenantDb(req);
      const data = await this.leadService.getMetrics(db);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  };

  listImportBatches = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = importBatchesQuerySchema.parse(req.query);
      const db = requireTenantDb(req);
      const data = await this.leadService.listImportBatches(db, query);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  };

  removeImportBatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = leadIdParamSchema.parse(req.params);
      const db = requireTenantDb(req);
      const data = await this.leadService.removeImportBatch(db, id);
      res.status(200).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = createLeadBodySchema.parse(req.body);
      const db = requireTenantDb(req);
      const lead = await this.leadService.create(db, body);
      res.status(201).json({ success: true, data: lead });
    } catch (e) {
      next(e);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = listLeadsQuerySchema.parse(req.query);
      const db = requireTenantDb(req);
      const data = await this.leadService.list(db, query);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = leadIdParamSchema.parse(req.params);
      const db = requireTenantDb(req);
      const lead = await this.leadService.getById(db, id);
      res.json({ success: true, data: lead });
    } catch (e) {
      next(e);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = leadIdParamSchema.parse(req.params);
      const body = updateLeadBodySchema.parse(req.body);
      const db = requireTenantDb(req);
      const lead = await this.leadService.update(db, id, body);
      res.json({ success: true, data: lead });
    } catch (e) {
      next(e);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = leadIdParamSchema.parse(req.params);
      const db = requireTenantDb(req);
      await this.leadService.remove(db, id);
      res.status(200).json({
        success: true,
        data: { ok: true },
      });
    } catch (e) {
      next(e);
    }
  };
}

import type { Request, Response } from "express";
import { z } from "zod";
import type { CreateTenantService } from "@/modules/tenants/services/create-tenant.service.js";
import type { TenantAdminRepository } from "@/modules/tenants/repositories/tenant-admin.repository.js";

const createTenantBodySchema = z.object({
  domain: z.string().min(1),
  /** Clientes podem enviar `null`; normalizamos para `[]`. */
  features: z.preprocess(
    (v) => (v === null || v === undefined ? [] : v),
    z.array(z.string())
  ),
  adminEmail: z.string().email(),
  adminName: z.string().min(1).optional(),
  companyName: z.string().optional(),
  cnpj: z.string().optional(),
  billingDate: z.string().optional(),
  phone: z.string().optional(),
});

/** Strings vazias tratadas como `null` (JSON / formulários). */
const nullableTrimmed = z.preprocess(
  (v) => (v === "" ? null : v),
  z.union([z.string(), z.null()]).optional()
);

const updateTenantBodySchema = z
  .object({
    domain: z.string().min(1).optional(),
    features: z.preprocess(
      (v) => (v === null ? undefined : v),
      z.array(z.string()).optional()
    ),
    isActive: z.boolean().optional(),
    companyName: nullableTrimmed,
    cnpj: nullableTrimmed,
    billingDate: nullableTrimmed,
    ownerEmail: z.preprocess(
      (v) => (v === "" ? null : v),
      z.union([z.string().email(), z.null()]).optional()
    ),
    phone: nullableTrimmed,
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), {
    message: "Informe ao menos um campo para atualizar.",
  });

export class TenantAdminController {
  constructor(
    private readonly createTenantService: CreateTenantService,
    private readonly tenantRepo: TenantAdminRepository
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const parsed = createTenantBodySchema.parse(req.body);
    const tenant = await this.createTenantService.execute(parsed);
    res.status(201).json({
      success: true,
      data: tenant,
    });
  };

  list = async (_req: Request, res: Response): Promise<void> => {
    const rows = await this.tenantRepo.listTenants();
    res.status(200).json({
      success: true,
      data: rows,
    });
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const id = z.string().uuid().parse(req.params.id);
    const row = await this.tenantRepo.findTenantById(id);
    if (!row) {
      res.status(404).json({
        success: false,
        error: { message: "Tenant não encontrado." },
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: row,
    });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const id = z.string().uuid().parse(req.params.id);
    const parsed = updateTenantBodySchema.parse(req.body);
    const updated = await this.tenantRepo.updateTenant(id, {
      domain: parsed.domain,
      features: parsed.features,
      isActive: parsed.isActive,
      companyName: parsed.companyName,
      cnpj: parsed.cnpj,
      billingDate: parsed.billingDate,
      ownerEmail: parsed.ownerEmail,
      phone: parsed.phone,
    });
    if (!updated) {
      res.status(404).json({
        success: false,
        error: { message: "Tenant não encontrado." },
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: updated,
    });
  };
}

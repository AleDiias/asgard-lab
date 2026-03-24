import type { Response } from "express";
import { z } from "zod";
import type { InviteTenantUserService } from "@/services/invite-tenant-user.service.js";
import type { TenantUserManagementService } from "@/services/tenant-user-management.service.js";
import type { RequestWithTenant } from "@/middlewares/require-tenant-domain.middleware.js";

const inviteBodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  permissionIds: z.array(z.string()).min(1),
});

const updatePermissionsSchema = z.object({
  permissionIds: z.array(z.string()),
});

const patchStatusSchema = z.object({
  isActive: z.boolean(),
});

export class TenantUsersController {
  constructor(
    private readonly inviteTenantUserService: InviteTenantUserService,
    private readonly tenantUserManagement: TenantUserManagementService
  ) {}

  invite = async (req: RequestWithTenant, res: Response): Promise<void> => {
    const tenantDomain = req.tenantDomain;
    if (!tenantDomain) {
      res.status(400).json({
        success: false,
        error: { message: "Header X-Tenant-Domain é obrigatório." },
      });
      return;
    }

    const parsed = inviteBodySchema.parse(req.body);
    const user = req.user;
    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: "Não autorizado." },
      });
      return;
    }

    const result = await this.inviteTenantUserService.execute({
      tenantDomain,
      actorTenantId: user.tenantId,
      actorIsSuperAdmin: user.isSuperAdmin,
      name: parsed.name,
      email: parsed.email,
      permissionIds: parsed.permissionIds,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  };

  list = async (req: RequestWithTenant, res: Response): Promise<void> => {
    const tenantDomain = req.tenantDomain;
    if (!tenantDomain) {
      res.status(400).json({
        success: false,
        error: { message: "Header X-Tenant-Domain é obrigatório." },
      });
      return;
    }
    const user = req.user;
    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: "Não autorizado." },
      });
      return;
    }

    const rows = await this.tenantUserManagement.listUsers({
      tenantDomain,
      actorTenantId: user.tenantId,
      actorIsSuperAdmin: user.isSuperAdmin,
    });

    res.status(200).json({
      success: true,
      data: rows,
    });
  };

  updatePermissions = async (req: RequestWithTenant, res: Response): Promise<void> => {
    const tenantDomain = req.tenantDomain;
    if (!tenantDomain) {
      res.status(400).json({
        success: false,
        error: { message: "Header X-Tenant-Domain é obrigatório." },
      });
      return;
    }
    const user = req.user;
    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: "Não autorizado." },
      });
      return;
    }

    const userId = z.string().uuid().parse(req.params.id);
    const parsed = updatePermissionsSchema.parse(req.body);

    await this.tenantUserManagement.updatePermissions({
      tenantDomain,
      userId,
      permissionIds: parsed.permissionIds,
      actorUserId: user.id,
      actorTenantId: user.tenantId,
      actorIsSuperAdmin: user.isSuperAdmin,
      actorPermissions: user.permissions ?? [],
    });

    res.status(200).json({
      success: true,
      data: { ok: true },
    });
  };

  setStatus = async (req: RequestWithTenant, res: Response): Promise<void> => {
    const tenantDomain = req.tenantDomain;
    if (!tenantDomain) {
      res.status(400).json({
        success: false,
        error: { message: "Header X-Tenant-Domain é obrigatório." },
      });
      return;
    }
    const user = req.user;
    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: "Não autorizado." },
      });
      return;
    }

    const userId = z.string().uuid().parse(req.params.id);
    const parsed = patchStatusSchema.parse(req.body);

    await this.tenantUserManagement.setActive({
      tenantDomain,
      userId,
      isActive: parsed.isActive,
      actorUserId: user.id,
      actorTenantId: user.tenantId,
      actorIsSuperAdmin: user.isSuperAdmin,
    });

    res.status(200).json({
      success: true,
      data: { ok: true },
    });
  };
}

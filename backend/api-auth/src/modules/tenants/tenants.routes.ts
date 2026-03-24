import { Router } from "express";
import { requireAuth } from "@/middlewares/require-auth.js";
import { requireSuperAdmin } from "@/middlewares/require-super-admin.js";
import { TenantAdminController } from "@/modules/tenants/controllers/tenant-admin.controller.js";
import { CreateTenantService } from "@/modules/tenants/services/create-tenant.service.js";
import { TenantAdminRepositoryDrizzle } from "@/modules/tenants/repositories/tenant-admin.repository.js";
import { UserRepositoryDrizzle } from "@/repositories/user.repository.drizzle.js";

const tenantRepo = new TenantAdminRepositoryDrizzle();
const userRepo = new UserRepositoryDrizzle();
const createTenantService = new CreateTenantService(tenantRepo, userRepo);
const tenantController = new TenantAdminController(createTenantService, tenantRepo);

const tenantsAdminRoutes = Router();

tenantsAdminRoutes.get("/", requireAuth, requireSuperAdmin, (req, res, next) => {
  tenantController.list(req, res).catch(next);
});

tenantsAdminRoutes.get("/:id", requireAuth, requireSuperAdmin, (req, res, next) => {
  tenantController.getById(req, res).catch(next);
});

tenantsAdminRoutes.put("/:id", requireAuth, requireSuperAdmin, (req, res, next) => {
  tenantController.update(req, res).catch(next);
});

tenantsAdminRoutes.post("/", requireAuth, requireSuperAdmin, (req, res, next) => {
  tenantController.create(req, res).catch(next);
});

export { tenantsAdminRoutes };

import { Router } from "express";
import { requireTenantDomain } from "@/middlewares/require-tenant-domain.middleware.js";
import { validateBody } from "@/middlewares/validate-body.middleware.js";
import { requireAuth } from "@/middlewares/require-auth.js";
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/schemas/auth.schema.js";
import { AuthController } from "@/controllers/auth.controller.js";
import { AuthenticateUserService } from "@/services/authenticate-user.service.js";
import { ForgotPasswordService } from "@/services/forgot-password.service.js";
import { ResetPasswordService } from "@/services/reset-password.service.js";
import { TenantRepositoryDrizzle } from "@/repositories/tenant.repository.drizzle.js";
import { UserRepositoryDrizzle } from "@/repositories/user.repository.drizzle.js";
import { AsgardUserRepositoryDrizzle } from "@/repositories/asgard-user.repository.js";
import { tenantsAdminRoutes } from "@/modules/tenants/tenants.routes.js";
import { asgardAdminRoutes } from "@/modules/asgard/asgard-admin.routes.js";
import { InviteTenantUserService } from "@/services/invite-tenant-user.service.js";
import { TenantUserManagementService } from "@/services/tenant-user-management.service.js";
import { TenantUsersController } from "@/controllers/tenant-users.controller.js";
import { requirePermission } from "@/middlewares/require-permission.js";
import { PERMISSION_USERS_MANAGE } from "@/constants/permissions.js";
import type { RequestWithTenant } from "@/middlewares/require-tenant-domain.middleware.js";

const tenantRepo = new TenantRepositoryDrizzle();
const userRepo = new UserRepositoryDrizzle();
const asgardUserRepo = new AsgardUserRepositoryDrizzle();

const authenticateService = new AuthenticateUserService(
  tenantRepo,
  userRepo,
  asgardUserRepo
);
const forgotPasswordService = new ForgotPasswordService(
  tenantRepo,
  userRepo,
  asgardUserRepo
);
const resetPasswordService = new ResetPasswordService(tenantRepo, userRepo, asgardUserRepo);

const authController = new AuthController(
  authenticateService,
  forgotPasswordService,
  resetPasswordService
);

const inviteTenantUserService = new InviteTenantUserService(tenantRepo, userRepo);
const tenantUserManagementService = new TenantUserManagementService(tenantRepo, userRepo);
const tenantUsersController = new TenantUsersController(
  inviteTenantUserService,
  tenantUserManagementService
);

const router = Router();

router.use("/admin/tenants", tenantsAdminRoutes);
router.use("/admin/asgard", asgardAdminRoutes);

router.get("/me", requireAuth, (req, res) => {
  res.status(200).json({ success: true, data: req.user });
});

router.use(requireTenantDomain);

router.post(
  "/login",
  validateBody(loginSchema),
  (req, res, next) => {
    authController.login(req as Parameters<typeof authController.login>[0], res).catch(next);
  }
);
router.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  (req, res, next) => {
    authController
      .forgotPassword(req as Parameters<typeof authController.forgotPassword>[0], res)
      .catch(next);
  }
);
router.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  (req, res, next) => {
    authController
      .resetPassword(req as Parameters<typeof authController.resetPassword>[0], res)
      .catch(next);
  }
);

router.get("/users", requireAuth, requirePermission([PERMISSION_USERS_MANAGE]), (req, res, next) => {
  tenantUsersController.list(req as RequestWithTenant, res).catch(next);
});

router.post("/users", requireAuth, requirePermission([PERMISSION_USERS_MANAGE]), (req, res, next) => {
  tenantUsersController.invite(req as RequestWithTenant, res).catch(next);
});

router.put("/users/:id", requireAuth, requirePermission([PERMISSION_USERS_MANAGE]), (req, res, next) => {
  tenantUsersController.updatePermissions(req as RequestWithTenant, res).catch(next);
});

router.patch(
  "/users/:id/status",
  requireAuth,
  requirePermission([PERMISSION_USERS_MANAGE]),
  (req, res, next) => {
    tenantUsersController.setStatus(req as RequestWithTenant, res).catch(next);
  }
);

export { router as authRoutes };

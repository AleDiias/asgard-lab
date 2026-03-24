import { Router } from "express";
import { requireAuth } from "@/middlewares/require-auth.js";
import { requireSuperAdmin } from "@/middlewares/require-super-admin.js";
import { AsgardAdminController } from "@/modules/asgard/controllers/asgard-admin.controller.js";
import { CreateAsgardUserService } from "@/modules/asgard/services/create-asgard-user.service.js";
import { AsgardUserRepositoryDrizzle } from "@/repositories/asgard-user.repository.js";
import { UserRepositoryDrizzle } from "@/repositories/user.repository.drizzle.js";

const asgardUserRepo = new AsgardUserRepositoryDrizzle();
const userRepo = new UserRepositoryDrizzle();
const createAsgardUserService = new CreateAsgardUserService(asgardUserRepo, userRepo);
const controller = new AsgardAdminController(createAsgardUserService, asgardUserRepo);

const asgardAdminRoutes = Router();

asgardAdminRoutes.get("/users", requireAuth, requireSuperAdmin, (req, res, next) => {
  controller.listUsers(req, res).catch(next);
});

asgardAdminRoutes.patch("/users/:id/status", requireAuth, requireSuperAdmin, (req, res, next) => {
  controller.patchUserStatus(req, res).catch(next);
});

asgardAdminRoutes.post("/users", requireAuth, requireSuperAdmin, (req, res, next) => {
  controller.createUser(req, res).catch(next);
});

export { asgardAdminRoutes };

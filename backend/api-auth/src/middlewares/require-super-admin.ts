import type { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "@/errors/app-error.js";

export function requireSuperAdmin(req: Request, _res: Response, next: NextFunction): void {
  const user = req.user;
  if (!user) {
    return next(new UnauthorizedError("Usuário não autenticado."));
  }

  if (!user.isSuperAdmin) {
    return next(new ForbiddenError("Acesso permitido apenas para Super Admin."));
  }

  return next();
}

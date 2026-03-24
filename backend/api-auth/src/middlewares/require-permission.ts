import type { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "@/errors/app-error.js";

export function requirePermission(requiredPermissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      return next(new UnauthorizedError("Usuário não autenticado."));
    }

    if (user.isSuperAdmin) {
      return next();
    }

    const granted = user.permissions ?? [];
    if (granted.includes("*")) {
      return next();
    }

    const hasAllPermissions = requiredPermissions.every((permission) =>
      granted.includes(permission)
    );

    if (!hasAllPermissions) {
      return next(new ForbiddenError("Permissão insuficiente para acessar este recurso."));
    }

    return next();
  };
}

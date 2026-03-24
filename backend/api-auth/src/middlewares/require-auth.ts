import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "@/errors/app-error.js";
import { validateAndGetEnv } from "@/infra/env.js";

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
  permissions?: string[];
  isSuperAdmin?: boolean;
}

const BEARER_PREFIX = "Bearer ";

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith(BEARER_PREFIX)) {
    return next(new UnauthorizedError("Token ausente ou inválido."));
  }

  const token = authHeader.slice(BEARER_PREFIX.length).trim();
  if (!token) {
    return next(new UnauthorizedError("Token ausente ou inválido."));
  }

  try {
    const { JWT_SECRET } = validateAndGetEnv();
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      tenantId: decoded.tenantId,
      permissions: decoded.permissions ?? [],
      isSuperAdmin: Boolean(decoded.isSuperAdmin),
    };
    return next();
  } catch {
    return next(new UnauthorizedError("Token expirado ou inválido."));
  }
}

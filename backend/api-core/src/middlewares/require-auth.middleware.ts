import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { validateAndGetEnv } from "@/infra/env.js";
import { UnauthorizedError } from "@/errors/app-error.js";
import type { AuthenticatedUser } from "@/types/auth.js";

const jwtPayloadSchema = z.object({
  tenantId: z.string(),
  userId: z.string(),
  email: z.string(),
  role: z.string(),
  isSuperAdmin: z.boolean(),
  permissions: z.array(z.string()),
  features: z.array(z.string()).optional(),
});

/**
 * Valida JWT emitido pela api-auth (mesmo `JWT_SECRET`) e preenche `req.user`.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Token de autenticação ausente."));
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    return next(new UnauthorizedError("Token de autenticação ausente."));
  }

  try {
    const env = validateAndGetEnv();
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const parsed = jwtPayloadSchema.safeParse(decoded);
    if (!parsed.success) {
      return next(new UnauthorizedError("Token inválido."));
    }

    const p = parsed.data;
    const user: AuthenticatedUser = {
      tenantId: p.tenantId,
      userId: p.userId,
      email: p.email,
      role: p.role,
      isSuperAdmin: p.isSuperAdmin,
      permissions: p.permissions,
      features: p.features,
    };
    req.user = user;
    return next();
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError || e instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError("Token inválido ou expirado."));
    }
    return next(e instanceof Error ? e : new Error(String(e)));
  }
}

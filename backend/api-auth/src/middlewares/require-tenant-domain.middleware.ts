import type { Request, Response, NextFunction } from "express";

const HEADER_TENANT_DOMAIN = "x-tenant-domain";

export interface RequestWithTenant extends Request {
  tenantDomain?: string;
}

export function requireTenantDomain(
  req: RequestWithTenant,
  res: Response,
  next: NextFunction
): void {
  const domain = req.headers[HEADER_TENANT_DOMAIN];
  const value =
    typeof domain === "string" ? domain.trim().toLowerCase() : "";

  if (!value) {
    res.status(400).json({
      success: false,
      error: { message: "Header X-Tenant-Domain é obrigatório." },
    });
    return;
  }

  req.tenantDomain = value;
  next();
}

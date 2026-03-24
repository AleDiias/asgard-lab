import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "@/infra/logger.js";
import { AppError } from "@/errors/app-error.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const tenantDomain = _req.headers["x-tenant-domain"];
  const cause =
    err && typeof err === "object" && "cause" in err
      ? (err as Error & { cause?: unknown }).cause
      : undefined;
  const causeMessage =
    cause instanceof Error
      ? cause.message
      : cause != null
        ? String(cause)
        : undefined;
  logger.error(err.message, {
    stack: err.stack,
    ...(causeMessage ? { pgCause: causeMessage } : {}),
    tenantDomain: typeof tenantDomain === "string" ? tenantDomain : undefined,
  });

  if (err instanceof ZodError) {
    const first = err.errors[0];
    const msg = first?.message ?? "Dados inválidos.";
    res.status(400).json({
      success: false,
      error: { message: msg },
    });
    return;
  }

  const pgMsg = err?.message ?? "";
  if (/column .* does not exist|relation .* does not exist/i.test(pgMsg)) {
    res.status(500).json({
      success: false,
      error: {
        message:
          "Esquema da base de dados desatualizado. Na pasta api-core execute as migrations de tenant (ver README).",
      },
    });
    return;
  }

  const statusFromError =
    err instanceof AppError
      ? err.statusCode
      : err.message.includes("não encontrad")
        ? 404
        : 400;
  const code = statusFromError;

  res.status(code).json({
    success: false,
    error: { message: err.message || "Erro interno." },
  });
}
